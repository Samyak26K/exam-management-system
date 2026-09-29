import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

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
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? 'Hide' : 'Show'}
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
      <section className="auth-card">
        <Link className="back-link" to="/">Exam Management System</Link>
        <p className="eyebrow">{isAdmin ? 'Administrator' : 'Student'} portal</p>
        <h1>{isRegister ? `Create ${isAdmin ? 'admin' : 'student'} account` : `${isAdmin ? 'Admin' : 'Student'} login`}</h1>
        {location.state?.message && <p className="success-message">{location.state.message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={submit} className="form-stack">
          {isRegister && <label>Full name<input name="name" value={form.name} onChange={update} required /></label>}
          <label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label>
          <PasswordField label="Password" name="password" value={form.password} minLength="8" onChange={update} required />
          {isRegister && !isAdmin && <>
            <label>Academic year<input name="academicYear" placeholder="e.g. Year 2" value={form.academicYear} onChange={update} required /></label>
            <label>Section<input name="section" placeholder="e.g. A" value={form.section} onChange={update} required /></label>
          </>}
          {isRegister && isAdmin && <PasswordField label="Admin provisioning key" name="setupKey" value={form.setupKey} onChange={update} required />}
          <button className="button button-primary" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="form-footer">{isRegister ? 'Already have an account?' : 'Need an account?'} <Link to={alternatePath}>{isRegister ? 'Log in' : 'Register'}</Link></p>
      </section>
    </main>
  );
}
