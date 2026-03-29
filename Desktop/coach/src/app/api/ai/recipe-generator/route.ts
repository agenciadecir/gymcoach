import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { ingredients, mealType, dietaryRestrictions, calories, saveRecipe } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Ingredientes requeridos" }, { status: 400 })
    }

    // Create AI instance
    const zai = await ZAI.create()

    const systemPrompt = `Eres un chef profesional y nutricionista especializado en cocina saludable y deportiva. Tu tarea es crear recetas deliciosas y nutritivas usando EXCLUSIVAMENTE los ingredientes proporcionados por el usuario.

Reglas importantes:
1. SOLO puedes usar los ingredientes que el usuario menciona (puedes asumir sal, pimienta y aceite de cocina como básicos)
2. La receta debe ser práctica y fácil de seguir
3. Incluye información nutricional estimada
4. Proporciona pasos de preparación claros

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "name": "Nombre de la receta",
  "description": "Breve descripción del platillo",
  "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "instructions": ["Paso 1", "Paso 2", "Paso 3"],
  "prepTime": número_de_minutos,
  "cookTime": número_de_minutos,
  "servings": número_de_porciones,
  "calories": calorías_estimadas_por_porción,
  "protein": gramos_de_proteína,
  "carbs": gramos_de_carbohidratos,
  "fat": gramos_de_grasa,
  "tips": "Consejos adicionales para la preparación"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional.`

    const userPrompt = `Genera una receta${mealType ? ` de ${mealType}` : ''} usando EXCLUSIVAMENTE estos ingredientes:
${ingredients.map(i => `- ${i}`).join('\n')}

${dietaryRestrictions ? `Restricciones dietéticas: ${dietaryRestrictions}` : ''}
${calories ? `Calorías objetivo por porción: aproximadamente ${calories} kcal` : ''}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      thinking: { type: "disabled" }
    })

    const responseText = completion.choices[0]?.message?.content || ""
    
    // Parse JSON response
    let recipe
    try {
      // Clean the response - remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      recipe = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error("Failed to parse recipe JSON:", responseText)
      return NextResponse.json({ 
        error: "No se pudo generar la receta",
        rawResponse: responseText 
      }, { status: 500 })
    }

    // Save recipe if requested
    if (saveRecipe && recipe) {
      const savedRecipe = await db.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          instructions: JSON.stringify(recipe.instructions),
          ingredients: JSON.stringify(recipe.ingredients),
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          isAiGenerated: true,
          userId: session.user.id
        }
      })
      recipe.id = savedRecipe.id
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error("Error generating recipe:", error)
    return NextResponse.json({ error: "Error al generar receta" }, { status: 500 })
  }
}
