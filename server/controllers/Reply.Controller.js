import Reply from "../models/Reply.Model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Solution from "../models/Solution.Model.js";

const submitReply = asyncHandler(async (req, res) => {
    try {
        const solutionId = req.params.id;
        const userId = req.user.id;
        const { reply } = req.body; // Ensure variable name matches body key

        if (!reply || reply.trim() === "") {
            throw new ApiError(400, "Reply text is required");
        }

        // 1. Fetch Solution to get the Problem ID
        // We cannot use .exists() here because we need the 'problem' field from the document
        const solution = await Solution.findById(solutionId);

        if (!solution) {
            throw new ApiError(404, "Solution not found.");
        }

        // 2. Create Reply with Problem ID
        const newReply = await Reply.create({
            solution: solutionId,
            problem: solution.problem, // 🔹 Automatically inherited from Solution
            replier: userId,
            reply: reply.trim(),
        });

        // 3. Populate replier details for immediate UI update (optional but recommended)
        const populatedReply = await newReply.populate("replier", "username email");

        return res.status(201).json({
            success: true,
            data: populatedReply,
            message: "Reply added successfully"
        });
    } catch (error) {
        console.error("Error replying to solution:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }

})

const fetchReplies = asyncHandler(async (req, res) => {
    try {
        const solutionId = req.params.id;

        // 1. Check if solution exists (Optional, mostly for 404 accuracy)
        const solutionExists = await Solution.exists({ _id: solutionId });
        if (!solutionExists) {
            throw new ApiError(404, "Solution not found");
        }

        // 2. Fetch Replies
        const replies = await Reply.find({ solution: solutionId })
            .populate("replier", "username") // Show who replied
            .sort({ createdAt: -1 }); // Newest replies first

        return res.status(200).json({
            success: true,
            count: replies.length,
            data: replies,
            message: "Replies fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching replies:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
})


export {submitReply, fetchReplies};