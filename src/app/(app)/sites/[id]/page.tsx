import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ChecklistEditor } from '@/components/ChecklistEditor'

export const dynamic = 'force-dynamic'

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const site = await prisma.site.findUnique({
    where: { id },
    include: { checklist: { orderBy: { order: 'asc' } } },
  })

  if (!site) {
    notFound()
  }

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>{site.name}</h1>
      <p style={{ color: 'var(--text-2)', marginTop: 0 }}>{site.status}</p>
      <ChecklistEditor siteId={site.id} initialItems={site.checklist} />
    </div>
  )
}
