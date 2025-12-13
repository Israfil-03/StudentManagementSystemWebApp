import { PrismaClient, Role, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.mark.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathematics' } }),
    prisma.subject.create({ data: { name: 'English' } }),
    prisma.subject.create({ data: { name: 'Science' } }),
    prisma.subject.create({ data: { name: 'History' } }),
    prisma.subject.create({ data: { name: 'Geography' } }),
  ]);
  console.log(`📚 Created ${subjects.length} subjects`);

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('👤 Created admin user: admin@school.com / admin123');

  // Create Teachers
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.smith@school.com',
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            firstName: 'John',
            lastName: 'Smith',
          },
        },
      },
      include: { teacher: true },
    }),
    prisma.user.create({
      data: {
        email: 'jane.doe@school.com',
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            firstName: 'Jane',
            lastName: 'Doe',
          },
        },
      },
      include: { teacher: true },
    }),
  ]);
  console.log(`👨‍🏫 Created ${teachers.length} teachers (password: teacher123)`);

  // Create Classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Grade 10 - Section A',
        teacherId: teachers[0].teacher!.id,
        subjects: {
          connect: subjects.slice(0, 3).map((s) => ({ id: s.id })),
        },
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 10 - Section B',
        teacherId: teachers[1].teacher!.id,
        subjects: {
          connect: subjects.slice(2, 5).map((s) => ({ id: s.id })),
        },
      },
    }),
    prisma.class.create({
      data: {
        name: 'Grade 11 - Section A',
        subjects: {
          connect: subjects.map((s) => ({ id: s.id })),
        },
      },
    }),
  ]);
  console.log(`🏫 Created ${classes.length} classes`);

  // Create Students
  const studentPassword = await bcrypt.hash('student123', 10);
  const studentData = [
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice@school.com' },
    { firstName: 'Bob', lastName: 'Williams', email: 'bob@school.com' },
    { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@school.com' },
    { firstName: 'Diana', lastName: 'Davis', email: 'diana@school.com' },
    { firstName: 'Edward', lastName: 'Miller', email: 'edward@school.com' },
    { firstName: 'Fiona', lastName: 'Wilson', email: 'fiona@school.com' },
  ];

  const students = await Promise.all(
    studentData.map((data, index) =>
      prisma.user.create({
        data: {
          email: data.email,
          password: studentPassword,
          role: Role.STUDENT,
          student: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              dateOfBirth: new Date(2008, index % 12, (index + 1) * 3),
              classId: classes[index % 2].id,
            },
          },
        },
        include: { student: true },
      })
    )
  );
  console.log(`🎒 Created ${students.length} students (password: student123)`);

  // Create some attendance records
  const today = new Date();
  for (const student of students) {
    if (student.student) {
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        await prisma.attendance.create({
          data: {
            studentId: student.student.id,
            classId: student.student.classId!,
            date,
            status: i === 2 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
          },
        });
      }
    }
  }
  console.log('📅 Created attendance records');

  // Create some marks
  for (const student of students) {
    if (student.student) {
      for (const subject of subjects.slice(0, 3)) {
        await prisma.mark.create({
          data: {
            studentId: student.student.id,
            subjectId: subject.id,
            examName: 'Mid-Term Exam',
            marks: Math.floor(Math.random() * 30) + 70, // 70-100
          },
        });
      }
    }
  }
  console.log('📝 Created marks');

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('   Admin:   admin@school.com / admin123');
  console.log('   Teacher: john.smith@school.com / teacher123');
  console.log('   Student: alice@school.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
