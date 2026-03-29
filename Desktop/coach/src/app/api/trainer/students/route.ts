import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromCookie } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

// GET - Obtener alumnos del entrenador
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo los entrenadores pueden ver alumnos' }, { status: 403 });
    }

    const students = await db.user.findMany({
      where: {
        trainerId: user.id,
        role: 'STUDENT'
      },
      include: {
        routines: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        diets: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        progress: {
          orderBy: { date: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error al obtener alumnos' }, { status: 500 });
  }
}

// POST - Agregar alumno al entrenador
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromCookie(request);
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Solo los entrenadores pueden agregar alumnos' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Si existe, actualizar con nueva contraseña y asignar al entrenador
      const hashedPassword = await hashPassword(password);
      const updatedUser = await db.user.update({
        where: { email },
        data: {
          trainerId: user.id,
          role: 'STUDENT',
          password: hashedPassword
        }
      });
      return NextResponse.json(updatedUser);
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await hashPassword(password);

    // Crear nuevo alumno
    const student = await db.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: 'STUDENT',
        trainerId: user.id
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Error al crear alumno' }, { status: 500 });
  }
}
