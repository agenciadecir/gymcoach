import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "gym-progress-tracker-secret-key-2024-super-secure"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    // Check if user is banned or inactive
    if (!user.isActive || user.bannedAt) {
      return NextResponse.json(
        { error: "Cuenta bloqueada" },
        { status: 403 }
      )
    }

    // Verify password
    const hashedPassword = await hashPassword(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    )

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

    // Set cookie
    response.cookies.set({
      name: "gympro_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    )
  }
}
