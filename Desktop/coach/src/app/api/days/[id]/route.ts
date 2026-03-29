import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PUT - Update a workout day
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, dayNumber } = body

    // Verify ownership through routine
    const day = await db.workoutDay.findFirst({
      where: { id },
      include: { routine: true }
    })

    if (!day || day.routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Día no encontrado" }, { status: 404 })
    }

    const updatedDay = await db.workoutDay.update({
      where: { id },
      data: { name, dayNumber },
      include: {
        exercises: {
          orderBy: { order: "asc" }
        }
      }
    })

    return NextResponse.json(updatedDay)
  } catch (error) {
    console.error("Error updating day:", error)
    return NextResponse.json({ error: "Error al actualizar día" }, { status: 500 })
  }
}

// DELETE - Delete a workout day
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through routine
    const day = await db.workoutDay.findFirst({
      where: { id },
      include: { routine: true }
    })

    if (!day || day.routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Día no encontrado" }, { status: 404 })
    }

    await db.workoutDay.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting day:", error)
    return NextResponse.json({ error: "Error al eliminar día" }, { status: 500 })
  }
}
