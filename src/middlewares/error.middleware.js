const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "An internal server error ",
    errors: err.errors || [],
  });
  next();
};

export default errorMiddleware;
