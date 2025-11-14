import jwt from 'jsonwebtoken'
import User from '../models/User.Model.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

const verifyJwt = asyncHandler(async (req, res) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if (accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken =  jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password")

        if(!user){
            throw new ApiError(404,"Invalid Access Token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})

export default verifyJwt;