import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      authenticated: true,
      user
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      { authenticated: false, error: "Error verificando sesión" },
      { status: 500 }
    )
  }
}
