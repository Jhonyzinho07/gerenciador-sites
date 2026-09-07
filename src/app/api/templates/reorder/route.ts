import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderColumn } from '@/lib/reorder'

const COLUMN = 'template'

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  const movedId = typeof body?.movedId === 'string' ? body.movedId : null
  const destIndex = typeof body?.destIndex === 'number' ? body.destIndex : null

  if (!movedId || destIndex === null) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const items = await prisma.checklistTemplateItem.findMany({ select: { id: true, order: true } })
  const positioned = items.map((i) => ({ id: i.id, status: COLUMN, priority: i.order }))
  const changes = reorderColumn(positioned, movedId, COLUMN, destIndex)

  if (changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  await prisma.$transaction(
    changes.map((change) =>
      prisma.checklistTemplateItem.update({ where: { id: change.id }, data: { order: change.priority } })
    )
  )

  return NextResponse.json({ ok: true })
}
