import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Add an item to a meal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { mealId, name, quantity, unit, calories, protein, carbs, fat, fiber } = body

    if (!mealId || !name) {
      return NextResponse.json({ error: "ID de comida y nombre son requeridos" }, { status: 400 })
    }

    // Verify ownership through diet
    const meal = await db.meal.findFirst({
      where: { id: mealId },
      include: { diet: true }
    })

    if (!meal || meal.diet.userId !== session.user.id) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    const item = await db.mealItem.create({
      data: {
        name,
        quantity: quantity || 100,
        unit: unit || "g",
        calories,
        protein,
        carbs,
        fat,
        fiber,
        mealId
      }
    })

    // Update meal totals
    const allItems = await db.mealItem.findMany({ where: { mealId } })
    const totals = allItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    // Add new item to totals
    totals.calories += calories || 0
    totals.protein += protein || 0
    totals.carbs += carbs || 0
    totals.fat += fat || 0

    await db.meal.update({
      where: { id: mealId },
      data: totals
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error creating meal item:", error)
    return NextResponse.json({ error: "Error al agregar alimento" }, { status: 500 })
  }
}
