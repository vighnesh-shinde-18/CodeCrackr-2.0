import logger from "../utils/logger.js"; 

export const errorHandler = (err, req, res, next) => {
    // This line writes the error to "logs/error.log"
    logger.error(err.message, { stack: err.stack }); 

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Server Error"
    });
};