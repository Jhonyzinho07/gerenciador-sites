'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function SiteNameEditor({ siteId, initialName }: { siteId: string; initialName: string }) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialName)
  const savingRef = useRef(false)

  async function commit() {
    if (savingRef.current) return
    const trimmed = value.trim()
    setEditing(false)
    if (!trimmed || trimmed === name) {
      setValue(name)
      return
    }
    savingRef.current = true
    const previous = name
    setName(trimmed)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        setName(previous)
        setValue(previous)
        return
      }
      router.refresh()
    } catch {
      setName(previous)
      setValue(previous)
    } finally {
      savingRef.current = false
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            setValue(name)
            setEditing(false)
          }
        }}
        style={{
          fontSize: 28,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--line)',
          marginBottom: 4,
        }}
      />
    )
  }

  return (
    <h1
      onClick={() => {
        setValue(name)
        setEditing(true)
      }}
      style={{ marginBottom: 4, cursor: 'pointer' }}
      title="Clique para editar o nome"
    >
      {name}
    </h1>
  )
}
