import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todas las invitaciones
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar que el usuario esté autenticado y tenga rol de admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    return NextResponse.json({ invitations: [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear una nueva invitación
export async function POST(req) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      console.log('No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener datos
    const data = await req.json();
    
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: 'Invitación creada correctamente',
      email: data.email 
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}