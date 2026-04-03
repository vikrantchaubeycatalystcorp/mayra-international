import { prisma } from "@/lib/db";

interface CreateNotificationParams {
  type: "enquiry" | "system" | "success" | "warning";
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        entityType: params.entityType,
        entityId: params.entityId,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
