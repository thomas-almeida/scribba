const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Adicionar alguns emails u00e0 wishlist para testes
  await prisma.wishlist.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com'
    }
  });

  await prisma.wishlist.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com'
    }
  });

  console.log('Seed concluu00eddo com sucesso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });