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
    const { routineId, userGoal, userDiet } = body

    // Get routine with all details
    const routine = await db.routine.findFirst({
      where: {
        id: routineId,
        userId: session.user.id
      },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    })

    if (!routine) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    // Prepare routine data for AI analysis
    const routineData = {
      name: routine.name,
      description: routine.description,
      days: routine.days.map(day => ({
        name: day.name,
        exercises: day.exercises.map(ex => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight
        }))
      }))
    }

    // Create AI instance
    const zai = await ZAI.create()

    const systemPrompt = `Eres un entrenador personal profesional con más de 15 años de experiencia en fisicoculturismo, hipertrofia muscular y nutrición deportiva. Tu especialidad es el diseño y análisis de rutinas de entrenamiento enfocadas en hipertrofia muscular.

Analiza la rutina proporcionada considerando:
1. Volumen de entrenamiento (series semanales por grupo muscular)
2. Distribución de frecuencia
3. Selección de ejercicios (compuestos vs aislamiento)
4. Progresión y periodización
5. Balance entre grupos musculares
6. Posibles lesiones o sobreentrenamiento
7. Recomendaciones específicas de mejora

Responde en español con un tono profesional pero accesible. Estructura tu respuesta en secciones claras usando Markdown.`

    const userPrompt = `Analiza esta rutina de entrenamiento:

**Nombre de la rutina:** ${routineData.name}
${routineData.description ? `**Descripción:** ${routineData.description}` : ''}

**Días de entrenamiento:**
${routineData.days.map((day) => `
### ${day.name}
${day.exercises.map(ex => `- ${ex.name}${ex.muscleGroup ? ` (${ex.muscleGroup})` : ''}: ${ex.sets || '?'} series x ${ex.reps || '?'} reps${ex.weight ? ` @ ${ex.weight}kg` : ''}`).join('\n')}`).join('\n')}

${userGoal ? `**Objetivo del usuario:** ${userGoal}` : ''}
${userDiet ? `**Dieta actual del usuario:** ${userDiet}` : ''}

Proporciona:
1. Resumen general de la rutina
2. Análisis de volumen y frecuencia
3. Puntos fuertes
4. Áreas de mejora
5. Recomendaciones específicas para hipertrofia
6. Sugerencias de ejercicios adicionales o modificaciones
7. Consideraciones sobre la dieta (si se proporcionó)`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      thinking: { type: "disabled" }
    })

    const analysis = completion.choices[0]?.message?.content

    // Save analysis to routine
    await db.routine.update({
      where: { id: routineId },
      data: { aiAnalysis: analysis }
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error in AI analysis:", error)
    return NextResponse.json({ error: "Error en el análisis de IA" }, { status: 500 })
  }
}
