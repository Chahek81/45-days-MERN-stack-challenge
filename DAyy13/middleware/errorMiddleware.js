// Filename: middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = `Resource not found with ID of ${err.value}`;
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
    });
};

module.exports = errorHandler;