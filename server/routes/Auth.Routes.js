import express from 'express'
import { registerUser, loginUser, generateAndSendOtp, validateAndResetPassword, logoutUser } from '../controllers/Auth.Controllers.js'
import {verifyJwt} from '../middlewares/Auth.Middleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/send-otp', generateAndSendOtp)
router.post('/reset-password', validateAndResetPassword)
router.post('/logout', verifyJwt, logoutUser) 

export default router;