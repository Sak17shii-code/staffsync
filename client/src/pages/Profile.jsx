import { useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg, fmtDate } from '../api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({
    name: user.name,
    phone: user.phone || '',
    address: user.address || '',
    password: ''
  });
  const [msg, setMsg] = useState({ ok: true, text: '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ ok: true, text: '' });
    try {
      const { data } = await api.put('/users/me/profile', f);
      setUser(data);
      setF({ ...f, password: '' });
      setMsg({ ok: true, text: 'Your personal profile details were updated successfully!' });
    } catch (x) {
      setMsg({ ok: false, text: errMsg(x) });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'hr': return 'HR Administrator';
      case 'manager': return 'Team Manager';
      default: return 'Staff Employee';
    }
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-title">Personal Personnel Profile</h3>
        <p className="page-subtitle">View your organizational placement, credentials, and update contact preferences</p>
      </div>

      <div className="row g-4">
        {/* Left Card: Profile Overview */}
        <div className="col-lg-4">
          <div className="card p-4 text-center shadow-sm">
            <div
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-3"
              style={{
                width: 88,
                height: 88,
                fontSize: '2rem',
                background: 'var(--primary-gradient)',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)'
              }}
            >
              {getInitials(user.name)}
            </div>

            <h5 className="fw-bold mb-1 text-dark">{user.name}</h5>
            <div className="mb-3">
              <span className="badge bg-primary text-uppercase" style={{ letterSpacing: '0.04em' }}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <hr className="my-3 text-muted" />

            <div className="text-start d-flex flex-column gap-3 small">
              <div className="d-flex align-items-center gap-2 text-secondary">
                <i className="bi bi-envelope-at text-primary fs-6"></i>
                <span className="text-truncate">{user.email}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <i className="bi bi-building text-primary fs-6"></i>
                <span>Department: <strong>{user.department || 'Not Assigned'}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <i className="bi bi-briefcase text-primary fs-6"></i>
                <span>Position: <strong>{user.position || 'Staff Specialist'}</strong></span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <i className="bi bi-calendar-event text-primary fs-6"></i>
                <span>Joined Organization: <strong>{fmtDate(user.joinDate)}</strong></span>
              </div>
              {user.salary > 0 && (
                <div className="d-flex align-items-center gap-2 text-secondary">
                  <i className="bi bi-cash-coin text-primary fs-6"></i>
                  <span>Monthly Base: <strong>${user.salary.toLocaleString()}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Card: Edit Details */}
        <div className="col-lg-8">
          <form className="card p-4 shadow-sm" onSubmit={save} style={{ borderTop: '4px solid #0d9488' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <i className="bi bi-pencil-square text-primary"></i>
              Update Contact & Security Information
            </h5>

            {msg.text && (
              <div className={`alert alert-${msg.ok ? 'success' : 'danger'} py-2 mb-3 d-flex align-items-center gap-2`}>
                <i className={`bi ${msg.ok ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <div>{msg.text}</div>
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  placeholder="Full legal name"
                  value={f.name}
                  onChange={set('name')}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contact Phone Number</label>
                <input
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={f.phone}
                  onChange={set('phone')}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Residential Address</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Street address, City, State, ZIP..."
                  value={f.address}
                  onChange={set('address')}
                />
              </div>

              <div className="col-12">
                <div className="p-3 rounded-3 bg-light border mt-2">
                  <label className="form-label mb-1">Update Password (optional)</label>
                  <p className="text-muted small mb-2">Leave blank if you do not want to change your current login password.</p>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new secure password (min 6 characters)"
                    minLength={6}
                    value={f.password}
                    onChange={set('password')}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-end">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <i className="bi bi-check2-circle"></i>
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
