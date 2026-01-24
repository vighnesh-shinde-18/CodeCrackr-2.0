import { z } from "zod";

// List of supported languages matches your controller's map
const supportedLanguages = [
  "c-gcc-14", "cpp-gcc-14", "csharp", "java-17", "go-1.23", 
  "javascript-22", "php-8", "python-3.13", "ruby", "rust-1.85", 
  "sql", "swift", "typescript-5.6"
];

 const compileSchema = z.object({
  language: z.enum(supportedLanguages, {
    errorMap: () => ({ message: "Invalid or unsupported language selected" })
  }),
  sourceCode: z.string().min(1, "Source code is required"),
  input: z.string().optional(), // Input is optional
});

export {compileSchema}