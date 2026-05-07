export default function ProgressBar({ percentage, height = 10, showLabel = true }) {
  return (
    <div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Progresso</span>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: percentage >= 100 ? '#4ade80' : '#d4af37',
          }}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="progress-bar-container" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
