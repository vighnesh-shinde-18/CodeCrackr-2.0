import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/User.Model.js";
import sendOtp from "../utils/sendOtp.js";

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

    if (!existingUser) {
        throw new ApiError(409, "User Already Exist")
    }

    const userInfo = {
        username, email, password
    }
    const newUser = await User.create(userInfo)

    const createdUser = await User.findById(newUser._id).select("-password -resetPasswordOTP").lean()

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
    }).select('+password -resetPasswordOTP')

    if (!user) {
        throw new ApiError(404, "User does not Exist")
    }

    const isPaaswordCorrect = await user.isPasswordCorrect(password)
    if (!isPaaswordCorrect) {
        throw new ApiError(401, "Invalid Password")
    }

    const accessToken = await user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password -resetPasswordOTP -_id -createdAt -updatedAt -__v -isAdmin")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .json({ success: true, data: { user: loggedInUser }, message: "User LoggedIn Successfully" })


})

const generateAndSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not Exist")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;

    await user.save();
    sendOtp(email, otp)

    return res.status(200).json({ message: "OTP sent to email." });
});


const validateAndResetPassword = asyncHandler(async (req, res) => {

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetPasswordOTP !== otp) {
        return res.status(400).json({ message: "Invalid email or OTP" });
    }


    user.password = newPassword;
    user.resetPasswordOTP = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });

});

const logoutUser = asyncHandler(async (req,res)=>{
   
  res.clearCookie('AccessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });

})


export { registerUser, loginUser, generateAndSendOtp, validateAndResetPassword, logoutUser }