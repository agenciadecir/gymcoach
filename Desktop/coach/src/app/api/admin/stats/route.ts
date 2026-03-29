import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Helper to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  })
  
  if (!user || user.role !== "ADMIN" || !user.isActive) return null
  return session.user.id
}

// GET - Get admin dashboard stats
export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      adminCount,
      totalRoutines,
      totalProgress,
      totalDiets,
      totalRecipes,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.routine.count(),
      db.physicalProgress.count(),
      db.diet.count(),
      db.recipe.count(),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        admins: adminCount,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth
      },
      content: {
        routines: totalRoutines,
        progress: totalProgress,
        diets: totalDiets,
        recipes: totalRecipes
      }
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
