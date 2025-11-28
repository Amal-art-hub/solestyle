// backend/middleware/errorMiddleware.js

// 1. Handles Express route not found (404)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// 2. The main error handler (catches errors thrown by asyncHandler)
const errorHandler = (err, req, res, next) => {
    // Determine the correct status code (default to 500 if the status is 200)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Send a JSON response for all API errors
    res.json({
        message: err.message,
        // Only send the stack trace in development mode for debugging
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };