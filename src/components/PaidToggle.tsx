'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PaidToggle({ siteId, initialPaid }: { siteId: string; initialPaid: boolean }) {
  const router = useRouter()
  const [paid, setPaid] = useState(initialPaid)

  async function handleChange(checked: boolean) {
    const previous = paid
    setPaid(checked)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: checked }),
      })
      if (!res.ok) {
        setPaid(previous)
        return
      }
      router.refresh()
    } catch {
      setPaid(previous)
    }
  }

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        background: paid ? '#E6F4EA' : 'var(--paper-2)',
        border: paid ? '1px solid #34A853' : '1px solid var(--line)',
        color: paid ? '#1E7E34' : 'var(--text-2)',
        fontSize: 14,
        cursor: 'pointer',
        width: 'fit-content',
      }}
    >
      <input type="checkbox" checked={paid} onChange={(e) => handleChange(e.target.checked)} />
      💰 Pago
    </label>
  )
}
