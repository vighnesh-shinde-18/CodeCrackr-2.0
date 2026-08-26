import express from 'express'
import { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleLikeSolution, toggleReportSolution, deleteSolution } from '../controllers/Solution.Controller.js'
import { verifyJwt, verifyAdmin } from '../middlewares/Auth.Middleware.js';
import { apiLimiter } from '../middlewares/RateLimit.Middleware.js';
import {
    idParamSchema,
    submitSolutionSchema,
    solutionFilterSchema
} from "../validation/Solution.Validation.js";
import { validate } from "../middlewares/Validate.Middleware.js";

const router = express.Router();

router.get("/problem/:id", verifyJwt, validate(idParamSchema, "params"),
    validate(solutionFilterSchema, "query"), fetchAllSolutions);

router.get("/:id", verifyJwt, validate(idParamSchema, "params"), fetchSolutionById)

router.post("/problem/:id", apiLimiter, verifyJwt, validate(idParamSchema, "params"),
    validate(submitSolutionSchema, "body"), submitSolution);

router.patch("/accept/:id", apiLimiter, verifyJwt, validate(idParamSchema, "params"), markSolutionAsAccepted)
router.patch("/:id/like", apiLimiter, verifyJwt, validate(idParamSchema, "params"), toggleLikeSolution);
router.patch("/:id/report", apiLimiter, verifyJwt, validate(idParamSchema, "params"), toggleReportSolution);
router.delete("/:id", verifyJwt, verifyAdmin, validate(idParamSchema, "params"), deleteSolution)

export default router;