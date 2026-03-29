import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie(request)
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
