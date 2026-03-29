import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// POST - Create a new workout day
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden crear días" }, { status: 403 })
    }

    const body = await request.json()
    const { routineId, name, dayNumber } = body

    if (!routineId) {
      return NextResponse.json({ error: "ID de rutina requerido" }, { status: 400 })
    }

    // Verify ownership (trainer created the routine)
    const routine = await db.routine.findFirst({
      where: { id: routineId, createdById: user.id }
    })

    if (!routine) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    // Check max days
    const existingDays = await db.workoutDay.count({
      where: { routineId }
    })

    if (existingDays >= 7) {
      return NextResponse.json({ error: "Máximo 7 días por rutina" }, { status: 400 })
    }

    const day = await db.workoutDay.create({
      data: {
        name: name || `Día ${existingDays + 1}`,
        dayNumber: dayNumber || existingDays + 1,
        routineId
      },
      include: {
        exercises: true
      }
    })

    return NextResponse.json(day)
  } catch (error) {
    console.error("Error creating day:", error)
    return NextResponse.json({ error: "Error al crear día" }, { status: 500 })
  }
}
