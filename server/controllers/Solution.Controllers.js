import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Solution from "../models/Solution.Model.js";
import mongoose from "mongoose";
import Reply from '../models/Reply.Model.js'
import Problem from '../models/Problem.Model.js'
import { compareTwoStrings } from "string-similarity";

const fetchAllSolutions = asyncHandler(async (req, res) => {
    try {
        const problemId = req.params.id;
        const rawUserId = req.user.id;
        const { accepted, submittedByMe } = req.query;

        if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
            throw new ApiError(400, "Invalid Problem ID format");
        }

        let userObjectId = null;
        if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
            userObjectId = new mongoose.Types.ObjectId(rawUserId);
        }

        const problemObjectId = new mongoose.Types.ObjectId(problemId);

        const matchStage = { problem: problemObjectId };

        if (accepted === "true") matchStage.accepted = true;
        if (accepted === "false") matchStage.accepted = false;

        if (submittedByMe === "true") {
            if (!userObjectId) {
                throw new ApiError(401, "You must be logged in to view your submissions");
            }
            matchStage.uploader = userObjectId;
        }

        const pipeline = [
            { $match: matchStage },
            // Stage 2: Join with Users to get Uploader Username
            {
                $lookup: {
                    from: "users",
                    localField: "uploader",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Stage 3: Join with Replies to count them
            {
                $lookup: {
                    from: "replies",
                    localField: "_id",
                    foreignField: "solution",
                    as: "linkedReplies"
                }
            },

            // Stage 4: Sort (Accepted first, then Newest)
            { $sort: { accepted: -1, createdAt: -1 } },

            // Stage 5: Project/Format Data
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    // 🔹 STANDARDIZED: Using 'username' instead of 'uploaderName'
                    uploader: { $ifNull: ["$userDetails.username", "Unknown User"] },
                    uploaderId: { $ifNull: ["$userDetails._id", null] }, // Useful for frontend checks

                    explanation: 1,
                    language: 1,
                    code: 1,
                    accepted: { $ifNull: ["$accepted", false] },
                    createdAt: 1,

                    // Reply Count
                    replyCount: { $size: "$linkedReplies" },

                    // Likes Logic
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    liked: {
                        $cond: {
                            if: { $ifNull: [userObjectId, false] },
                            then: { $in: [userObjectId, { $ifNull: ["$likes", []] }] },
                            else: false
                        }
                    },

                    // Reports Logic
                    reportCount: { $size: { $ifNull: ["$reports", []] } },
                    reported: {
                        $cond: {
                            if: { $ifNull: [userObjectId, false] },
                            then: { $in: [userObjectId, { $ifNull: ["$reports", []] }] },
                            else: false
                        }
                    }
                },
            },
        ];

        const formattedSolutions = await Solution.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: formattedSolutions.length,
            data: formattedSolutions
        });

    } catch (error) {
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        const message = error.message || "Server Error";
        console.error("Error fetching solutions:", error);
        res.status(statusCode).json({ success: false, error: message });
    }
});

const fetchSolutionById = asyncHandler(async (req, res) => {
    try {
        const solutionId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(solutionId)) {
            throw new ApiError(400, "Invalid Solution ID");
        }

        const solutionAgg = await Solution.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(solutionId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "uploader",
                    foreignField: "_id",
                    as: "uploaderDetails",
                },
            },
            {
                $unwind: {
                    path: "$uploaderDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    code: 1,
                    description: "$explanation", // Mapped to description as requested
                    explanation: 1, // Keeping original key just in case
                    accepted: 1,
                    // 🔹 STANDARDIZED: Using 'username' here as well
                    uploader: { $ifNull: ["$uploaderDetails.username", "Unknown"] },
                    uploaderId: { $ifNull: ["$uploaderDetails._id", null] },
                    language: 1,
                    createdAt: 1
                },
            },
        ]);

        if (!solutionAgg.length) {
            throw new ApiError(404, "Solution not found");
        }

        return res.status(200).json({
            success: true,
            data: solutionAgg[0],
            message: "Fetch Solution Details Successfully"
        })
    } catch (error) {
        console.error("Error fetching solution by ID:", error);
        throw new ApiError(500, "Server Error")
    }
})
const submitSolution = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.id;
        const { code, explanation, language } = req.body;

        if (!problemId || !code || !explanation || !language) {
            throw new ApiError(400, "All fields are required")
        }

        // 2. Check if Problem Exists (Optimized)
        // .exists() is much faster than .findById() as it stops scanning once it finds a match
        // and returns only the _id, saving memory.
        const problemExists = await Problem.exists({ _id: problemId });

        if (!problemExists) {
            throw new ApiError(404, "Problem not found.");
        }

        // 3. Similarity Check (Anti-Spam)
        // Optimization: Select ONLY 'code' and 'explanation'.
        // We don't need 'likes', 'createdAt', or 'reports' for this comparison.
        const existingSolutions = await Solution.find({
            problem: problemId,
            uploader: userId
        }).select("code explanation");

        // Prepare the new content for comparison once
        const newContent = `${code} ${explanation}`.toLowerCase();

        for (const sol of existingSolutions) {
            const existingContent = `${sol.code} ${sol.explanation}`.toLowerCase();

            const similarity = compareTwoStrings(existingContent, newContent);

            // Threshold: 0.85 (85% similar)
            if (similarity > 0.85) {
                throw new ApiError(409, "You have already submitted a very similar solution.");
            }
        }

        // 4. Create and Save Solution
        const newSolution = await Solution.create({
            problem: problemId,
            user: userId,
            code,
            language,
            explanation,
            accepted: false // Default explicitly (good practice)
        });

        return res.status(201).json(
            { success: true, data: newSolution._id, message: "Solution submitted successfully" })
    } catch (error) {
        console.error("Error submiting solution by ID:", error);
        throw new ApiError(500, "Server Error")
    }
})

