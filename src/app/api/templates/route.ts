import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.checklistTemplateItem.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'Texto do item é obrigatório.' }, { status: 400 })
  }

  const maxOrder = await prisma.checklistTemplateItem.aggregate({ _max: { order: true } })
  const item = await prisma.checklistTemplateItem.create({
    data: { label, order: (maxOrder._max.order ?? -1) + 1 },
  })
  return NextResponse.json({ item }, { status: 201 })
}
