import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg, fmtDate } from '../api';

const empty = {
  title: '',
  description: '',
  trainer: '',
  startDate: '',
  endDate: '',
  participants: []
};

export default function Trainings() {
  const { user } = useAuth();
  const canManage = user.role !== 'employee';
  const [list, setList] = useState([]);
  const [people, setPeople] = useState([]);
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/trainings').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (canManage) api.get('/users').then((r) => setPeople(r.data.filter((u) => u.role === 'employee')));
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const toggle = (id) =>
    setF({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter((p) => p !== id)
        : [...f.participants, id]
    });

  const selectAll = () => setF({ ...f, participants: people.map(p => p._id) });
  const clearAll = () => setF({ ...f, participants: [] });

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await api.post('/trainings', f);
      setF(empty);
      load();
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id, title) => {
    if (!confirm(`Are you sure you want to cancel and remove "${title}"?`)) return;
    try {
      await api.delete(`/trainings/${id}`);
      load();
    } catch (x) {
      alert(errMsg(x));
    }
  };

  const getProgramStatus = (start, end) => {
    const today = new Date().toISOString().slice(0, 10);
    const s = new Date(start).toISOString().slice(0, 10);
    const e = new Date(end).toISOString().slice(0, 10);
    if (today < s) return { label: 'Upcoming', badge: 'bg-info' };
    if (today > e) return { label: 'Completed', badge: 'bg-secondary' };
    return { label: 'In Progress', badge: 'bg-success' };
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-title">Learning & Professional Development</h3>
        <p className="page-subtitle">Upskill personnel competencies with specialized workshops, courses, and certifications</p>
      </div>

      {canManage && (
        <div className="card p-4 mb-4 shadow-sm" style={{ borderTop: '4px solid #0d9488' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
            <i className="bi bi-mortarboard text-primary"></i>
            Schedule New Training Curriculum
          </h5>
          {err && <div className="alert alert-danger py-2 mb-3">{err}</div>}
          <form onSubmit={create}>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label">Curriculum / Program Title *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Advanced TypeScript & Clean Microservices Architecture"
                  value={f.title}
                  onChange={set('title')}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Lead Trainer / Instructor</label>
                <input
                  className="form-control"
                  placeholder="e.g. Dr. Alex Vance"
                  value={f.trainer}
                  onChange={set('trainer')}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={f.startDate}
                  onChange={set('startDate')}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={f.endDate}
                  onChange={set('endDate')}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Curriculum Objectives & Overview</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Summarize course goals, syllabus modules, or prerequisites for staff..."
                  value={f.description}
                  onChange={set('description')}
                />
              </div>
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Select Enrolled Team Members ({f.participants.length} chosen)</label>
                  <div className="btn-group btn-group-sm">
                    <button type="button" className="btn btn-outline-secondary" onClick={selectAll}>Select All</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>Clear</button>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 border">
                  {people.map((p) => {
                    const isChecked = f.participants.includes(p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => toggle(p._id)}
                        className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
                          isChecked ? 'btn-primary' : 'btn-outline-secondary bg-white'
                        }`}
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        <i className={`bi ${isChecked ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                        <span>{p.name}</span>
                        {p.department && <small className="opacity-75">({p.department})</small>}
                      </button>
                    );
                  })}
                  {people.length === 0 && <span className="text-muted small">No eligible employees listed.</span>}
                </div>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={submitting}>
                {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <i className="bi bi-calendar-event"></i>
                <span>Publish Training Program</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Program Cards Grid */}
      <div className="row g-3">
        {list.map((t) => {
          const progStatus = getProgramStatus(t.startDate, t.endDate);
          const isEnrolled = t.participants?.some(p => p._id === user._id || p === user._id);

          return (
            <div className="col-lg-6" key={t._id}>
              <div className="card p-4 h-100 shadow-sm d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${progStatus.badge}`}>{progStatus.label}</span>
                      {isEnrolled && (
                        <span className="badge bg-success">
                          <i className="bi bi-person-check-fill me-1"></i> You are enrolled
                        </span>
                      )}
                    </div>
                    {canManage && (
                      <button
                        className="btn btn-sm btn-soft-danger d-inline-flex align-items-center gap-1"
                        onClick={() => del(t._id, t.title)}
                        title="Cancel Program"
                      >
                        <i className="bi bi-trash3"></i>
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>

                  <h5 className="fw-bold mb-2 text-dark mt-1">{t.title}</h5>

                  <div className="d-flex flex-wrap gap-2 align-items-center mb-3 small text-muted">
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-calendar-range text-primary me-1"></i>
                      {fmtDate(t.startDate)} → {fmtDate(t.endDate)}
                    </span>
                    {t.trainer && (
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-person-badge text-primary me-1"></i>
                        Instructor: {t.trainer}
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-secondary small mb-3" style={{ lineHeight: '1.6' }}>
                      {t.description}
                    </p>
                  )}
                </div>

                <div className="border-top pt-3 mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                      Enrolled Roster ({t.participants?.length || 0})
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {t.participants?.map((p) => (
                      <span key={p._id || p} className="badge bg-light text-dark border">
                        {p.name || 'Employee'}
                      </span>
                    ))}
                    {(!t.participants || t.participants.length === 0) && (
                      <span className="text-muted small">No participants assigned yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="col-12">
            <div className="card p-5 text-center text-muted shadow-sm">
              <i className="bi bi-mortarboard fs-1 d-block mb-2 text-black-50"></i>
              No active learning & training programs scheduled at this time.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
