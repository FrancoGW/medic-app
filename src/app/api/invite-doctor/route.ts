import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configuración del transporte de correo
const getTransport = () => {
  console.log('Configurando transporte SMTP con estos valores:');
  console.log('Host:', process.env.EMAIL_SERVER_HOST);
  console.log('Port:', process.env.EMAIL_SERVER_PORT);
  console.log('User:', process.env.EMAIL_SERVER_USER);
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Función para enviar correo
const sendEmail = async (email) => {
  try {
    console.log(`Intentando enviar correo a: ${email}`);
    
    const transport = getTransport();
    const signInURL = `${process.env.NEXTAUTH_URL}/login?email=${encodeURIComponent(email)}`;
    
    const result = await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Invitación a registrarse como Doctor',
      text: `Has sido invitado a registrarte como doctor en nuestra plataforma. Por favor, visita el siguiente enlace para registrarte: ${signInURL}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3182ce;">Invitación para Doctor</h2>
          <p>Has sido invitado a registrarte como doctor en nuestra plataforma.</p>
          <p style="margin: 20px 0;">
            <a href="${signInURL}" style="background-color: #3182ce; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Registrarse ahora</a>
          </p>
          <p style="font-size: 0.8em; color: #666;">Si no solicitaste esta invitación, puedes ignorar este correo.</p>
        </div>
      `,
    });
    
    console.log('Correo enviado correctamente:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { success: false, error: error.message };
  }
};

// POST - Crear una nueva invitación
export async function POST(req) {
  console.log('Recibida solicitud POST en /api/invite-doctor');
  
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session || session.user.role !== 'admin') {
      console.log('No autorizado, rol:', session?.user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener datos
    const data = await req.json();
    console.log('Datos recibidos:', data);
    
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    
    // Verificar si el doctor ya fue invitado
    try {
      const existingInvitation = await prisma.doctorInvitation.findUnique({
        where: { email: data.email },
      });
      
      if (existingInvitation) {
        console.log('Doctor ya invitado:', existingInvitation);
        
        // Si está revocado, lo activamos nuevamente
        if (existingInvitation.status === 'REVOKED') {
          await prisma.doctorInvitation.update({
            where: { id: existingInvitation.id },
            data: { status: 'PENDING' },
          });
          console.log('Invitación reactivada');
        }
        
        // Intentar enviar correo de nuevo
        const emailResult = await sendEmail(data.email);
        
        return NextResponse.json({ 
          message: 'Invitación actualizada correctamente',
          email: data.email,
          emailSent: emailResult.success,
          emailDetails: emailResult 
        });
      }
    } catch (err) {
      console.log('Error al verificar invitación existente:', err);
      // Continuamos con el flujo normal si hay error
    }
    
    // Crear la invitación en la base de datos
    let invitation;
    try {
      invitation = await prisma.doctorInvitation.create({
        data: {
          email: data.email,
          invitedBy: session.user.id,
          status: 'PENDING',
        },
      });
      console.log('Invitación creada en la base de datos:', invitation);
    } catch (dbError) {
      console.error('Error al crear invitación en la base de datos:', dbError);
      // Continuamos aunque haya error en la base de datos
    }
    
    // Intentar enviar el correo electrónico
    const emailResult = await sendEmail(data.email);
    
    return NextResponse.json({ 
      message: 'Invitación enviada correctamente',
      email: data.email,
      emailSent: emailResult.success,
      emailDetails: emailResult,
      invitation
    }, { status: 201 });
  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json({ 
      error: 'Error en el servidor', 
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}