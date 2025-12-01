import express from 'express'
import { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleSolutionInteraction } from '../controllers/Solution.Controllers.js'
import verifyJwt from '../middlewares/Auth.Middleware.js';

const router = express.Router();

router.get("/problem/:id", verifyJwt, fetchAllSolutions)
router.get("/:id", verifyJwt, fetchSolutionById)
router.post("problem/:id", verifyJwt, submitSolution)
router.patch("/accept/:id", verifyJwt, markSolutionAsAccepted)
router.patch("/:id/toggle", verifyJwt, toggleSolutionInteraction)

export default router;