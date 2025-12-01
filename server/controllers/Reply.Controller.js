import Reply from "../models/Reply.Model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Solution from "../models/Solution.Model.js";

const submitReply = asyncHandler(async (req, res) => {
    try {
        const solutionId = req.params.id;
        const userId = req.user.id;

        const { reply } = req.body;

        if (!reply || !reply.trim() === "") {
            throw new ApiError(400, "Reply text is required")
        }

        // 2. 🔹 OPTIMIZATION: Lightweight Existence Check
        // Instead of fetching the entire Solution (code, description, arrays...), 
        // .exists() returns a simple boolean-like object. 
        // This saves significant memory and bandwidth.
        const solutionExists = await Solution.exists({ _id: solutionId });

        if (!solutionExists) {
            throw new ApiError(404, "Solution not found.");
        }

        // 3. Create and Save
        const newReply = await Reply.create({
            solution: solutionId,
            replier: userId,
            reply: text.trim(), // Good practice to trim whitespace before saving
        });

        // 4. Response
        // Return the created object so the Frontend can append it to the list immediately
        return res.status(201).json({
            success: true, data: newReply, message: "Reply added successfully"
        }
        );
    } catch (error) {
        console.error("Error replying to solution:", error);
        res.status(500).json({ error: "Server Error" });
    }

})

export default submitReply;