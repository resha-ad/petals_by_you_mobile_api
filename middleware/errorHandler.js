const errorHandler = (err, req, res, next) => {
    console.error(err.stack.red);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((val) => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorHandler;