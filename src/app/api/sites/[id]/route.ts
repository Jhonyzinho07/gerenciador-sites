import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const site = await prisma.site.findUnique({
    where: { id },
    include: { checklist: { orderBy: { order: 'asc' } } },
  })
  if (!site) {
    return NextResponse.json({ error: 'Site não encontrado.' }, { status: 404 })
  }
  return NextResponse.json({ site })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined
  const paid = typeof body?.paid === 'boolean' ? body.paid : undefined
  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: 'Nome não pode ser vazio.' }, { status: 400 })
  }
  try {
    const site = await prisma.site.update({ where: { id }, data: { name, paid } })
    return NextResponse.json({ site })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Site não encontrado.' }, { status: 404 })
    }
    throw err
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  try {
    await prisma.site.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Site não encontrado.' }, { status: 404 })
    }
    throw err
  }
}
