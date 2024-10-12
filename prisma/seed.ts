import { PrismaClient, Organization, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Step 1: Create Organizations
  const organizationNames = ['Alpha Corp', 'Beta LLC', 'Gamma Inc', 'Delta Co'];
  const organizations: Organization[] = [];

  for (const name of organizationNames) {
    const org = await prisma.organization.create({
      data: {
        name,
        description: faker.company.catchPhrase(),
        logo: faker.image.avatar(),
      },
    });
    organizations.push(org);
    console.log(`Created organization: ${org.name}`);
  }

  // Step 2: Create Employment Statuses for Each Organization
  const employmentStatusesData: { status: string; description?: string }[] = [
    { status: 'Active', description: 'Currently employed' },
    { status: 'On Leave', description: 'Currently on leave' },
    { status: 'Resigned', description: 'Has resigned from the organization' },
    { status: 'Terminated', description: 'Employment has been terminated' },
  ];

  for (const org of organizations) {
    for (const status of employmentStatusesData) {
      await prisma.employmentStatus.create({
        data: {
          status: status.status,
          description: status.description,
          organizationId: org.id,
        },
      });
    }
    console.log(`Created employment statuses for organization: ${org.name}`);
  }

  // Step 3: Create Employee Levels for Each Organization
  const employeeLevelsData: { name: string; description?: string }[] = [
    { name: 'Junior', description: 'Entry-level position' },
    { name: 'Mid', description: 'Mid-level position' },
    { name: 'Senior', description: 'Senior-level position' },
    { name: 'Lead', description: 'Lead position' },
  ];

  for (const org of organizations) {
    for (const level of employeeLevelsData) {
      await prisma.employeeLevel.create({
        data: {
          name: level.name,
          description: level.description,
          organizationId: org.id,
        },
      });
    }
    console.log(`Created employee levels for organization: ${org.name}`);
  }

  // Step 4: Create Leave Types for Each Organization
  const leaveTypesData: { name: string; description?: string }[] = [
    { name: 'Annual Leave', description: 'Paid time off for vacations' },
    { name: 'Sick Leave', description: 'Paid time off for illness' },
    { name: 'Maternity Leave', description: 'Leave for maternity' },
    { name: 'Paternity Leave', description: 'Leave for paternity' },
  ];

  for (const org of organizations) {
    for (const leaveType of leaveTypesData) {
      await prisma.leaveType.create({
        data: {
          name: leaveType.name,
          description: leaveType.description,
          createdBy: 'system', // or any default string identifier
          updatedBy: 'system',
          organizationId: org.id,
        },
      });
    }
    console.log(`Created leave types for organization: ${org.name}`);
  }

  // Step 5: Fetch Employment Statuses and Employee Levels for Each Organization
  const orgData = await Promise.all(
    organizations.map(async (org) => {
      const employmentStatuses = await prisma.employmentStatus.findMany({
        where: { organizationId: org.id },
      });

      const employeeLevels = await prisma.employeeLevel.findMany({
        where: { organizationId: org.id },
      });

      const leaveTypes = await prisma.leaveType.findMany({
        where: { organizationId: org.id },
      });

      return {
        org,
        employmentStatuses,
        employeeLevels,
        leaveTypes,
      };
    })
  );

  // Step 6: Create Users
  const totalUsers = 1000;
  const usersPerOrg = Math.floor(totalUsers / organizations.length);
  let usersCreated = 0;

  for (const { org, employmentStatuses, employeeLevels } of orgData) {
    const usersData: Prisma.UserCreateManyInput[] = [];

    for (let i = 0; i < usersPerOrg; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      // Ensure email uniqueness by appending a unique number if necessary
      const uniqueEmail = `${firstName}.${lastName}.${faker.string.uuid()}@example.com`.toLowerCase();

      const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
      const dateOfBirth = faker.date.between({ from: '1960-01-01', to: '2000-12-31' });
      const startDate = faker.date.between({ from: '2010-01-01', to: '2023-12-31' });
      const endDate = faker.helpers.arrayElement([null, faker.date.future()]);

      const employmentStatus = faker.helpers.arrayElement(employmentStatuses);
      const employeeLevel = faker.helpers.arrayElement(employeeLevels);

      usersData.push({
        firstName,
        lastName,
        email: uniqueEmail,
        gender,
        dateOfBirth,
        startDate,
        endDate,
        employmentStatusId: employmentStatus.id,
        employeeLevelId: employeeLevel.id,
        organizationId: org.id,
        password: faker.internet.password(), // Note: In production, hash passwords!
        createdBy: 'system', // or reference an admin user ID
        updatedBy: 'system',
      });

      // Batch create users in chunks to improve performance and avoid memory issues
      if (usersData.length === 100) {
        await prisma.user.createMany({
          data: usersData,
          skipDuplicates: true, // Ensures unique emails
        });
        usersCreated += usersData.length;
        console.log(`${usersCreated} users created...`);
        usersData.length = 0; // Clear the array
      }
    }

    // Create any remaining users in the batch
    if (usersData.length > 0) {
      await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true,
      });
      usersCreated += usersData.length;
      console.log(`${usersCreated} users created...`);
    }
  }

  // Handle any remaining users if totalUsers isn't perfectly divisible
  const remainingUsers = totalUsers - usersCreated;
  if (remainingUsers > 0) {
    const org = organizations[0]; // Assign remaining users to the first organization
    const employmentStatuses = await prisma.employmentStatus.findMany({
      where: { organizationId: org.id },
    });
    const employeeLevels = await prisma.employeeLevel.findMany({
      where: { organizationId: org.id },
    });

    const usersData: Prisma.UserCreateManyInput[] = [];

    for (let i = 0; i < remainingUsers; i++) {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const uniqueEmail = `${firstName}.${lastName}.${faker.string.uuid()}@example.com`.toLowerCase();

      const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
      const dateOfBirth = faker.date.between({ from: '1960-01-01', to: '2000-12-31' });
      const startDate = faker.date.between({ from: '2010-01-01', to: '2023-12-31' });
      const endDate = faker.helpers.arrayElement([null, faker.date.future()]);

      const employmentStatus = faker.helpers.arrayElement(employmentStatuses);
      const employeeLevel = faker.helpers.arrayElement(employeeLevels);

      usersData.push({
        firstName,
        lastName,
        email: uniqueEmail,
        gender,
        dateOfBirth,
        startDate,
        endDate,
        employmentStatusId: employmentStatus.id,
        employeeLevelId: employeeLevel.id,
        organizationId: org.id,
        password: faker.internet.password(),
        createdBy: 'system',
        updatedBy: 'system',
      });

      // Batch insert
      if (usersData.length === 100) {
        await prisma.user.createMany({
          data: usersData,
          skipDuplicates: true,
        });
        usersCreated += usersData.length;
        console.log(`${usersCreated} users created...`);
        usersData.length = 0;
      }
    }

    // Insert any remaining users
    if (usersData.length > 0) {
      await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true,
      });
      usersCreated += usersData.length;
      console.log(`${usersCreated} users created...`);
    }
  }

  console.log(`Seeded ${usersCreated} users across ${organizations.length} organizations.`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
