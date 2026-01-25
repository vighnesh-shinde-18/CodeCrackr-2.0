import User from '../models/User.Model.js';
import Problem from '../models/Problem.Model.js';
import Solution from '../models/Solution.Model.js';
import mongoose from 'mongoose';
import redis from '../utils/Redis.js';
import asyncHandler from '../utils/asyncHandler.js';

const getDashboardStats = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    // --- PART 1: GLOBAL STATS (Cache Strategy: High TTL) ---
    // Leaderboards and Global Counts are heavy to calculate but valid for 15-30 mins.

    const cacheKey = "dashboard:global_stats";
    let globalData = await redis.get(cacheKey);

    if (!globalData) { 
        // 1. Fetch Global Counts
        const [userCount, problemCount, solutionCount] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Solution.countDocuments()
        ]);

        // 2. Define Aggregation Helpers
        const getLeaderboardPipeline = (lookupCollection, matchCondition = {}) => [
            {
                $lookup: {
                    from: lookupCollection,
                    localField: "_id",
                    foreignField: "uploader",
                    as: "joinedData"
                }
            },
            {
                $project: {
                    username: 1,
                    score: {
                        $size: {
                            $filter: {
                                input: "$joinedData",
                                as: "item",
                                cond: matchCondition
                            }
                        }
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 3 }
        ];

        // 3. Run Heavy Aggregations
        const [topQuestionsRaw, topAnswersRaw, topAcceptedRaw] = await Promise.all([
            User.aggregate(getLeaderboardPipeline("problems", {})),
            User.aggregate(getLeaderboardPipeline("solutions", {})),
            User.aggregate(getLeaderboardPipeline("solutions", { $eq: ["$$item.accepted", true] }))
        ]);

        // 4. Format Data
        const formatLeaderboard = (data) => ({
            first: data[0] ? { id: data[0]._id, username: data[0].username, score: data[0].score } : null,
            second: data[1] ? { id: data[1]._id, username: data[1].username, score: data[1].score } : null,
            third: data[2] ? { id: data[2]._id, username: data[2].username, score: data[2].score } : null,
        });

        // 5. Structure for Cache
        globalData = {
            totalStats: { userCount, problemCount, solutionCount },
            leaderboards: [
                { metric: "Questions Uploaded", data: formatLeaderboard(topQuestionsRaw) },
                { metric: "Answers Given", data: formatLeaderboard(topAnswersRaw) },
                { metric: "Accepted Answers", data: formatLeaderboard(topAcceptedRaw) }
            ]
        };

        // 6. Save to Redis (TTL: 15 Minutes)
        // Leaderboards don't need to be instant. 15 mins is a good balance.
        await redis.set(cacheKey, JSON.stringify(globalData), 'EX', 900);
    } else {
        globalData = JSON.parse(globalData);
    }

    // --- PART 2: CURRENT USER STATS (DB Strategy: Real-time) ---
    // This is fast (indexed lookup) and needs to be instant for the user.

    const currentUserPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(currentUserId) } },
        {
            $lookup: { from: "problems", localField: "_id", foreignField: "uploader", as: "problems" }
        },
        {
            $lookup: { from: "solutions", localField: "_id", foreignField: "uploader", as: "solutions" }
        },
        {
            $project: {
                username: 1,
                totalQuestionsPosted: { $size: "$problems" },
                totalSolutionsGiven: { $size: "$solutions" },
                totalAcceptedSolutions: {
                    $size: {
                        $filter: {
                            input: "$solutions",
                            as: "sol",
                            cond: { $eq: ["$$sol.accepted", true] }
                        }
                    }
                }
            }
        }
    ];

    const currentUserRaw = await User.aggregate(currentUserPipeline);
    const currentUserStats = currentUserRaw[0] ? {
        id: currentUserRaw[0]._id,
        username: currentUserRaw[0].username,
        totalProblemsPosted: currentUserRaw[0].totalQuestionsPosted,
        totalSolutionsGiven: currentUserRaw[0].totalSolutionsGiven,
        totalAcceptedSolutions: currentUserRaw[0].totalAcceptedSolutions
    } : null;

    // --- PART 3: MERGE AND SEND ---
    res.status(200).json({
        success: true,
        totalStats: globalData.totalStats,
        leaderboards: {
            leaderboardMetrics: globalData.leaderboards,
            currentUserStats: currentUserStats
        }
    });


});

export default getDashboardStats;