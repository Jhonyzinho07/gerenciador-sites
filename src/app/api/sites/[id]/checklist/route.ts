import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'Texto do item é obrigatório.' }, { status: 400 })
  }

  const maxOrder = await prisma.checklistItem.aggregate({
    where: { siteId: id },
    _max: { order: true },
  })

  const item = await prisma.checklistItem.create({
    data: {
      siteId: id,
      label,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}
