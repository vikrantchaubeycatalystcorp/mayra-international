import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";
import { hasPermission, type Resource, type Permission } from "./permissions";
import type { AdminJWTPayload } from "@/types/admin";

export function unauthorized(message = "Not authenticated") {
  return NextResponse.json(
    { success: false, error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}

export function forbidden(message = "Insufficient permissions") {
  return NextResponse.json(
    { success: false, error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}

export function badRequest(message: string, details?: { field: string; message: string }[]) {
  return NextResponse.json(
    { success: false, error: { code: "VALIDATION_ERROR", message, details } },
    { status: 400 }
  );
}

export function notFound(message = "Resource not found") {
  return NextResponse.json(
    { success: false, error: { code: "NOT_FOUND", message } },
    { status: 404 }
  );
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

export async function getAdminFromRequest(
  req: NextRequest
): Promise<AdminJWTPayload | null> {
  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireAdmin(
  req: NextRequest,
  resource?: Resource,
  action?: Permission,
  checkDb = false
): Promise<{ admin: AdminJWTPayload } | NextResponse> {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  if (!admin.isActive) return forbidden("Account deactivated");

  // For sensitive operations, verify admin is still active in DB
  if (checkDb) {
    const { prisma } = await import("@/lib/db");
    const dbAdmin = await prisma.admin.findUnique({
      where: { id: admin.id },
      select: { isActive: true, role: true },
    });
    if (!dbAdmin || !dbAdmin.isActive) return forbidden("Account deactivated");
  }

  if (resource && action && !hasPermission(admin.role, resource, action)) {
    return forbidden();
  }
  return { admin };
}

export function getSearchParams(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "";
  const sortOrder = (url.searchParams.get("sortOrder") || "asc") as "asc" | "desc";
  return { page, limit, search, sortBy, sortOrder, url };
}
