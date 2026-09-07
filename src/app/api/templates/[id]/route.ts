import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'Texto do item é obrigatório.' }, { status: 400 })
  }

  try {
    const item = await prisma.checklistTemplateItem.update({
      where: { id },
      data: { label },
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
  const { id } = await params

  try {
    await prisma.checklistTemplateItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 })
    }
    throw err
  }
}
