import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionFromCookie } from "@/lib/session"

// DELETE - Eliminar ejercicio (solo entrenador)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    const { id } = await params
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden eliminar ejercicios" }, { status: 403 })
    }

    await db.exerciseLibrary.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json({ error: "Error al eliminar ejercicio" }, { status: 500 })
  }
}

// PUT - Actualizar ejercicio (solo entrenador)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request)
    const { id } = await params
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (user.role !== "TRAINER") {
      return NextResponse.json({ error: "Solo los entrenadores pueden editar ejercicios" }, { status: 403 })
    }

    const body = await request.json()
    const { name, muscleGroup, videoUrl, description } = body

    // Helper para extraer el ID del video de YouTube
    const extractYouTubeId = (url: string): string | null => {
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

    let thumbnailUrl = undefined
    if (videoUrl) {
      const videoId = extractYouTubeId(videoUrl)
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      }
    }

    const exercise = await db.exerciseLibrary.update({
      where: { id },
      data: {
        name,
        muscleGroup,
        videoUrl,
        description,
        thumbnailUrl
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error updating exercise:", error)
    return NextResponse.json({ error: "Error al actualizar ejercicio" }, { status: 500 })
  }
}
