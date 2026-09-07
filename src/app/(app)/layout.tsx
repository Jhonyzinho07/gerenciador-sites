import { AppHeader } from '@/components/AppHeader'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  )
}
