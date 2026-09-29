import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import AppShell from '../components/AppShell.jsx';

const emptyExam = { subjectName: '', subjectCode: '', academicYear: '', section: '', examDate: '', startTime: '', endTime: '', venue: '', roomId: '' };
const emptyRoom = { name: '', capacity: '' };

function ExamForm({ initial, rooms, onSaved, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial, roomId: initial.room?._id || initial.room || '' } : emptyExam);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(initial ? { ...initial, roomId: initial.room?._id || initial.room || '' } : emptyExam); setError(''); }, [initial]);
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const result = initial ? await api.updateExam(initial._id, form) : await api.createExam(form); onSaved(result.exam); setForm(emptyExam); }
    catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  }
  return <form className="exam-form" onSubmit={submit}>
    <div className="form-heading"><div><p className="eyebrow">{initial ? 'Update schedule' : 'New schedule'}</p><h2>{initial ? 'Edit exam' : 'Add an exam'}</h2></div>{initial && <button type="button" className="text-button" onClick={onCancel}>Cancel</button>}</div>
    {error && <p className="error-message">{error}</p>}
    {!rooms.length && <p className="info-message">Create a room before scheduling an exam.</p>}
    <div className="form-grid">
      <label>Subject name<input name="subjectName" value={form.subjectName} onChange={update} required /></label>
      <label>Subject code<input name="subjectCode" value={form.subjectCode} onChange={update} required /></label>
      <label>Academic year<input name="academicYear" value={form.academicYear} onChange={update} required /></label>
      <label>Section<input name="section" value={form.section} onChange={update} required /></label>
      <label>Exam date<input type="date" name="examDate" value={form.examDate} onChange={update} required /></label>
      <label>Start time<input type="time" name="startTime" value={form.startTime} onChange={update} required /></label>
      <label>End time<input type="time" name="endTime" value={form.endTime} onChange={update} required /></label>
      <label>Venue details<input name="venue" value={form.venue} onChange={update} placeholder="Building or campus details" required /></label>
      <label className="full-width">Assigned room<select name="roomId" value={form.roomId} onChange={update} required><option value="">Select a room</option>{rooms.map((room) => <option key={room._id} value={room._id}>{room.name} · capacity {room.capacity}</option>)}</select></label>
    </div>
    <button className="button button-primary" disabled={busy || !rooms.length}>{busy ? 'Saving...' : initial ? 'Save changes' : 'Add exam'}</button>
  </form>;
}

function RoomForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || emptyRoom); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(initial || emptyRoom); setError(''); }, [initial]);
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) { event.preventDefault(); setError(''); setBusy(true); try { const result = initial ? await api.updateRoom(initial._id, { ...form, capacity: Number(form.capacity) }) : await api.createRoom({ ...form, capacity: Number(form.capacity) }); onSaved(result.room); setForm(emptyRoom); } catch (requestError) { setError(requestError.message); } finally { setBusy(false); } }
  return <form className="room-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">Room inventory</p><h2>{initial ? 'Edit room' : 'Add a room'}</h2></div>{initial && <button type="button" className="text-button" onClick={onCancel}>Cancel</button>}</div>{error && <p className="error-message">{error}</p>}<div className="room-form-grid"><label>Room name<input name="name" value={form.name} onChange={update} placeholder="e.g. Main Hall" required /></label><label>Seating capacity<input type="number" min="1" step="1" name="capacity" value={form.capacity} onChange={update} required /></label></div><button className="button button-primary" disabled={busy}>{busy ? 'Saving...' : initial ? 'Save room' : 'Add room'}</button></form>;
}

function ExamTable({ exams, admin, onEdit, onDelete }) {
  if (!exams.length) return <div className="empty-state"><span className="empty-mark">—</span><h2>No exams scheduled</h2><p>{admin ? 'Add the first timetable entry after creating a room.' : 'There are no exams for your academic year and section yet.'}</p></div>;
  return <div className="table-wrap"><table><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th>Venue</th>{admin && <th>Actions</th>}</tr></thead><tbody>{exams.map((exam) => <tr key={exam._id}><td><strong>{exam.subjectName}</strong><small>{exam.subjectCode} · {exam.academicYear} · Section {exam.section}</small></td><td>{exam.examDate}</td><td>{exam.startTime}–{exam.endTime}</td><td><strong>{exam.room?.name || 'Unassigned'}</strong><small>{exam.room ? `${exam.room.capacity} seats` : 'Room unavailable'}</small></td><td>{exam.venue}</td>{admin && <td><div className="row-actions"><button className="table-button" onClick={() => onEdit(exam)}>Edit</button><button className="table-button danger-button" onClick={() => onDelete(exam._id)}>Delete</button></div></td>}</tr>)}</tbody></table></div>;
}

