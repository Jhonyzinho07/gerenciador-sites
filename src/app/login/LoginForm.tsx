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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        setError('Email ou senha inválidos.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
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
