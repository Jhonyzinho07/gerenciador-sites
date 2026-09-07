import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gerenciador de Sites — JvSoft',
  description: 'Painel interno JvSoft para gerenciar sites em produção.',
  icons: { icon: '/logo-jvsoft-icon.webp' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
