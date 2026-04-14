const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Seed script for Organization Types
 * 
 * This script populates the database with common organization types:
 * - Startup
 * - NGO (Non-Governmental Organization)
 * - Business
 * - Enterprise
 * - Government
 * - Educational Institution
 * - Investor
 * - Non-Profit
 * - Foundation
 * - Corporation
 */

const organizationTypes = [
  {
    name: 'Startup',
    description: 'Early-stage company focused on innovation, rapid growth, and scalability. Typically in technology, fintech, or emerging industries.'
  },
  {
    name: 'NGO',
    description: 'Non-Governmental Organization working for social welfare, humanitarian causes, environmental protection, or community development without profit motive.'
  },
  {
    name: 'Business',
    description: 'Profit-oriented company providing goods or services to customers. Can range from small businesses to medium-sized enterprises.'
  },
  {
    name: 'Enterprise',
    description: 'Large-scale business organization with complex operations, multiple departments, and significant market presence. Typically employs 1000+ people.'
  },
  {
    name: 'Government',
    description: 'Public sector organizations managed by the state or federal government. Includes government agencies, departments, and public institutions.'
  },
  {
    name: 'Educational Institution',
    description: 'Organizations focused on education and training, including schools, colleges, universities, and vocational training centers.'
  },
  {
    name: 'Investor',
    description: 'Individual or organization that provides capital to businesses in exchange for equity or returns. Includes VCs, angel investors, and investment firms.'
  },
  {
    name: 'Non-Profit',
    description: 'Organization that operates for charitable, educational, or social purposes without distributing profits to owners or shareholders.'
  },
  {
    name: 'Foundation',
    description: 'Non-profit organization that provides grants and funding to other organizations or individuals for charitable, educational, or research purposes.'
  },
  {
    name: 'Corporation',
    description: 'Large business entity that is legally separate from its owners, with shareholders, board of directors, and complex organizational structure.'
  }
];

/**
 * Main seed function
 */
async function seedOrganizationTypes() {
  try {
    console.log('🌱 Starting organization types seed...\n');

    // Check if organization types already exist
    const existingTypes = await prisma.organizationType.findMany();
    
    if (existingTypes.length > 0) {
      console.log(`⚠️  Found ${existingTypes.length} existing organization types.`);
      console.log('   Skipping seed to avoid duplicates.\n');
      console.log('   To re-seed, delete existing types first or use --force flag.\n');
      return;
    }

    // Create organization types
    console.log(`📝 Creating ${organizationTypes.length} organization types...\n`);

    for (const orgType of organizationTypes) {
      try {
        const created = await prisma.organizationType.create({
          data: orgType
        });
        console.log(`✅ Created: ${created.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Skipped: ${orgType.name} (already exists)`);
        } else {
          console.error(`❌ Error creating ${orgType.name}:`, error.message);
        }
      }
    }

    console.log('\n✨ Organization types seed completed successfully!\n');

    // Display summary
    const allTypes = await prisma.organizationType.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Total organization types in database: ${allTypes.length}\n`);
    console.log('Organization Types:');
    allTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type.name}${type.description ? ` - ${type.description.substring(0, 60)}...` : ''}`);
    });

  } catch (error) {
    console.error('❌ Error seeding organization types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Force seed - deletes all existing types and re-creates them
 */
async function forceSeed() {
  try {
    console.log('🔄 Force seeding organization types...\n');
    
    // Delete all existing organization types
    const deleted = await prisma.organizationType.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.count} existing organization types.\n`);

    // Run normal seed
    await seedOrganizationTypes();
  } catch (error) {
    console.error('❌ Error in force seed:', error);
    throw error;
  }
}

// Run seed if script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');

  if (force) {
    forceSeed()
      .then(() => {
        console.log('\n✅ Force seed completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Force seed failed:', error);
        process.exit(1);
      });
  } else {
    seedOrganizationTypes()
      .then(() => {
        console.log('\n✅ Seed completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  seedOrganizationTypes,
  forceSeed,
  organizationTypes
};

