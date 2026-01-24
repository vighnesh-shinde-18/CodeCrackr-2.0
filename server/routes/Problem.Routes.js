import express from 'express'
import { getAllTopics, fetchAllProblems, uploadProblem, fetchUserProblem, fecthProblemById, toggleReportProblem, deleteProblem } from '../controllers/Problem.Controller.js'
import { verifyJwt, verifyAdmin } from '../middlewares/Auth.Middleware.js'
import { createProblemSchema, fetchUserProblemSchema, problemIdSchema } from '../validation/Problem.Validation.js';
import { validate } from '../middlewares/validate.middleware.js';
import { apiLimiter } from '../middlewares/RateLimit.Middleware.js';

const router = express.Router()

router.get("/topics", apiLimiter, verifyJwt, getAllTopics);
router.get('/', apiLimiter, verifyJwt, fetchAllProblems)
router.post('/upload', apiLimiter, verifyJwt, validate(createProblemSchema, "body"), uploadProblem)
router.post('/user-uploads', verifyJwt, validate(fetchUserProblemSchema, "body"), fetchUserProblem)
router.get('/:id', verifyJwt, validate(problemIdSchema, "params"), fecthProblemById)
router.patch("/:id", apiLimiter, verifyJwt, validate(problemIdSchema, "params"), toggleReportProblem)
router.delete("/:id", verifyJwt, verifyAdmin, validate(problemIdSchema, "params"), deleteProblem)

export default router;