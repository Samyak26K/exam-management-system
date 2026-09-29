import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

function EyeIcon({ hidden }) {
  return hidden ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4 9.7 7a12.7 12.7 0 0 1-3.1 4.3M6.2 6.2C3.9 7.7 2.6 10 2.3 12c.7 1.8 2.2 3.9 4.7 5.4A10.8 10.8 0 0 0 12 19c1.1 0 2.1-.2 3-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.3 12C3.5 9 7 5 12 5s8.5 4 9.7 7c-1.2 3-4.7 7-9.7 7s-8.5-4-9.7-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

function ArrowLeftIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }

function PasswordField({ name, label, value, onChange, minLength, required = false }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <label htmlFor={`password-${name}`}>{label}</label>
      <span className="password-input">
        <input
          id={`password-${name}`}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          minLength={minLength}
          onChange={onChange}
          required={required}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setVisible((current) => !current)}
        >
          <EyeIcon hidden={visible} />
        </button>
      </span>
    </div>
  );
}

export default function AuthPage({ role, mode }) {
  const isAdmin = role === 'admin';
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '', academicYear: '', section: '', setupKey: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) {
        const register = isAdmin ? api.registerAdmin : api.registerStudent;
        await register(form);
        navigate(`/${role}/login`, { state: { message: 'Account created. You can now log in.' } });
      } else {
        await login({ email: form.email, password: form.password, role });
        navigate(`/${role}/dashboard`);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  const alternatePath = isRegister ? `/${role}/login` : `/${role}/register`;
  return (
    <main className="auth-page">
      <div className="auth-layout">
        <aside className="auth-brand-panel"><Link className="auth-logo" to="/"><span className="brand-mark">EF</span><span>ExamFlow</span></Link><div className="auth-brand-copy"><span className="brand-kicker">Campus examination portal</span><h1>{isAdmin ? 'Keep every exam day moving.' : 'Know exactly where you need to be.'}</h1><p>{isAdmin ? 'Coordinate rooms, schedules, and capacity from one dependable workspace.' : 'Your schedule, rooms, and exam details in one calm, focused place.'}</p></div><div className="auth-brand-footer"><span className="status-dot" /> Secure role-based access</div></aside>
        <section className="auth-card">
          <Link className="back-link" to="/"><ArrowLeftIcon /> <span>Back to home</span></Link>
          <div className="auth-heading"><p className="eyebrow">{isAdmin ? 'Administrator' : 'Student'} portal</p><h2>{isRegister ? `Create ${isAdmin ? 'admin' : 'student'} account` : `${isAdmin ? 'Admin' : 'Student'} login`}</h2><p>{isRegister ? isAdmin ? 'Use your authorized provisioning key to get started.' : 'Create your student account to view your cohort schedule.' : 'Sign in to continue to your ExamFlow workspace.'}</p></div>
          {location.state?.message && <p className="success-message">{location.state.message}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          <form onSubmit={submit} className="form-stack">
            {isRegister && <label>Full name<input name="name" value={form.name} onChange={update} required /></label>}
            <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
            <PasswordField label="Password" name="password" value={form.password} minLength="8" onChange={update} required />
            {isRegister && !isAdmin && <><label>Academic year<input name="academicYear" placeholder="e.g. Year 2" value={form.academicYear} onChange={update} required /></label><label>Section<input name="section" placeholder="e.g. A" value={form.section} onChange={update} required /></label></>}
            {isRegister && isAdmin && <PasswordField label="Admin provisioning key" name="setupKey" value={form.setupKey} onChange={update} required />}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}</button>
          </form>
          <p className="form-footer">{isRegister ? 'Already have an account?' : 'Need an account?'} <Link to={alternatePath}>{isRegister ? 'Log in' : 'Register'}</Link></p>
        </section>
      </div>
    </main>
  );
}
