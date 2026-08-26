import express from 'express'
import { getUserSolvedProblems, getUserAiInteractions } from '../controllers/History.Controller.js'
import { verifyJwt } from '../middlewares/Auth.Middleware.js'
import { validate } from '../middlewares/Validate.Middleware.js';
import { solvedProblemsSchema, aiInteractionFilterSchema } from "../validation/HistoryData.Validation.js";

const router = express.Router()

router.post('/solved-problems', verifyJwt, validate(solvedProblemsSchema, "body"), getUserSolvedProblems)
router.get('/ai-interactions', verifyJwt, validate(aiInteractionFilterSchema, "params"), getUserAiInteractions)

export default router;