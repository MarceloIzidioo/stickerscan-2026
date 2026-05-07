import ProgressBar from './ProgressBar';
import { TEAM_FLAGS } from '../utils/statusUtils';

const TEAM_GRADIENT_MAP = {
  'Brasil': 'team-gradient-brasil',
  'Argentina': 'team-gradient-argentina',
  'França': 'team-gradient-franca',
  'Alemanha': 'team-gradient-alemanha',
  'Espanha': 'team-gradient-espanha',
  'Inglaterra': 'team-gradient-inglaterra',
  'Portugal': 'team-gradient-portugal',
  'Japão': 'team-gradient-japao',
  'México': 'team-gradient-mexico',
  'Estados Unidos': 'team-gradient-eua',
};

export default function TeamCard({ team, progress, onClick }) {
  const flag = TEAM_FLAGS[team] || '🏳️';
  const gradientClass = TEAM_GRADIENT_MAP[team] || '';

  return (
    <div
      className={`glass-card ${gradientClass}`}
      onClick={onClick}
      style={{
        padding: 14,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {progress.percentage === 100 && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: 14,
        }}>
          ✅
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>{flag}</span>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{team}</h3>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            {progress.owned}/{progress.total} figurinhas
          </span>
        </div>
      </div>

      <ProgressBar percentage={progress.percentage} height={6} showLabel={false} />
    </div>
  );
}
