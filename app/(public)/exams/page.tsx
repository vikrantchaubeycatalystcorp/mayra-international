import { prisma } from "../../../lib/db";
import { ExamsClient } from "./ExamsClient";

export const revalidate = 60;

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      fullName: true,
      streams: true,
      level: true,
      registrationStart: true,
      registrationEnd: true,
      examDate: true,
      resultDate: true,
      applicationFeeGeneral: true,
      mode: true,
      frequency: true,
      participatingColleges: true,
      description: true,
    },
  });

  return <ExamsClient exams={exams} />;
}
