import express, { response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

// 1. Security Headers (Helmet)
// Helps secure your app by setting various HTTP headers
app.use(helmet())

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))

// 2. Rate Limiting
// Limits repeated requests to public APIs and/or endpoints
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes"
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

import {verifyJwt} from './middlewares/Auth.Middleware.js';
import AuthRoutes from './routes/Auth.Routes.js'
import ProblemRoutes from './routes/Problem.Routes.js'
import getDashboardStats from './controllers/Stats.Controllers.js';
import CompileCode from './controllers/Compiler.Controllers.js';
import processAIRequest from './controllers/Ai.Controllers.js';
import HistoryRoutes from './routes/History.Routes.js'
import SolutionRoutes from './routes/Solution.Routes.js'
import ReplyRoutes from './routes/Reply.Routes.js'
import AiInteractionRoutes from './routes/AiInteraction.Routes.js'

app.get("/test", (req, res) => {res.json({data: "working"})})

app.use("/api/v1/auth", AuthRoutes)
app.use("/api/v1/problem", ProblemRoutes)
app.use("/api/v1/history", HistoryRoutes)
app.get("/api/v1/stats", verifyJwt, getDashboardStats)
app.post("/api/v1/compile", verifyJwt, CompileCode)
app.post("/api/v1/ai", verifyJwt, processAIRequest)
app.use("/api/v1/solution",SolutionRoutes)
app.use("/api/v1/reply",ReplyRoutes)
app.use("/api/v1/aiInteractions",AiInteractionRoutes)

export default app;