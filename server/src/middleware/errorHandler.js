export function errorHandler(error, _request, response, _next) {
  console.error(error);
  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    return response.status(409).json({ message: duplicateField === 'name' ? 'A room with this name already exists' : 'An account with this email already exists' });
  }
  if (process.env.NODE_ENV === 'production') return response.status(error.status || 500).json({ message: 'Unexpected server error' });
  response.status(error.status || 500).json({ message: error.message || 'Unexpected server error' });
}
