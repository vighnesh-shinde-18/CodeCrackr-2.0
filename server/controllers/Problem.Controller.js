import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Problem from "../models/Problem.Model.js";
import Solution from "../models/Solution.Model.js";
import Reply from "../models/Reply.Model.js";
import mongoose from "mongoose";
import { getPagination } from "../utils/pagination.js"; // Import pagination helper
import redis from "../utils/Redis.js";

const getAllTopics = asyncHandler(async (req, res) => {
    // MongoDB distinct is perfect for this
    const topics = await Problem.distinct("topics");
    res.status(200).json({
        success: true,
        data: topics.sort() // Send them alphabetically
    });
});

const fetchAllProblems = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req.query);

    // Filters from Query
    const { search, topic, status } = req.query;
    // status options: "solved", "unsolved", "attempted"

    // 1. FETCH USER STATUS (We need this for both Cache AND DB paths)
    // We fetch the lightweight map of what the user has done.
    const userKey = `user_status:${userId}`;
    let userMap = await redis.hgetall(userKey);

    // Hydrate User Map if missing (Lazy Loading)
    if (!userMap || Object.keys(userMap).length === 0) {
        const solutions = await Solution.find({ uploader: userId }).select("problem accepted").lean();
        userMap = {};
        solutions.forEach(s => {
            // Logic: accepted=true overrides accepted=false
            if (userMap[s.problem] !== "true") {
                userMap[s.problem] = s.accepted.toString();
            }
        });
        if (Object.keys(userMap).length > 0) {
            await redis.hmset(userKey, userMap);
            await redis.expire(userKey, 604800); // 7 Days
        }
    }

    // --- DECISION TIME: CACHE OR DB? ---

    if (topic && topic.toLowerCase() === 'all') topic = undefined;
    if (status && status.toLowerCase() === 'all') status = undefined;

    // If ANY filter is active, we MUST use MongoDB (Redis is bad at filtering)
    const isFiltering = search || topic || status;

    if (isFiltering) {
        return fetchFilteredFromDB(req, res, userMap);
    }

    // --- PATH A: STANDARD BROWSING (Redis Cache) ---
    // This is super fast for 90% of user traffic (just browsing the list)

    const globalKey = `problems:page:${page}:limit:${limit}`;
    let problemsData = await redis.get(globalKey);
    let total = await redis.get(`problems:count`);

    if (!problemsData) {
        // Cache Miss: Fetch Standard Page from DB
        const [data, count] = await Promise.all([
            Problem.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-testCases -reports -uploader -description") // 👈 IMPORTANT: Don't leak test cases or bloat Redis
                .lean(),
            Problem.countDocuments()
        ]);

        problemsData = data;
        total = count;

        // Save to Redis (1 Hour)
        await redis.set(globalKey, JSON.stringify(problemsData), 'EX', 3600);
        await redis.set(`problems:count`, total, 'EX', 3600);
    } else {
        problemsData = JSON.parse(problemsData);
    }

    // Merge User Status
    const finalResponse = mergeStatus(problemsData, userMap);

    // Return
    return sendResponse(res, finalResponse, page, limit, total);
});

// --- PATH B: FILTERING (MongoDB) ---
const fetchFilteredFromDB = async (req, res, userMap) => {
    const { page, limit, skip } = getPagination(req.query);
    const { search, topic, status } = req.query;

    const query = {};

    // 1. Text Search
    if (search) {
        query.title = { $regex: search, $options: "i" };
    }

    // 2. Topic Filter
    if (topic) {
        query.topics = topic;
    }

    // 3. Status Filter (The tricky part!)
    if (status) {
        const solvedIds = Object.keys(userMap).filter(id => userMap[id] === "true"); // Accepted
        const attemptedIds = Object.keys(userMap); // All interactions

        if (status === "accepted") {
            query._id = { $in: solvedIds };
        } else if (status === "not replied") {
            query._id = { $nin: attemptedIds }; // Never touched
        } else if (status === "replied") {
            // Attempted but NOT solved
            // Find IDs in attemptedIds but NOT in solvedIds
            const failedIds = attemptedIds.filter(id => userMap[id] === "false");
            query._id = { $in: failedIds };
        }
    }

    // Execute Query
    const [problems, total] = await Promise.all([
        Problem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-reports -uploader -description").lean(),
        Problem.countDocuments(query)
    ]);

    // Merge User Status (So UI still shows checkboxes)
    const finalResponse = mergeStatus(problems, userMap);

    return sendResponse(res, finalResponse, page, limit, total);
};

// --- HELPERS ---

// Merges the "Heavy" Problem data with "Light" User Status
const mergeStatus = (problems, userMap) => {
    return problems.map(p => ({
        ...p,
        replied: !!userMap[p._id.toString()], // True if key exists
        accepted: userMap[p._id.toString()] === "true" // True if value is "true"
    }));
};

