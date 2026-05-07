import { useState, useEffect } from 'react';
import stickersData from '../data/stickers';
import { getCollection } from '../services/collectionService';
import { getDuplicatesText, TEAM_FLAGS } from '../utils/statusUtils';
import Toast from '../components/Toast';

export default function Duplicates() {
  const [collection, setCollection] = useState({});
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  const duplicates = stickersData.filter(s => (collection[s.id] || 0) > 1);
  const totalExtras = duplicates.reduce((sum, s) => sum + (collection[s.id] - 1), 0);

  const handleCopy = () => {
    if (duplicates.length === 0) return;
    const text = duplicates.map(s => String(s.numero).replace(/[-\s]/g, '').replace(/([A-Za-z]+)(\d+)/, '$1-$2').toUpperCase()).join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: '📋 Lista copiada!' });
    }).catch(() => {
      setToast({ show: true, message: '❌ Não foi possível copiar.' });
    });
  };

  const handleWhatsAppShare = () => {
    if (duplicates.length === 0) return;
    const text = duplicates.map(s => String(s.numero).replace(/[-\s]/g, '').replace(/([A-Za-z]+)(\d+)/, '$1-$2').toUpperCase()).join(', ');
    const encodedText = encodeURIComponent(`*Minhas repetidas da Copa 2026:*\n\n${text}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
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
        🔄 Figurinhas Repetidas
      </h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>
        {duplicates.length > 0
          ? `Você tem ${totalExtras} figurinha${totalExtras > 1 ? 's' : ''} sobrando para troca.`
          : 'Nenhuma repetida ainda. Continue colecionando!'}
      </p>

      {duplicates.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#e2e8f0',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            📋 Copiar lista
          </button>
          
          <button
            onClick={handleWhatsAppShare}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            💬 Compartilhar no WhatsApp
          </button>
        </div>
      )}

      {/* Duplicate list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {duplicates.map(s => {
          const qty = collection[s.id] || 0;
          const extras = qty - 1;
          const flag = TEAM_FLAGS[s.selecao] || '🏳️';
          return (
            <div key={s.id} className="glass-card" style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{flag}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.numero}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.nome}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.selecao}</div>
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(234,179,8,0.15)',
                color: '#facc15',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                whiteSpace: 'nowrap',
              }}>
                +{extras} para troca
              </div>
            </div>
          );
        })}
      </div>

      {duplicates.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          color: '#64748b',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📦</span>
          <p>Nenhuma figurinha repetida ainda.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Continue abrindo pacotinhos!</p>
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
