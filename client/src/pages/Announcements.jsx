import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg, fmtDate } from '../api';

export default function Announcements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'announcement' | 'news'
  const [f, setF] = useState({ title: '', message: '', type: 'announcement' });
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get('/announcements').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await api.post('/announcements', f);
      setF({ title: '', message: '', type: 'announcement' });
      load();
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id, title) => {
    if (confirm(`Are you sure you want to remove "${title}" from the company bulletin?`)) {
      await api.delete(`/announcements/${id}`);
      load();
    }
  };

  const filtered = list.filter((a) => filterType === 'all' || a.type === filterType);

  return (
    <>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center page-header gap-3">
        <div>
          <h3 className="page-title">Company Bulletins & Circulars</h3>
          <p className="page-subtitle">Official organizational communications, policy updates, and executive announcements</p>
        </div>

        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            All Notices ({list.length})
          </button>
          <button
            className={`btn ${filterType === 'announcement' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterType('announcement')}
          >
            Announcements ({list.filter(x => x.type === 'announcement').length})
          </button>
          <button
            className={`btn ${filterType === 'news' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterType('news')}
          >
            Company News ({list.filter(x => x.type === 'news').length})
          </button>
        </div>
      </div>

      {user.role === 'hr' && (
        <div className="card p-4 mb-4 shadow-sm" style={{ borderTop: '4px solid #0d9488' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
            <i className="bi bi-broadcast text-primary"></i>
            Broadcast New Notice to Workforce
          </h5>
          {err && <div className="alert alert-danger py-2 mb-3">{err}</div>}
          <form onSubmit={post}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Notice Headline *</label>
                <input
                  className="form-control"
                  placeholder="e.g. Q4 All-Hands Town Hall & Employee Awards"
                  value={f.title}
                  onChange={set('title')}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Classification</label>
                <select className="form-select" value={f.type} onChange={set('type')}>
                  <option value="announcement">Official Announcement</option>
                  <option value="news">Company News & Updates</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Bulletin Details & Instructions *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Draft the message content, relevant dates, or links for staff..."
                  value={f.message}
                  onChange={set('message')}
                  required
                />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={submitting}>
                {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <i className="bi bi-megaphone-fill"></i>
                <span>Publish Bulletin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulletins Feed */}
      <div className="d-flex flex-column gap-3">
        {filtered.map((a) => (
          <div className="card p-4 shadow-sm" key={a._id}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark">{a.title}</h5>
                <span className={`badge ${a.type === 'news' ? 'bg-primary' : 'bg-warning'} text-capitalize`}>
                  <i className={`bi ${a.type === 'news' ? 'bi-newspaper' : 'bi-bell-fill'} me-1`}></i>
                  {a.type}
                </span>
              </div>
              {user.role === 'hr' && (
                <button
                  className="btn btn-sm btn-soft-danger d-inline-flex align-items-center gap-1"
                  onClick={() => del(a._id, a.title)}
                  title="Remove bulletin"
                >
                  <i className="bi bi-trash3"></i>
                  <span>Remove</span>
                </button>
              )}
            </div>

            <p className="mb-3 text-secondary" style={{ lineHeight: '1.6' }}>{a.message}</p>

            <div className="d-flex align-items-center justify-content-between text-muted small border-top pt-2">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: 24, height: 24, background: 'var(--primary-gradient)', fontSize: '0.7rem' }}
                >
                  <i className="bi bi-person"></i>
                </div>
                <span>Posted by <strong>{a.postedBy?.name || 'Human Resources Executive'}</strong></span>
              </div>

              <div className="d-flex align-items-center gap-1 text-muted">
                <i className="bi bi-calendar3"></i>
                <span>{fmtDate(a.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-5 text-center text-muted shadow-sm">
            <i className="bi bi-inbox fs-1 d-block mb-2 text-black-50"></i>
            No circulars found matching this classification.
          </div>
        )}
      </div>
    </>
  );
}
