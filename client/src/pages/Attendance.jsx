import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api, { errMsg, fmtTime, calcWorkHours } from '../api';

export default function Attendance() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const load = () => {
    api.get('/attendance/mine').then((r) => setMine(r.data));
    if (user.role !== 'employee') {
      api.get('/attendance', { params: date ? { date } : {} }).then((r) => setAll(r.data));
    }
  };

  useEffect(load, [date]);

  const act = async (what) => {
    setMsg('');
    setLoadingAction(true);
    try {
      await api.post(`/attendance/${what}`);
      load();
    } catch (x) {
      setMsg(errMsg(x));
    } finally {
      setLoadingAction(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = mine.find((r) => r.date === todayStr);

  const formattedDateToday = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <div className="page-header">
        <h3 className="page-title">Attendance & Time Telemetry</h3>
        <p className="page-subtitle">Track daily work shifts, log check-in/out stamps, and audit team presence</p>
      </div>

      {/* Hero Interactive Punch Clock Container */}
      <div className="card shadow-sm p-4 mb-4" style={{ borderTop: '4px solid #0d9488' }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                style={{ width: 64, height: 64, background: '#f0fdfa', fontSize: '1.8rem', border: '1px solid #ccfbf1' }}
              >
                <i className="bi bi-clock-history"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h4 className="fw-bold mb-0 text-dark">Live Punch Terminal</h4>
                  <span className="status-indicator-dot"></span>
                </div>
                <div className="text-muted small mt-1">{formattedDateToday}</div>
                <div className="font-monospace fw-bold text-dark fs-3 mt-1" style={{ letterSpacing: '0.04em' }}>
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 text-lg-end">
            <div className="d-flex flex-wrap justify-content-lg-end gap-2">
              <button
                className="btn btn-success py-2 px-3 d-inline-flex align-items-center gap-2"
                disabled={loadingAction || !!todayRecord?.checkIn}
                onClick={() => act('checkin')}
              >
                <i className="bi bi-box-arrow-in-right fs-5"></i>
                <div className="text-start">
                  <div className="fw-bold lh-1">Clock In</div>
                  <small className="opacity-75" style={{ fontSize: '0.7rem' }}>Start Workday</small>
                </div>
              </button>

              <button
                className="btn btn-outline-danger py-2 px-3 d-inline-flex align-items-center gap-2"
                disabled={loadingAction || !todayRecord?.checkIn || !!todayRecord?.checkOut}
                onClick={() => act('checkout')}
              >
                <i className="bi bi-box-arrow-left fs-5"></i>
                <div className="text-start">
                  <div className="fw-bold lh-1">Clock Out</div>
                  <small className="opacity-75" style={{ fontSize: '0.7rem' }}>End Workday</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Status Overview Bar */}
        <div className="mt-4 pt-3 border-top">
          <div className="row g-3">
            <div className="col-sm-4">
              <div className="p-3 rounded-3 bg-light border">
                <span className="small text-muted d-block mb-1">Check-In Timestamp</span>
                <span className="fw-bold text-dark">
                  {todayRecord?.checkIn ? (
                    <span className="badge bg-success fs-6">{fmtTime(todayRecord.checkIn)}</span>
                  ) : (
                    <span className="text-muted fst-italic">Not recorded</span>
                  )}
                </span>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 rounded-3 bg-light border">
                <span className="small text-muted d-block mb-1">Check-Out Timestamp</span>
                <span className="fw-bold text-dark">
                  {todayRecord?.checkOut ? (
                    <span className="badge bg-secondary fs-6">{fmtTime(todayRecord.checkOut)}</span>
                  ) : (
                    <span className="text-muted fst-italic">Not recorded</span>
                  )}
                </span>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 rounded-3 bg-light border">
                <span className="small text-muted d-block mb-1">Hours Logged Today</span>
                <span className="fw-bold text-teal fs-6">
                  {todayRecord?.checkIn ? calcWorkHours(todayRecord.checkIn, todayRecord.checkOut) : '0h 0m'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {msg && (
          <div className="alert alert-danger py-2 mt-3 mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{msg}</div>
          </div>
        )}
      </div>

      {/* My Attendance Log */}
      <div className="mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <i className="bi bi-calendar-week text-primary"></i>
          My Monthly Attendance Log
        </h5>
        <div className="card shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-modern table-hover mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift In</th>
                  <th>Shift Out</th>
                  <th>Logged Duration</th>
                  <th>Presence Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-semibold text-dark">{r.date}</td>
                    <td>{fmtTime(r.checkIn)}</td>
                    <td>{fmtTime(r.checkOut)}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {calcWorkHours(r.checkIn, r.checkOut)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'present' ? 'bg-success' : 'bg-warning'} text-capitalize`}>
                        <i className={`bi ${r.status === 'present' ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-1`}></i>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {mine.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="bi bi-clock fs-1 d-block mb-2 text-black-50"></i>
                      No attendance stamps recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team / Organization Attendance Audit (HR & Managers) */}
      {user.role !== 'employee' && (
        <div className="mb-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                <i className="bi bi-people-fill text-primary"></i>
                {user.role === 'hr' ? 'All Organization' : 'Team'} Attendance Audit
              </h5>
              <span className="small text-muted">Review presence records across departments</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted fw-semibold text-nowrap">Filter Date:</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              >
                Today
              </button>
              {date && (
                <button
                  className="btn btn-sm btn-link text-decoration-none text-muted"
                  onClick={() => setDate('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="card shadow-sm overflow-hidden">
            <div className="table-responsive">
              <table className="table table-modern table-hover mb-0">
                <thead>
                  <tr>
                    <th>Personnel</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="fw-semibold text-dark">{r.employee?.name || 'Staff Member'}</div>
                        <div className="small text-muted">{r.employee?.email}</div>
                      </td>
                      <td className="fw-medium text-dark">{r.date}</td>
                      <td>{fmtTime(r.checkIn)}</td>
                      <td>{fmtTime(r.checkOut)}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {calcWorkHours(r.checkIn, r.checkOut)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'present' ? 'bg-success' : 'bg-warning'} text-capitalize`}>
                          <i className={`bi ${r.status === 'present' ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-1`}></i>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {all.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-person-x fs-1 d-block mb-2 text-black-50"></i>
                        No employee attendance records found matching this date.
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
