import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ZAI from "z-ai-web-dev-sdk"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { mealDescription, mealType } = body

    if (!mealDescription || typeof mealDescription !== 'string') {
      return NextResponse.json({ error: "Descripción de comida requerida" }, { status: 400 })
    }

    // Create AI instance
    const zai = await ZAI.create()

    const systemPrompt = `Eres un nutricionista experto en análisis de comidas y cálculo de macronutrientes. Tu tarea es analizar una descripción de comida en texto libre y estimar sus valores nutricionales.

Reglas importantes:
1. Analiza cada alimento mencionado y sus cantidades aproximadas
2. Estima las calorías totales y macronutrientes (proteínas, carbohidratos, grasas)
3. Considera métodos de cocción típicos si no se especifican
4. Sé realista con las porciones estándar

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "calories": número_total_de_calorías,
  "protein": gramos_de_proteína,
  "carbs": gramos_de_carbohidratos,
  "fat": gramos_de_grasa,
  "fiber": gramos_de_fibra_estimados,
  "summary": "Breve resumen de lo analizado"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional ni formato markdown.`

    const userPrompt = `Analiza esta comida${mealType ? ` (${mealType})` : ''} y calcula sus macronutrientes:

"${mealDescription}"

Proporciona las calorías totales, proteínas, carbohidratos, grasas y fibra estimados.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      thinking: { type: "disabled" }
    })

    const responseText = completion.choices[0]?.message?.content || ""
    
    // Parse JSON response
    let macros
    try {
      // Clean the response - remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      macros = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error("Failed to parse macros JSON:", responseText)
      return NextResponse.json({ 
        error: "No se pudo analizar la comida",
        rawResponse: responseText 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      macros: {
        calories: macros.calories || 0,
        protein: macros.protein || 0,
        carbs: macros.carbs || 0,
        fat: macros.fat || 0,
        fiber: macros.fiber || 0,
        summary: macros.summary || ""
      }
    })
  } catch (error) {
    console.error("Error analyzing meal:", error)
    return NextResponse.json({ error: "Error al analizar comida" }, { status: 500 })
  }
}
