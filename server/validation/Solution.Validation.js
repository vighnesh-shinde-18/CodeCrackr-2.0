import { z } from "zod";

// 1. Validator for Route Params (Mongo ID)
// We can reuse this for both ProblemID and SolutionID validation
 const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

// 2. Validator for Submitting a Solution (Body)
 const submitSolutionSchema = z.object({
  code: z.string().min(1, "Code cannot be empty"),
  explanation: z.string().min(10, "Explanation is too short").trim(),
  language: z.string().min(1, "Language is required"),
});

// 3. Validator for Fetching Solutions (Query Filters)
 const solutionFilterSchema = z.object({
  accepted: z.enum(["true", "false"]).optional(),     // Validates ?accepted=true
  submittedByMe: z.enum(["true", "false"]).optional() // Validates ?submittedByMe=true
});

export {idParamSchema, submitSolutionSchema, solutionFilterSchema}