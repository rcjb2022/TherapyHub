// Create Test Patient User
// Run with: node scripts/create-test-patient.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating test patient user...\n')

  // Simple credentials
  const email = 'patient@test.com'
  const password = 'password123'
  const hashedPassword = await bcrypt.hash(password, 12)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('⚠️  User already exists with email:', email)
    console.log('Deleting existing user...\n')
    await prisma.user.delete({ where: { email } })
  }

  // Get first patient (or create a test patient)
  let patient = await prisma.patient.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!patient) {
    console.log('No patients found. Creating test patient...\n')

    // Get therapist
    const therapist = await prisma.therapist.findFirst()

    if (!therapist) {
      throw new Error('No therapist found! Please create a therapist first.')
    }

    patient = await prisma.patient.create({
      data: {
        therapistId: therapist.id,
        firstName: 'Test',
        lastName: 'Patient',
        email: 'patient@test.com',
        phone: '555-0100',
        dateOfBirth: new Date('1990-01-01'),
        status: 'ACTIVE',
      },
    })

    console.log('✅ Created test patient:', patient.firstName, patient.lastName)
  }

  // Create patient user
  const user = await prisma.user.create({
    data: {
      email: email,
      name: `${patient.firstName} ${patient.lastName}`,
      password: hashedPassword,
      role: 'PATIENT',
      patient: {
        connect: { id: patient.id },
      },
    },
  })

  console.log('\n✅ Test patient user created successfully!\n')
  console.log('📧 Email:    ', email)
  console.log('🔑 Password: ', password)
  console.log('👤 Name:     ', user.name)
  console.log('🆔 Patient ID:', patient.id)
  console.log('\n💡 You can now log in at http://localhost:3000/login\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
