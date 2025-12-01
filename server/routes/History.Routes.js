import express from 'express'
import { getUserSolvedProblems, getAiInteractions } from '../controllers/History.Controllers.js'
import verifyJwt from '../middlewares/Auth.Middleware.js'

const router = express.Router()

router.post('/solved-problems',verifyJwt,getUserSolvedProblems)
router.post('/ai-interactions',verifyJwt,getAiInteractions)

export default router;