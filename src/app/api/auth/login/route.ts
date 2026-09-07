import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : null
  const password = typeof body?.password === 'string' ? body.password : null

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const isValid = user ? await verifyPassword(password, user.passwordHash) : false

  if (!user || !isValid) {
    return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
  }

  const token = await createSessionToken(user.id)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
