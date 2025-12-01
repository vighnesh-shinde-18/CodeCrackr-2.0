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

        // SAFE USER ID EXTRACTION
        const rawUserId = req.user.id;

        const { accepted, submittedByMe, language } = req.query;

        // 1. VALIDATION CHECKS
        if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
            throw new ApiError(400, "Invalid Problem ID format");
        }

        // Validate User ID if present
        let userObjectId = null;
        if (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId)) {
            userObjectId = new mongoose.Types.ObjectId(rawUserId);
        }

        const problemObjectId = new mongoose.Types.ObjectId(problemId);

        // 2. BUILD MATCH STAGE (Filters)
        const matchStage = { problem: problemObjectId };

        if (accepted === "true") matchStage.accepted = true;
        if (accepted === "false") matchStage.accepted = false;

        if (submittedByMe === "true") {
            if (!userObjectId) {
                throw new ApiError(401, "You must be logged in to view your submissions");
            }
            matchStage.uploader = userObjectId;
        }

        if (language) {
            matchStage.language = language;
        }

        const pipeline = [
            // Stage 1: Filter Solutions
            { $match: matchStage },

            // Stage 2: Join with Users (Get Uploader Info)
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

            // --- NEW STAGE: Join with Replies Collection ---
            // This pulls all documents from the "replies" collection 
            // where reply.solution === solution._id
            {
                $lookup: {
                    from: "replies", // Make sure this matches your MongoDB collection name (usually lowercase plural)
                    localField: "_id", // The Solution ID
                    foreignField: "solution", // The field in Reply schema pointing to Solution
                    as: "linkedReplies" // Temporary array to hold the replies
                }
            },

            // Stage 4: Sort (Accepted first, then Newest)
            { $sort: { accepted: -1, createdAt: -1 } },

            //  code: 1,
            // Stage 5: Project/Format Data
            //   uploaderId: { $ifNull: ["$userDetails._id", ""] },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    uploaderName: { $ifNull: ["$userDetails.username", "Unknown User"] },

                    explanation: 1,

                    language: 1,
                    accepted: { $ifNull: ["$accepted", false] },
                    createdAt: 1,

                    // --- UPDATED COUNT LOGIC ---
                    // Count the size of the array we just created via $lookup
                    replyCount: { $size: "$linkedReplies" },

                    // Likes Logic (Unchanged)
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    liked: {
                        $cond: {
                            if: { $ifNull: [userObjectId, false] },
                            then: { $in: [userObjectId, { $ifNull: ["$likes", []] }] },
                            else: false
                        }
                    },

                    // Reports Logic (Unchanged)
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

        // 1. Validate ID format
        if (!mongoose.Types.ObjectId.isValid(solutionId)) {
            throw new ApiError(400, "Invalid Solution ID");
        }

        const solutionAgg = await Solution.aggregate([
            // 🔹 Stage 1: Match the specific solution
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(solutionId)
                }
            },

            // 🔹 Stage 2: Join with 'users' to get Uploader Username
            {
                $lookup: {
                    from: "users",
                    localField: "uploader", // Change this to "uploader" if your schema uses that field name
                    foreignField: "_id",
                    as: "uploaderDetails",
                },
            },
            {
                $unwind: {
                    path: "$uploaderDetails",
                    preserveNullAndEmptyArrays: true, // Returns null if user is deleted
                },
            },

            // 🔹 Stage 3: Project ONLY the required fields
            {
                $project: {
                    _id: 0, // Exclude default internal _id
                    id: "$_id",
                    code: 1,
                    // Map 'explanation' from DB to 'description' as requested
                    description: "$explanation",
                    accepted: 1,
                    username: { $ifNull: ["$uploaderDetails.username", "Unknown"] },
                    language: 1,
                    createdAt: 1
                },
            },
        ]);

        // 🔹 Check if solution exists
        if (!solutionAgg.length) {
            throw new ApiError(404, "Solution not found");
        }

        // 🔹 Return success response
        return res.status(200).json({
            success: true, data: solutionAgg[0], message: "Fetch Solution Details Successfully"
        })
    } catch (error) {
        console.error("Error fetching solution by ID:", error);
        throw new ApiError(500, "Server Error")
    }
})

const submitSolution = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const { problemId, code, explanation, language } = req.body;

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
            { success: true, data: { solutionId: newSolution._id }, message: "Solution submitted successfully" })
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

const toggleSolutionInteraction = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.query; // ?action=like OR ?action=report
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Validate Input
        if (!["like", "report"].includes(action)) {
            throw new ApiError(400, "Invalid action. Use 'like' or 'report'.");
        }

        // 2. Fetch Current State (Lightweight Read)
        // We only need the arrays to check for conflicts
        const solution = await Solution.findById(id).select("likes reports");

        if (!solution) {
            throw new ApiError(404, "Solution not found");
        }

        // 3. CHECK CONFLICTS (The Logic You Requested)
        const isLiked = solution.likes.some(uid => uid.equals(userId));
        const isReported = solution.reports.some(uid => uid.equals(userId));

        if (action === "like" && isReported) {
            // User wants to like, but it is currently reported
            throw new ApiError(400, "You cannot like a reported solution. Please un-report it first.");
        }

        if (action === "report" && isLiked) {
            // User wants to report, but it is currently liked
            throw new ApiError(400, "You cannot report a solution you liked. Please unlike it first.");
        }

        // 4. Perform the Atomic Toggle (Safe)
        const targetField = action === "like" ? "likes" : "reports";

        const updatedSolution = await Solution.findByIdAndUpdate(
            id,
            [
                {
                    $set: {
                        [targetField]: {
                            $cond: {
                                // Check if user is already in the array
                                if: { $in: [userId, `$${targetField}`] },
                                // TRUE: Remove (Toggle Off)
                                then: { $setDifference: [`$${targetField}`, [userId]] },
                                // FALSE: Add (Toggle On)
                                else: { $setUnion: [`$${targetField}`, [userId]] }
                            }
                        }
                    }
                }
            ],
            { new: true }
        );

        // 5. Response
        const isActive = updatedSolution[targetField].some(uid => uid.equals(userId));
        const count = updatedSolution[targetField].length;

        return res.status(200).json({
            success: true,
            data: {
                action,
                active: isActive, // true if just added, false if removed
                count
            },
            message: isActive ? `Solution marked as ${action}d.` : `Removed ${action} from solution.`
        });
    } catch (error) {
        console.error("Error for accepting solution by ID:", error);
        throw new ApiError(500, "Server Error")
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

export { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleSolutionInteraction }
