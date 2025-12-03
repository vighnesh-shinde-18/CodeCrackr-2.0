import express from 'express'
import { getInteractions,
    getInteractionById,
    deleteInteractionById,
    deleteAllInteractions} from '../controllers/AiInteractions.Controllers.js'

import { verifyJwt } from '../middlewares/Auth.Middleware.js'

const router = express.Router()

router.get("/",verifyJwt,getInteractions)
router.get("/:id",verifyJwt,getInteractionById)
router.delete("/:id",verifyJwt,deleteInteractionById)
router.delete("/",verifyJwt,deleteAllInteractions)

export default router;