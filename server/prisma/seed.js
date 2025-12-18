const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Get super admin password from environment
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!superAdminPassword) {
    throw new Error('SUPER_ADMIN_PASSWORD environment variable is required for seeding');
  }

  // Create or update SUPER_ADMIN "Mirage"
  const superAdminEmail = 'mirage@mirage.local';
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Mirage',
        email: superAdminEmail,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true
      }
    });
    console.log('✅ Created SUPER_ADMIN user: Mirage');
  } else {
    console.log('ℹ️ SUPER_ADMIN user already exists');
  }

  // Check if database has any other data (for demo seeding)
  const userCount = await prisma.user.count();
  
  if (userCount <= 1) {
    console.log('📝 Seeding demo data...');

    // Create demo ADMIN
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@mirage.local',
        passwordHash: adminPassword,
        role: 'ADMIN',
        active: true
      }
    });
    console.log('✅ Created ADMIN user: admin@mirage.local / Admin123!');

    // Create demo STAFF users
    const staffPassword = await bcrypt.hash('Staff123!', 10);
    await prisma.user.createMany({
      data: [
        {
          name: 'Staff One',
          email: 'staff@mirage.local',
          passwordHash: staffPassword,
          role: 'STAFF',
          active: true
        },
        {
          name: 'Staff Two',
          email: 'staff2@mirage.local',
          passwordHash: staffPassword,
          role: 'STAFF',
          active: true
        }
      ]
    });
    console.log('✅ Created 2 STAFF users');

    // Create demo subjects
    const subjects = await prisma.subject.createMany({
      data: [
        { name: 'Mathematics', code: 'MATH101' },
        { name: 'English', code: 'ENG101' },
        { name: 'Science', code: 'SCI101' },
        { name: 'History', code: 'HIST101' },
        { name: 'Computer Science', code: 'CS101' }
      ]
    });
    console.log('✅ Created 5 subjects');

    // Create demo class sections
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    const classSections = await Promise.all([
      prisma.classSection.create({
        data: { name: 'Class 10-A', section: 'A', grade: '10', academicYear, capacity: 40, roomNumber: '101', status: 'ACTIVE' }
      }),
      prisma.classSection.create({
        data: { name: 'Class 10-B', section: 'B', grade: '10', academicYear, capacity: 40, roomNumber: '102', status: 'ACTIVE' }
      }),
      prisma.classSection.create({
        data: { name: 'Class 9-A', section: 'A', grade: '9', academicYear, capacity: 35, roomNumber: '103', status: 'ACTIVE' }
      }),
      prisma.classSection.create({
        data: { name: 'Class 9-B', section: 'B', grade: '9', academicYear, capacity: 35, roomNumber: '104', status: 'ACTIVE' }
      })
    ]);
    console.log('✅ Created 4 class sections');

    // Create demo teachers
    const teachers = await prisma.teacher.createMany({
      data: [
        { employeeId: 'TCH001', firstName: 'John', lastName: 'Smith', email: 'john.smith@school.edu', phone: '555-0101', specialization: 'Mathematics', qualification: 'Ph.D. Mathematics' },
        { employeeId: 'TCH002', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@school.edu', phone: '555-0102', specialization: 'English', qualification: 'M.A. English Literature' },
        { employeeId: 'TCH003', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@school.edu', phone: '555-0103', specialization: 'Science', qualification: 'M.Sc. Physics' },
        { employeeId: 'TCH004', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@school.edu', phone: '555-0104', specialization: 'History', qualification: 'M.A. History' },
        { employeeId: 'TCH005', firstName: 'David', lastName: 'Lee', email: 'david.lee@school.edu', phone: '555-0105', specialization: 'Computer Science', qualification: 'M.Tech CS' }
      ]
    });
    console.log('✅ Created 5 teachers');

    // Create demo students
    const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 
                        'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Joseph', 'Abigail'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const genders = ['MALE', 'FEMALE'];
    
    const students = await Promise.all(
      Array.from({ length: 20 }, (_, i) => {
        const num = String(i + 1).padStart(3, '0');
        return prisma.student.create({
          data: {
            studentId: `STU${currentYear}${num}`,
            firstName: firstNames[i],
            lastName: lastNames[i % 10],
            email: `student${num}@school.edu`,
            phone: `555-1${num}`,
            dateOfBirth: new Date(2008 + Math.floor(i / 10), (i % 12), 15),
            gender: genders[i % 2],
            address: `${100 + i} School Street, City`,
            guardianName: `Mr./Mrs. ${lastNames[i % 10]}`,
            guardianPhone: `555-2${num}`,
            status: 'ACTIVE'
          }
        });
      })
    );
    console.log('✅ Created 20 students');

    // Create enrollments
    for (let i = 0; i < students.length; i++) {
      const classSectionIndex = i % classSections.length;
      await prisma.enrollment.create({
        data: {
          studentId: students[i].id,
          classSectionId: classSections[classSectionIndex].id,
          academicYear
        }
      });
    }
    console.log('✅ Created enrollments');

    // Create some demo fees
    for (let i = 0; i < 10; i++) {
      await prisma.fee.create({
        data: {
          studentId: students[i].id,
          amount: 5000 + (i * 500),
          dueDate: new Date(currentYear, (i % 12) + 1, 15),
          status: i < 5 ? 'PAID' : 'DUE',
          paymentDate: i < 5 ? new Date(currentYear, (i % 12) + 1, 10) : null
        }
      });
    }
    console.log('✅ Created 10 fee records');

    // Create some demo attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 10; i++) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: students[i].id }
      });
      
      if (enrollment) {
        await prisma.attendance.create({
          data: {
            studentId: students[i].id,
            classSectionId: enrollment.classSectionId,
            date: today,
            status: i < 8 ? 'P' : (i === 8 ? 'A' : 'L')
          }
        });
      }
    }
    console.log('✅ Created attendance records for today');

    console.log('\n🎉 Demo data seeding completed!');
  } else {
    console.log('ℹ️ Database already has data, skipping demo seed');
  }

  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
