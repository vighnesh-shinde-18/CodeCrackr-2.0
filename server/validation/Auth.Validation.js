import { z } from "zod";

// 1. Register Schema
 const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").trim(),
  email: z.email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"), 
});

// 2. Login Schema
 const loginSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z.string().min(1, "Password is required"),
});

// 3. Forgot Password / Send OTP Schema
 const sendOtpSchema = z.object({
  email: z.email("Invalid email address").trim(),
});

// 4. Reset Password Schema
 const resetPasswordSchema = z.object({
  email: z.email("Invalid email address").trim(),
  otp: z.string().length(6, "OTP must be 6 digits"), // Assuming 6 digit OTP
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export {registerSchema,loginSchema,sendOtpSchema,resetPasswordSchema}