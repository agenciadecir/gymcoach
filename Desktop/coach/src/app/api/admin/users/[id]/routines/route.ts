import { NextRequest, NextResponse } from "next/server"
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

// GET - Get user's routines (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const routines = await db.routine.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
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
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error("Error fetching user routines:", error)
    return NextResponse.json({ error: "Error al obtener rutinas" }, { status: 500 })
  }
}
