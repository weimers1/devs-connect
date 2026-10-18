const errorHandler = (err, req, res, next) => {
    if (!err) {
        err = new Error('Unknown error occurred');
    }

    if (!res || res.headersSent) {
        console.error('Cannot send response - headers already sent');
        return;
    }

    try {
        const isDevelopment = process.env.NODE_ENV === 'development';
        console.error('Error occurred:', {
            name: err.name || 'Error',
            code: err.code || err.original?.code,
            message: isDevelopment ? err.message || 'Unknown error' : undefined,
            stack: isDevelopment ? err.stack : undefined,
            status: err.status || 500,
            url: req?.path || 'unknown',
            method: req?.method || 'unknown',
            timestamp: new Date().toISOString(),
        });

        res.status(err.status || 500).json({
            error: isDevelopment
                ? err.message || 'Internal Server Error'
                : 'Internal Server Error',
        });
    } catch (loggingError) {
        console.error('Error in error handler:', loggingError.name || 'Error');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default errorHandler;
