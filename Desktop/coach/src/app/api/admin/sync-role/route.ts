import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Sync user role to ADMIN (for fixing session issues)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Update user role to ADMIN
    const user = await db.user.update({
      where: { email: session.user.email },
      data: { role: "ADMIN" }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Rol actualizado a ADMIN",
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error("Error syncing role:", error)
    return NextResponse.json({ error: "Error al actualizar rol" }, { status: 500 })
  }
}
