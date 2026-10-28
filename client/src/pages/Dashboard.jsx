import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api, { fmtDate, fmtTime, calcWorkHours } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [newsRes, trainRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/trainings').catch(() => ({ data: [] }))
      ]);
      setNews(newsRes.data.slice(0, 6));

      if (user.role === 'employee') {
        const [lRes, aRes] = await Promise.all([
          api.get('/leaves/mine'),
          api.get('/attendance/mine')
        ]);
        const myAttendances = aRes.data || [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRec = myAttendances.find((r) => r.date === todayStr);
        setTodayAttendance(todayRec || null);

        const myTrainings = trainRes.data?.filter(t => t.participants?.some(p => p._id === user._id || p === user._id)) || [];

        setStats([
          { label: 'Days Present', n: myAttendances.length, icon: 'bi-calendar-check-fill', color: '#0d9488', bg: '#f0fdfa', trend: 'Monthly Log' },
          { label: 'Pending Leaves', n: lRes.data.filter((x) => x.status === 'pending').length, icon: 'bi-hourglass-split', color: '#d97706', bg: '#fffbeb', trend: 'In Review' },
          { label: 'Approved Leaves', n: lRes.data.filter((x) => x.status === 'approved').length, icon: 'bi-check-circle-fill', color: '#059669', bg: '#ecfdf5', trend: 'Granted' },
          { label: 'Assigned Trainings', n: myTrainings.length, icon: 'bi-mortarboard-fill', color: '#0284c7', bg: '#f0f9ff', trend: 'Active L&D' }
        ]);
      } else {
        const [uRes, lRes] = await Promise.all([
          api.get('/users'),
          api.get('/leaves')
        ]);
        const pendingCount = lRes.data.filter((x) => x.status === 'pending').length;

        setStats([
          { label: user.role === 'hr' ? 'Total Personnel' : 'Team Members', n: uRes.data.length, icon: 'bi-people-fill', color: '#0d9488', bg: '#f0fdfa', trend: 'Active Roster' },
          { label: 'Pending Approvals', n: pendingCount, icon: 'bi-hourglass-split', color: '#d97706', bg: '#fffbeb', trend: pendingCount > 0 ? 'Action Needed' : 'All Clear' },
          { label: 'Total Leave Requests', n: lRes.data.length, icon: 'bi-file-earmark-text-fill', color: '#0284c7', bg: '#f0f9ff', trend: 'All History' },
          { label: 'Active Programs', n: trainRes.data.length, icon: 'bi-mortarboard-fill', color: '#7c3aed', bg: '#f5f3ff', trend: 'Curriculum' }
        ]);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleQuickClock = async (action) => {
    setClockLoading(true);
    try {
      await api.post(`/attendance/${action}`);
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setClockLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      {/* Executive Welcome Hero */}
      <div className="executive-hero mb-4">
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', letterSpacing: '0.05em' }}>
                  <i className="bi bi-shield-check me-1"></i>
                  {user.role === 'hr' ? 'Executive HR Portal' : user.role === 'manager' ? 'Management Console' : 'Employee Workspace'}
                </span>
                {user.department && (
                  <span className="badge" style={{ background: 'rgba(45, 212, 191, 0.25)', color: '#2dd4bf' }}>
                    {user.department}
                  </span>
                )}
              </div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
                {getGreeting()}, {user.name} 👋
              </h2>
              <p className="text-white-50 mb-0 small">
                Today is {todayDateStr} • All organizational systems operational
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-25 px-3 py-2 rounded-3 border border-white border-opacity-10">
              <i className="bi bi-clock text-info fs-5"></i>
              <div className="d-flex flex-column">
                <span className="small text-white-50" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Live System Time</span>
                <span className="fw-bold text-white font-monospace">{currentTime}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-top border-white border-opacity-15 d-flex flex-wrap gap-2">
            <Link to="/leaves" className="btn btn-sm btn-light d-inline-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-calendar-plus text-primary"></i>
              <span>Request Leave</span>
            </Link>
            <Link to="/attendance" className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1">
              <i className="bi bi-clock-history"></i>
              <span>Log Attendance</span>
            </Link>
            {user.role !== 'employee' && (
              <>
                <Link to="/employees" className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1">
                  <i className="bi bi-person-lines-fill"></i>
                  <span>Staff Directory</span>
                </Link>
                <Link to="/announcements" className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1">
                  <i className="bi bi-megaphone"></i>
                  <span>Broadcast Notice</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="row g-3 mb-4">
        {stats.map(({ label, n, icon, color, bg, trend }) => (
          <div className="col-sm-6 col-lg-3" key={label} style={{ '--stat-accent': color }}>
            <div className="stat-card-modern h-100 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-label-modern">{label}</div>
                  <div className="stat-num-modern mt-1">{n}</div>
                </div>
                <div className="stat-icon-box" style={{ background: bg, color: color }}>
                  <i className={`bi ${icon}`}></i>
                </div>
              </div>
              <div className="mt-3 pt-2 border-top d-flex align-items-center justify-content-between small text-muted">
                <span className="fw-medium">{trend}</span>
                <i className="bi bi-arrow-up-right opacity-50"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Split */}
      <div className="row g-4">
        {/* Left Column: Announcements Bulletin */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="p-3 px-4 border-bottom d-flex justify-content-between align-items-center bg-white">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded p-1 text-primary bg-light">
                  <i className="bi bi-megaphone-fill fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0 text-dark">Official Bulletins & Company Updates</h5>
              </div>
              <Link to="/announcements" className="btn btn-sm btn-soft-primary">
                <span>View All</span>
                <i className="bi bi-chevron-right small"></i>
              </Link>
            </div>

            <div className="p-4">
              {news.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2 text-black-50"></i>
                  No company notices published yet.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {news.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-3 border"
                      style={{ background: '#f8fafc', transition: 'all 0.2s ease' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark">{item.title}</span>
                        <span className={`badge ${item.type === 'news' ? 'bg-primary' : 'bg-warning'} text-capitalize`}>
                          <i className={`bi ${item.type === 'news' ? 'bi-newspaper' : 'bi-bell-fill'} me-1`}></i>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-secondary mb-2 small" style={{ lineHeight: '1.6' }}>
                        {item.message}
                      </p>
                      <div className="d-flex align-items-center gap-3 text-muted small border-top pt-2" style={{ fontSize: '0.78rem' }}>
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {fmtDate(item.createdAt)}
                        </span>
                        <span>•</span>
                        <span>
                          <i className="bi bi-shield-check me-1 text-teal"></i>
                          HR Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Status & Quick Actions */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Quick Punch Clock Card */}
            <div className="card shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-primary"></i>
                  Today's Attendance Status
                </h6>
                <span className="status-indicator-dot"></span>
              </div>

              <div className="text-center p-3 mb-3 rounded-3" style={{ background: '#f1f5f9' }}>
                <div className="clock-display mb-1">{currentTime}</div>
                <div className="small text-muted">{todayDateStr}</div>
              </div>

              <div className="mb-3">
                {todayAttendance?.checkIn ? (
                  <div className="p-3 rounded-3 bg-light border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Clocked In:</span>
                      <span className="badge bg-success">{fmtTime(todayAttendance.checkIn)}</span>
                    </div>
                    {todayAttendance?.checkOut ? (
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Clocked Out:</span>
                        <span className="badge bg-secondary">{fmtTime(todayAttendance.checkOut)}</span>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Duration:</span>
                        <span className="fw-semibold text-primary">{calcWorkHours(todayAttendance.checkIn)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning py-2 small mb-3">
                    <i className="bi bi-info-circle me-1"></i> You haven't punched in for today yet.
                  </div>
                )}

                <div className="d-grid gap-2">
                  {!todayAttendance?.checkIn ? (
                    <button
                      className="btn btn-success py-2 d-flex align-items-center justify-content-center gap-2"
                      disabled={clockLoading}
                      onClick={() => handleQuickClock('checkin')}
                    >
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>Clock In Now</span>
                    </button>
                  ) : !todayAttendance?.checkOut ? (
                    <button
                      className="btn btn-outline-danger py-2 d-flex align-items-center justify-content-center gap-2"
                      disabled={clockLoading}
                      onClick={() => handleQuickClock('checkout')}
                    >
                      <i className="bi bi-box-arrow-left"></i>
                      <span>Clock Out</span>
                    </button>
                  ) : (
                    <div className="text-center text-muted small py-1">
                      <i className="bi bi-check2-all text-success me-1"></i> Attendance logged for today
                    </div>
                  )}
                </div>
              </div>

              <Link to="/attendance" className="btn btn-sm btn-link text-decoration-none text-muted p-0 text-center">
                View Full Attendance History →
              </Link>
            </div>

            {/* Quick Resources Guide */}
            <div className="card shadow-sm p-4">
              <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-journal-bookmark text-primary"></i>
                Portal Resources & Guidelines
              </h6>
              <div className="d-flex flex-column gap-2 small">
                <div className="p-2 rounded bg-light d-flex align-items-center justify-content-between">
                  <span>Standard Shift:</span>
                  <span className="fw-semibold text-dark">09:00 AM – 06:00 PM</span>
                </div>
                <div className="p-2 rounded bg-light d-flex align-items-center justify-content-between">
                  <span>Annual Leave Quota:</span>
                  <span className="fw-semibold text-dark">18 Days / Year</span>
                </div>
                <div className="p-2 rounded bg-light d-flex align-items-center justify-content-between">
                  <span>Approval Policy:</span>
                  <span className="fw-semibold text-dark">Manager / HR Sign-off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
