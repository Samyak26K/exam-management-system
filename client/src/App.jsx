import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <main className="center-message">Loading...</main>;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <main className="landing-page"><section className="landing-panel"><p className="eyebrow">B1 Software Engineering Assessment</p><h1>Exam Management System</h1><p className="intro">A clear place for students and administrators to manage exam timetables.</p><div className="landing-actions"><Link className="button button-primary" to="/student/login">Student login</Link><Link className="button button-secondary" to="/admin/login">Admin login</Link></div><p className="landing-links"><Link to="/student/register">Create student account</Link> <Link to="/admin/register">Provision admin account</Link></p></section></main>;
}

export default function App() {
  return <AuthProvider><Routes><Route path="/" element={<Home />} /><Route path="/student/login" element={<AuthPage role="student" mode="login" />} /><Route path="/student/register" element={<AuthPage role="student" mode="register" />} /><Route path="/admin/login" element={<AuthPage role="admin" mode="login" />} /><Route path="/admin/register" element={<AuthPage role="admin" mode="register" />} /><Route element={<ProtectedRoute role="admin" />}><Route path="/admin/dashboard" element={<DashboardPage role="admin" />} /></Route><Route element={<ProtectedRoute role="student" />}><Route path="/student/dashboard" element={<DashboardPage role="student" />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider>;
}
