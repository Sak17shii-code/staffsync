import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leaves from './pages/Leaves';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import Trainings from './pages/Trainings';
import Profile from './pages/Profile';

function Guard({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-teal mb-3" style={{ width: '3rem', height: '3rem', color: '#0d9488' }} role="status"></div>
        <div className="text-muted fw-semibold small">Initializing StaffSync Workspace...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {user && <Navbar />}
      <main className="main-content">
        <div className={user ? "container py-4 px-md-4" : ""}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/" element={<Guard><Dashboard /></Guard>} />
            <Route path="/employees" element={<Guard roles={['hr', 'manager']}><Employees /></Guard>} />
            <Route path="/leaves" element={<Guard><Leaves /></Guard>} />
            <Route path="/attendance" element={<Guard><Attendance /></Guard>} />
            <Route path="/announcements" element={<Guard><Announcements /></Guard>} />
            <Route path="/trainings" element={<Guard><Trainings /></Guard>} />
            <Route path="/profile" element={<Guard><Profile /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {user && (
        <footer className="py-3 text-center text-muted border-top bg-white small mt-auto">
          <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span>
              <strong>StaffSync</strong> — Modern Human Resource Management Solution
            </span>
            <span className="text-secondary opacity-75">
              Built with MERN Stack • Role-Based Security • Real-Time Attendance Telemetry
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
