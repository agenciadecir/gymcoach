import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}
