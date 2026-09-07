'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type SiteCardData = {
  id: string
  name: string
  doneCount: number
  totalCount: number
  paid: boolean
}

export function SiteCard({
  site,
  onTogglePaid,
}: {
  site: SiteCardData
  onTogglePaid: (id: string, paid: boolean) => void
}) {
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
        background: site.paid ? '#E6F4EA' : 'var(--paper)',
        border: site.paid ? '1px solid #34A853' : '1px solid var(--line)',
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
      <label
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          fontSize: 13,
          color: site.paid ? '#1E7E34' : 'var(--text-2)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={site.paid}
          onChange={(e) => onTogglePaid(site.id, e.target.checked)}
        />
        💰 Pago
      </label>
    </div>
  )
}
