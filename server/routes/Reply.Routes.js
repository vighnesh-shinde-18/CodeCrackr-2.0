import express from 'express'
import { fetchReplies, submitReply } from '../controllers/Reply.Controller.js';
import {verifyJwt} from '../middlewares/Auth.Middleware.js';

const router = express.Router();

router.get("/:id", verifyJwt, fetchReplies)
router.post("/:id", verifyJwt, submitReply) 

export default router;