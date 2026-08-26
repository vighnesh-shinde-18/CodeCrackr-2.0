import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Solution from "../models/Solution.Model.js";
import mongoose from "mongoose";
import Reply from '../models/Reply.Model.js';
import Problem from '../models/Problem.Model.js';
import { compareTwoStrings } from "string-similarity";
import { getPagination } from "../utils/pagination.js";
import redis from "../utils/Redis.js";

// --- HELPER: Database Fetch for Filtering (No Cache) ---
const fetchSolutionsFromDB = async (req, res) => {
    const problemId = req.params.id;
    const userId = req.user?.id;
    const { accepted, submittedByMe } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    let userObjectId = null;
    if (userId) userObjectId = new mongoose.Types.ObjectId(userId);
    const problemObjectId = new mongoose.Types.ObjectId(problemId);

    const matchStage = { problem: problemObjectId };
    if (accepted === "true") matchStage.accepted = true;
    if (accepted === "false") matchStage.accepted = false;

    if (submittedByMe === "true") {
        if (!userObjectId) throw new ApiError(401, "Login required");
        matchStage.uploader = userObjectId;
    }

    const total = await Solution.countDocuments(matchStage);

    const pipeline = [
        { $match: matchStage },
        { $sort: { accepted: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "uploader",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "replies",
                localField: "_id",
                foreignField: "solution",
                as: "linkedReplies"
            }
        },
        {
            $project: {
                id: "$_id",
                uploader: { $ifNull: ["$userDetails.username", "Unknown User"] },
                uploaderId: { $ifNull: ["$userDetails._id", null] },
                code: 1,
                explanation: 1, // Will alias to 'description' in map
                language: 1,
                accepted: { $ifNull: ["$accepted", false] },
                createdAt: 1,
                replyCount: { $size: "$linkedReplies" },
                likes: { $ifNull: ["$likes", []] },
                reports: { $ifNull: ["$reports", []] }
            },
        },
    ];

    const solutions = await Solution.aggregate(pipeline);

    // 🟢 1. HYDRATE & FORMAT DATA
    const finalData = solutions.map(sol => ({
        ...sol, 
        liked: userObjectId ? sol.likes.some(id => id.toString() === userId.toString()) : false,
        likesCount: sol.likes.length,
        reported: userObjectId ? sol.reports.some(id => id.toString() === userId.toString()) : false,
        reportCount: sol.reports.length, // 🟢 Added Missing Count
        likes: undefined, // Cleanup
        reports: undefined
    }));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        data: finalData,
        pagination: { total, page, limit, totalPages }
    });
};

// --- MAIN CONTROLLER: Fetch with Cache ---
const fetchAllSolutions = asyncHandler(async (req, res) => {
    const problemId = req.params.id;
    const userId = req.user?.id; 
    const { accepted, submittedByMe } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    if (accepted || submittedByMe) {
        return fetchSolutionsFromDB(req, res);
    }

    const cacheKey = `solutions:problem:${problemId}:page:${page}:limit:${limit}`;
    let cachedData = await redis.get(cacheKey);
    let total = await redis.get(`solutions:problem:${problemId}:count`);

    if (!cachedData) {
        const matchStage = { problem: new mongoose.Types.ObjectId(problemId) };
        const pipeline = [
            { $match: matchStage },
            { $sort: { accepted: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "uploader",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "replies",
                    localField: "_id",
                    foreignField: "solution",
                    as: "linkedReplies"
                }
            },
            {
                $project: {
                    id: "$_id",
                    uploader: { $ifNull: ["$userDetails.username", "Unknown User"] },
                    explanation: 1,
                    language: 1,
                    accepted: 1,
                    createdAt: 1,
                    replyCount: { $size: "$linkedReplies" },
                    likes: 1, 
                    reports: 1
                }
            }
        ];

        const data = await Solution.aggregate(pipeline);
        const count = await Solution.countDocuments(matchStage);

        cachedData = data; 
        total = count;

        await redis.set(cacheKey, JSON.stringify(cachedData), 'EX', 1800);
        await redis.set(`solutions:problem:${problemId}:count`, total, 'EX', 1800);
    } else {
        cachedData = JSON.parse(cachedData);
    }

    // 🟢 2. HYDRATE CACHED DATA
    const finalData = (Array.isArray(cachedData) ? cachedData : []).map(sol => ({
        ...sol,
        description: sol.explanation,
        
        // Robust ID Check (Strings vs ObjectIds)
        liked: userId ? sol.likes.some(id => id.toString() === userId.toString()) : false,
        likesCount: sol.likes.length,
        
        reported: userId ? sol.reports.some(id => id.toString() === userId.toString()) : false,
        reportCount: sol.reports.length, // 🟢 Added Missing Count
        
        likes: undefined, 
        reports: undefined
    }));

    return res.status(200).json({
        success: true,
        data: finalData,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
});

const fetchSolutionById = asyncHandler(async (req, res) => {
    const solutionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(solutionId)) {
        throw new ApiError(400, "Invalid Solution ID");
    }
    const solutionAgg = await Solution.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(solutionId) } },
        {
            $lookup: {
                from: "users",
                localField: "uploader",
                foreignField: "_id",
                as: "uploaderDetails",
            },
        },
        { $unwind: { path: "$uploaderDetails", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                id: "$_id",
                code: 1,
                description: "$explanation",
                explanation: 1,
                accepted: 1,
                uploader: { $ifNull: ["$uploaderDetails.username", "Unknown"] },
                uploaderEmail: { $ifNull: ["$uploaderDetails.email", null] },
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
});

const submitSolution = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const problemId = req.params.id;
    const { code, explanation, language } = req.body;

    const problemExists = await Problem.exists({ _id: problemId });
    if (!problemExists) {
        throw new ApiError(404, "Problem not found.");
    }

    const existingSolutions = await Solution.find({
        problem: problemId,
        uploader: userId
    }).select("code explanation");

    const newContent = `${code} ${explanation}`.toLowerCase();
    for (const sol of existingSolutions) {
        const existingContent = `${sol.code} ${sol.explanation}`.toLowerCase();
        const similarity = compareTwoStrings(existingContent, newContent);
        if (similarity > 0.85) {
            throw new ApiError(409, "You have already submitted a very similar solution.");
        }
    }

    const newSolution = await Solution.create({
        problem: problemId,
        uploader: userId,
        code,
        language,
        explanation,
        accepted: false
    });

    const keys = await redis.keys(`solutions:problem:${problemId}:*`);
    if (keys.length > 0) await redis.del(keys);

    const userKey = `user_status:${userId}`;
    const currentStatus = await redis.hget(userKey, problemId);
    if (currentStatus !== "true") {
        await redis.hset(userKey, problemId, "false");
        await redis.expire(userKey, 604800); 
    }

    return res.status(201).json({ success: true, data: newSolution._id, message: "Solution submitted successfully" })
});

