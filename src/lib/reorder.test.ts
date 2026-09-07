import { describe, expect, it } from 'vitest'
import { reorderColumn, type PositionedItem } from './reorder'

function make(id: string, status: string, priority: number): PositionedItem {
  return { id, status, priority }
}

describe('reorderColumn', () => {
  it('moves an item within the same column and renumbers priorities', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('c', 'A', 2)]
    const result = reorderColumn(items, 'c', 'A', 0)
    const byId = Object.fromEntries(result.map((i) => [i.id, i]))
    expect(byId.c).toMatchObject({ status: 'A', priority: 0 })
    expect(byId.a).toMatchObject({ status: 'A', priority: 1 })
    expect(byId.b).toMatchObject({ status: 'A', priority: 2 })
  })

  it('moves an item to a different column and renumbers both columns', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('c', 'B', 0)]
    const result = reorderColumn(items, 'a', 'B', 0)
    const byId = Object.fromEntries(result.map((i) => [i.id, i]))
    expect(byId.a).toMatchObject({ status: 'B', priority: 0 })
    expect(byId.c).toMatchObject({ status: 'B', priority: 1 })
    expect(byId.b).toMatchObject({ status: 'A', priority: 0 })
  })

  it('only returns items whose status or priority changed', () => {
    const items = [make('a', 'A', 0), make('b', 'A', 1), make('z', 'C', 0)]
    const result = reorderColumn(items, 'b', 'A', 0)
    expect(result.map((i) => i.id).sort()).toEqual(['a', 'b'])
  })
})
