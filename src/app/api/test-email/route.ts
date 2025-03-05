import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

// Configuración del transporte de correo
const getTransport = () => {
  const config = {
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  };
  
  return { 
    transport: nodemailer.createTransport(config),
    config
  };
};

// POST - Probar la configuración de correo
export async function POST(req) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener datos
    const data = await req.json();
    
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    
    // Obtener configuración de transporte
    const { transport, config } = getTransport();
    
    // Probar conexión SMTP
    let smtpCheck = null;
    try {
      await transport.verify();
      smtpCheck = { success: true, message: 'Conexión SMTP verificada correctamente' };
    } catch (smtpError) {
      smtpCheck = { 
        success: false, 
        message: 'Error al verificar conexión SMTP', 
        error: smtpError.message 
      };
    }
    
    // Intentar enviar correo de prueba
    let emailResult = null;
    try {
      const result = await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: data.email,
        subject: 'Prueba de configuración de correo',
        text: `Esta es una prueba de la configuración de correo. Si estás recibiendo este mensaje, significa que la configuración es correcta.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #3182ce;">Prueba de configuración de correo</h2>
            <p>Esta es una prueba de la configuración de correo en tu aplicación Next.js.</p>
            <p>Si estás recibiendo este mensaje, significa que la configuración es correcta.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
            <p style="font-size: 0.8em; color: #666;">Enviado desde tu aplicación Next.js.</p>
          </div>
        `,
      });
      
      emailResult = { 
        success: true, 
        message: 'Correo enviado correctamente', 
        messageId: result.messageId,
        response: result.response
      };
    } catch (emailError) {
      emailResult = { 
        success: false, 
        message: 'Error al enviar correo', 
        error: emailError.message 
      };
    }
    
    // Devolver resultados
    return NextResponse.json({
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user,
        from: process.env.EMAIL_FROM,
      },
      smtpCheck,
      emailResult,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error en el servidor', 
      details: error.message 
    }, { status: 500 });
  }
}