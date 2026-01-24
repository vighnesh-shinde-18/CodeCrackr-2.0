import morgan from "morgan";
import logger from "../utils/logger.js";

// Create a stream object that Morgan will write to
const stream = {
  // Use the 'info' level so these show up in standard logs
  write: (message) => logger.info(message.trim()),
};

// Configure Morgan to use our custom stream
// "remote-addr" = user IP, "status" = 200/404, "response-time" = speed
export const requestLogger = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  { stream }
);