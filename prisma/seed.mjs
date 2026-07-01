import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

const regulations = [
  {
    name: 'ISO/IEC 27001:2022',
    description: 'ISMS standard...',
    authority: 'ISO/IEC',
    country: 'International',
    region: 'Global',
    category: 'INFORMATION_SECURITY',
    version: '2022',
    effectiveDate: new Date('2022-10-25'),
    externalUrl: 'https://www.iso.org/standard/27001',
    status: 'ACTIVE',
    requirements: [
      {
        id: 'ISO27-4.1',
        title: 'Understanding Organization Context',
        type: 'MANDATORY',
        priority: 'HIGH',
        desc: 'Determine internal and external issues...'
      },
      {
        id: 'ISO27-5.1',
        title: 'Leadership and Commitment',
        type: 'MANDATORY',
        priority: 'CRITICAL',
        desc: 'Top management must demonstrate leadership...'
      }
    ]
  }
  // 👉 KEEP YOUR OTHER REGULATIONS EXACTLY SAME (unchanged)
];

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // ✅ Create admin
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pryrogrc.com' },
      update: {},
      create: {
        email: 'admin@pryrogrc.com',
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMINISTRATOR',
        department: 'IT',
      },
    });

    console.log(`✅ Admin ready: ${adminUser.email}`);

    // ✅ Seed regulations
    for (const reg of regulations) {
      const { requirements, ...regData } = reg;

      let regulation = await prisma.regulation.findFirst({
        where: { name: regData.name },
      });

      if (!regulation) {
        regulation = await prisma.regulation.create({
          data: regData,
        });

        console.log(`✅ Created regulation: ${regData.name}`);
      } else {
        console.log(`⏭️ Exists: ${regData.name}`);
      }

      // ✅ Seed requirements
      for (const req of requirements) {
        const exists = await prisma.requirement.findUnique({
          where: { requirementId: req.id },
        });

        if (!exists) {
          await prisma.requirement.create({
            data: {
              requirementId: req.id,
              title: req.title,
              description: req.desc,
              requirementType: req.type,
              priority: req.priority,
              status: 'PENDING_REVIEW',
              regulationId: regulation.id,
            },
          });

          console.log(`   ➕ Requirement: ${req.id}`);
        }
      }
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();