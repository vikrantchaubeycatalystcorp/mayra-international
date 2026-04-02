import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Append connection_limit to the URL if not already present
  // This prevents "too many clients" during next build static generation
  let url = process.env.DATABASE_URL || "";
  if (url && !url.includes("connection_limit")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=5`;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: { url },
    },
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Always cache in globalThis — prevents connection exhaustion during
// next build (runs in production mode) and in dev hot-reload.
globalForPrisma.prisma = prisma;
