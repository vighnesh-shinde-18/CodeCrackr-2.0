import { z } from "zod";
import ApiError from "../utils/ApiError.js";

export const validate = (schema, source = "body") => (req, res, next) => {
  try {
    // 1. Parse the data 
    const data = schema.parse(req[source]);

    Object.assign(req[source], data);
    next();
  } catch (error) {
    // 2. Check if it's a Zod Error 
    if (error instanceof z.ZodError) {
      // 3. Extract the specific messages (e.g., "Invalid email address")
      // If multiple fields fail, this joins them: "Invalid email, Password too short"

      const errorMessage = error.issues.map((e) => e.message).join(", ");
      // 4. Throw ApiError with the SPECIFIC message
      throw new ApiError(400, errorMessage, error.errors);
    }

    // Fallback for non-Zod errors
    next(error);
  }
};