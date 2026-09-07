# Gerenciador de Sites JvSoft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app where the single JvSoft admin manages client sites on a Trello-style Kanban board with a per-site checklist copied from an editable template.

**Architecture:** Next.js App Router (TypeScript) with Route Handlers as the API layer, Prisma + Postgres (Vercel Postgres/Neon) for persistence, JWT-in-cookie auth (no signup route — account created via seed script), and `@dnd-kit` for the Kanban drag-and-drop.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Prisma, Postgres, bcryptjs, jose (JWT), @dnd-kit/core + @dnd-kit/sortable, Vitest for unit tests.

**Spec:** [gerenciador-sites/docs/superpowers/specs/2026-09-07-gerenciador-sites-design.md](../specs/2026-09-07-gerenciador-sites-design.md)

## Global Constraints

- No signup/account-creation route anywhere in the app — the only account-creation path is the Prisma seed script (`prisma/seed.ts`), run manually against the database.
- No client personal data fields (name, contact, company) anywhere in the schema or UI.
- No financial fields (price, payment status, due dates) anywhere in the schema or UI.
- Single admin user only — no roles, no permissions system.
- `Site.priority` is an integer representing position within its `status` column; lower = higher priority (shown first).
- Brand colors (exact hex, from `Site JvSoft/css/style.css`): `--blue-800:#1E3F82`, `--blue-700:#2D559B`, `--blue-600:#3A6EAC`, `--teal-700:#1F6E63`, `--teal-600:#2F9385`, `--teal-500:#45A99A`, `--mint:#79C0C5`, `--paper:#FAFAF9`, `--paper-2:#F1F3F7`, `--line:#E4E7EC`, `--ink:#0B0D14`, `--ink-2:#141824`, `--text:#0B0D14`, `--text-2:#5A6472`. Brand gradient: `linear-gradient(135deg,#2D559B 0%,#3A6EAC 45%,#2F9385 100%)`.
- Logo asset: copy `Site JvSoft/img/logo-jvsoft-icon.webp` into the app (used in header and as favicon source).

---

## Task 1: Project scaffold, brand tokens, and logo asset

**Files:**
- Create: `gerenciador-sites/package.json`, `gerenciador-sites/tsconfig.json`, `gerenciador-sites/next.config.mjs`
- Create: `gerenciador-sites/src/app/layout.tsx`
- Create: `gerenciador-sites/src/app/globals.css`
- Create: `gerenciador-sites/public/logo-jvsoft-icon.webp` (copied)
- Create: `gerenciador-sites/.env.example`
- Create: `gerenciador-sites/.gitignore`
- Create: `gerenciador-sites/vitest.config.ts`

**Interfaces:**
- Produces: `globals.css` CSS custom properties (`--blue-800`, `--blue-700`, `--blue-600`, `--teal-700`, `--teal-600`, `--teal-500`, `--mint`, `--paper`, `--paper-2`, `--line`, `--ink`, `--ink-2`, `--text`, `--text-2`, `--gradient-brand`) consumed by every later UI task.

- [ ] **Step 1: Scaffold the Next.js app**

```bash
cd "C:\Users\Jhony\Desktop\Jhony\JvSoft\gerenciador-sites"
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir=false --import-alias "@/*"
```

When prompted, accept defaults. This creates `package.json`, `tsconfig.json`, `next.config.mjs`, `src/app/`.

- [ ] **Step 2: Install runtime and dev dependencies**

```bash
npm install @prisma/client bcryptjs jose @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D prisma vitest @vitejs/plugin-react vite-tsconfig-paths tsx
```

- [ ] **Step 3: Add Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Add the `test` script to `package.json`**

Edit `package.json` `"scripts"` block to add:

```json
"test": "vitest run"
```

- [ ] **Step 5: Copy the logo asset**

```bash
cp "C:\Users\Jhony\Desktop\Jhony\JvSoft\Site JvSoft\img\logo-jvsoft-icon.webp" "C:\Users\Jhony\Desktop\Jhony\JvSoft\gerenciador-sites\public\logo-jvsoft-icon.webp"
```

- [ ] **Step 6: Write brand tokens into `globals.css`**

```css
/* src/app/globals.css */
:root {
  --blue-800: #1E3F82;
  --blue-700: #2D559B;
  --blue-600: #3A6EAC;
  --teal-700: #1F6E63;
  --teal-600: #2F9385;
  --teal-500: #45A99A;
  --mint: #79C0C5;

  --paper: #FAFAF9;
  --paper-2: #F1F3F7;
  --line: #E4E7EC;

  --ink: #0B0D14;
  --ink-2: #141824;
  --text: #0B0D14;
  --text-2: #5A6472;

  --gradient-brand: linear-gradient(135deg, #2D559B 0%, #3A6EAC 45%, #2F9385 100%);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper-2);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

a {
  color: inherit;
}
```

