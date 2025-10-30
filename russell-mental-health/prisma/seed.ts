// Database Seed Script
// Creates initial therapist account for testing

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create therapist user
  const user = await prisma.user.upsert({
    where: { email: 'dr.russell@russellmentalhealth.com' },
    update: {},
    create: {
      email: 'dr.russell@russellmentalhealth.com',
      name: 'Dr. Bethany R. Russell',
      role: 'THERAPIST',
      password: '$2b$10$NRzZNNUs9KaqYngMlrzj3.GEXlpgx9YtKZ3aZ1aUEq/vOs1qhnvES', // password123
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created user:', user.email)

  // Create therapist profile
  const therapist = await prisma.therapist.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      npi: '1336918325',
      license: 'FL-LMHC-12345',
      credentials: 'Ph.D., LMHC, RPT, NCC',
      specialty: 'Play Therapy, ASD Assessments, Immigration Evaluations',
    },
  })

  console.log('✅ Created therapist profile:', therapist.npi)

  // Create some sample patients for testing
  console.log('🧪 Creating sample patients...')

  const patient1 = await prisma.patient.create({
    data: {
      therapistId: therapist.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(239) 555-0101',
      dateOfBirth: new Date('1985-06-15'),
      address: {
        street: '123 Main St',
        city: 'Fort Myers',
        state: 'FL',
        zip: '33901',
      },
      status: 'ACTIVE',
      onboardingComplete: true,
    },
  })

  const patient2 = await prisma.patient.create({
    data: {
      therapistId: therapist.id,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(239) 555-0102',
      dateOfBirth: new Date('1992-03-22'),
      address: {
        street: '456 Oak Ave',
        city: 'Babcock Ranch',
        state: 'FL',
        zip: '32988',
      },
      status: 'ACTIVE',
      onboardingComplete: false,
    },
  })

  const patient3 = await prisma.patient.create({
    data: {
      therapistId: therapist.id,
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '(239) 555-0103',
      dateOfBirth: new Date('1978-11-08'),
      address: {
        street: '789 Pine Rd',
        city: 'Naples',
        state: 'FL',
        zip: '34102',
      },
      status: 'ACTIVE',
      onboardingComplete: true,
    },
  })

  console.log('✅ Created 3 sample patients')

  console.log('\n🎉 Database seed completed!')
  console.log('\n📝 Login credentials:')
  console.log('   Email: dr.russell@russellmentalhealth.com')
  console.log('   Password: password123')
  console.log('\n🚀 Start the dev server: npm run dev')
  console.log('   Then visit: http://localhost:3000')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
