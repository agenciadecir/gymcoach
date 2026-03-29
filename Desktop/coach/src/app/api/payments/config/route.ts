import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionFromCookie } from '@/lib/session'

// GET - Obtener configuración de pagos de un alumno
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    const targetId = user.role === 'TRAINER' ? studentId : user.id
    
    if (!targetId) {
      return NextResponse.json({ error: 'ID de alumno requerido' }, { status: 400 })
    }
    
    // Si es trainer, verificar que el alumno es suyo
    if (user.role === 'TRAINER' && studentId) {
      const student = await db.user.findFirst({
        where: { id: studentId, trainerId: user.id }
      })
      if (!student) {
        return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
      }
    }
    
    const config = await db.studentPaymentConfig.findUnique({
      where: { studentId: targetId },
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    })
    
    return NextResponse.json(config || null)
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

// POST - Crear o actualizar configuración de pagos
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request)
    
    if (!user || user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo el entrenador puede configurar pagos' }, { status: 403 })
    }
    
    const body = await request.json()
    const { studentId, monthlyFee, dueDay, startDate, notes } = body
    
    // Verificar que el alumno existe y es del trainer
    const student = await db.user.findFirst({
      where: { id: studentId, trainerId: user.id }
    })
    
    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }
    
    // Upsert de la configuración
    const config = await db.studentPaymentConfig.upsert({
      where: { studentId },
      update: {
        monthlyFee: monthlyFee || 0,
        dueDay: dueDay || 10,
        startDate: startDate ? new Date(startDate) : null,
        notes: notes || null
      },
      create: {
        studentId,
        monthlyFee: monthlyFee || 0,
        dueDay: dueDay || 10,
        startDate: startDate ? new Date(startDate) : null,
        notes: notes || null
      },
      include: {
        student: { select: { id: true, name: true, email: true } }
      }
    })
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error saving payment config:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}
