'use client'

import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type ChecklistItemData = { id: string; label: string; done: boolean; order: number }

function Row({
  item,
  onToggle,
  onDelete,
  onRename,
}: {
  item: ChecklistItemData
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  onRename: (id: string, label: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(item.label)

  function startEditing() {
    setValue(item.label)
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed && trimmed !== item.label) {
      onRename(item.id, trimmed)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      setValue(item.label)
      setEditing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        ⠿
      </span>
      <input type="checkbox" checked={item.done} onChange={(e) => onToggle(item.id, e.target.checked)} />
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
        />
      ) : (
        <span
          onDoubleClick={startEditing}
          style={{
            flex: 1,
            cursor: 'text',
            textDecoration: item.done ? 'line-through' : 'none',
            color: item.done ? 'var(--text-2)' : 'var(--text)',
          }}
        >
          {item.label}
        </span>
      )}
      <button onClick={startEditing} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)' }}>
        editar
      </button>
      <button onClick={() => onDelete(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)' }}>
        remover
      </button>
    </div>
  )
}

export function ChecklistEditor({ siteId, initialItems }: { siteId: string; initialItems: ChecklistItemData[] }) {
  const [items, setItems] = useState(initialItems)
  const [newLabel, setNewLabel] = useState('')

  async function handleToggle(id: string, done: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)))
    await fetch(`/api/sites/${siteId}/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/sites/${siteId}/checklist/${id}`, { method: 'DELETE' })
  }

  async function handleRename(id: string, label: string) {
    const previous = items
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)))
    try {
      const res = await fetch(`/api/sites/${siteId}/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (!res.ok) {
        setItems(previous)
      }
    } catch {
      setItems(previous)
    }
  }

  async function handleAdd() {
    const label = newLabel.trim()
    if (!label) return
    const res = await fetch(`/api/sites/${siteId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems((prev) => [...prev, item])
      setNewLabel('')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setItems(reordered)

    await fetch(`/api/sites/${siteId}/checklist/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movedId: active.id, destIndex: newIndex }),
    })
  }

  return (
    <div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <Row key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} onRename={handleRename} />
          ))}
        </SortableContext>
      </DndContext>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Novo item"
          style={{ flex: 1, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
        />
        <button onClick={handleAdd} style={{ padding: '8px 12px' }}>
          Adicionar
        </button>
      </div>
    </div>
  )
}
