import { prisma } from "../src/lib/prisma";

async function main() {
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      include: {
        school: true,
        enrollments: {
          include: { gradeLevel: true, section: true, schoolYear: true },
          where: { schoolYear: { isActive: true } }
        }
      },
      orderBy: { lastName: 'asc' }
    }),
    prisma.student.count()
  ])

  console.log("Students length:", students.length);
  console.log("Total:", total);
  if (students.length > 0) {
    console.log("First student:", JSON.stringify(students[0], null, 2));
  } else {
    // Check without include
    const allStudents = await prisma.student.findMany();
    console.log("All students without include:", allStudents.length);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
