import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/User.Model.js";

const registerUser = asyncHandler(async (req, res) => {

    const { username, password, email } = req.body;

    if ([username, password, email].some(field => !field?.trim())) {
        throw new ApiError(400, "All Fields Are Required")
    }

    if (!email.includes('@')) {
        throw new ApiError(400, "Invalid Email Id")
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        throw new ApiError(409, "User Already Exist")
    }

    const userInfo = {
        username, email, password
    }
    const newUser = await User.create(userInfo)

    const createdUser = await User.findById(newUser._id).select("-password").lean()

    if (!createdUser) {
        throw new ApiError(500, "Something Went Wrong While Registring User")
    }

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: createdUser
    }
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "Email and Password are required")
    }

    const user = await User.findOne({
        email
    }).select('+password')

    if (!user) {
        throw new ApiError(404, "User does not Exist")
    }

    const isPaaswordCorrect = await user.isPaaswordCorrect(password)
    if (!isPaaswordCorrect) {
        throw new ApiError(401, "Invalid Password")
    }

    const accessToken = await user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json({ success: true, data: { user:loggedInUser, accessToken }, message: "User LoggedIn Successfully" })

})

export { registerUser, loginUser }