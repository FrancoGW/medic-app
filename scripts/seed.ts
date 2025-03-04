// scripts/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear el rol de administrador
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  // Crear un usuario con el rol de admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'lautaro@sftdevelopment.com' },
    update: { roleId: adminRole.id },
    create: {
      email: 'lautaro@sftdevelopment.com',
      name: 'Lautaro Admin',
      roleId: adminRole.id,
    },
  });

  console.log('Roles creados:', { adminRole });
  console.log('Usuario administrador creado:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });