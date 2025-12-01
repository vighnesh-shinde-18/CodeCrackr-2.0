import express, { response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions))

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

import AuthRoutes from './routes/Auth.Routes.js'
import ProblemRoutes from './routes/Problem.Routes.js'
import getDashboardStats from './controllers/Stats.Controllers.js';
import verifyJwt from './middlewares/Auth.Middleware.js';
import CompileCode from './controllers/Compiler.Controllers.js';
import processAIRequest from './controllers/Ai.Controllers.js';
import HistoryRoutes from './routes/History.Routes.js'
import SolutionRoutes from './routes/Solution.Routes.js'

app.get("/test", (req, res) => {res.json({data: "working"})})


app.use("/api/v1/auth", AuthRoutes)
app.use("/api/v1/problem", ProblemRoutes)
app.use("/api/v1/history", HistoryRoutes)
app.get("/api/v1/stats", verifyJwt, getDashboardStats)
app.post("/api/v1/compile", verifyJwt, CompileCode)
app.post("/api/v1/ai", verifyJwt, processAIRequest)
app.use("/api/v1/solution",SolutionRoutes)

export default app;

