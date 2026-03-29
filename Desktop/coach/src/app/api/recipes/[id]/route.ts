import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// GET - Get a specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const recipe = await db.recipe.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!recipe) {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json({ error: "Error al obtener receta" }, { status: 500 })
  }
}

// DELETE - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const recipe = await db.recipe.findFirst({
      where: { id, userId: user.id }
    })

    if (!recipe) {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    }

    await db.recipe.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return NextResponse.json({ error: "Error al eliminar receta" }, { status: 500 })
  }
}
