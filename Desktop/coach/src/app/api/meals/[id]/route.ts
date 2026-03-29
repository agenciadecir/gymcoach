import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// PUT - Update a meal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden editar comidas" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { mealType, name, description, calories, protein, carbs, fat, fiber } = body

    // Verify ownership through diet
    const meal = await db.meal.findFirst({
      where: { id },
      include: {
        diet: {
          include: { createdBy: true }
        }
      }
    })

    if (!meal || meal.diet.createdById !== user.id) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    const updatedMeal = await db.meal.update({
      where: { id },
      data: {
        mealType,
        name,
        description,
        calories,
        protein,
        carbs,
        fat,
        fiber
      }
    })

    // Update diet totals
    const allMeals = await db.meal.findMany({ where: { dietId: meal.dietId } })
    const totals = allMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      fiber: acc.fiber + (m.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

    await db.diet.update({
      where: { id: meal.dietId },
      data: {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber
      }
    })

    return NextResponse.json(updatedMeal)
  } catch (error) {
    console.error("Error updating meal:", error)
    return NextResponse.json({ error: "Error al actualizar comida" }, { status: 500 })
  }
}

// DELETE - Delete a meal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden eliminar comidas" }, { status: 403 })
    }

    const { id } = await params

    // Verify ownership through diet
    const meal = await db.meal.findFirst({
      where: { id },
      include: {
        diet: true
      }
    })

    if (!meal || meal.diet.createdById !== user.id) {
      return NextResponse.json({ error: "Comida no encontrada" }, { status: 404 })
    }

    const dietId = meal.dietId

    // Delete meal items first
    await db.mealItem.deleteMany({
      where: { mealId: id }
    })

    // Delete meal
    await db.meal.delete({
      where: { id }
    })

    // Update diet totals
    const allMeals = await db.meal.findMany({ where: { dietId } })
    const totals = allMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      fiber: acc.fiber + (m.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

    await db.diet.update({
      where: { id: dietId },
      data: {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meal:", error)
    return NextResponse.json({ error: "Error al eliminar comida" }, { status: 500 })
  }
}
