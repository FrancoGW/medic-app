import NextAuth from 'next-auth';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Para Hostinger
const transportConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: transportConfig,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        try {
          const { createTransport } = await import('nodemailer');
          // Crear el transporte aquí dentro de la función
          const transport = createTransport(server);
          
          const result = await transport.sendMail({
            to: email,
            from,
            subject: `Acceso a tu cuenta de Administrador`,
            text: `Haz clic en el siguiente enlace para iniciar sesión: ${url}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #3182ce;">Acceso a tu cuenta de Administrador</h2>
              <p>Haz clic en el siguiente enlace para iniciar sesión:</p>
              <p style="margin: 20px 0;">
                <a href="${url}" style="background-color: #3182ce; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Iniciar sesión</a>
              </p>
              <p style="font-size: 0.8em; color: #666;">Si no solicitaste este email, puedes ignorarlo.</p>
            </div>
            `,
          });
          
          console.log('Email enviado:', result);
        } catch (error) {
          console.error('Error al enviar email:', error);
          // No lanzar el error aquí, solo registrarlo
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request',
    error: '/auth-error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          // Añadir rol e ID a la sesión
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { role: true },
          });
          
          if (user) {
            session.user.id = user.id;
            session.user.role = user.role?.name || 'user';
          }
        } catch (error) {
          console.error('Error al obtener los datos del usuario:', error);
          // No lanzar error aquí, solo registrarlo
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };