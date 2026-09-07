import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_TEMPLATE = [
  'Registrar domínio',
  'Configurar hospedagem',
  'Definir estrutura de páginas',
  'Aplicar identidade visual',
  'Redigir conteúdo',
  'Revisão de SEO on-page',
  'Testes em dispositivos móveis',
  'Publicar e entregar ao cliente',
]

async function main() {
  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  if (!email || !password) {
    throw new Error('SEED_EMAIL and SEED_PASSWORD must be set in the environment before seeding')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  const existingTemplateCount = await prisma.checklistTemplateItem.count()
  if (existingTemplateCount === 0) {
    await prisma.checklistTemplateItem.createMany({
      data: DEFAULT_TEMPLATE.map((label, index) => ({ label, order: index })),
    })
  }

  console.log(`Seeded user ${email} and ${DEFAULT_TEMPLATE.length} default checklist items.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
