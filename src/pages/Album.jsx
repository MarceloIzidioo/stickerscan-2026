import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import stickersData from '../data/stickers';
import { getCollection, addSticker, removeSticker, getViewMode } from '../services/collectionService';
import { getStickerStatus, getTeams, TEAM_FLAGS, getGroupForTeam, GROUPS_ORDER, getTeamSortIndex } from '../utils/statusUtils';
import StickerCard from '../components/StickerCard';
import Toast from '../components/Toast';

export default function Album() {
  const [searchParams] = useSearchParams();
  const [collection, setCollection] = useState({});
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState(searchParams.get('selecao') || 'todas');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterRarity, setFilterRarity] = useState('todas');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [viewMode] = useState(getViewMode());
  const [selectedSticker, setSelectedSticker] = useState(null);

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  // Handle URL param for team filter
  useEffect(() => {
    const selecao = searchParams.get('selecao');
    if (selecao) setFilterTeam(selecao);
  }, [searchParams]);

  // Sort teams for the filter chips using official order
  const teams = useMemo(() => getTeams(stickersData).filter(t => t !== '—').sort((a, b) => getTeamSortIndex(a) - getTeamSortIndex(b)), []);
  const rarities = ['Base', 'Especial'];

  const handleAdd = useCallback((id) => {
    const updated = addSticker(id);
    setCollection({ ...updated });
    const sticker = stickersData.find(s => s.id === id);
    const qty = updated[id] || 0;
    if (qty === 1) {
      setToast({ show: true, message: `✅ ${sticker.nome} adicionada!` });
    } else {
      setToast({ show: true, message: `🔄 ${sticker.nome} - ${qty} unidades` });
    }
  }, []);

  const handleRemove = useCallback((id) => {
    const updated = removeSticker(id);
    setCollection({ ...updated });
  }, []);

  const filteredStickers = useMemo(() => {
    return stickersData.filter(s => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match = s.nome.toLowerCase().includes(q)
          || s.numero.toLowerCase().includes(q)
          || s.selecao.toLowerCase().includes(q)
          || s.clube.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Team filter
      if (filterTeam !== 'todas' && s.selecao !== filterTeam) return false;
      // Status filter
      if (filterStatus !== 'todas') {
        const status = getStickerStatus(collection[s.id] || 0);
        if (filterStatus === 'faltando' && status !== 'faltando') return false;
        if (filterStatus === 'tenho' && status === 'faltando') return false;
        if (filterStatus === 'repetida' && status !== 'repetida') return false;
      }
      // Rarity filter
      if (filterRarity !== 'todas' && s.raridade !== filterRarity) return false;
      return true;
    });
  }, [search, filterTeam, filterStatus, filterRarity, collection]);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Title */}
      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 20,
        fontWeight: 800,
        color: '#f1f5f9',
        marginBottom: 14,
      }}>
        📋 Álbum de Figurinhas
      </h2>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 16,
          pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          placeholder="Buscar por nome, número, seleção ou clube..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#f1f5f9',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {/* Team filter */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            className={`filter-chip ${filterTeam === 'todas' ? 'active' : ''}`}
            onClick={() => setFilterTeam('todas')}
          >
            Todas
          </button>
          {teams.map(team => (
            <button
              key={team}
              className={`filter-chip ${filterTeam === team ? 'active' : ''}`}
              onClick={() => setFilterTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>

        {/* Status + Rarity filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'todas', label: 'Todos' },
            { key: 'faltando', label: '❌ Faltando' },
            { key: 'tenho', label: '✅ Tenho' },
            { key: 'repetida', label: '🔄 Repetidas' },
          ].map(opt => (
            <button
              key={opt.key}
              className={`filter-chip ${filterStatus === opt.key ? 'active' : ''}`}
              onClick={() => setFilterStatus(opt.key)}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 2px', flexShrink: 0 }} />
          {rarities.map(r => (
            <button
              key={r}
              className={`filter-chip ${filterRarity === r ? 'active' : ''}`}
              onClick={() => setFilterRarity(filterRarity === r ? 'todas' : r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div style={{
        fontSize: 12,
        color: '#64748b',
        marginBottom: 10,
        fontWeight: 500,
      }}>
        {filteredStickers.length} figurinha{filteredStickers.length !== 1 ? 's' : ''} encontrada{filteredStickers.length !== 1 ? 's' : ''}
      </div>

      {/* Grouped rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {GROUPS_ORDER.map(groupName => {
          const groupStickers = filteredStickers.filter(s => getGroupForTeam(s.selecao) === groupName);
          if (groupStickers.length === 0) return null;

          return (
            <div key={groupName}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#d4af37',
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {groupName}
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                  {groupStickers.length} figurinha{groupStickers.length !== 1 ? 's' : ''}
                </span>
              </h3>

              {Object.entries(
                groupStickers.reduce((acc, sticker) => {
                  if (!acc[sticker.selecao]) acc[sticker.selecao] = [];
                  acc[sticker.selecao].push(sticker);
                  return acc;
                }, {})
              )
                // Optional: sort teams exactly by the official World Cup order
              .sort(([a], [b]) => getTeamSortIndex(a) - getTeamSortIndex(b))
                .map(([selecao, selecaoStickers]) => (
                  <div key={selecao} style={{ marginBottom: 24 }}>
                    <h4 style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#94a3b8',
                      marginBottom: 10,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      {TEAM_FLAGS[selecao] || ''} {selecao}
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: viewMode === 'simplified' ? 'repeat(auto-fill, minmax(64px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 10,
                    }}>
                      {selecaoStickers.map(sticker => {
                        const qty = collection[sticker.id] || 0;

                        if (viewMode === 'complete') {
                          return (
                            <StickerCard
                              key={sticker.id}
                              sticker={sticker}
                              quantity={qty}
                              onAdd={() => handleAdd(sticker.id)}
                              onRemove={() => handleRemove(sticker.id)}
                            />
                          );
                        }

                        // Visão Simplificada
                        const hasSticker = qty > 0;
                        return (
                          <button
                            key={sticker.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSticker(sticker);
                            }}
                            title={`${sticker.nome} - ${sticker.selecao}`}
                            style={{
                              appearance: 'none',
                              outline: 'none',
                              padding: 0,
                              width: '100%',
                              aspectRatio: '1',
                              borderRadius: 8,
                              background: hasSticker ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${hasSticker ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: hasSticker ? '#4ade80' : '#64748b',
                              textAlign: 'center',
                              wordBreak: 'break-word',
                              padding: '0 4px'
                            }}>
                              {sticker.numero}
                            </span>
                            {qty > 1 && (
                              <div style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                background: '#facc15',
                                color: '#000',
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                zIndex: 2,
                              }}>
                                +{qty - 1}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {filteredStickers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔎</span>
          <p>Nenhuma figurinha encontrada com esses filtros.</p>
        </div>
      )}

      {/* Action Modal for Simplified View */}
      {selectedSticker && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setSelectedSticker(null)}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s ease',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>
              {selectedSticker.selecao.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
              {selectedSticker.numero}
            </h3>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#d4af37', marginBottom: 6 }}>
              {selectedSticker.nome}
            </div>

            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.05)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              color: '#cbd5e1',
              marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              Na coleção: <span style={{ fontWeight: 800, color: collection[selectedSticker.id] > 0 ? '#4ade80' : '#f87171' }}>{collection[selectedSticker.id] || 0}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => {
                handleAdd(selectedSticker.id);
                setSelectedSticker(null);
              }} style={{
                padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-heading)'
              }}>
                ✅ Adicionar (+1)
              </button>

              <button onClick={() => {
                handleRemove(selectedSticker.id);
                setSelectedSticker(null);
              }}
                disabled={(collection[selectedSticker.id] || 0) === 0}
                style={{
                  padding: '14px', borderRadius: 12, border: 'none',
                  background: (collection[selectedSticker.id] || 0) === 0 ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.15)',
                  color: (collection[selectedSticker.id] || 0) === 0 ? '#7f1d1d' : '#f87171',
                  fontSize: 15, fontWeight: 700,
                  cursor: (collection[selectedSticker.id] || 0) === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-heading)'
                }}>
                🗑️ Excluir (-1)
              </button>

              <button onClick={() => setSelectedSticker(null)} style={{
                padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#94a3b8', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                fontFamily: 'var(--font-heading)'
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ show: false, message: '' })}
      />
    </div>
  );
}
