import jwt from 'jsonwebtoken'
import User from '../models/User.Model.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const AccessToken = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer", "")

        if (!AccessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?.id).select("-password")

        if (!user) {
            throw new ApiError(404, "Invalid Access Token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

const verifyAdmin = asyncHandler(async (req, _, next) => {
    try {
        const AccessToken = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer", "")

        if (!AccessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?.id).select("-password")

        if (!user) {
            throw new ApiError(404, "Invalid Access Token")
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (user.email != adminEmail) {
            throw new ApiError(403, "Access is Forbiden")
        }

        next()
    } catch (error) {
        throw new ApiError(403, error?.message || "Access is Forbiden")
    }
})

export {verifyJwt, verifyAdmin};