function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  const response = {
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && status === 500) {
    response.debug = err.message;
  }

  res.status(status).json(response);
}

export { notFoundHandler, errorHandler };
