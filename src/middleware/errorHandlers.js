function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
