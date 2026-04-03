import { prisma } from "@/lib/db";

interface LogActivityParams {
  adminId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "IMPORT" | "ACTIVATE" | "DEACTIVATE";
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.adminActivity.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
