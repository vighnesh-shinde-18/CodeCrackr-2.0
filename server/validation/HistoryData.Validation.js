import { z } from "zod";

// 1. Validator for User Solved Problems Filter
 const solvedProblemsSchema = z.object({
  topic: z.string().optional(),
  accepted: z.boolean().optional().or(z.string().optional()) // Handle boolean or "All" string
});

// 2. Validator for AI Interactions Filter
 const aiInteractionFilterSchema = z.object({
  feature: z.string().optional()
});

export{solvedProblemsSchema,aiInteractionFilterSchema}