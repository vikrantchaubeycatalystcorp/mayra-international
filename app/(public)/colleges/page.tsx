import { prisma } from "../../../lib/db";
import { CollegesClient } from "./CollegesClient";

export const revalidate = 300;

export default async function CollegesPage() {
  const totalCount = await prisma.college.count({ where: { isActive: true } });

  return <CollegesClient totalCount={totalCount} />;
}
