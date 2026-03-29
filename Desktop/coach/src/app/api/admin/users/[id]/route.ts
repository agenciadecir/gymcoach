import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Helper to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true }
  })
  
  if (!user || user.role !== "ADMIN" || !user.isActive) return null
  return session.user.id
}

// GET - Get single user details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        bannedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            routines: true,
            progress: true,
            diets: true,
            recipes: true
          }
        },
        routines: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, isActive: true, createdAt: true }
        },
        progress: {
          take: 5,
          orderBy: { date: "desc" },
          select: { id: true, date: true, bodyWeight: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 })
  }
}

// PUT - Update user (ban, activate, change role)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await isAdmin()
    if (!adminId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // "ban", "unban", "activate", "deactivate", "makeAdmin", "removeAdmin"

    // Prevent self-modification
    if (id === adminId) {
      return NextResponse.json({ error: "No puedes modificarte a ti mismo" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case "ban":
        updateData = {
          isActive: false,
          bannedAt: new Date()
        }
        break
      case "unban":
        updateData = {
          isActive: true,
          bannedAt: null
        }
        break
      case "activate":
        updateData = { isActive: true }
        break
      case "deactivate":
        updateData = { isActive: false }
        break
      case "makeAdmin":
        updateData = { role: "ADMIN" }
        break
      case "removeAdmin":
        updateData = { role: "USER" }
        break
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        bannedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

// DELETE - Delete user permanently (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await isAdmin()
    if (!adminId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === adminId) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Delete user (cascade will handle related data)
    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Usuario eliminado" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
