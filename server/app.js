import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from "compression";
import { config } from 'dotenv';

// --- IMPORT MIDDLEWARE ---

import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/Error.Middleware.js"; // Ensure you have this!
// ⚠️ Ensure filenames match exactly what you have in your folder

import { authLimiter, apiLimiter } from './middlewares/RateLimit.Middleware.js';
import { verifyJwt } from './middlewares/Auth.Middleware.js';
import { validate } from './middlewares/Validate.Middleware.js';

// --- IMPORT VALIDATION SCHEMAS ---
import { aiRequestSchema } from './validation/Ai.Validation.js';
import { compileSchema } from './validation/Compiler.Validation.js';

// --- IMPORT ROUTES & CONTROLLERS ---
import AuthRoutes from './routes/Auth.Routes.js';
import ProblemRoutes from './routes/Problem.Routes.js';
import HistoryRoutes from './routes/History.Routes.js';
import SolutionRoutes from './routes/Solution.Routes.js';
import ReplyRoutes from './routes/Reply.Routes.js';
import AiInteractionRoutes from './routes/AiInteraction.Routes.js';
import getDashboardStats from './controllers/Stats.Controller.js';
import CompileCode from './controllers/Compiler.Controller.js';
import processAIRequest from './controllers/Ai.Controller.js';

// 1. Initialize Config (Do this early)
config();

const app = express();

// ==========================================
// 🟢 SECTION 1: GLOBAL MIDDLEWARE (ORDER MATTERS)
// ==========================================
app.use(requestLogger);

const csrfProtection = (req, res, next) => {
  // 1. Allow GET/HEAD/OPTIONS (Read-only requests are usually safe)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 2. Verify the Origin header
  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL; // e.g., 'http://localhost:5173'

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "CSRF Blocked: Request origin mismatch."
    });
  }

  next();
};

// 2. Security Headers (Helmet)
// app.use(csrfProtection);
app.use(helmet());

// 3. Compression (Gzip/Brotli)
app.use(compression());

// 4. CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Ensure this is set in .env
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Add this helper middleware

app.use(cors(corsOptions));

// 5. Body Parsers (JSON, URL, Cookies)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());


// ==========================================
// 🟡 SECTION 2: ROUTES
// ==========================================

// Public / Auth Routes
app.use(
  "/api/v1/auth", authLimiter, AuthRoutes);
// Protected Routes
app.get("/api/v1/stats", verifyJwt, getDashboardStats);

// Feature Routes
app.use("/api/v1/problem", ProblemRoutes);
app.use("/api/v1/solution", SolutionRoutes);
app.use("/api/v1/reply", ReplyRoutes);
app.use("/api/v1/history", HistoryRoutes);
app.use("/api/v1/aiInteractions", AiInteractionRoutes);

// Special Feature Routes (Direct Controllers)
// 💡 Tip: In the future, move these into 'Ai.Routes.js' and 'Compiler.Routes.js'
app.post(
  "/api/v1/compile",
  apiLimiter,
  verifyJwt,
  validate(compileSchema, "body"),
  CompileCode
);

app.post(
  "/api/v1/ai",
  apiLimiter,
  verifyJwt,
  validate(aiRequestSchema, "body"),
  processAIRequest
);

app.get("/",(req,res)=>{res.send("Welcome to code crackr backend")});

app.use(errorHandler);
export default app;
