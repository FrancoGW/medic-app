import { PrismaClient } from '@prisma/client';

// Este script actualiza el rol del usuario admin
async function main() {
  console.log('Iniciando script para corregir el rol de administrador...');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Verificar que exista el rol 'admin'
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });
    
    if (!adminRole) {
      console.log('Creando rol de administrador...');
      adminRole = await prisma.role.create({
        data: { name: 'admin' },
      });
    }
    
    console.log(`Rol de administrador encontrado con ID: ${adminRole.id}`);
    
    // 2. Obtener el correo de administrador desde las variables de entorno
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error('La variable de entorno ADMIN_EMAIL no está definida');
    }
    
    console.log(`Buscando usuario con email: ${adminEmail}`);
    
    // 3. Verificar si existe el usuario
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { role: true },
    });
    
    if (!adminUser) {
      console.log(`No se encontró ningún usuario con el email ${adminEmail}`);
      console.log('Necesitas registrarte primero con ese email.');
      return;
    }
    
    // 4. Asignar el rol de administrador
    console.log(`Usuario encontrado: ${adminUser.email} (ID: ${adminUser.id})`);
    console.log(`Rol actual: ${adminUser.role?.name || 'Sin rol'}`);
    
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole.id },
      include: { role: true },
    });
    
    console.log(`¡Usuario actualizado correctamente!`);
    console.log(`Nuevo rol: ${updatedUser.role?.name}`);
    
  } catch (error) {
    console.error('Error durante la ejecución del script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();