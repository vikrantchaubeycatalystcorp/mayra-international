import { prisma } from "../../../lib/db";
import { BrowseAllLink } from "../../../components/shared/BrowseAllLink";
import { CollegesClient } from "./CollegesClient";

export const revalidate = 300;

export default async function CollegesPage() {
  const totalCount = await prisma.college.count({ where: { isActive: true } });

  return (
    <>
      <CollegesClient totalCount={totalCount} />
      <BrowseAllLink type="colleges" />
    </>
  );
}
