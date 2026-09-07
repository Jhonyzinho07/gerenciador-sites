import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderColumn } from '@/lib/reorder'

const VALID_STATUSES = ['NAO_INICIADO', 'EM_ANDAMENTO', 'REVISAO', 'CONCLUIDO', 'PAUSADO']

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  const movedId = typeof body?.movedId === 'string' ? body.movedId : null
  const destStatus = typeof body?.destStatus === 'string' ? body.destStatus : null
  const destIndex = typeof body?.destIndex === 'number' ? body.destIndex : null

  if (!movedId || !destStatus || destIndex === null || !VALID_STATUSES.includes(destStatus)) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const sites = await prisma.site.findMany({ select: { id: true, status: true, priority: true } })
  const changes = reorderColumn(sites, movedId, destStatus, destIndex)

  if (changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  await prisma.$transaction(
    changes.map((change) =>
      prisma.site.update({
        where: { id: change.id },
        data: { status: change.status as never, priority: change.priority },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
