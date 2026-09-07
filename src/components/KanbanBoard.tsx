'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
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

function Column({ status, label, children }: { status: string; label: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 260,
        background: 'var(--paper-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 12,
      }}
    >
      <h3 style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 0 }}>{label}</h3>
      {children}
    </div>
  )
}

export function KanbanBoard({ initialSites }: { initialSites: BoardSite[] }) {
  const [sites, setSites] = useState(initialSites)
  const [reorderError, setReorderError] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    setSites(initialSites)
  }, [initialSites])

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
    setReorderError(null)

    try {
      const res = await fetch('/api/sites/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movedId, destStatus, destIndex }),
      })

      if (!res.ok) {
        setSites(previous)
        setReorderError('Não foi possível salvar a nova ordem.')
      }
    } catch {
      setSites(previous)
      setReorderError('Não foi possível salvar a nova ordem.')
    }
  }

  async function handleTogglePaid(id: string, paid: boolean) {
    const previous = sites
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, paid } : s)))
    try {
      const res = await fetch(`/api/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid }),
      })
      if (!res.ok) {
        setSites(previous)
      }
    } catch {
      setSites(previous)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {reorderError && (
        <p style={{ color: '#B3261E', fontSize: 13, marginTop: 0 }}>{reorderError}</p>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', overflowX: 'auto' }}>
        {COLUMNS.map((col) => (
          <Column key={col.status} status={col.status} label={col.label}>
            <SortableContext items={columnSites(col.status).map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {columnSites(col.status).map((site) => (
                <SiteCard key={site.id} site={site} onTogglePaid={handleTogglePaid} />
              ))}
            </SortableContext>
          </Column>
        ))}
      </div>
    </DndContext>
  )
}
