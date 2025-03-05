import NextAuth from 'next-auth';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

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
          // Verificar si el email es de un admin o está en la lista de invitaciones de doctores
          const isAdmin = email === process.env.ADMIN_EMAIL || email === "lautarofrancogaray.unne@hotmail.com" || email === "lautaro@sftdevelopment.com";
          let isInvitedDoctor = false;
          let userRole = null;
          
          if (!isAdmin) {
            // Buscar si existe una invitación para este email
            const invitation = await prisma.doctorInvitation.findUnique({
              where: { email },
            });
            
            isInvitedDoctor = !!invitation && invitation.status === 'PENDING';
            
            if (!isInvitedDoctor) {
              // Si no es admin ni doctor invitado, verificar si ya es un usuario existente
              const existingUser = await prisma.user.findUnique({
                where: { email },
                include: { role: true },
              });
              
              // Si existe un usuario pero no tiene rol de admin ni doctor, rechazar
              if (existingUser && existingUser.role?.name !== 'admin' && existingUser.role?.name !== 'doctor') {
                console.log(`Acceso denegado para ${email}: no tiene permisos suficientes`);
                return; // No enviar el email de verificación
              }
              
              if (existingUser) {
                userRole = existingUser.role?.name;
              }
            }
          }
          
          // Si no es admin, ni doctor invitado, ni usuario existente con rol adecuado, rechazar
          if (!isAdmin && !isInvitedDoctor && !userRole) {
            console.log(`Acceso denegado para ${email}: no está en la lista de permitidos`);
            return; // No enviar el email de verificación
          }
          
          const { createTransport } = await import('nodemailer');
          // Crear el transporte aquí dentro de la función
          const transport = createTransport(server);
          
          // Determinar el asunto según el rol
          let subject = 'Acceso a tu cuenta';
          if (isAdmin || userRole === 'admin') {
            subject = 'Acceso a tu cuenta de Administrador';
          } else if (isInvitedDoctor || userRole === 'doctor') {
            subject = 'Acceso a tu cuenta de Doctor';
          }
          
          const result = await transport.sendMail({
            to: email,
            from,
            subject,
            text: `Haz clic en el siguiente enlace para iniciar sesión: ${url}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #3182ce;">${subject}</h2>
              <p>Haz clic en el siguiente enlace para iniciar sesión:</p>
              <p style="margin: 20px 0;">
                <a href="${url}" style="background-color: #3182ce; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Iniciar sesión</a>
              </p>
              <p style="font-size: 0.8em; color: #666;">Si no solicitaste este email, puedes ignorarlo.</p>
            </div>
            `,
          });
          
          console.log('Email enviado:', result);
          
          // Si es un doctor invitado que se está registrando por primera vez, actualizar la invitación
          if (isInvitedDoctor) {
            // No marcamos como ACCEPTED hasta que realmente inicie sesión
            console.log(`Email de verificación enviado a doctor invitado: ${email}`);
          }
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
    async signIn({ user, account, profile, email, credentials }) {
      const userEmail = user.email;
      
      // Si es el admin, permitir acceso y asignar rol si es necesario
      if (userEmail === process.env.ADMIN_EMAIL || userEmail === "lautarofrancogaray.unne@hotmail.com" || userEmail === "lautaro@sftdevelopment.com") {
        // Asignar rol de admin si no lo tiene
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { role: true },
          });
          
          if (existingUser && !existingUser.roleId) {
            // Buscar el ID del rol de admin
            const adminRole = await prisma.role.findUnique({
              where: { name: 'admin' },
            });
            
            if (adminRole) {
              // Asignar el rol de admin
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { roleId: adminRole.id },
              });
              
              console.log(`Rol de admin asignado a ${userEmail}`);
            }
          }
        } catch (error) {
          console.error('Error al asignar rol de admin:', error);
        }
        
        return true;
      }
      
      // Verificar si es un doctor invitado
      const invitation = await prisma.doctorInvitation.findUnique({
        where: { email: userEmail },
      });
      
      if (invitation) {
        // Es un doctor invitado, verificar que la invitación esté pendiente o aceptada
        if (invitation.status === 'REVOKED') {
          return false; // Invitación revocada, denegar acceso
        }
        
        // Si es la primera vez que se registra, asignarle el rol de doctor y marcar la invitación como aceptada
        const existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
          include: { role: true },
        });
        
        if (existingUser && !existingUser.roleId) {
          // Buscar el ID del rol de doctor
          const doctorRole = await prisma.role.findUnique({
            where: { name: 'doctor' },
          });
          
          if (doctorRole) {
            // Asignar el rol de doctor
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { roleId: doctorRole.id },
            });
          }
          
          // Actualizar la invitación como aceptada
          await prisma.doctorInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
          });
        }
        
        return true;
      }
      
      // Si no es admin ni doctor invitado, verificar si ya es un usuario con rol asignado
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { role: true },
      });
      
      return !!(existingUser && existingUser.role);
    },
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
            
            // Forzar rol admin para ciertos emails específicos (respaldo)
            if (
              user.email === process.env.ADMIN_EMAIL || 
              user.email === "lautarofrancogaray.unne@hotmail.com" || 
              user.email === "lautaro@sftdevelopment.com"
            ) {
              session.user.role = 'admin';
            }
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
        // Si el usuario tiene un rol asignado, incluirlo en el token
        token.role = user.role || 'user';
        
        // Obtener el rol desde la base de datos si existe
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { role: true },
          });
          
          if (dbUser && dbUser.role) {
            token.role = dbUser.role.name;
          }
          
          // Forzar rol admin para ciertos emails específicos (respaldo)
          if (
            user.email === process.env.ADMIN_EMAIL || 
            user.email === "lautarofrancogaray.unne@hotmail.com" || 
            user.email === "lautaro@sftdevelopment.com"
          ) {
            token.role = 'admin';
          }
        } catch (error) {
          console.error('Error al obtener rol de usuario:', error);
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };