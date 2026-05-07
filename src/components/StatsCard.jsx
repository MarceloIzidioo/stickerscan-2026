export default function StatsCard({ icon, value, label, color }) {
  return (
    <div className="glass-card" style={{
      padding: '14px 12px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        fontSize: 44,
        opacity: 0.06,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div className="stat-number" style={{
        background: color
          ? `linear-gradient(135deg, ${color}, #fff)`
          : 'linear-gradient(135deg, #fff, #d4af37)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}
