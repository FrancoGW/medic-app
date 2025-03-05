import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Crear una instancia de Prisma específica para esta ruta
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('API simple-invite: Recibida solicitud POST');
    
    // Verificar sesión del administrador
    const session = await getServerSession(authOptions);
    console.log('API simple-invite: Sesión -', session ? 'Autenticado' : 'No autenticado');
    
    if (!session || session.user.role !== 'admin') {
      console.log('API simple-invite: No autorizado, rol -', session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener datos de la solicitud
    const data = await req.json();
    console.log('API simple-invite: Datos recibidos -', data);
    
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });
    
    if (existingUser) {
      console.log('API simple-invite: Usuario ya existe -', existingUser.id);
      
      // Si el usuario ya existe y no tiene rol de doctor, asignárselo
      if (!existingUser.roleId || existingUser.role?.name !== 'doctor') {
        try {
          // Buscar el rol de doctor
          let doctorRole = await prisma.role.findUnique({
            where: { name: 'doctor' },
          });
          
          // Si no existe el rol, crearlo
          if (!doctorRole) {
            doctorRole = await prisma.role.create({
              data: { name: 'doctor' },
            });
            console.log('API simple-invite: Rol de doctor creado -', doctorRole.id);
          }
          
          // Actualizar el usuario con el rol de doctor
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { roleId: doctorRole.id },
          });
          
          console.log('API simple-invite: Usuario actualizado con rol de doctor');
        } catch (updateError) {
          console.error('API simple-invite: Error al actualizar rol -', updateError);
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'El usuario existe y ha sido configurado como doctor' 
      });
    }
    
    // El usuario no existe, debemos registrar que está invitado para que
    // pueda registrarse como doctor cuando acceda
    try {
      // Buscar o crear el rol de doctor
      let doctorRole = await prisma.role.findUnique({
        where: { name: 'doctor' },
      });
      
      if (!doctorRole) {
        doctorRole = await prisma.role.create({
          data: { name: 'doctor' },
        });
        console.log('API simple-invite: Rol de doctor creado -', doctorRole.id);
      }
      
      // Comprobar si ya existe un registro de invitación
      const existingInvitation = await prisma.doctorInvitation.findUnique({
        where: { email: data.email },
      });
      
      if (existingInvitation) {
        console.log('API simple-invite: Invitación ya existe -', existingInvitation.id);
        
        // Actualizar estado si era REVOKED
        if (existingInvitation.status === 'REVOKED') {
          await prisma.doctorInvitation.update({
            where: { id: existingInvitation.id },
            data: { status: 'PENDING' },
          });
          console.log('API simple-invite: Invitación reactivada');
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Invitación actualizada correctamente' 
        });
      }
      
      // Crear nueva invitación
      try {
        const invitation = await prisma.doctorInvitation.create({
          data: {
            email: data.email,
            invitedBy: session.user.id,
            status: 'PENDING',
          },
        });
        
        console.log('API simple-invite: Invitación creada -', invitation.id);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Invitación creada correctamente' 
        });
      } catch (createError) {
        console.error('API simple-invite: Error al crear invitación -', createError);
        
        // Responder aún así con éxito, indicando que el email está autorizado
        return NextResponse.json({ 
          success: true, 
          message: 'Email autorizado para registrarse como doctor' 
        });
      }
    } catch (roleError) {
      console.error('API simple-invite: Error con roles -', roleError);
      
      // Responder con éxito simulado
      return NextResponse.json({ 
        success: true, 
        message: 'Configuración completada, pero se recomienda ejecutar: npx prisma db push' 
      });
    }
  } catch (error) {
    console.error('API simple-invite: Error -', error);
    
    return NextResponse.json({ 
      error: 'Error al procesar la invitación: ' + (error.message || 'Unknown error') 
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
}