import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function MenuIcon({ open }) {
  return open ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>; }
function RoomIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15M3 20h18M9 8h6M9 12h6M9 16h6" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4M18 12H9" /></svg>; }

export default function AppShell({ children, role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = role === 'admin';
  const displayName = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : isAdmin ? 'Administrator' : 'Student';
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const navItems = [
    { label: 'Dashboard', path: `/${role}/dashboard`, icon: GridIcon },
    { label: 'Exams', path: `/${role}/dashboard#exams`, icon: CalendarIcon },
    ...(isAdmin ? [{ label: 'Rooms', path: `/${role}/dashboard#rooms`, icon: RoomIcon }] : [])
  ];

  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.hash]);

  function handleNavClick() {
    setMenuOpen(false);
  }

  async function handleLogout() { await logout(); }

  return <div className="app-shell">
    <aside className={`app-sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="sidebar-brand"><span className="brand-mark">EF</span><span><strong>ExamFlow</strong><small>Campus operations</small></span></div>
      <div className="sidebar-profile"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>{isAdmin ? 'Administrator' : 'Student'}</span></div></div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="nav-label">Workspace</span>
        {navItems.map(({ label, path, icon: Icon }) => <NavLink key={label} to={path} onClick={handleNavClick} className={({ isActive }) => `nav-item ${((path.includes('#') && location.hash === `#${path.split('#')[1]}`) || (isActive && !path.includes('#') && !location.hash)) ? 'active' : ''}`}><Icon /><span>{label}</span>{label === 'Dashboard' && <span className="nav-current" aria-hidden="true" />}</NavLink>)}
      </nav>
      <div className="sidebar-footer"><button className="logout-link" type="button" onClick={handleLogout}><LogoutIcon /><span>Log out</span></button><small>ExamFlow campus operations</small></div>
    </aside>
    {menuOpen && <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="app-main"><header className="mobile-topbar"><button className="icon-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}><MenuIcon open={menuOpen} /></button><span className="mobile-brand"><span className="brand-mark">EF</span> ExamFlow</span><span className="mobile-avatar">{initials}</span></header>{children}</div>
  </div>;
}
