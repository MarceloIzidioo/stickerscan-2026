import { useState, useRef } from 'react';
import {
  exportCollection,
  importCollection,
  resetCollection,
  getUserName,
  saveUserName,
  getViewMode,
  setViewMode,
} from '../services/collectionService';
import Toast from '../components/Toast';

export default function Settings() {
  const [userName, setUserName] = useState(getUserName());
  const [viewMode, setViewModeState] = useState(getViewMode());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const fileInputRef = useRef(null);

  const handleSaveName = () => {
    saveUserName(userName);
    setViewMode(viewMode);
    setToast({ show: true, message: '✅ Configurações salvas!' });
  };

  const handleExport = () => {
    const data = exportCollection();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stickerscan-2026-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ show: true, message: '📦 Coleção exportada com sucesso!' });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importCollection(event.target.result);
      if (result.success) {
        setUserName(getUserName());
        setToast({ show: true, message: `✅ ${result.message}` });
      } else {
        setToast({ show: true, message: `❌ ${result.message}` });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleReset = () => {
    resetCollection();
    setShowConfirmReset(false);
    setToast({ show: true, message: '🗑️ Coleção resetada.' });
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
        ⚙️ Configurações
      </h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
        Gerencie seu perfil e coleção.
      </p>

      {/* User name */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          👤 Seu nome
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Seu nome ou apelido"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: '#f1f5f9',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSaveName}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #b8941e)',
              color: '#000',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Salvar
          </button>
        </div>

        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginTop: 16, marginBottom: 8 }}>
          👁️ Modo de visualização do Álbum
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewModeState('simplified')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: `1px solid ${viewMode === 'simplified' ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
              background: viewMode === 'simplified' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'simplified' ? '#d4af37' : '#94a3b8',
              fontSize: 13,
              fontWeight: viewMode === 'simplified' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            Simplificada (Padrão)
          </button>
          <button
            onClick={() => setViewModeState('complete')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: `1px solid ${viewMode === 'complete' ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
              background: viewMode === 'complete' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
              color: viewMode === 'complete' ? '#d4af37' : '#94a3b8',
              fontSize: 13,
              fontWeight: viewMode === 'complete' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            Completa (Cards)
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          📦 Backup da coleção
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid rgba(34,197,94,0.2)',
              background: 'rgba(34,197,94,0.08)',
              color: '#4ade80',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            ⬇️ Exportar JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid rgba(59,130,246,0.2)',
              background: 'rgba(59,130,246,0.08)',
              color: '#60a5fa',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            ⬆️ Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Reset */}
      <div className="glass-card" style={{ padding: 16 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          ⚠️ Zona de perigo
        </label>
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.08)',
              color: '#f87171',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🗑️ Resetar toda a coleção
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: '#f87171', marginBottom: 10, fontWeight: 500 }}>
              Tem certeza? Essa ação vai apagar TODAS as figurinhas da sua coleção. Isso não pode ser desfeito.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sim, apagar tudo
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div style={{
        textAlign: 'center',
        marginTop: 30,
        padding: 20,
        color: '#475569',
        fontSize: 12,
      }}>
        <p style={{ fontWeight: 600 }}>⚽ StickerScan 2026</p>
        <p>Versão MVP 1.0</p>
        <p style={{ marginTop: 4, fontSize: 11 }}>
          Dados armazenados localmente no seu navegador.
        </p>
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
