export default function LoadingSiteDetails() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Site Name Skeleton */}
      <div style={{ height: 40, width: '50%', background: 'var(--paper-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />
      {/* Status Skeleton */}
      <div style={{ height: 20, width: '20%', background: 'var(--paper-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />
      {/* Paid Toggle Skeleton */}
      <div style={{ height: 32, width: '30%', background: 'var(--paper-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />

      {/* Checklist Skeleton items */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--paper-2)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 24, flex: 1, background: 'var(--paper-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
