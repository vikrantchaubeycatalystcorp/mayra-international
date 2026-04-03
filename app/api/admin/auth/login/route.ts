import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity-logger";
import { adminLoginSchema } from "@/types/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "ACCOUNT_DISABLED", message: "Account has been deactivated" } },
        { status: 403 }
      );
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_LOCKED",
            message: `Account locked. Try again in ${minutes} minutes`,
          },
        },
        { status: 423 }
      );
    }

    const isValid = await comparePassword(password, admin.password);

    if (!isValid) {
      const attempts = admin.loginAttempts + 1;
      const updateData: Record<string, unknown> = { loginAttempts: attempts };

      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message:
              attempts >= 5
                ? "Account locked for 30 minutes due to too many failed attempts"
                : `Invalid email or password. ${5 - attempts} attempts remaining`,
          },
        },
        { status: 401 }
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const tokenPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
    };

    const accessToken = await createAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(tokenPayload);
    await setAuthCookies(accessToken, refreshToken);

    await logActivity({
      adminId: admin.id,
      action: "LOGIN",
      entity: "Admin",
      details: "Admin logged in",
      ipAddress: (() => {
        const forwarded = req.headers.get("x-forwarded-for");
        return forwarded
          ? forwarded.split(",").map(s => s.trim()).filter(Boolean).pop() || "unknown"
          : req.headers.get("x-real-ip") || "unknown";
      })(),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