const sendResponse = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit) || 1;
    res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages
        }
    });
};


const uploadProblem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { title, description, topics, testCases } = req.body;

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        throw new ApiError(409, "Problem Title Already Exist")
    }

    const newProblem = new Problem({
        title,
        description,
        topics,
        testCases,
        uploader: userId,
        reports: []
    });

    await newProblem.save();

    // 🔴 NEW: Invalidate Cache
    // We remove the Count and Page 1 because that's where new questions appear.
    // For a cleaner approach, you can iterate keys, but deleting Page 1 is usually enough for immediate feedback.
    const keys = await redis.keys("problems:page:*");
    if (keys.length > 0) {
        await redis.del(keys); // Clear ALL pages to be safe
    }
    await redis.del("problems:count");

    res.status(201).json({ success: true, message: "Problem uploaded successfully", data: newProblem._id });
});
const fetchUserProblem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { topic } = req.body; // Keep the filter if you want server-side filtering

    const matchStage = {
        uploader: new mongoose.Types.ObjectId(userId),
    };

    if (topic && topic.toLowerCase() !== "all") {
        matchStage.topics = { $in: [topic] };
    }

    const enrichedProblems = await Problem.aggregate([
        // Stage 1: Filter (Match User & Topic)
        { $match: matchStage },

        // Stage 2: Sort (Newest First)
        { $sort: { createdAt: -1 } },

        // ❌ REMOVED PAGINATION (Skip/Limit) ❌ 
        // We want all of them so the frontend filter works correctly.

        // Stage 3: Join with Solutions (To show count)
        {
            $lookup: {
                from: "solutions",
                localField: "_id",
                foreignField: "problem",
                as: "solutionsList"
            }
        },

        // Stage 4: Calculate solution count
        {
            $addFields: {
                solutionCount: { $size: "$solutionsList" }
            }
        },

        // Stage 5: Project (Clean up response)
        {
            $project: {
                _id: 0,
                id: "$_id",
                title: 1,
                topics: 1,
                description: 1,
                createdAt: 1,
                solutionCount: 1,
            }
        }
    ]);

    // Simple response without pagination metadata
    return res.status(200).json({
        success: true,
        data: enrichedProblems,
        message: "Successfully fetched user problems",
    });
});

const fecthProblemById = asyncHandler(async (req, res) => {
    const problemId = req.params.id;
    const currentUserId = req.user?.id?.toString();

    const problem = await Problem.findById(problemId)
        .populate("uploader", "username email")
        .lean();

    if (!problem) {
        throw new ApiError(404, "Problem Not Found");
    }

    const reportsList = problem.reports || [];
    const reportCount = reportsList.length;

    const isReported = currentUserId
        ? reportsList.some((r) => r.toString() === currentUserId.toString())
        : false;

    const responseObj = {
        id: problem._id,
        title: problem.title,
        description: problem.description,
        topics: problem.topics,
        testCases: problem.testCases,
        username: problem.uploader?.username || "Unknown",
        email: problem.uploader?.email,
        userId: problem.uploader?._id,
        createdAt: problem.createdAt,
        reportCount,
        isReported
    };
    return res.status(200).json({
        success: true,
        data: responseObj,
        message: "Successfully fetched problem details"
    });
});

const toggleReportProblem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const problemId = req.params.id;

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const reportIndex = problem.reports.findIndex(
        (reportId) => reportId.toString() === userId.toString()
    );

    if (reportIndex !== -1) {
        problem.reports.splice(reportIndex, 1);
        await problem.save();

        return res.status(200).json({
            success: true,
            message: "Problem report removed.",
            isReported: false,
            reportCount: problem.reports.length
        });
    }

    problem.reports.push(userId);
    await problem.save();

    return res.status(200).json({
        success: true,
        message: "Problem reported successfully.",
        data: {
            isReported: true,
            reportCount: problem.reports.length
        }
    });
});

const deleteProblem = asyncHandler(async (req, res) => {
    const problemId = req.params.id;

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    await Reply.deleteMany({ problem: problem._id });
    await Solution.deleteMany({ problem: problem._id });
    await problem.deleteOne();

    // 🔴 NEW: Invalidate Cache
    const keys = await redis.keys("problems:page:*");
    if (keys.length > 0) {
        await redis.del(keys);
    }
    await redis.del("problems:count");

    return res.status(200).json({
        success: true,
        message: "Problem and associated solutions deleted successfully."
    });
});

export { getAllTopics, fetchAllProblems, fetchUserProblem, uploadProblem, fecthProblemById, deleteProblem, toggleReportProblem };