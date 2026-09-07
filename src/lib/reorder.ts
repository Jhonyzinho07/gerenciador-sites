export type PositionedItem = { id: string; status: string; priority: number }

export function reorderColumn<T extends PositionedItem>(
  items: T[],
  movedId: string,
  destStatus: string,
  destIndex: number
): T[] {
  const moved = items.find((i) => i.id === movedId)
  if (!moved) return []

  const sourceStatus = moved.status

  const destColumn = items
    .filter((i) => i.status === destStatus && i.id !== movedId)
    .sort((a, b) => a.priority - b.priority)
  destColumn.splice(destIndex, 0, moved)

  const changed = new Map<string, T>()
  destColumn.forEach((item, index) => {
    if (item.status !== destStatus || item.priority !== index) {
      changed.set(item.id, { ...item, status: destStatus, priority: index })
    }
  })

  if (sourceStatus !== destStatus) {
    const sourceColumn = items
      .filter((i) => i.status === sourceStatus && i.id !== movedId)
      .sort((a, b) => a.priority - b.priority)
    sourceColumn.forEach((item, index) => {
      if (item.priority !== index) {
        changed.set(item.id, { ...item, priority: index })
      }
    })
  }

  return Array.from(changed.values())
}
