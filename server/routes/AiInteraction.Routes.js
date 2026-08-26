import express from 'express'
import {
    getInteractionById,
    deleteInteractionById,
    deleteAllInteractions
} from '../controllers/AiInteractions.Controller.js'

import { verifyJwt } from '../middlewares/Auth.Middleware.js'
import { validate } from '../middlewares/Validate.Middleware.js';
import { aiIdSchema } from "../validation/Ai.Validation.js";

const router = express.Router()


router.get("/:id", verifyJwt, validate(aiIdSchema, "params"), getInteractionById)
router.delete("/:id", verifyJwt, validate(aiIdSchema, "params"), deleteInteractionById)
router.delete("/", verifyJwt, deleteAllInteractions)

export default router;