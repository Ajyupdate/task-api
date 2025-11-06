function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Not Found', statusCode: 404 });
}

// Standardized error response format
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error',
    statusCode,
  };
  if (err.details) {
    response.details = err.details;
  }
  // eslint-disable-next-line no-console
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json(response);
}

module.exports = { errorHandler, notFoundHandler };

