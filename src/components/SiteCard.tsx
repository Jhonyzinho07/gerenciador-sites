'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type SiteCardData = {
  id: string
  name: string
  doneCount: number
  totalCount: number
  totalAmount: number
  paidAmount: number
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseBRL(value: string) {
  const numericString = value.replace(/\D/g, '')
  return parseInt(numericString || '0', 10)
}

export const SiteCard = React.memo(function SiteCard({
  site,
  onUpdatePayment,
}: {
  site: SiteCardData
  onUpdatePayment: (id: string, totalAmount: number, paidAmount: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: site.id,
  })

  const [editing, setEditing] = useState(false)
  const [totalVal, setTotalVal] = useState(formatBRL(site.totalAmount))
  const [paidVal, setPaidVal] = useState(formatBRL(site.paidAmount))

  const fullyPaid = site.totalAmount > 0 && site.paidAmount >= site.totalAmount
  const partiallyPaid = site.paidAmount > 0 && site.paidAmount < site.totalAmount
  const progressPercent = site.totalAmount > 0 ? Math.min(100, Math.round((site.paidAmount / site.totalAmount) * 100)) : 0

  let bg = 'var(--paper)'
  let border = '1px solid var(--line)'
  if (fullyPaid) {
    bg = '#E6F4EA'
    border = '1px solid #34A853'
  } else if (partiallyPaid) {
    bg = '#FFF8E1'
    border = '1px solid #FFC107'
  }

  function handleSave() {
    setEditing(false)
    const newTotal = parseBRL(totalVal)
    const newPaid = parseBRL(paidVal)
    if (newTotal !== site.totalAmount || newPaid !== site.paidAmount) {
      onUpdatePayment(site.id, newTotal, newPaid)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setTotalVal(formatBRL(site.totalAmount))
      setPaidVal(formatBRL(site.paidAmount))
      setEditing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: bg,
        border,
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 8,
        cursor: 'grab',
      }}
    >
      <Link href={`/sites/${site.id}`} prefetch={true} style={{ textDecoration: 'none', color: 'var(--text)' }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>{site.name}</strong>
        <span style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
          {site.doneCount}/{site.totalCount}
        </span>
      </Link>

      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: 8 }}
      >
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--text-2)' }}>
              Valor Total:
              <input
                type="text"
                value={totalVal}
                onChange={(e) => setTotalVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ width: '100%', fontSize: 12, padding: '2px 4px', marginTop: 2, borderRadius: 2, border: '1px solid var(--line)' }}
              />
            </label>
            <label style={{ fontSize: 11, color: 'var(--text-2)' }}>
              Valor Pago:
              <input
                type="text"
                value={paidVal}
                onChange={(e) => setPaidVal(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ width: '100%', fontSize: 12, padding: '2px 4px', marginTop: 2, borderRadius: 2, border: '1px solid var(--line)' }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: '#34A853',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 0',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setTotalVal(formatBRL(site.totalAmount))
                  setPaidVal(formatBRL(site.paidAmount))
                  setEditing(false)
                }}
                style={{
                  flex: 1,
                  background: 'var(--paper-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  padding: '4px 0',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setTotalVal(formatBRL(site.totalAmount))
              setPaidVal(formatBRL(site.paidAmount))
              setEditing(true)
            }}
            style={{ cursor: 'pointer' }}
            title="Clique para editar os valores"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: 'var(--text-2)' }}>
              <span>Pago: {formatBRL(site.paidAmount)}</span>
              <span>Total: {formatBRL(site.totalAmount)}</span>
            </div>

            {site.totalAmount > 0 && (
              <div style={{ width: '100%', height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: fullyPaid ? '#34A853' : '#FFC107',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
            {site.totalAmount === 0 && (
               <div style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic', textAlign: 'center' }}>
                  Clique para adicionar valor
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
