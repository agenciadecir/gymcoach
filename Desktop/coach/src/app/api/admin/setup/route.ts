import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "ADMIN" }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Ya existe un administrador en el sistema" },
        { status: 400 }
      )
    }

    // Promote current user to admin
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" }
    })

    return NextResponse.json({
      success: true,
      message: "¡Felicidades! Ahora eres administrador",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })
  } catch (error) {
    console.error("Error setting up admin:", error)
    return NextResponse.json(
      { error: "Error al configurar administrador" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if any admin exists
    const adminCount = await db.user.count({
      where: { role: "ADMIN" }
    })

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json(
      { error: "Error al verificar administradores" },
      { status: 500 }
    )
  }
}
