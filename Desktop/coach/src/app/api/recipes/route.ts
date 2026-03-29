import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// GET - Get all recipes for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const recipes = await db.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(recipes)
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json({ error: "Error al obtener recetas" }, { status: 500 })
  }
}

// POST - Create a new recipe manually
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, instructions, ingredients, servings, prepTime, cookTime, calories, protein, carbs, fat, imageUrl } = body

    if (!name || !instructions || !ingredients) {
      return NextResponse.json({ error: "Nombre, instrucciones e ingredientes son requeridos" }, { status: 400 })
    }

    const recipe = await db.recipe.create({
      data: {
        name,
        description,
        instructions: typeof instructions === 'string' ? instructions : JSON.stringify(instructions),
        ingredients: typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients),
        servings: servings || 1,
        prepTime,
        cookTime,
        calories,
        protein,
        carbs,
        fat,
        imageUrl,
        isAiGenerated: false,
        userId: user.id
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Error creating recipe:", error)
    return NextResponse.json({ error: "Error al crear receta" }, { status: 500 })
  }
}
