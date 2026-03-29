import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromCookie } from '@/lib/session';

// GET - Obtener detalles de un alumno
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo los entrenadores pueden ver alumnos' }, { status: 403 });
    }

    const { id } = await params;

    const student = await db.user.findFirst({
      where: {
        id,
        trainerId: user.id,
        role: 'STUDENT'
      },
      include: {
        routines: {
          where: { isArchived: false },
          include: {
            days: {
              include: {
                exercises: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { dayNumber: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        diets: {
          where: { isArchived: false },
          include: {
            meals: {
              include: {
                items: true
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        progress: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Error al obtener alumno' }, { status: 500 });
  }
}

// DELETE - Eliminar alumno (desasignar del entrenador)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo los entrenadores pueden eliminar alumnos' }, { status: 403 });
    }

    const { id } = await params;

    // Solo desasignar, no eliminar el usuario
    const student = await db.user.update({
      where: { id },
      data: {
        trainerId: null
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error removing student:', error);
    return NextResponse.json({ error: 'Error al eliminar alumno' }, { status: 500 });
  }
}
