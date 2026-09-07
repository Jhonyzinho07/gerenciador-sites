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
