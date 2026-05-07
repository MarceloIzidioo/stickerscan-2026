import { checkBadges } from '../utils/statusUtils';

export default function BadgeDisplay({ progress, meta }) {
  const badges = checkBadges(progress, meta);

  return (
    <div>
      <h3 style={{
        fontSize: 15,
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: 12,
        fontFamily: 'var(--font-heading)',
      }}>
        🏆 Conquistas
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
            title={badge.description}
          >
            <span className="badge-icon">{badge.icon}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.2,
              color: badge.unlocked ? '#d4af37' : '#475569',
            }}>
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
