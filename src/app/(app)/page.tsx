import { prisma } from '@/lib/prisma'
import { KanbanBoard, type BoardSite } from '@/components/KanbanBoard'
import { NewSiteButton } from '@/components/NewSiteButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sites = await prisma.site.findMany({
    include: { checklist: { select: { done: true } } },
    orderBy: [{ status: 'asc' }, { priority: 'asc' }],
  })

  const boardSites: BoardSite[] = sites.map((s) => ({
    id: s.id,
    name: s.name,
    status: s.status,
    priority: s.priority,
    doneCount: s.checklist.filter((c) => c.done).length,
    totalCount: s.checklist.length,
  }))

  return (
    <div>
      <NewSiteButton />
      <KanbanBoard initialSites={boardSites} />
    </div>
  )
}
