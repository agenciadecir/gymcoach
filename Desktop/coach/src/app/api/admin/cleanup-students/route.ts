import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Delete all students (for cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const result = await db.user.deleteMany({
      where: { role: 'STUDENT' }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `Eliminados ${result.count} alumnos` 
    })
  } catch (error) {
    console.error('Error deleting students:', error)
    return NextResponse.json({ error: 'Error al eliminar alumnos' }, { status: 500 })
  }
}
