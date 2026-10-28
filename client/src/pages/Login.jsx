import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login, register } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (isReg) await register(f.name, f.email, f.password);
      else await login(f.email, f.password);
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setIsReg(false);
    setF({ name: '', email, password });
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card row g-0">
        {/* Left Hero Pane */}
        <div className="col-lg-6 auth-hero-pane d-none d-lg-flex">
          <div className="position-relative" style={{ zIndex: 1 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="brand-emblem" style={{ width: 42, height: 42, fontSize: '1.4rem' }}>
                <i className="bi bi-activity"></i>
              </div>
              <span className="brand-title fs-4">
                Staff<span className="brand-accent">Sync</span>
              </span>
            </div>

            <div className="mt-4">
              <span className="badge bg-light text-white mb-3" style={{ background: 'rgba(255,255,255,0.15) !important' }}>
                Modern Human Resource Platform
              </span>
              <h2 className="fw-bold display-6 mb-3" style={{ letterSpacing: '-0.03em', lineHeight: '1.2' }}>
                Modern Human Resource Management Solution.
              </h2>
              <p className="text-white-50 lead fs-6 mb-4" style={{ lineHeight: '1.6' }}>
                Streamline and automate core HR processes: real-time attendance telemetry, multi-tier leave approval workflows, employee records, and team training programs.
              </p>
            </div>

            <div className="d-flex flex-column gap-3 my-4">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: 'rgba(45, 212, 191, 0.2)', color: '#2dd4bf' }}>
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <span className="small text-white">Three Distinct Permission Roles (HR Admin, Manager, Employee)</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                  <i className="bi bi-clock-history"></i>
                </div>
                <span className="small text-white">Live Attendance Punch Clock & Daily Duration Calculation</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <span className="small text-white">Transparent Leave Request Workflow with Decision Notes</span>
              </div>
            </div>
          </div>

          <div className="position-relative pt-4 border-top border-white border-opacity-10 small text-white-50" style={{ zIndex: 1 }}>
            <span>© 2026 StaffSync HR • MERN Stack Enterprise Solution</span>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="col-lg-6 auth-form-pane d-flex flex-column justify-content-center">
          <div className="d-lg-none d-flex align-items-center gap-2 mb-4">
            <div className="brand-emblem" style={{ width: 36, height: 36 }}>
              <i className="bi bi-activity"></i>
            </div>
            <span className="brand-title fs-4 text-dark">
              Staff<span className="brand-accent">Sync</span>
            </span>
          </div>

          <div className="mb-4">
            <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em', color: '#0f172a' }}>
              {isReg ? 'Create Employee Account' : 'Welcome to StaffSync'}
            </h3>
            <p className="text-muted small">
              {isReg ? 'Fill in your details to register as a staff member' : 'Sign in to access your HR workspace portal'}
            </p>
          </div>

          {err && (
            <div className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle-fill fs-5"></i>
              <div className="small">{err}</div>
            </div>
          )}

          <form onSubmit={submit}>
            {isReg && (
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-person"></i></span>
                  <input
                    className="form-control border-start-0 ps-0"
                    placeholder="e.g. Alex Morgan"
                    value={f.name}
                    onChange={set('name')}
                    required
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Work Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@staffsync.com"
                  value={f.email}
                  onChange={set('email')}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-shield-lock"></i></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="••••••••"
                  minLength={6}
                  value={f.password}
                  onChange={set('password')}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-start-0 text-muted"
                  onClick={() => setShowPass(!showPass)}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading}
              type="submit"
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <span>{isReg ? 'Complete Registration' : 'Sign In to Portal'}</span>
              <i className="bi bi-arrow-right"></i>
            </button>
          </form>

          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-link text-decoration-none small text-muted p-0"
              onClick={() => { setIsReg(!isReg); setErr(''); }}
            >
              {isReg ? 'Already registered? Return to sign in' : "New employee without access? Register here"}
            </button>
          </div>

          {!isReg && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                  Instant Demo Access Roles
                </span>
                <span className="badge bg-secondary">1-Click Fill</span>
              </div>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="demo-account-card"
                  onClick={() => fillDemo('hr@staffsync.com', 'hr1234')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">HR Admin</span>
                    <span className="fw-medium">hr@staffsync.com</span>
                  </div>
                  <span className="small text-muted"><i className="bi bi-chevron-right"></i></span>
                </button>
                <button
                  type="button"
                  className="demo-account-card"
                  onClick={() => fillDemo('manager@staffsync.com', 'mgr1234')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning">Manager</span>
                    <span className="fw-medium">manager@staffsync.com</span>
                  </div>
                  <span className="small text-muted"><i className="bi bi-chevron-right"></i></span>
                </button>
                <button
                  type="button"
                  className="demo-account-card"
                  onClick={() => fillDemo('employee@staffsync.com', 'emp1234')}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-info">Employee</span>
                    <span className="fw-medium">employee@staffsync.com</span>
                  </div>
                  <span className="small text-muted"><i className="bi bi-chevron-right"></i></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
