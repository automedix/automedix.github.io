import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
  console.log('Seeding...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@praxis.de' },
    update: {},
    create: { email: 'admin@praxis.de', passwordHash: adminPassword, name: 'Praxis Admin' }
  })
  const careHomePassword = await bcrypt.hash('demo123', 10)
  await prisma.careHome.upsert({
    where: { email: 'demo@pflegeheim.de' },
    update: {},
    create: { email: 'demo@pflegeheim.de', passwordHash: careHomePassword, name: 'Demo Pflegeheim', contactPerson: 'Max Mustermann', phone: '030-12345678', address: 'Musterstraße 1, Berlin' }
  })
  const cats = ['Pflaster und Wundauflagen', 'Verbände und Binden', 'Desinfektion', 'Spritzen und Kanülen', 'Handschuhe und Schutz']
  for (const name of cats) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, sortOrder: 1 } })
  }
  console.log('Seed done!')
}
main().catch(console.error).finally(() => prisma.$disconnect())
