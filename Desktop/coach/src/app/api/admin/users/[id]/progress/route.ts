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

// GET - Get user's progress records (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const progress = await db.physicalProgress.findMany({
      where: { userId: id },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json({ error: "Error al obtener progreso" }, { status: 500 })
  }
}