- [ ] **Step 7: Wire the root layout to import the CSS**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gerenciador de Sites — JvSoft',
  description: 'Painel interno JvSoft para gerenciar sites em produção.',
  icons: { icon: '/logo-jvsoft-icon.webp' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Add `.env.example` and confirm `.gitignore` excludes `.env`**

```bash
# .env.example
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-string"
SEED_EMAIL="jhony@jvsoft.com.br"
SEED_PASSWORD="replace-with-a-strong-password"
```

Confirm `.gitignore` (generated by `create-next-app`) already contains `.env*`; if not, append it.

- [ ] **Step 9: Verify the app builds and runs**

Run: `npm run dev` in `gerenciador-sites`, open `http://localhost:3000`, confirm the default Next.js page loads with no console errors, then stop the server (Ctrl+C).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with brand tokens and logo asset"
```

---

## Task 2: Prisma schema, client, and seed script

**Files:**
- Create: `gerenciador-sites/prisma/schema.prisma`
- Create: `gerenciador-sites/prisma/seed.ts`
- Create: `gerenciador-sites/src/lib/prisma.ts`
- Create: `gerenciador-sites/src/lib/password.ts`
- Test: `gerenciador-sites/src/lib/password.test.ts`
- Modify: `gerenciador-sites/package.json` (add `prisma.seed` config)

**Interfaces:**
- Consumes: `DATABASE_URL` env var (Task 1's `.env.example`).
- Produces: `prisma` singleton export from `src/lib/prisma.ts` (`import { prisma } from '@/lib/prisma'`), `hashPassword(plain: string): Promise<string>` and `verifyPassword(plain: string, hash: string): Promise<boolean>` from `src/lib/password.ts`. Prisma models `User`, `Site`, `SiteStatus` enum, `ChecklistItem`, `ChecklistTemplateItem` consumed by all later API tasks.

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and appends `DATABASE_URL` to `.env` (overwrite with your real Neon connection string before running migrations).

- [ ] **Step 2: Write the schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

enum SiteStatus {
  NAO_INICIADO
  EM_ANDAMENTO
  REVISAO
  CONCLUIDO
  PAUSADO
}

model Site {
  id        String          @id @default(cuid())
  name      String
  status    SiteStatus      @default(NAO_INICIADO)
  priority  Int
  checklist ChecklistItem[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([status, priority])
}

model ChecklistItem {
  id     String  @id @default(cuid())
  siteId String
  site   Site    @relation(fields: [siteId], references: [id], onDelete: Cascade)
  label  String
  done   Boolean @default(false)
  order  Int

  @@index([siteId, order])
}

model ChecklistTemplateItem {
  id    String @id @default(cuid())
  label String
  order Int
}
```

- [ ] **Step 3: Write the Prisma client singleton**

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 4: Write the failing test for password helpers**

```ts
// src/lib/password.test.ts
import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password helpers', () => {
  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    await expect(verifyPassword('correct-horse-battery-staple', hash)).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })

  it('produces a hash different from the plaintext', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    expect(hash).not.toBe('correct-horse-battery-staple')
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- password.test.ts`
Expected: FAIL — `Cannot find module './password'`

- [ ] **Step 6: Implement password helpers**

```ts
// src/lib/password.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- password.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 8: Write the seed script**

```ts
// prisma/seed.ts
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
```

- [ ] **Step 9: Register the seed command in `package.json`**

Add to `package.json` (top level, sibling of `"scripts"`):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 10: Run the migration and seed against your real database**

Set `DATABASE_URL` in `.env` to your Neon/Vercel Postgres connection string, then:

```bash
npx prisma migrate dev --name init
SEED_EMAIL="jhony@jvsoft.com.br" SEED_PASSWORD="choose-a-strong-password" npx prisma db seed
```

Expected: migration applies cleanly, seed logs `Seeded user ... and 8 default checklist items.`

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, client, password helpers, and seed script"
```

---

## Task 3: Session/JWT auth utilities

**Files:**
- Create: `gerenciador-sites/src/lib/auth.ts`
- Test: `gerenciador-sites/src/lib/auth.test.ts`

**Interfaces:**
- Consumes: `AUTH_SECRET` env var.
- Produces: `SESSION_COOKIE: string`, `createSessionToken(userId: string): Promise<string>`, `verifySessionToken(token: string): Promise<string | null>` — consumed by Task 4 (login route, middleware) and every protected route/page after it.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/auth.test.ts
import { beforeAll, describe, expect, it } from 'vitest'
import { createSessionToken, verifySessionToken } from './auth'

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long'
})

