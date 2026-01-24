import winston from "winston";

// Destructure format methods
const { combine, timestamp, printf, colorize, errors } = winston.format;

// 1. Define how the log looks
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// 2. Create the Logger
const logger = winston.createLogger({
  level: "info", // "info" captures everything (info, warn, error)
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Catch error stack traces
    logFormat
  ),
  transports: [
    // A. Console: Show logs in terminal (colored)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    
    // B. File: Save CRITICAL errors to a separate file
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error" 
    }),

    // C. File: Save EVERYTHING to a combined file
    new winston.transports.File({ 
      filename: "logs/combined.log" 
    }),
  ],
});

export default logger;