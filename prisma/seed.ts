import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Organizations
  const organization1 = await prisma.organization.create({
    data: {
      name: 'Tech Innovators Inc.',
      description: 'A technology company specializing in AI solutions.',
      logo: 'https://example.com/logos/tech-innovators.png',
    },
  });

  const organization2 = await prisma.organization.create({
    data: {
      name: 'Green Earth Corp.',
      description: 'A company focused on sustainable and eco-friendly solutions.',
      logo: 'https://example.com/logos/green-earth.png',
    },
  });

  // Seed Employment Statuses
  await prisma.employmentStatus.createMany({
    data: [
      {
        status: 'Active',
        description: 'Currently employed',
        organizationId: organization1.id,
      },
      {
        status: 'Inactive',
        description: 'Not currently employed',
        organizationId: organization1.id,
      },
      {
        status: 'Terminated',
        description: 'Employment has been terminated',
        organizationId: organization2.id,
      },
    ],
  });

  // Seed Employee Levels
  await prisma.employeeLevel.createMany({
    data: [
      {
        name: 'Junior Developer',
        description: 'Entry-level position in the development team.',
        organizationId: organization1.id,
      },
      {
        name: 'Senior Developer',
        description: 'Senior position in the development team.',
        organizationId: organization1.id,
      },
      {
        name: 'Manager',
        description: 'Responsible for overseeing projects and teams.',
        organizationId: organization2.id,
      },
    ],
  });

  // Seed Leave Types
  await prisma.leaveType.createMany({
    data: [
      {
        name: 'Sick Leave',
        description: 'Leave for health-related issues.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1, // Assuming created by a specific admin user
        updatedBy: 1,
        organizationId: organization1.id,
      },
      {
        name: 'Annual Leave',
        description: 'Paid leave for vacation or personal time.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1,
        updatedBy: 1,
        organizationId: organization1.id,
      },
      {
        name: 'Maternity Leave',
        description: 'Leave for maternity reasons.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 2, // Created by another admin in a different organization
        updatedBy: 2,
        organizationId: organization2.id,
      },
    ],
  });

  await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      gender: 'Male',
      dateOfBirth: new Date('1990-01-01'),  // Ensure date format is correct
      startDate: new Date('2023-09-08'),     // Ensure date format is correct
      createdBy: 1,   // Assuming 1 is a valid user ID
      updatedBy: 1,   // Same as above

      // Linking to an existing organization
      organization: {
        connect: { id: 1 },  // Assuming 1 is the ID of an existing organization
      },

      // Linking to an existing employment status
      employmentStatus: {
        connect: { id: 1 },  // Assuming 1 is the ID of an existing employment status
      },

      // Linking to an existing employee level
      employeeLevel: {
        connect: { id: 1 },  // Assuming 1 is the ID of an existing employee level
      },
    },
  });

  console.log('Seeding finished!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });