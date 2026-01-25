import express from 'express'
import { fetchReplies, submitReply } from '../controllers/Reply.Controller.js';
import { verifyJwt } from '../middlewares/Auth.Middleware.js';
import { apiLimiter } from '../middlewares/RateLimit.Middleware.js';
import { validate } from '../middlewares/Validate.Middleware.js';
import { submitReplySchema, solutionIdSchema } from "../validation/Reply.Validation.js";

const router = express.Router();

router.get("/solution/:id", verifyJwt, validate(solutionIdSchema, "params"), fetchReplies)
router.post("/solution/:id", apiLimiter, verifyJwt, validate(solutionIdSchema, "params"),
    validate(submitReplySchema, "body"), submitReply)

export default router;
  