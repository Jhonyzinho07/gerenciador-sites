'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        setError('Email ou senha inválidos.')
        setLoading(false)
        return
      }
      startTransition(() => {
        router.push('/')
        router.refresh()
      })
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading || isPending}
        style={{ padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading || isPending}
        style={{ padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
      />
      {error && <p style={{ color: '#B3261E', fontSize: 13, margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || isPending}
        style={{
          padding: 10,
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'var(--gradient-brand)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: (loading || isPending) ? 0.7 : 1,
        }}
      >
        {(loading || isPending) ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
