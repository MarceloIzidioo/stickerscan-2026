import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import stickersData from '../data/stickers';
import { getCollection, getMeta, getUserName, saveUserName } from '../services/collectionService';
import { getOverallProgress, getTeamProgress, getTeams } from '../utils/statusUtils';
import StatsCard from '../components/StatsCard';
import ProgressBar from '../components/ProgressBar';
import TeamCard from '../components/TeamCard';
import BadgeDisplay from '../components/BadgeDisplay';

export default function Dashboard() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(() => getCollection());
  const [userName, setUserName] = useState(() => getUserName());
  const [showNameInput, setShowNameInput] = useState(() => !getUserName());

  const refreshData = useCallback(() => {
    setCollection(getCollection());
    setUserName(getUserName());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const progress = getOverallProgress(collection, stickersData);
  const teams = getTeams(stickersData);
  const meta = getMeta();

  const handleSaveName = (name) => {
    saveUserName(name);
    setUserName(name);
    setShowNameInput(false);
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Welcome name input modal */}
      {showNameInput && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⚽</span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 4,
              background: 'linear-gradient(135deg, #fff, #d4af37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Bem-vindo ao StickerScan!
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Como podemos te chamar?
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.elements.name.value.trim();
              if (name) handleSaveName(name);
            }}>
              <input
                name="name"
                type="text"
                placeholder="Seu nome ou apelido"
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(212,175,55,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f1f5f9',
                  fontSize: 15,
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  marginBottom: 14,
                }}
              />
              <button type="submit" style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #d4af37, #b8941e)',
                color: '#000',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
              }}>
                Bora começar! 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 22,
          fontWeight: 800,
          color: '#f1f5f9',
          marginBottom: 4,
        }}>
          Fala, {userName || 'Colecionador'}! 👋
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>
          {progress.percentage === 0
            ? 'Sua coleção está esperando. Bora começar?'
            : progress.percentage === 100
              ? 'ÁLBUM COMPLETO! Você é uma lenda! 👑'
              : `Sua coleção está ficando braba! ${progress.percentage}% completo.`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <ProgressBar percentage={progress.percentage} />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 8,
          fontSize: 12,
          color: '#64748b',
        }}>
          {progress.owned} de {progress.total} figurinhas
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 16,
      }}>
        <StatsCard icon="✅" value={progress.owned} label="Tenho" color="#4ade80" />
        <StatsCard icon="❌" value={progress.missing} label="Faltam" color="#f87171" />
        <StatsCard icon="🔄" value={progress.duplicateUnits} label="Repetidas" color="#facc15" />
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 20,
      }}>
        <button
          onClick={() => navigate('/scanner')}
          className="glass-card"
          style={{
            padding: '16px 12px',
            border: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(212,175,55,0.05)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: '#d4af37',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 28 }}>📸</span>
          Escanear Figurinha
        </button>
        <button
          onClick={() => navigate('/album')}
          className="glass-card"
          style={{
            padding: '16px 12px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: '#e2e8f0',
            fontFamily: 'var(--font-heading)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 28 }}>📋</span>
          Ver Álbum Completo
        </button>
      </div>

      {/* Teams */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 16,
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: 12,
      }}>
        🏟️ Seleções
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        marginBottom: 20,
      }}>
        {teams.map(team => {
          const teamProgress = getTeamProgress(collection, stickersData, team);
          return (
            <TeamCard
              key={team}
              team={team}
              progress={teamProgress}
              onClick={() => navigate(`/album?selecao=${encodeURIComponent(team)}`)}
            />
          );
        })}
      </div>

      {/* Badges */}
      <BadgeDisplay progress={progress} meta={meta} />
    </div>
  );
}