describe('session tokens', () => {
  it('round-trips a user id through create and verify', async () => {
    const token = await createSessionToken('user-123')
    await expect(verifySessionToken(token)).resolves.toBe('user-123')
  })

  it('rejects a garbage token', async () => {
    await expect(verifySessionToken('not-a-real-token')).resolves.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- auth.test.ts`
Expected: FAIL — `Cannot find module './auth'`

- [ ] **Step 3: Implement session token helpers**

```ts
// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'session'
const ALG = 'HS256'

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- auth.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add JWT session token helpers"
```

---

## Task 4: Login route, middleware, and login page

**Files:**
- Create: `gerenciador-sites/src/app/api/auth/login/route.ts`
- Create: `gerenciador-sites/src/app/api/auth/logout/route.ts`
- Create: `gerenciador-sites/src/middleware.ts`
- Create: `gerenciador-sites/src/app/login/page.tsx`
- Create: `gerenciador-sites/src/app/login/LoginForm.tsx`

**Interfaces:**
- Consumes: `prisma` (Task 2), `verifyPassword` (Task 2), `SESSION_COOKIE`/`createSessionToken`/`verifySessionToken` (Task 3).
- Produces: `POST /api/auth/login` (body `{ email, password }` → sets `session` cookie or `401`), `POST /api/auth/logout` (clears cookie), middleware that redirects unauthenticated requests to `/login` for every route except `/login` and `/api/auth/*`.

- [ ] **Step 1: Write the login API route**

```ts
// src/app/api/auth/login/route.ts
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
```

- [ ] **Step 2: Write the logout API route**

```ts
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
```

- [ ] **Step 3: Write the middleware**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/auth/') || PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const userId = token ? await verifySessionToken(token) : null

  if (!userId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo-jvsoft-icon.webp).*)'],
}
```

- [ ] **Step 4: Write the login page and client form**

```tsx
// src/app/login/page.tsx
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-brand)',
      }}
    >
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          width: 360,
          boxShadow: '0 16px 40px rgba(11,13,20,0.2)',
        }}
      >
        <img src="/logo-jvsoft-icon.webp" alt="JvSoft" width={56} height={56} style={{ display: 'block', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 18, textAlign: 'center', marginBottom: 24, color: 'var(--text)' }}>
          Gerenciador de Sites
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
```

```tsx
// src/app/login/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (!res.ok) {
      setError('Email ou senha inválidos.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
      />
      {error && <p style={{ color: '#B3261E', fontSize: 13, margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: 10,
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'var(--gradient-brand)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Manually verify the login flow**

Run `npm run dev`, visit `http://localhost:3000/` — expect a redirect to `/login`. Log in with the `SEED_EMAIL`/`SEED_PASSWORD` from Task 2 — expect a redirect back to `/` (a 404 is fine here since the dashboard page doesn't exist yet; what matters is no redirect loop back to `/login`). Confirm a wrong password shows "Email ou senha inválidos."

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add login/logout routes, auth middleware, and login page"
```

---

## Task 5: Reorder logic (pure function)

**Files:**
- Create: `gerenciador-sites/src/lib/reorder.ts`
- Test: `gerenciador-sites/src/lib/reorder.test.ts`

**Interfaces:**
- Produces: `type PositionedItem = { id: string; status: string; priority: number }` and `reorderColumn<T extends PositionedItem>(items: T[], movedId: string, destStatus: string, destIndex: number): T[]` — consumed by Task 6 (sites reorder API) and Task 7 (checklist reorder, called with a constant `status` field).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/reorder.test.ts
import { describe, expect, it } from 'vitest'
import { reorderColumn, type PositionedItem } from './reorder'

function make(id: string, status: string, priority: number): PositionedItem {
  return { id, status, priority }
}

describe('reorderColumn', () => {
  it('moves an item within the same column and renumbers priorities', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('c', 'A', 2)]
    const result = reorderColumn(items, 'c', 'A', 0)
    const byId = Object.fromEntries(result.map((i) => [i.id, i]))
    expect(byId.c).toMatchObject({ status: 'A', priority: 0 })
    expect(byId.a).toMatchObject({ status: 'A', priority: 1 })
    expect(byId.b).toMatchObject({ status: 'A', priority: 2 })
  })

  it('moves an item to a different column and renumbers both columns', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('c', 'B', 0)]
    const result = reorderColumn(items, 'a', 'B', 0)
    const byId = Object.fromEntries(result.map((i) => [i.id, i]))
    expect(byId.a).toMatchObject({ status: 'B', priority: 0 })
    expect(byId.c).toMatchObject({ status: 'B', priority: 1 })
    expect(byId.b).toMatchObject({ status: 'A', priority: 0 })
  })

  it('only returns items whose status or priority changed', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('z', 'C', 0)]
    const result = reorderColumn(items, 'b', 'A', 0)
    expect(result.map((i) => i.id).sort()).toEqual(['a', 'b'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- reorder.test.ts`
Expected: FAIL — `Cannot find module './reorder'`

- [ ] **Step 3: Implement `reorderColumn`**

```ts
// src/lib/reorder.ts
export type PositionedItem = { id: string; status: string; priority: number }

export function reorderColumn<T extends PositionedItem>(
  items: T[],
  movedId: string,
  destStatus: string,
  destIndex: number
): T[] {
  const moved = items.find((i) => i.id === movedId)
  if (!moved) return []

  const sourceStatus = moved.status

  const destColumn = items
    .filter((i) => i.status === destStatus && i.id !== movedId)
    .sort((a, b) => a.priority - b.priority)
  destColumn.splice(destIndex, 0, moved)

  const changed = new Map<string, T>()
  destColumn.forEach((item, index) => {
    if (item.status !== destStatus || item.priority !== index) {
      changed.set(item.id, { ...item, status: destStatus, priority: index })
    }
  })

  if (sourceStatus !== destStatus) {
    const sourceColumn = items
      .filter((i) => i.status === sourceStatus && i.id !== movedId)
      .sort((a, b) => a.priority - b.priority)
    sourceColumn.forEach((item, index) => {
      if (item.priority !== index) {
        changed.set(item.id, { ...item, priority: index })
      }
    })
  }

  return Array.from(changed.values())
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- reorder.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pure reorderColumn function for kanban drag-and-drop"
```

---

## Task 6: Sites API (list, create, reorder)

**Files:**
- Create: `gerenciador-sites/src/app/api/sites/route.ts`
- Create: `gerenciador-sites/src/app/api/sites/reorder/route.ts`
- Create: `gerenciador-sites/src/app/api/sites/[id]/route.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `reorderColumn` (Task 5).
- Produces: `GET /api/sites` → `{ sites: Array<{ id, name, status, priority, checklist: { done: boolean }[] } >}`; `POST /api/sites` (body `{ name: string }`) → creates a `Site` with checklist copied from `ChecklistTemplateItem`, returns the created site; `PATCH /api/sites/reorder` (body `{ movedId: string, destStatus: SiteStatus, destIndex: number }`) → persists the reordered priorities; `GET /api/sites/[id]` → single site with checklist; `PATCH /api/sites/[id]` (body `{ name?: string }`) → rename; `DELETE /api/sites/[id]` → delete.

- [ ] **Step 1: Write the list + create route**

```ts
// src/app/api/sites/route.ts
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
```

- [ ] **Step 2: Write the reorder route**

```ts
// src/app/api/sites/reorder/route.ts
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
```

- [ ] **Step 3: Write the single-site route**

```ts
// src/app/api/sites/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: { checklist: { orderBy: { order: 'asc' } } },
  })
  if (!site) {
    return NextResponse.json({ error: 'Site não encontrado.' }, { status: 404 })
  }
  return NextResponse.json({ site })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined
  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: 'Nome não pode ser vazio.' }, { status: 400 })
  }
  const site = await prisma.site.update({ where: { id: params.id }, data: { name } })
  return NextResponse.json({ site })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.site.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Manually verify with the running dev server**

Run `npm run dev`, log in, then from the browser dev console (or `curl` with the session cookie) call `POST /api/sites` with `{"name":"Site Teste"}` — expect `201` with a `site` object containing 8 checklist items copied from the template. Call `GET /api/sites` — expect the created site listed. Call `DELETE /api/sites/[id]` with its id — expect `200` and it gone from a follow-up `GET`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sites list/create/reorder/detail API routes"
```

---

## Task 7: Checklist API (add, toggle, rename, delete, reorder item)

**Files:**
- Create: `gerenciador-sites/src/app/api/sites/[id]/checklist/route.ts`
- Create: `gerenciador-sites/src/app/api/sites/[id]/checklist/[itemId]/route.ts`
- Create: `gerenciador-sites/src/app/api/sites/[id]/checklist/reorder/route.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `reorderColumn` (Task 5, called with every item sharing the same constant `status` value so it reduces to a flat within-list reorder).
- Produces: `POST /api/sites/[id]/checklist` (body `{ label: string }`) → creates item at end of list; `PATCH /api/sites/[id]/checklist/[itemId]` (body `{ done?: boolean, label?: string }`) → updates item; `DELETE /api/sites/[id]/checklist/[itemId]` → removes item; `PATCH /api/sites/[id]/checklist/reorder` (body `{ movedId: string, destIndex: number }`) → renumbers `order` for that site's checklist.

- [ ] **Step 1: Write the add-item route**

```ts
// src/app/api/sites/[id]/checklist/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'Texto do item é obrigatório.' }, { status: 400 })
  }

  const maxOrder = await prisma.checklistItem.aggregate({
    where: { siteId: params.id },
    _max: { order: true },
  })

  const item = await prisma.checklistItem.create({
    data: {
      siteId: params.id,
      label,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}
```

- [ ] **Step 2: Write the update/delete item route**

```ts
// src/app/api/sites/[id]/checklist/[itemId]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const body = await request.json().catch(() => null)
  const data: { done?: boolean; label?: string } = {}
  if (typeof body?.done === 'boolean') data.done = body.done
  if (typeof body?.label === 'string' && body.label.trim().length > 0) data.label = body.label.trim()

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })
  }

  const item = await prisma.checklistItem.update({
    where: { id: params.itemId },
    data,
  })
  return NextResponse.json({ item })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  await prisma.checklistItem.delete({ where: { id: params.itemId } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Write the reorder-item route**

```ts
// src/app/api/sites/[id]/checklist/reorder/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderColumn } from '@/lib/reorder'

const COLUMN = 'checklist'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const movedId = typeof body?.movedId === 'string' ? body.movedId : null
  const destIndex = typeof body?.destIndex === 'number' ? body.destIndex : null

  if (!movedId || destIndex === null) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  const items = await prisma.checklistItem.findMany({
    where: { siteId: params.id },
    select: { id: true, order: true },
  })
  const positioned = items.map((i) => ({ id: i.id, status: COLUMN, priority: i.order }))
  const changes = reorderColumn(positioned, movedId, COLUMN, destIndex)

  if (changes.length === 0) {
    return NextResponse.json({ ok: true })
  }

  await prisma.$transaction(
    changes.map((change) =>
      prisma.checklistItem.update({ where: { id: change.id }, data: { order: change.priority } })
    )
  )

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Manually verify**

With the dev server running and a test site created (Task 6, Step 4), call `POST /api/sites/[id]/checklist` with `{"label":"Item extra"}` — expect `201`. Toggle it with `PATCH .../checklist/[itemId]` body `{"done":true}` — expect `done: true` in the response. Delete it — expect it gone from `GET /api/sites/[id]`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add checklist item add/update/delete/reorder API routes"
```

---

## Task 8: Templates API (CRUD for default checklist)

**Files:**
- Create: `gerenciador-sites/src/app/api/templates/route.ts`
- Create: `gerenciador-sites/src/app/api/templates/[id]/route.ts`
- Create: `gerenciador-sites/src/app/api/templates/reorder/route.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2), `reorderColumn` (Task 5).
- Produces: `GET /api/templates` → `{ items: ChecklistTemplateItem[] }` ordered by `order`; `POST /api/templates` (body `{ label }`) → append; `PATCH /api/templates/[id]` (body `{ label }`) → rename; `DELETE /api/templates/[id]` → remove; `PATCH /api/templates/reorder` (body `{ movedId, destIndex }`) → renumber.

- [ ] **Step 1: Write list + create route**

```ts
// src/app/api/templates/route.ts
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
```

- [ ] **Step 2: Write update/delete route**

```ts
// src/app/api/templates/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null)
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) {
    return NextResponse.json({ error: 'Texto do item é obrigatório.' }, { status: 400 })
  }
  const item = await prisma.checklistTemplateItem.update({ where: { id: params.id }, data: { label } })
  return NextResponse.json({ item })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.checklistTemplateItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Write reorder route**

```ts
// src/app/api/templates/reorder/route.ts
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
```

- [ ] **Step 4: Manually verify**

Call `GET /api/templates` — expect the 8 seeded items. `POST` a new item, `PATCH` to rename it, `DELETE` it — confirm each response and a final `GET` reflecting the change.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add checklist template CRUD and reorder API routes"
```

---

## Task 9: App shell (header with logo, nav, logout)

**Files:**
- Create: `gerenciador-sites/src/app/(app)/layout.tsx`
- Create: `gerenciador-sites/src/components/AppHeader.tsx`
- Modify: `gerenciador-sites/src/app/layout.tsx` (no change needed — `(app)` is a route group under it)

**Interfaces:**
- Produces: `<AppHeader />` component rendered by the `(app)` route group layout, wrapping the dashboard, site detail, and templates pages built in Tasks 10–12.

- [ ] **Step 1: Write the header component**

```tsx
// src/components/AppHeader.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AppHeader() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'var(--gradient-brand)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo-jvsoft-icon.webp" alt="JvSoft" width={32} height={32} />
        <strong>Gerenciador de Sites</strong>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link href="/templates" style={{ color: '#fff', textDecoration: 'none' }}>
          Checklist padrão
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.6)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Write the `(app)` route group layout**

```tsx
// src/app/(app)/layout.tsx
import { AppHeader } from '@/components/AppHeader'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Manually verify**

Run `npm run dev`, log in — expect the header (logo, "Dashboard", "Checklist padrão", "Sair") to render above whatever the `/` route currently returns (still 404 until Task 10). Click "Sair" — expect redirect to `/login` and that revisiting `/` redirects back to `/login`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add app shell with branded header and navigation"
```

---

## Task 10: Dashboard Kanban board

**Files:**
- Create: `gerenciador-sites/src/app/(app)/page.tsx`
- Create: `gerenciador-sites/src/components/KanbanBoard.tsx`
- Create: `gerenciador-sites/src/components/SiteCard.tsx`
- Create: `gerenciador-sites/src/components/NewSiteButton.tsx`

**Interfaces:**
- Consumes: `GET /api/sites`, `POST /api/sites`, `PATCH /api/sites/reorder` (Task 6).
- Produces: the `/` dashboard page. No other task consumes this directly.

- [ ] **Step 1: Write the `SiteCard` component**

```tsx
// src/components/SiteCard.tsx
'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type SiteCardData = {
  id: string
  name: string
  doneCount: number
  totalCount: number
}

export function SiteCard({ site }: { site: SiteCardData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: site.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 8,
        cursor: 'grab',
      }}
    >
      <Link href={`/sites/${site.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>{site.name}</strong>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {site.doneCount}/{site.totalCount}
        </span>
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Write the `KanbanBoard` component**

```tsx
// src/components/KanbanBoard.tsx
'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SiteCard, type SiteCardData } from './SiteCard'
import { reorderColumn } from '@/lib/reorder'

const COLUMNS: { status: string; label: string }[] = [
  { status: 'NAO_INICIADO', label: 'Não iniciado' },
  { status: 'EM_ANDAMENTO', label: 'Em andamento' },
  { status: 'REVISAO', label: 'Revisão' },
  { status: 'CONCLUIDO', label: 'Concluído' },
  { status: 'PAUSADO', label: 'Pausado' },
]

export type BoardSite = SiteCardData & { status: string; priority: number }

export function KanbanBoard({ initialSites }: { initialSites: BoardSite[] }) {
  const [sites, setSites] = useState(initialSites)

  function columnSites(status: string) {
    return sites.filter((s) => s.status === status).sort((a, b) => a.priority - b.priority)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const movedId = String(active.id)
    const moved = sites.find((s) => s.id === movedId)
    if (!moved) return

    const overId = String(over.id)
    const overSite = sites.find((s) => s.id === overId)
    const destStatus = overSite ? overSite.status : overId
    const destIndex = overSite ? columnSites(destStatus).findIndex((s) => s.id === overId) : columnSites(destStatus).length

    const changes = reorderColumn(sites, movedId, destStatus, destIndex)
    if (changes.length === 0) return

    const previous = sites
    const changedById = new Map(changes.map((c) => [c.id, c]))
    setSites((prev) => prev.map((s) => changedById.get(s.id) ?? s))

    const res = await fetch('/api/sites/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movedId, destStatus, destIndex }),
    })

    if (!res.ok) {
      setSites(previous)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', overflowX: 'auto' }}>
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            id={col.status}
            style={{
              minWidth: 260,
              background: 'var(--paper-2)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
            }}
          >
            <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 0 }}>{col.label}</h3>
            <SortableContext items={columnSites(col.status).map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {columnSites(col.status).map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
```

- [ ] **Step 3: Write the `NewSiteButton` client component**

```tsx
// src/components/NewSiteButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function NewSiteButton() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    if (res.ok) {
      setName('')
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          marginBottom: 16,
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'var(--gradient-brand)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        + Novo site
      </button>
    )
  }

  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do site"
        style={{ padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
      />
      <button onClick={handleCreate} style={{ padding: '8px 12px' }}>
        Criar
      </button>
      <button onClick={() => setOpen(false)} style={{ padding: '8px 12px' }}>
        Cancelar
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Write the dashboard page (server component fetching data)**

```tsx
// src/app/(app)/page.tsx
import { prisma } from '@/lib/prisma'
import { KanbanBoard, type BoardSite } from '@/components/KanbanBoard'
import { NewSiteButton } from '@/components/NewSiteButton'

export default async function DashboardPage() {
  const sites = await prisma.site.findMany({
    include: { checklist: { select: { done: true } } },
    orderBy: [{ status: 'asc' }, { priority: 'asc' }],
  })

  const boardSites: BoardSite[] = sites.map((s) => ({
    id: s.id,
    name: s.name,
    status: s.status,
    priority: s.priority,
    doneCount: s.checklist.filter((c) => c.done).length,
    totalCount: s.checklist.length,
  }))

  return (
    <div>
      <NewSiteButton />
      <KanbanBoard initialSites={boardSites} />
    </div>
  )
}
```

- [ ] **Step 5: Manually verify in the browser**

Run `npm run dev`, log in, land on `/`. Click "+ Novo site", create "Site Teste" — expect a card in the "Não iniciado" column showing "0/8". Drag it to "Em andamento" — expect it to land there and stay there after a page refresh (confirms the reorder API persisted). Drag a second site above/below it within the same column and refresh — expect the order to persist.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Kanban dashboard with drag-and-drop reordering"
```

---

## Task 11: Site detail page (checklist editor)

**Files:**
- Create: `gerenciador-sites/src/app/(app)/sites/[id]/page.tsx`
- Create: `gerenciador-sites/src/components/ChecklistEditor.tsx`

**Interfaces:**
- Consumes: `GET /api/sites/[id]`, `PATCH/DELETE /api/sites/[id]/checklist/[itemId]`, `POST /api/sites/[id]/checklist`, `PATCH /api/sites/[id]/checklist/reorder` (Task 7), `PATCH /api/sites/[id]` for rename (Task 6).

- [ ] **Step 1: Write the `ChecklistEditor` client component**

```tsx
// src/components/ChecklistEditor.tsx
'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type ChecklistItemData = { id: string; label: string; done: boolean; order: number }

function Row({
  item,
  onToggle,
  onDelete,
}: {
  item: ChecklistItemData
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        ⠿
      </span>
      <input type="checkbox" checked={item.done} onChange={(e) => onToggle(item.id, e.target.checked)} />
      <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-2)' : 'var(--text)' }}>
        {item.label}
      </span>
      <button onClick={() => onDelete(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)' }}>
        remover
      </button>
    </div>
  )
}

export function ChecklistEditor({ siteId, initialItems }: { siteId: string; initialItems: ChecklistItemData[] }) {
  const [items, setItems] = useState(initialItems)
  const [newLabel, setNewLabel] = useState('')

  async function handleToggle(id: string, done: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)))
    await fetch(`/api/sites/${siteId}/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/sites/${siteId}/checklist/${id}`, { method: 'DELETE' })
  }

  async function handleAdd() {
    const label = newLabel.trim()
    if (!label) return
    const res = await fetch(`/api/sites/${siteId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems((prev) => [...prev, item])
      setNewLabel('')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setItems(reordered)

    await fetch(`/api/sites/${siteId}/checklist/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movedId: active.id, destIndex: newIndex }),
    })
  }

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Row key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </SortableContext>
      </DndContext>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Novo item"
          style={{ flex: 1, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
        />
        <button onClick={handleAdd} style={{ padding: '8px 12px' }}>
          Adicionar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the site detail page**

```tsx
// src/app/(app)/sites/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChecklistEditor } from '@/components/ChecklistEditor'

export default async function SiteDetailPage({ params }: { params: { id: string } }) {
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: { checklist: { orderBy: { order: 'asc' } } },
  })

  if (!site) {
    notFound()
  }

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>{site.name}</h1>
      <p style={{ color: 'var(--text-2)', marginTop: 0 }}>{site.status}</p>
      <ChecklistEditor siteId={site.id} initialItems={site.checklist} />
    </div>
  )
}
```

- [ ] **Step 3: Manually verify in the browser**

From the dashboard, click into "Site Teste". Toggle a checklist item — expect the strikethrough style and, after a refresh, the state persisted. Add a new item, then drag it to the top — refresh and confirm order persisted. Delete an item — confirm it's gone after refresh.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add site detail page with drag-and-drop checklist editor"
```

---

## Task 12: Templates page (edit default checklist)

**Files:**
- Create: `gerenciador-sites/src/app/(app)/templates/page.tsx`
- Create: `gerenciador-sites/src/components/TemplateEditor.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/templates`, `PATCH/DELETE /api/templates/[id]`, `PATCH /api/templates/reorder` (Task 8).

- [ ] **Step 1: Write the `TemplateEditor` client component**

```tsx
// src/components/TemplateEditor.tsx
'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type TemplateItemData = { id: string; label: string; order: number }

function Row({ item, onRemove }: { item: TemplateItemData; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        ⠿
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      <button onClick={() => onRemove(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)' }}>
        remover
      </button>
    </div>
  )
}

export function TemplateEditor({ initialItems }: { initialItems: TemplateItemData[] }) {
  const [items, setItems] = useState(initialItems)
  const [newLabel, setNewLabel] = useState('')

  async function handleAdd() {
    const label = newLabel.trim()
    if (!label) return
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems((prev) => [...prev, item])
      setNewLabel('')
    }
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setItems(reordered)

    await fetch('/api/templates/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movedId: active.id, destIndex: newIndex }),
    })
  }

  return (
    <div>
      <p style={{ color: 'var(--text-2)' }}>
        Esse checklist é copiado para todo site novo. Mudanças aqui não afetam sites já criados.
      </p>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Row key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </SortableContext>
      </DndContext>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Novo item padrão"
          style={{ flex: 1, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
        />
        <button onClick={handleAdd} style={{ padding: '8px 12px' }}>
          Adicionar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the templates page**

```tsx
// src/app/(app)/templates/page.tsx
import { prisma } from '@/lib/prisma'
import { TemplateEditor } from '@/components/TemplateEditor'

export default async function TemplatesPage() {
  const items = await prisma.checklistTemplateItem.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <h1>Checklist padrão</h1>
      <TemplateEditor initialItems={items} />
    </div>
  )
}
```

- [ ] **Step 3: Manually verify in the browser**

Visit `/templates` via the header nav. Add a new default item, drag it to reorder, remove an item — confirm each change persists after refresh. Create a brand-new site from the dashboard afterward and confirm its checklist reflects the updated template.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add checklist template editor page"
```

---

## Task 13: Deployment configuration

**Files:**
- Create: `gerenciador-sites/README.md`
- Modify: `gerenciador-sites/package.json` (add `postinstall` for Prisma generate)

**Interfaces:**
- None — this is operational documentation and a build-time hook, not consumed by other code.

- [ ] **Step 1: Add a `postinstall` script so Vercel generates the Prisma client on every deploy**

Add to `package.json` `"scripts"`:

```json
"postinstall": "prisma generate"
```

- [ ] **Step 2: Write the README with deployment steps**

```markdown
# Gerenciador de Sites — JvSoft

Painel interno para gerenciar os sites em produção da JvSoft: board Kanban
por status, prioridade por posição no board, checklist por site copiado de
um template editável.

## Rodando localmente

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (Postgres,
   ex: Neon/Vercel Postgres), `AUTH_SECRET` (string aleatória longa),
   `SEED_EMAIL` e `SEED_PASSWORD` (credenciais do único usuário admin).
3. `npx prisma migrate dev --name init`
4. `npx prisma db seed`
5. `npm run dev`

## Deploy na Vercel

1. Crie um banco Postgres via Vercel Postgres (Neon) no dashboard da Vercel
   e conecte ao projeto — isso preenche `DATABASE_URL` automaticamente.
2. Defina `AUTH_SECRET` nas variáveis de ambiente do projeto na Vercel.
3. Faça o deploy (`vercel --prod` ou push para a branch conectada).
4. Rode a migração e o seed contra o banco de produção uma única vez, a
   partir da sua máquina, apontando `DATABASE_URL` para a connection
   string de produção:
   ```bash
   npx prisma migrate deploy
   SEED_EMAIL="..." SEED_PASSWORD="..." npx prisma db seed
   ```

Não existe tela de cadastro — para trocar a senha ou criar outra conta,
rode o seed novamente com as variáveis atualizadas (ele faz upsert pelo
email).
```

- [ ] **Step 3: Run the full test suite one last time**

Run: `npm test`
Expected: all Vitest suites pass (`password.test.ts`, `auth.test.ts`, `reorder.test.ts`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add README with local setup and Vercel deployment steps"
```

---

## Post-plan manual smoke test (not a task — run once everything above is done)

1. `npm run dev`, visit `/` while logged out → redirected to `/login`.
2. Log in with seeded credentials → land on the Kanban dashboard.
3. Create 2–3 sites, drag them across all 5 columns and within a column → order and status survive a page refresh.
4. Open a site, edit its checklist (toggle, add, remove, reorder) → survives refresh.
5. Edit `/templates`, create a new site → new site's checklist matches the updated template.
6. Click "Sair" → redirected to `/login`, and `/` is inaccessible until logging back in.
