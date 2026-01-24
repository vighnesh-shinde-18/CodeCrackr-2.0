import Reply from "../models/Reply.Model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Solution from "../models/Solution.Model.js";
import { getPagination } from "../utils/pagination.js"; // Import pagination helper

const submitReply = asyncHandler(async (req, res) => {
    const solutionId = req.params.id;
    const userId = req.user.id;
    const { reply } = req.body; 

    const solution = await Solution.findById(solutionId);

    if (!solution) {
        throw new ApiError(404, "Solution not found.");
    }

    const newReply = await Reply.create({
        solution: solutionId,
        problem: solution.problem,
        replier: userId,
        reply: reply.trim(),
    });

    const populatedReply = await newReply.populate("replier", "username email");

    return res.status(201).json({
        success: true,
        data: populatedReply,
        message: "Reply added successfully"
    });
});

const fetchReplies = asyncHandler(async (req, res) => {
    const solutionId = req.params.id;
    
    // 1. Get Pagination Data
    const { page, limit, skip } = getPagination(req.query);

    const solutionExists = await Solution.exists({ _id: solutionId });
    if (!solutionExists) {
        throw new ApiError(404, "Solution not found");
    }

    // 2. Fetch Data and Count in Parallel
    const [replies, total] = await Promise.all([
        Reply.find({ solution: solutionId })
            .populate("replier", "username")
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .lean(),
        Reply.countDocuments({ solution: solutionId }) // Count specific to this solution
    ]);

    // 3. Pagination Metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json({
        success: true,
        count: replies.length,
        data: replies,
        message: "Replies fetched successfully",
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage
        }
    });
});

export { submitReply, fetchReplies };