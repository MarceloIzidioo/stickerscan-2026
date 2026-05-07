import { getStickerStatus, getStatusLabel, RARITY_COLORS, TEAM_FLAGS } from '../utils/statusUtils';

// Generate a deterministic color from a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${Math.abs(h)}, 50%, 35%)`;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function StickerCard({ sticker, quantity, onAdd, onRemove }) {
  const status = getStickerStatus(quantity);
  const statusLabel = getStatusLabel(status);
  const rarityKey = sticker.raridade.toLowerCase().replace('á', 'a');
  const avatarColor = stringToColor(sticker.nome + sticker.selecao);
  const flag = TEAM_FLAGS[sticker.selecao] || '🏳️';

  return (
    <div className={`sticker-card status-${status}`}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div
          className="sticker-avatar"
          style={{ background: avatarColor }}
        >
          {sticker.categoria === 'Escudo' ? '🛡️' : getInitials(sticker.nome)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{sticker.numero}</span>
            <span className={`badge-rarity ${rarityKey === 'lendária' ? 'lendaria' : rarityKey}`}>
              {sticker.raridade === 'Lendária' ? '✦ ' : ''}{sticker.raridade}
            </span>
          </div>

          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#f1f5f9',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {sticker.nome}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: 13 }}>{flag}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{sticker.selecao}</span>
            {sticker.clube && (
              <>
                <span style={{ fontSize: 10, color: '#475569' }}>•</span>
                <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sticker.clube}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: status + controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span className={`badge-status ${status}`}>
          {status === 'faltando' ? '✗' : status === 'tenho' ? '✓' : '↻'} {statusLabel}
          {status === 'repetida' && ` (${quantity})`}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="qty-btn" onClick={onRemove} aria-label="Remover">−</button>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            minWidth: 24,
            textAlign: 'center',
            color: quantity > 0 ? '#f1f5f9' : '#475569',
          }}>
            {quantity}
          </span>
          <button className="qty-btn" onClick={onAdd} aria-label="Adicionar">+</button>
        </div>
      </div>
    </div>
  );
}
