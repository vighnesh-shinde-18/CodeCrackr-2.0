import express from 'express'
import { registerUser, loginUser, generateAndSendOtp, validateAndResetPassword, logoutUser } from '../controllers/Auth.Controller.js'
import { verifyJwt } from '../middlewares/Auth.Middleware.js'
import { validate } from "../middlewares/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    sendOtpSchema,
    resetPasswordSchema
} from "../validation/Auth.Validation.js";

const router = express.Router()

router.post('/register', validate(registerSchema, "body"), registerUser)
router.post('/login', validate(loginSchema, "body"), loginUser)
router.post('/send-otp', validate(sendOtpSchema, "body"), generateAndSendOtp)
router.post('/reset-password', validate(resetPasswordSchema, "body"), validateAndResetPassword)
router.post('/logout', verifyJwt, logoutUser)

export default router;