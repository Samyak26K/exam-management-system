export function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error.code === 11000) return response.status(409).json({ message: 'An account with this email already exists' });
  if (process.env.NODE_ENV === 'production') return response.status(error.status || 500).json({ message: 'Unexpected server error' });
  response.status(error.status || 500).json({ message: error.message || 'Unexpected server error' });
}
