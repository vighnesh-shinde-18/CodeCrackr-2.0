import { z } from "zod";

const createProblemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description too short"),
  topics: z.array(z.string()).min(1, "At least one topic required"),
  testCases: z.array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1)
    })
  ).min(1, "At least one test case required")
});

const fetchUserProblemSchema = z.object({
  topic: z.string().trim().optional(), // Optional, but if present, must be a string
  search: z.string().optional()
});

const problemIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Problem ID format"),
});

export { createProblemSchema, fetchUserProblemSchema, problemIdSchema }

