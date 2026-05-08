import { useState, useEffect } from 'react';
import stickersData from '../data/stickers';
import { getCollection, getUserName } from '../services/collectionService';
import { getOverallProgress, getDuplicatesText, getMissingText, TEAM_FLAGS } from '../utils/statusUtils';
import ProgressBar from '../components/ProgressBar';
import Toast from '../components/Toast';

export default function TradePage() {
  const [collection, setCollection] = useState({});
  const [userName, setUserName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    setCollection(getCollection());
    setUserName(getUserName());
  }, []);

  const progress = getOverallProgress(collection, stickersData);
  const duplicates = stickersData.filter(s => (collection[s.id] || 0) > 1);
  const missing = stickersData.filter(s => (collection[s.id] || 0) === 0);

  const getFormattedList = (stickersArray) => {
    return stickersArray.map(s => String(s.numero).replace(/[-\s]/g, '').replace(/([A-Za-z]+)(\d+)/, '$1-$2').toUpperCase()).join(', ');
  };

  const handleCopySection = (stickersArray, label) => {
    if (stickersArray.length === 0) return;
    const text = getFormattedList(stickersArray);
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: `📋 Lista copiada!` });
    }).catch(() => {
      setToast({ show: true, message: `❌ Erro ao copiar lista.` });
    });
  };

  const handleWhatsAppSection = (stickersArray, prefix) => {
    if (stickersArray.length === 0) return;
    const text = getFormattedList(stickersArray);
    const encodedText = encodeURIComponent(`*${prefix}*\n\n${text}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 20,
        fontWeight: 800,
        color: '#f1f5f9',
        marginBottom: 24,
      }}>
        🤝 Central de Trocas
      </h2>

      {/* Action buttons removed as requested by the user */}

      {/* Duplicates section */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 15,
          fontWeight: 700,
          color: '#facc15',
          marginBottom: 10,
        }}>
          🔄 Para troca ({duplicates.reduce((s, st) => s + (collection[st.id] - 1), 0)})
        </h3>

        {duplicates.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => handleCopySection(duplicates, 'Repetidas')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              📋 Copiar lista
            </button>
            <button
              onClick={() => handleWhatsAppSection(duplicates, 'Minhas repetidas da Copa 2026:')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              💬 Compartilhar via WhatsApp
            </button>
          </div>
        )}

        {duplicates.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {duplicates.map(s => (
              <div key={s.id} style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(234,179,8,0.1)',
                border: '1px solid rgba(234,179,8,0.15)',
                fontSize: 12,
                color: '#facc15',
                fontWeight: 500,
              }}>
                {TEAM_FLAGS[s.selecao]} {s.numero} ({collection[s.id] - 1}x)
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#475569' }}>Nenhuma figurinha repetida.</p>
        )}
      </div>

      {/* Missing section */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 15,
          fontWeight: 700,
          color: '#f87171',
          marginBottom: 10,
        }}>
          ❌ Faltam ({missing.length})
        </h3>

        {missing.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => handleCopySection(missing, 'Faltantes')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              📋 Copiar lista
            </button>
            <button
              onClick={() => handleWhatsAppSection(missing, 'Figurinhas que faltam para o meu álbum da Copa 2026:')}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              💬 Compartilhar via WhatsApp
            </button>
          </div>
        )}

        {missing.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {missing.map(s => (
              <div key={s.id} style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.12)',
                fontSize: 12,
                color: '#f87171',
                fontWeight: 500,
                opacity: 0.7,
              }}>
                {TEAM_FLAGS[s.selecao]} {s.numero}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#4ade80' }}>Álbum completo! 🎉</p>
        )}
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
