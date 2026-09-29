async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  registerStudent: (body) => request('/api/auth/student/register', { method: 'POST', body: JSON.stringify(body) }),
  registerAdmin: (body) => request('/api/auth/admin/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  getExams: () => request('/api/exams'),
  createExam: (body) => request('/api/exams', { method: 'POST', body: JSON.stringify(body) }),
  updateExam: (id, body) => request(`/api/exams/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExam: (id) => request(`/api/exams/${id}`, { method: 'DELETE' })
};
