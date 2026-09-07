import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sites = await prisma.site.findMany({
    include: { checklist: { select: { done: true } } },
    orderBy: [{ status: 'asc' }, { priority: 'asc' }],
  })
  return NextResponse.json({ sites })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'Nome do site é obrigatório.' }, { status: 400 })
  }

  const [templateItems, maxPriority] = await Promise.all([
    prisma.checklistTemplateItem.findMany({ orderBy: { order: 'asc' } }),
    prisma.site.aggregate({
      where: { status: 'NAO_INICIADO' },
      _max: { priority: true },
    }),
  ])

  const nextPriority = (maxPriority._max.priority ?? -1) + 1

  const site = await prisma.site.create({
    data: {
      name,
      priority: nextPriority,
      checklist: {
        create: templateItems.map((item) => ({
          label: item.label,
          order: item.order,
        })),
      },
    },
    include: { checklist: true },
  })

  return NextResponse.json({ site }, { status: 201 })
}
