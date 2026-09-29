import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const emptyExam = { subjectName: '', subjectCode: '', academicYear: '', section: '', examDate: '', startTime: '', endTime: '', venue: '' };

function ExamForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || emptyExam);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(initial || emptyExam); setError(''); }, [initial]);
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const result = initial ? await api.updateExam(initial._id, form) : await api.createExam(form); onSaved(result.exam); setForm(emptyExam); }
    catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  }
  return <form className="exam-form" onSubmit={submit}>
    <h2>{initial ? 'Edit exam' : 'Add an exam'}</h2>
    {error && <p className="error-message">{error}</p>}
    <div className="form-grid">
      <label>Subject name<input name="subjectName" value={form.subjectName} onChange={update} required /></label>
      <label>Subject code<input name="subjectCode" value={form.subjectCode} onChange={update} required /></label>
      <label>Academic year<input name="academicYear" value={form.academicYear} onChange={update} required /></label>
      <label>Section<input name="section" value={form.section} onChange={update} required /></label>
      <label>Exam date<input type="date" name="examDate" value={form.examDate} onChange={update} required /></label>
      <label>Start time<input type="time" name="startTime" value={form.startTime} onChange={update} required /></label>
      <label>End time<input type="time" name="endTime" value={form.endTime} onChange={update} required /></label>
      <label>Venue<input name="venue" value={form.venue} onChange={update} required /></label>
    </div>
    <div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Saving...' : initial ? 'Save changes' : 'Add exam'}</button>{initial && <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>}</div>
  </form>;
}

function ExamList({ exams, admin, onEdit, onDelete }) {
  if (!exams.length) return <div className="empty-state"><h2>No exams scheduled</h2><p>{admin ? 'Add the first exam timetable entry above.' : 'There are no exams scheduled for your academic year and section yet.'}</p></div>;
  return <div className="exam-list">{exams.map((exam) => <article className="exam-row" key={exam._id}><div><strong>{exam.subjectName}</strong><span>{exam.subjectCode} · {exam.academicYear} · Section {exam.section}</span></div><div><span>{exam.examDate} · {exam.startTime}–{exam.endTime}</span><span>{exam.venue}</span></div>{admin && <div className="row-actions"><button onClick={() => onEdit(exam)}>Edit</button><button onClick={() => onDelete(exam._id)}>Delete</button></div>}</article>)}</div>;
}

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]); const [editing, setEditing] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const admin = role === 'admin';
  useEffect(() => { api.getExams().then(({ exams: loaded }) => setExams(loaded)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); }, []);
  async function remove(id) { if (!window.confirm('Delete this exam?')) return; try { await api.deleteExam(id); setExams(exams.filter((exam) => exam._id !== id)); } catch (requestError) { setError(requestError.message); } }
  function savedExam(exam) { setExams((current) => editing ? current.map((item) => item._id === exam._id ? exam : item) : [...current, exam]); setEditing(null); }
  async function signOut() { await logout(); }
  return <main className="dashboard-page"><header className="dashboard-header"><div><p className="eyebrow">{admin ? 'Administrator dashboard' : 'Student dashboard'}</p><h1>Good day, {user.name}</h1><p>{admin ? 'Manage the examination timetable.' : `Showing exams for ${user.academicYear}, Section ${user.section}.`}</p></div><button className="button button-secondary" onClick={signOut}>Log out</button></header><section className="dashboard-content">{error && <p className="error-message">{error}</p>}{admin && <ExamForm initial={editing} onSaved={savedExam} onCancel={() => setEditing(null)} />}{loading ? <p className="center-message">Loading exams...</p> : <><div className="section-heading"><h2>{admin ? 'Exam timetable' : 'Your exams'}</h2><span>{exams.length} scheduled</span></div><ExamList exams={exams} admin={admin} onEdit={setEditing} onDelete={remove} /></>}</section></main>;
}
