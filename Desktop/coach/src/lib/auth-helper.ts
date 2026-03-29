import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { db } from "./db"

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        bannedAt: true
      }
    })
    
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: "No autorizado", status: 401 }
  }
  
  if (!user.isActive || user.bannedAt) {
    return { success: false, error: "Cuenta bloqueada", status: 403 }
  }
  
  return { success: true, user }
}

export async function requireAdmin() {
  const authResult = await requireAuth()
  
  if (!authResult.success) {
    return authResult
  }
  
  if (authResult.user?.role !== "ADMIN") {
    return { success: false, error: "Acceso denegado", status: 403 }
  }
  
  return { success: true, user: authResult.user }
}