function RoomTable({ rooms, exams, onEdit, onDelete }) {
  if (!rooms.length) return <div className="empty-state compact"><h2>No rooms yet</h2><p>Add rooms to make exam scheduling available.</p></div>;
  return <div className="room-list">{rooms.map((room) => { const assigned = exams.filter((exam) => exam.room?._id === room._id).length; return <article className="room-card" key={room._id}><div><strong>{room.name}</strong><span>{room.capacity} seats</span></div><div className="room-card-meta"><span>{assigned} scheduled {assigned === 1 ? 'exam' : 'exams'}</span><div className="row-actions"><button className="table-button" onClick={() => onEdit(room)}>Edit</button><button className="table-button danger-button" onClick={() => onDelete(room._id)}>Delete</button></div></div></article>; })}</div>;
}

function SummaryCard({ label, value, detail }) { return <article className="summary-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function LoadingState({ admin }) { return <div className="loading-state" aria-label="Loading dashboard"><div className="loading-line wide" /><div className="loading-line" /><div className="loading-grid">{Array.from({ length: admin ? 4 : 3 }, (_, index) => <div className="loading-card" key={index} />)}</div></div>; }

export default function DashboardPage({ role }) {
  const { user } = useAuth(); const admin = role === 'admin';
  const [exams, setExams] = useState([]); const [rooms, setRooms] = useState([]); const [editingExam, setEditingExam] = useState(null); const [editingRoom, setEditingRoom] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [requestVersion, setRequestVersion] = useState(0);
  const studentName = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : 'Student';
  const academicYear = typeof user?.academicYear === 'string' && user.academicYear.trim() ? user.academicYear.trim() : 'your academic year';
  const section = typeof user?.section === 'string' && user.section.trim() ? user.section.trim() : 'your section';
  useEffect(() => { setLoading(true); setError(''); Promise.all([api.getExams(), ...(admin ? [api.getRooms()] : [])]).then(([examData, roomData]) => { setExams(examData.exams); if (roomData) setRooms(roomData.rooms); }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); }, [admin, requestVersion]);
  async function removeExam(id) { if (!window.confirm('Delete this exam?')) return; try { await api.deleteExam(id); setExams((current) => current.filter((exam) => exam._id !== id)); } catch (requestError) { setError(requestError.message); } }
  async function removeRoom(id) { if (!window.confirm('Delete this room?')) return; try { await api.deleteRoom(id); setRooms((current) => current.filter((room) => room._id !== id)); } catch (requestError) { setError(requestError.message); } }
  function savedExam(exam) { setExams((current) => editingExam ? current.map((item) => item._id === exam._id ? exam : item) : [...current, exam]); setEditingExam(null); }
  function savedRoom(room) { setRooms((current) => editingRoom ? current.map((item) => item._id === room._id ? room : item) : [...current, room]); setEditingRoom(null); }
  const assignedRooms = new Set(exams.map((exam) => exam.room?._id).filter(Boolean)).size;
  return <AppShell role={role}><main className="dashboard-page"><header className="dashboard-header"><div className="brand-block"><span className="brand-kicker">{admin ? 'Examination portal' : 'STUDENT DASHBOARD'}</span><h1>{admin ? 'Admin workspace' : `Welcome back, ${studentName}!`}</h1><p>{admin ? `Welcome back, ${studentName}. Keep every room and schedule in sync.` : `Here is your exam schedule for ${academicYear}, Section ${section}.`}</p></div></header><section className="dashboard-content">{error && <div className="error-message"><span>{error}</span><button className="text-button" type="button" onClick={() => setRequestVersion((current) => current + 1)}>Try again</button></div>}{loading ? <LoadingState admin={admin} /> : <>{admin && <div className="summary-grid"><SummaryCard label="Scheduled exams" value={exams.length} detail="Across all cohorts" /><SummaryCard label="Available rooms" value={rooms.length} detail="Managed inventory" /><SummaryCard label="Rooms in use" value={assignedRooms} detail={rooms.length ? `${Math.round((assignedRooms / rooms.length) * 100)}% utilization` : 'No rooms created'} /></div>}<div className={`dashboard-grid ${admin ? 'admin-dashboard-grid' : 'student-dashboard-grid'}`}>{admin && <div className="dashboard-column"><ExamForm initial={editingExam} rooms={rooms} onSaved={savedExam} onCancel={() => setEditingExam(null)} /><RoomForm initial={editingRoom} onSaved={savedRoom} onCancel={() => setEditingRoom(null)} /></div>}<section className="schedule-section" id="exams"><div className="section-heading"><div><p className="eyebrow">{admin ? 'Master schedule' : 'Upcoming schedule'}</p><h2>{admin ? 'Exam timetable' : 'Your exams'}</h2></div><span>{exams.length} scheduled</span></div><ExamTable exams={exams} admin={admin} onEdit={setEditingExam} onDelete={removeExam} /></section>{admin && <section className="rooms-section" id="rooms"><div className="section-heading"><div><p className="eyebrow">Capacity planning</p><h2>Room inventory</h2></div><span>{rooms.length} rooms</span></div><RoomTable rooms={rooms} exams={exams} onEdit={setEditingRoom} onDelete={removeRoom} /></section>}</div></>}</section></main></AppShell>;
}
