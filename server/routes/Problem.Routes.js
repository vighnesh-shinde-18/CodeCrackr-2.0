import express from 'express'
import {fetchAllProblems ,uploadProblem, fetchUserProblem, fecthProblemById } from '../controllers/Problem.Controllers.js'
import verifyJwt from '../middlewares/Auth.Middleware.js'

const router = express.Router()


router.get('/',verifyJwt,fetchAllProblems)
router.post('/upload',verifyJwt,uploadProblem)
router.post('/user-uploads',verifyJwt,fetchUserProblem)
router.post('/:id',verifyJwt,fecthProblemById)

export default router;