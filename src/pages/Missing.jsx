import { useState, useEffect } from 'react';
import stickersData from '../data/stickers';
import { getCollection } from '../services/collectionService';
import { getMissingText, TEAM_FLAGS, getTeams } from '../utils/statusUtils';
import Toast from '../components/Toast';

export default function Missing() {
  const [collection, setCollection] = useState({});
  const [filterTeam, setFilterTeam] = useState('todas');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  const teams = getTeams(stickersData);
  const missing = stickersData.filter(s => {
    const qty = collection[s.id] || 0;
    if (qty > 0) return false;
    if (filterTeam !== 'todas' && s.selecao !== filterTeam) return false;
    return true;
  });

  const totalMissing = stickersData.filter(s => (collection[s.id] || 0) === 0).length;

  const handleCopy = () => {
    const text = getMissingText(collection, stickersData);
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: '📋 Lista copiada! Manda no grupo do WhatsApp!' });
    }).catch(() => {
      setToast({ show: true, message: '❌ Não foi possível copiar.' });
    });
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 20,
        fontWeight: 800,
        color: '#f1f5f9',
        marginBottom: 6,
      }}>
        ❌ Figurinhas Faltantes
      </h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
        {totalMissing > 0
          ? `Faltam ${totalMissing} figurinha${totalMissing > 1 ? 's' : ''} para completar o álbum.`
          : 'Álbum completo! Você é uma lenda! 👑'}
      </p>

      {totalMissing > 0 && (
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 12,
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.08)',
            color: '#f87171',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            cursor: 'pointer',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          📋 Copiar lista de faltantes
        </button>
      )}

      {/* Team filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
        <button
          className={`filter-chip ${filterTeam === 'todas' ? 'active' : ''}`}
          onClick={() => setFilterTeam('todas')}
        >
          Todas ({totalMissing})
        </button>
        {teams.map(team => {
          const count = stickersData.filter(s =>
            s.selecao === team && (collection[s.id] || 0) === 0
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={team}
              className={`filter-chip ${filterTeam === team ? 'active' : ''}`}
              onClick={() => setFilterTeam(team)}
            >
              {TEAM_FLAGS[team]} {count}
            </button>
          );
        })}
      </div>

      {/* Missing list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {missing.map(s => {
          const flag = TEAM_FLAGS[s.selecao] || '🏳️';
          return (
            <div key={s.id} className="glass-card" style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              opacity: 0.7,
            }}>
              <span style={{ fontSize: 18 }}>{flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.numero}</span>
                  <span className={`badge-rarity ${s.raridade.toLowerCase().replace('á', 'a')}`}>
                    {s.raridade}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1' }}>{s.nome}</div>
              </div>
              <span style={{ fontSize: 16 }}>❌</span>
            </div>
          );
        })}
      </div>

      {missing.length === 0 && totalMissing === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          color: '#64748b',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎉</span>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#4ade80' }}>Álbum completo!</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Você é uma lenda do colecionismo.</p>
        </div>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
