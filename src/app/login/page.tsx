import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-brand)',
      }}
    >
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          width: 360,
          boxShadow: '0 16px 40px rgba(11,13,20,0.2)',
        }}
      >
        <img src="/logo-jvsoft-icon.webp" alt="JvSoft" width={56} height={56} style={{ display: 'block', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 18, textAlign: 'center', marginBottom: 24, color: 'var(--text)' }}>
          Gerenciador de Sites
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