const markSolutionAsAccepted = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const solution = await Solution.findById(id).populate({ path: "problem", select: "user" });

    if (!solution) throw new ApiError(404, "Solution not found");
    if (!solution.problem) throw new ApiError(404, "Problem not found");

    const problem = await Problem.findById(solution.problem._id || solution.problem);
    if (problem.uploader.toString() !== userId) {
        throw new ApiError(403, "Only the problem creator can accept solutions.");
    }

    solution.accepted = !solution.accepted;
    await solution.save();

    const keys = await redis.keys(`solutions:problem:${solution.problem._id}:*`);
    if (keys.length > 0) await redis.del(keys);

    const solutionUploaderId = solution.uploader.toString();
    const userKey = `user_status:${solutionUploaderId}`;
    
    if (solution.accepted) {
        await redis.hset(userKey, solution.problem._id.toString(), "true");
    } else {
        await redis.hset(userKey, solution.problem._id.toString(), "false");
    }
    await redis.expire(userKey, 604800);

    res.status(200).json({ success: true, data: "", message: "Solution Mark Accepted Successfully" })
});

// 🟢 3. TOGGLE LIKE (Returns correct boolean and count)
const toggleLikeSolution = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const solutionId = req.params.id;
    const solution = await Solution.findById(solutionId);
    if (!solution) throw new ApiError(404, "Solution not found.");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = solution.likes.some((uid) => uid.equals(userObjectId));

    if (alreadyLiked) {
        solution.likes.pull(userObjectId);
    } else {
        solution.likes.push(userObjectId);
    }
    await solution.save();

    // Invalidate Cache
    const keys = await redis.keys(`solutions:problem:${solution.problem}:*`);
    if (keys.length > 0) await redis.del(keys);

    return res.status(200).json({
        message: alreadyLiked ? "Like removed." : "Solution liked!",
        // 🟢 Return updated state for Optimistic UI confirmation
        data: { 
            likesCount: solution.likes.length, 
            liked: !alreadyLiked 
        },
        success: true,
    });
});

// 🟢 4. TOGGLE REPORT (Returns correct boolean and count)
const toggleReportSolution = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const solutionId = req.params.id;
    const solution = await Solution.findById(solutionId);
    if (!solution) throw new ApiError(404, "Solution not found.");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyReported = solution.reports.some((uid) => uid.equals(userObjectId));

    if (alreadyReported) {
        solution.reports.pull(userObjectId);
    } else {
        solution.reports.push(userObjectId);
    }
    await solution.save();

    // Invalidate Cache
    const keys = await redis.keys(`solutions:problem:${solution.problem}:*`);
    if (keys.length > 0) await redis.del(keys);

    return res.status(200).json({
        message: alreadyReported ? "Report removed." : "Solution Reported!",
        // 🟢 Return updated state for Optimistic UI confirmation
        data: { 
            reportCount: solution.reports.length, 
            reported: !alreadyReported 
        },
        success: true,
    });
});

const deleteSolution = asyncHandler(async (req, res) => {
    const solutionId = req.params.id;
    const solution = await Solution.findById(solutionId);
    if (!solution) throw new ApiError(404, "Solution Not found");

    const problemId = solution.problem;

    await Solution.deleteOne({ _id: solutionId });
    await Reply.deleteMany({ solution: solutionId });

    const keys = await redis.keys(`solutions:problem:${problemId}:*`);
    if (keys.length > 0) await redis.del(keys);

    return res.status(200).json({ success: true, message: "Solution and its replies deleted successfully" });
});

export { fetchAllSolutions, fetchSolutionById, submitSolution, markSolutionAsAccepted, toggleLikeSolution, toggleReportSolution, deleteSolution };