import { z } from "zod";

// 1. Validator for generating AI content
const aiRequestSchema = z.object({
  FeatureType: z.string().min(1, "Feature Type is required"), // You could use z.enum(['Summarize', 'ConvertCode', etc]) if keys are fixed
  UserInput: z.string().min(1, "User Input cannot be empty"),
  TargetLanguage: z.string().optional(), // Only needed for code conversion
});

 

// 3. Validator for AI Interaction IDs (Params)
const aiIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Interaction ID format"),
});

export {aiIdSchema,aiRequestSchema}