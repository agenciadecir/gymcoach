import { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "./db"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "gym-progress-tracker-secret-key-2024-super-secure"

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function getSessionFromCookie(request: NextRequest): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get("gympro_session")?.value
    
    if (!token) {
      return null
    }
    
    const decoded = verify(token, JWT_SECRET) as SessionUser
    
    // Verify user still exists and is active
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, bannedAt: true }
    })
    
    if (!user || !user.isActive || user.bannedAt) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  const user = await getSessionFromCookie(request)
  
  if (!user) {
    return { success: false, error: "No autorizado", status: 401 }
  }
  
  return { success: true, user }
}

export async function getAdminUser(request: NextRequest) {
  const result = await getAuthUser(request)
  
  if (!result.success) {
    return result
  }
  
  if (result.user?.role !== "ADMIN") {
    return { success: false, error: "Acceso denegado", status: 403 }
  }
  
  return result
}

export async function getTrainerUser(request: NextRequest) {
  const result = await getAuthUser(request)
  
  if (!result.success) {
    return result
  }
  
  if (result.user?.role !== "TRAINER") {
    return { success: false, error: "Solo entrenadores pueden realizar esta acción", status: 403 }
  }
  
  return result
}

export async function getStudentUser(request: NextRequest) {
  const result = await getAuthUser(request)
  
  if (!result.success) {
    return result
  }
  
  if (result.user?.role !== "STUDENT") {
    return { success: false, error: "Solo alumnos pueden realizar esta acción", status: 403 }
  }
  
  return result
}
