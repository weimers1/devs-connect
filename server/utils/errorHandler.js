const errorHandler = (err, req, res, next) => {
    // Validate error object and request/response to prevent crashes
    if (!err) {
        err = new Error('Unknown error occurred');
    }
    
    if (!res || res.headersSent) {
        console.error('Cannot send response - headers already sent');
        return;
    }

    try {
        console.error('Error occurred:', {
            message: err.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            status: err.status || 500,
            url: req?.originalUrl || 'unknown',
            method: req?.method || 'unknown',
            timestamp: new Date().toISOString()
        });

        // Don't expose internal error details in production
        const isDevelopment = process.env.NODE_ENV === 'development';

        res.status(err.status || 500).json({
            error: isDevelopment
                ? err.message || 'Internal Server Error'
                : 'Internal Server Error',
        });
    } catch (loggingError) {
        console.error('Error in error handler:', loggingError.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default errorHandler;
