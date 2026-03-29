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
    const { meals } = body

    if (!meals || typeof meals !== 'object') {
      return NextResponse.json({ error: "Datos de comidas requeridos" }, { status: 400 })
    }

    // Create AI instance
    const zai = await ZAI.create()

    // Build meals description for AI
    const mealsDescription = Object.entries(meals)
      .filter(([_, desc]) => desc && (desc as string).trim())
      .map(([mealType, desc]) => {
        const mealTypeLabels: Record<string, string> = {
          breakfast: "Desayuno",
          morning_snack: "Colación matutina",
          lunch: "Almuerzo",
          afternoon_snack: "Colación vespertina",
          dinner: "Cena"
        }
        return `${mealTypeLabels[mealType] || mealType}: ${desc}`
      })
      .join('\n')

    if (!mealsDescription.trim()) {
      return NextResponse.json({ error: "No hay comidas para analizar" }, { status: 400 })
    }

    const systemPrompt = `Eres un nutricionista deportivo experto. Analiza TODA la dieta diaria de una persona y proporciona:

1. Un resumen general de la dieta
2. Análisis del balance de macronutrientes
3. Evaluación de la calidad nutricional
4. Recomendaciones específicas para mejorar (especialmente para hipertrofia)
5. Sugerencias de alimentos que podrían agregarse o reducirse

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "summary": "Resumen general de la dieta",
  "macroAnalysis": "Análisis del balance de macros",
  "qualityScore": número_del_1_al_10,
  "strengths": ["punto fuerte 1", "punto fuerte 2"],
  "improvements": ["mejora sugerida 1", "mejora sugerida 2"],
  "recommendations": "Recomendaciones generales para hipertrofia"
}

Responde ÚNICAMENTE con el JSON, sin formato markdown.`

    const userPrompt = `Analiza esta dieta diaria completa:

${mealsDescription}

Proporciona un análisis nutricional completo.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      thinking: { type: "disabled" }
    })

    const responseText = completion.choices[0]?.message?.content || ""
    
    // Parse JSON response
    let analysis
    try {
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanedResponse)
    } catch (e) {
      console.error("Failed to parse diet analysis JSON:", responseText)
      return NextResponse.json({ 
        error: "No se pudo analizar la dieta",
        rawResponse: responseText 
      }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing diet:", error)
    return NextResponse.json({ error: "Error al analizar dieta" }, { status: 500 })
  }
}