const markSolutionAsAccepted = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const solution = await Solution.findById(id).populate({
            path: "problem",
            select: "user" // Only fetch the user ID to minimize data transfer
        });

        // 2. Validation
        if (!solution) {
            throw new ApiError(404, "Solution not found");
        }
        if (!solution.problem) {
            throw new ApiError(404, "The problem associated with this solution no longer exists");
        }

        // 3. Authorization Check
        // Only the person who created the Problem can mark solutions as "Accepted"
        if (solution.problem.user.toString() !== userId.toString()) {
            throw new ApiError(403, "Only the problem creator can accept solutions.");
        }

        // 4. The Logic: Simple Toggle
        // If true -> make false. If false -> make true.
        solution.accepted = !solution.accepted;

        // Save the changes
        await solution.save();

        res.status(200).json({
            success: true,
            data: "",
            message: "Solution Mark Accepted Successfully"
        })
    } catch (error) {
        console.error("Error for accepting solution by ID:", error);
        throw new ApiError(500, "Server Error")
    }
})

// LIKE
const toggleLikeSolution = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const solutionId = req.params.id;

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      throw new ApiError(404, "Solution not found.");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // likes: [ObjectId]
    const alreadyLiked = solution.likes.some((uid) =>
      uid.equals(userObjectId)
    );

    if (alreadyLiked) {
      // Unlike
      solution.likes.pull(userObjectId);
    } else {
      // Like
      solution.likes.push(userObjectId);
    }

    await solution.save();

    return res.status(200).json({
      message: alreadyLiked ? "Like removed." : "Solution liked!",
      data: {
        likesCount: solution.likes.length,
        liked: !alreadyLiked,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error toggling like solution:", error);
    throw new ApiError(500, "Server Error");
  }
});

// REPORT
const toggleReportSolution = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const solutionId = req.params.id;

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      throw new ApiError(404, "Solution not found.");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // reports: [ObjectId]
    const alreadyReported = solution.reports.some((uid) =>
      uid.equals(userObjectId)
    );

    if (alreadyReported) {
      solution.reports.pull(userObjectId);
    } else {
      solution.reports.push(userObjectId);
    }

    await solution.save();

    return res.status(200).json({
      message: alreadyReported ? "Report removed." : "Solution Reported!",
      data: {
        reportCount: solution.reports.length,
        reported: !alreadyReported,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error toggling report solution:", error);
    throw new ApiError(500, "Server Error");
  }
});


const deleteSolution = asyncHandler(async (req, res) => {
    try {
        const solutionId = req.params.id;

        const deletedSolution = await Solution.findOneAndDelete({
            _id: solutionId
        });

        if (!deleteSolution) {
            throw new ApiError(404, "Solution Not found");
        }
        // If null, it means either:
        // 1. Solution doesn't exist
        // 2. OR User is not the owner (unauthorized)
        if (!deletedSolution) {
            throw new ApiError(404, "Solution Not Deleted");
        }

        // 🔹 If we reached here, the solution is ALREADY deleted.
        // Now just clean up the replies.
        await Reply.deleteMany({ solution: solutionId });

        return res.status(200).json(
            { success: true, message: "Solution and its replies deleted successfully", data: deleteSolution }
        );
    } catch (error) {
        console.error("Error fetching deleting solution :", error);
        throw new ApiError(500, "Server Error")
    }
})

export { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleLikeSolution, toggleReportSolution, deleteSolution }
