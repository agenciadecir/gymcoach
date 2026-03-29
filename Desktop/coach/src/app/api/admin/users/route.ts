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

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") // "active", "banned", "all"

    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    }
    
    if (status === "active") {
      where.isActive = true
      where.bannedAt = null
    } else if (status === "banned") {
      where.isActive = false
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          bannedAt: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              routines: true,
              progress: true,
              diets: true,
              recipes: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.user.count({ where })
    ])

    return NextResponse.json({ users, total, page, limit })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}
