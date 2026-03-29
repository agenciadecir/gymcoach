import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"

// Get detailed user info (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie(request)
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      include: {
        activeRoutine: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: {
                exercises: {
                  orderBy: { order: "asc" }
                }
              }
            }
          }
        },
        activeDiet: {
          include: {
            meals: {
              orderBy: { mealType: "asc" },
              include: {
                items: {
                  orderBy: { createdAt: "asc" }
                }
              }
            }
          }
        },
        routines: {
          where: { isArchived: false },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        diets: {
          where: { isArchived: false },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        progress: {
          orderBy: { date: "desc" },
          take: 20
        },
        recipes: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            name: true,
            calories: true,
            protein: true,
            isAiGenerated: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            routines: true,
            diets: true,
            progress: true,
            recipes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user detail error:", error)
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    )
  }
}
