'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function NewSiteButton() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

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
      startTransition(() => {
        router.refresh()
      })
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
        disabled={isPending}
      />
      <button onClick={handleCreate} disabled={isPending} style={{ padding: '8px 12px' }}>
        {isPending ? 'Criando...' : 'Criar'}
      </button>
      <button onClick={() => setOpen(false)} disabled={isPending} style={{ padding: '8px 12px' }}>
        Cancelar
      </button>
    </div>
  )
}
