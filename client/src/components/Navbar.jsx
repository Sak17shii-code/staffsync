import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2' },
    ...(user.role !== 'employee' ? [{
      to: '/employees',
      label: user.role === 'hr' ? 'Directory' : 'My Team',
      icon: 'bi-people'
    }] : []),
    { to: '/leaves', label: 'Leaves', icon: 'bi-calendar2-week' },
    { to: '/attendance', label: 'Attendance', icon: 'bi-clock-history' },
    { to: '/announcements', label: 'Bulletins', icon: 'bi-megaphone' },
    { to: '/trainings', label: 'Training', icon: 'bi-mortarboard' },
    { to: '/profile', label: 'Profile', icon: 'bi-person-badge' }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'hr': return { label: 'HR Admin', bg: 'rgba(20, 184, 166, 0.2)', text: '#2dd4bf', border: 'rgba(45, 212, 191, 0.4)' };
      case 'manager': return { label: 'Team Manager', bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' };
      default: return { label: 'Staff Employee', bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
    }
  };

  const roleStyle = getRoleStyle(user.role);

  return (
    <nav className="navbar navbar-expand-lg executive-navbar sticky-top">
      <div className="container-fluid px-lg-4">
        <NavLink to="/" className="navbar-brand text-decoration-none d-flex align-items-center gap-2">
          <div className="brand-emblem">
            <i className="bi bi-activity"></i>
          </div>
          <div>
            <span className="brand-title">
              Staff<span className="brand-accent">Sync</span>
              <span className="brand-tier-badge">Enterprise</span>
            </span>
          </div>
        </NavLink>

        <button className="navbar-toggler border-0 shadow-none text-white p-1" type="button" data-bs-toggle="collapse" data-bs-target="#executiveNav">
          <i className="bi bi-list fs-2 text-white"></i>
        </button>

        <div className="collapse navbar-collapse" id="executiveNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
            {links.map(({ to, label, icon }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  end={to === '/'}
                  to={to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <i className={`bi ${icon}`}></i>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <div className="user-profile-chip">
              <div className="user-avatar-circle position-relative">
                {getInitials(user.name)}
                <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-dark rounded-circle" style={{ width: 8, height: 8 }}></span>
              </div>
              <div className="d-flex flex-column lh-sm">
                <span className="fw-semibold text-white small" style={{ letterSpacing: '-0.01em' }}>{user.name}</span>
                <span
                  className="badge px-1 py-0"
                  style={{
                    fontSize: '0.66rem',
                    background: roleStyle.bg,
                    color: roleStyle.text,
                    border: `1px solid ${roleStyle.border}`,
                    width: 'fit-content'
                  }}
                >
                  {roleStyle.label}
                </span>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-light d-flex align-items-center gap-2"
              title="Sign out securely"
              style={{ borderRadius: 'var(--radius-sm)', borderColor: 'rgba(255,255,255,0.18)' }}
              onClick={() => { logout(); nav('/login'); }}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
