import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Delete all data
  await prisma.mealItem.deleteMany({})
  await prisma.meal.deleteMany({})
  await prisma.diet.deleteMany({})
  await prisma.exercise.deleteMany({})
  await prisma.workoutDay.deleteMany({})
  await prisma.routine.deleteMany({})
  await prisma.physicalProgress.deleteMany({})
  await prisma.recipe.deleteMany({})
  
  // Clear active references
  await prisma.user.updateMany({
    data: {
      activeRoutineId: null,
      activeDietId: null
    }
  })
  
  console.log('All data cleared!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
