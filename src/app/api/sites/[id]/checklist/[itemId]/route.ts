import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  const { itemId } = await params
  const body = await request.json().catch(() => null)
  const data: { done?: boolean; label?: string } = {}
  if (typeof body?.done === 'boolean') data.done = body.done
  if (typeof body?.label === 'string' && body.label.trim().length > 0) data.label = body.label.trim()

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })
  }

  try {
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data,
    })
    return NextResponse.json({ item })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 })
    }
    throw err
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { itemId } = await params
  try {
    await prisma.checklistItem.delete({ where: { id: itemId } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 })
    }
    throw err
  }
}
