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
