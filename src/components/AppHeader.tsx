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
