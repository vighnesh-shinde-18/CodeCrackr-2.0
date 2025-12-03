import express from 'express'
import { fetchAllProblems, uploadProblem, fetchUserProblem, fecthProblemById, toggleReportProblem, deleteProblem } from '../controllers/Problem.Controllers.js'
import { verifyJwt, verifyAdmin } from '../middlewares/Auth.Middleware.js'

const router = express.Router()


router.get('/', verifyJwt, fetchAllProblems)
router.post('/upload', verifyJwt, uploadProblem)
router.post('/user-uploads', verifyJwt, fetchUserProblem)
router.get('/:id', verifyJwt, fecthProblemById)
router.patch("/:id", verifyJwt, toggleReportProblem)
router.delete("/:id", verifyJwt, verifyAdmin, deleteProblem)

export default router;