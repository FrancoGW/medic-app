import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Iniciando script para asignar roles...');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Verificar y crear roles necesarios
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });
    
    if (!adminRole) {
      console.log('Creando rol de administrador...');
      adminRole = await prisma.role.create({
        data: { name: 'admin' },
      });
      console.log(`Rol de administrador creado con ID: ${adminRole.id}`);
    } else {
      console.log(`Rol de administrador existente con ID: ${adminRole.id}`);
    }
    
    let doctorRole = await prisma.role.findUnique({
      where: { name: 'doctor' },
    });
    
    if (!doctorRole) {
      console.log('Creando rol de doctor...');
      doctorRole = await prisma.role.create({
        data: { name: 'doctor' },
      });
      console.log(`Rol de doctor creado con ID: ${doctorRole.id}`);
    } else {
      console.log(`Rol de doctor existente con ID: ${doctorRole.id}`);
    }
    
    // 2. Listar todos los usuarios
    const users = await prisma.user.findMany();
    console.log(`Se encontraron ${users.length} usuarios en la base de datos`);
    
    // 3. Configurar email del administrador
    const adminEmails = [
      process.env.ADMIN_EMAIL,
      "lautaro@sftdevelopment.com", // Asumiendo que este es tu email
      "lautarofrancogaray.unne@hotmail.com" // Basado en la captura
    ].filter(Boolean); // Elimina valores nulos o undefined
    
    console.log(`Correos de administrador a asignar: ${adminEmails.join(', ')}`);
    
    // 4. Asignar roles a los usuarios
    for (const user of users) {
      console.log(`Procesando usuario: ${user.email} (ID: ${user.id})`);
      
      if (adminEmails.includes(user.email)) {
        // Asignar rol de admin
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: adminRole.id },
        });
        console.log(`✅ Asignado rol de ADMIN a ${user.email}`);
      } else {
        // Por defecto, asignar rol de usuario regular o doctor según corresponda
        console.log(`⚠️ Usuario ${user.email} no es administrador, manteniendo rol actual`);
      }
    }
    
    // 5. Verificar asignaciones
    const updatedUsers = await prisma.user.findMany({
      include: { role: true },
    });
    
    console.log('\nResumen de asignación de roles:');
    for (const user of updatedUsers) {
      console.log(`- ${user.email}: ${user.role?.name || 'Sin rol'}`);
    }
    
  } catch (error) {
    console.error('Error durante la ejecución del script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();