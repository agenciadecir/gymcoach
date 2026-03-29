import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Get the first user
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' }
  })

  if (firstUser) {
    // Make them admin
    const updated = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' }
    })
    console.log(`✅ User ${updated.email} is now ADMIN`)
  } else {
    console.log('❌ No users found in database')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
