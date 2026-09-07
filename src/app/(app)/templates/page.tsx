import { prisma } from '@/lib/prisma'
import { TemplateEditor } from '@/components/TemplateEditor'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const items = await prisma.checklistTemplateItem.findMany({ orderBy: { order: 'asc' } })
  return (
    <div>
      <h1>Checklist padrão</h1>
      <TemplateEditor initialItems={items} />
    </div>
  )
}
