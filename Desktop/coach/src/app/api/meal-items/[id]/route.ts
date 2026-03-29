import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// DELETE - Delete a meal item
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

    // Verify ownership
    const item = await db.mealItem.findFirst({
      where: { id },
      include: {
        meal: {
          include: { diet: true }
        }
      }
    })

    if (!item || item.meal.diet.userId !== session.user.id) {
      return NextResponse.json({ error: "Alimento no encontrado" }, { status: 404 })
    }

    const mealId = item.mealId

    await db.mealItem.delete({
      where: { id }
    })

    // Update meal totals
    const remainingItems = await db.mealItem.findMany({ where: { mealId } })
    const totals = remainingItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    await db.meal.update({
      where: { id: mealId },
      data: totals
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meal item:", error)
    return NextResponse.json({ error: "Error al eliminar alimento" }, { status: 500 })
  }
}
