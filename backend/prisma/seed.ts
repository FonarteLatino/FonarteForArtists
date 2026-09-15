import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding fonarte_portal database ---');

  // 1. Crear Sello Inicial (Fonarte Latino)
  const selloFonarte = await prisma.sello.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Fonarte Latino',
    },
  });
  console.log(`✓ Sello principal creado: ${selloFonarte.nombre}`);

  // 2. Crear Artista de demostración
  const artistaDemo = await prisma.artista.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      selloId: selloFonarte.id,
      nombre: 'Fonarte Artista Demo',
    },
  });
  console.log(`✓ Artista demo creado: ${artistaDemo.nombre}`);

  // 3. Crear Usuario Administrador inicial
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@fonartelatino.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'FonarteAdmin2026!';
  const hashPassword = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      esAdmin: true,
      activo: true,
    },
    create: {
      email: adminEmail,
      hashPassword,
      esAdmin: true,
      activo: true,
      artistaId: null,
    },
  });
  console.log(`✓ Administrador inicial verificado: ${admin.email}`);

  // 4. Registrar en auditoría
  await prisma.auditoriaAcceso.create({
    data: {
      usuarioId: admin.id,
      evento: 'CUENTA_CREADA',
      detalle: 'Cuenta administradora inicial inicializada via seed',
      fecha: new Date(),
    },
  });

  console.log('--- Seed completado exitosamente ---');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
