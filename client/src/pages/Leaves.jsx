import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg, fmtDate, calcDays } from '../api';

const statusStyles = {
  pending: { badge: 'bg-warning', icon: 'bi-hourglass-split', label: 'Pending Review' },
  approved: { badge: 'bg-success', icon: 'bi-check-circle-fill', label: 'Approved' },
  rejected: { badge: 'bg-danger', icon: 'bi-x-circle-fill', label: 'Rejected' }
};

export default function Leaves() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [f, setF] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/leaves/mine').then((r) => setMine(r.data));
    if (canReview) api.get('/leaves').then((r) => setAll(r.data));
  };

  useEffect(load, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const calculatedDays = calcDays(f.startDate, f.endDate);

  const apply = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await api.post('/leaves', f);
      setF({ type: 'casual', startDate: '', endDate: '', reason: '' });
      load();
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setSubmitting(false);
    }
  };

  const review = async (id, status) => {
    let comment = '';
    if (status === 'rejected') {
      const reason = prompt('Please provide feedback or reason for rejection (optional):');
      if (reason === null) return; // User cancelled prompt
      comment = reason;
    }
    try {
      await api.put(`/leaves/${id}/status`, { status, comment });
      load();
    } catch (x) {
      alert(errMsg(x));
    }
  };

  const renderStatus = (status) => {
    const s = statusStyles[status] || { badge: 'bg-secondary', icon: 'bi-circle', label: status };
    return (
      <span className={`badge ${s.badge} d-inline-flex align-items-center gap-1`}>
        <i className={`bi ${s.icon}`}></i>
        <span>{s.label}</span>
      </span>
    );
  };

  // Compute leave stats for employee
  const casualTaken = mine.filter(l => l.type === 'casual' && l.status === 'approved').length;
  const sickTaken = mine.filter(l => l.type === 'sick' && l.status === 'approved').length;
  const annualTaken = mine.filter(l => l.type === 'annual' && l.status === 'approved').length;

  const filteredTeamLeaves = all.filter(l => filterTab === 'all' || l.status === filterTab);

  return (
    <>
      <div className="page-header">
        <h3 className="page-title">Leave & Time-Off Management</h3>
        <p className="page-subtitle">Submit leave applications, view entitlement quotas, and manage team approvals</p>
      </div>

      {/* Leave Entitlement Overview */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card p-3 shadow-sm border-start border-4 border-primary">
            <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>Casual Leave</div>
            <div className="d-flex justify-content-between align-items-baseline mt-1">
              <span className="fs-4 fw-bold text-dark">{casualTaken} / 10</span>
              <span className="small text-muted">days used</span>
            </div>
            <div className="progress mt-2" style={{ height: 4 }}>
              <div className="progress-bar bg-primary" style={{ width: `${(casualTaken / 10) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card p-3 shadow-sm border-start border-4 border-info">
            <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>Sick Leave</div>
            <div className="d-flex justify-content-between align-items-baseline mt-1">
              <span className="fs-4 fw-bold text-dark">{sickTaken} / 12</span>
              <span className="small text-muted">days used</span>
            </div>
            <div className="progress mt-2" style={{ height: 4 }}>
              <div className="progress-bar bg-info" style={{ width: `${(sickTaken / 12) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card p-3 shadow-sm border-start border-4 border-success">
            <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>Annual Paid Vacation</div>
            <div className="d-flex justify-content-between align-items-baseline mt-1">
              <span className="fs-4 fw-bold text-dark">{annualTaken} / 15</span>
              <span className="small text-muted">days used</span>
            </div>
            <div className="progress mt-2" style={{ height: 4 }}>
              <div className="progress-bar bg-success" style={{ width: `${(annualTaken / 15) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card p-3 shadow-sm border-start border-4 border-warning">
            <div className="small text-muted text-uppercase fw-semibold" style={{ fontSize: '0.74rem' }}>Pending Requests</div>
            <div className="d-flex justify-content-between align-items-baseline mt-1">
              <span className="fs-4 fw-bold text-dark">{mine.filter(l => l.status === 'pending').length}</span>
              <span className="small text-warning fw-semibold">Awaiting review</span>
            </div>
            <div className="progress mt-2" style={{ height: 4 }}>
              <div className="progress-bar bg-warning" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Card */}
      <div className="card p-4 mb-4 shadow-sm" style={{ borderTop: '4px solid #0d9488' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-calendar-plus text-primary"></i>
            Submit New Time-Off Application
          </h5>
          {calculatedDays > 0 && (
            <span className="badge bg-primary fs-6">
              <i className="bi bi-clock me-1"></i>
              Duration: {calculatedDays} day{calculatedDays > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {err && <div className="alert alert-danger py-2 mb-3">{err}</div>}

        <form onSubmit={apply}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Leave Category *</label>
              <select className="form-select" value={f.type} onChange={set('type')}>
                <option value="casual">Casual Leave (Short)</option>
                <option value="sick">Sick / Medical Leave</option>
                <option value="annual">Annual Paid Vacation</option>
                <option value="unpaid">Unpaid Personal Leave</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-control" value={f.startDate} onChange={set('startDate')} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date *</label>
              <input type="date" className="form-control" value={f.endDate} onChange={set('endDate')} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Reason / Justification *</label>
              <input className="form-control" placeholder="Brief reason for time-off..." value={f.reason} onChange={set('reason')} required />
            </div>
          </div>
          <div className="mt-3 text-end">
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-send-fill"></i>
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </div>

      {/* My Leave History */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <i className="bi bi-clock-history text-primary"></i>
          My Submitted Leave Applications
        </h5>
        <div className="card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-modern table-hover mb-0">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Dates Range</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Feedback</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => {
                  const days = calcDays(r.startDate, r.endDate);
                  return (
                    <tr key={r._id}>
                      <td><span className="fw-semibold text-capitalize">{r.type}</span></td>
                      <td><span className="badge bg-secondary">{days} day{days > 1 ? 's' : ''}</span></td>
                      <td>
                        <span className="fw-medium text-dark">{fmtDate(r.startDate)}</span>
                        <span className="text-muted mx-1">→</span>
                        <span className="fw-medium text-dark">{fmtDate(r.endDate)}</span>
                      </td>
                      <td>{r.reason || <span className="text-muted">-</span>}</td>
                      <td>{renderStatus(r.status)}</td>
                      <td>{r.comment || <span className="text-muted">No comment</span>}</td>
                    </tr>
                  );
                })}
                {mine.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 d-block mb-2 text-black-50"></i>
                      No leave requests found on your record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Section for Managers and HR */}
      {canReview && (
        <div className="mb-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                <i className="bi bi-check2-square text-primary"></i>
                Team Leave Approval Console
              </h5>
              <span className="small text-muted">Manage time-off requests submitted by your team members</span>
            </div>

            {/* Filter Tabs */}
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${filterTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterTab('all')}
              >
                All ({all.length})
              </button>
              <button
                className={`btn ${filterTab === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterTab('pending')}
              >
                Pending ({all.filter(x => x.status === 'pending').length})
              </button>
              <button
                className={`btn ${filterTab === 'approved' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterTab('approved')}
              >
                Approved ({all.filter(x => x.status === 'approved').length})
              </button>
              <button
                className={`btn ${filterTab === 'rejected' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterTab('rejected')}
              >
                Rejected ({all.filter(x => x.status === 'rejected').length})
              </button>
            </div>
          </div>

          <div className="card shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-modern table-hover mb-0">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Date Period</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Feedback</th>
                    <th className="text-end">Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeamLeaves.map((r) => {
                    const days = calcDays(r.startDate, r.endDate);
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-semibold text-dark">{r.employee?.name || 'Staff Member'}</div>
                          <div className="small text-muted">{r.employee?.email}</div>
                        </td>
                        <td><span className="fw-semibold text-capitalize">{r.type}</span></td>
                        <td><span className="badge bg-secondary">{days} day{days > 1 ? 's' : ''}</span></td>
                        <td>
                          <span className="fw-medium text-dark">{fmtDate(r.startDate)}</span>
                          <span className="text-muted mx-1">→</span>
                          <span className="fw-medium text-dark">{fmtDate(r.endDate)}</span>
                        </td>
                        <td>{r.reason || <span className="text-muted">-</span>}</td>
                        <td>{renderStatus(r.status)}</td>
                        <td>{r.comment || <span className="text-muted">-</span>}</td>
                        <td className="text-end text-nowrap">
                          {r.status === 'pending' ? (
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                onClick={() => review(r._id, 'approved')}
                                title="Approve Request"
                              >
                                <i className="bi bi-check-lg"></i>
                                <span>Approve</span>
                              </button>
                              <button
                                className="btn btn-sm btn-soft-danger d-inline-flex align-items-center gap-1"
                                onClick={() => review(r._id, 'rejected')}
                                title="Reject Request"
                              >
                                <i className="bi bi-x-lg"></i>
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">
                              <i className="bi bi-check2-all text-teal me-1"></i>
                              Decided
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTeamLeaves.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        <i className="bi bi-check-circle fs-1 d-block mb-2 text-black-50"></i>
                        No requests matching the selected filter tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
