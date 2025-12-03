import express from 'express'
import { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleSolutionInteraction, deleteSolution } from '../controllers/Solution.Controllers.js'
import {verifyJwt, verifyAdmin} from '../middlewares/Auth.Middleware.js';

const router = express.Router();

router.get("/problem/:id", verifyJwt, fetchAllSolutions)
router.get("/:id", verifyJwt, fetchSolutionById)
router.post("/problem/:id", verifyJwt, submitSolution)
router.patch("/accept/:id", verifyJwt, markSolutionAsAccepted)
router.patch("/toggle/:id", verifyJwt, toggleSolutionInteraction)
router.delete("/:id",verifyJwt,verifyAdmin, deleteSolution)

export default router;