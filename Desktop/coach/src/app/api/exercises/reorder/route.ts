import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// PUT - Reorder exercises
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden reordenar ejercicios" }, { status: 403 })
    }

    const body = await request.json()
    const { exercises } = body // Array of { id, order }

    if (!Array.isArray(exercises)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
    }

    // Update each exercise order in a transaction
    await db.$transaction(
      exercises.map((ex: { id: string; order: number }) =>
        db.exercise.update({
          where: { id: ex.id },
          data: { order: ex.order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering exercises:", error)
    return NextResponse.json({ error: "Error al reordenar ejercicios" }, { status: 500 })
  }
}
