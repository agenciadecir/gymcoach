import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// Helper para extraer el ID del video de YouTube
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// GET - Obtener todos los ejercicios de la biblioteca
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const exercises = await db.exerciseLibrary.findMany({
      orderBy: [
        { muscleGroup: "asc" },
        { name: "asc" }
      ]
    })

    // Agregar thumbnailUrl si no existe
    const exercisesWithThumbnails = exercises.map(ex => {
      if (!ex.thumbnailUrl) {
        const videoId = extractYouTubeId(ex.videoUrl)
        if (videoId) {
          return {
            ...ex,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
          }
        }
      }
      return ex
    })

    return NextResponse.json(exercisesWithThumbnails)
  } catch (error) {
    console.error("Error fetching exercise library:", error)
    return NextResponse.json({ error: "Error al obtener ejercicios" }, { status: 500 })
  }
}

// POST - Crear nuevo ejercicio (solo entrenador)
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden crear ejercicios" }, { status: 403 })
    }

    const body = await request.json()
    const { name, muscleGroup, videoUrl, description } = body

    if (!name || !muscleGroup || !videoUrl) {
      return NextResponse.json({ error: "Nombre, grupo muscular y video son requeridos" }, { status: 400 })
    }

    // Extraer ID del video y generar miniatura
    const videoId = extractYouTubeId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 })
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

    const exercise = await db.exerciseLibrary.create({
      data: {
        name,
        muscleGroup,
        videoUrl,
        thumbnailUrl,
        description,
        order: 0,
        createdById: user.id
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json({ error: "Error al crear ejercicio" }, { status: 500 })
  }
}
