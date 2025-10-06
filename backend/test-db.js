const { PrismaClient } = require('@prisma/client')

async function test() {
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    await prisma.$disconnect()
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
  }
}

test()