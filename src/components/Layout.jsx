import { NavLink, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Início' },
    { path: '/album', icon: '📋', label: 'Álbum' },
    { path: '/scanner', icon: '📸', label: 'Scanner' },
    { path: '/repetidas', icon: '🔄', label: 'Repetidas' },
    { path: '/troca', icon: '🤝', label: 'Trocas' },
  ];

  return (
    <>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.08)',
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>⚽</span>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 18,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff, #d4af37)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}>
                StickerScan 2026
              </h1>
              <p style={{ fontSize: 10, color: '#64748b', fontWeight: 500, letterSpacing: 1 }}>
                COPA DO MUNDO
              </p>
            </div>
          </NavLink>

          <NavLink to="/config" style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
            fontSize: 18,
            transition: 'all 0.2s ease',
          }}>
            ⚙️
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '16px 16px 0' }}>
        <div className="page-enter" key={location.pathname}>
          {children}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
