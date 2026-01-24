import { z } from "zod";

// 1. Validator for Submitting a Reply
const submitReplySchema = z.object({
    reply: z.string().trim().min(1, "Reply text cannot be empty"),
});

// 2. Validator for IDs (used for fetching and submitting)
const solutionIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Solution ID format"),
});

export { submitReplySchema, solutionIdSchema };