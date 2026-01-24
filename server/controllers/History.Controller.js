import mongoose from 'mongoose';
import Solution from '../models/Solution.Model.js';
import AiInteraction from '../models/AIinteraction.Model.js';
import { getPagination } from "../utils/pagination.js"; // Ensure this path is correct
import asyncHandler from '../utils/asyncHandler.js'; // Ensure this is imported

const getUserSolvedProblems = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Get Pagination Params (from Query) & Filters (from Body)
    const { page, limit, skip } = getPagination(req.query);
    const { topic, accepted } = req.body;

    const pipeline = [];

    // --- EXISTING LOGIC STARTS ---
    // 1. Match solutions by User
    pipeline.push({
        $match: { uploader: new mongoose.Types.ObjectId(userId) }
    });

    // 2. Lookup Problem Details
    pipeline.push({
        $lookup: {
            from: "problems",
            localField: "problem",
            foreignField: "_id",
            pipeline: [
                { $project: { title: 1, topics: 1 } }
            ],
            as: "problemDoc"
        }
    });

    // 3. Unwind
    pipeline.push({
        $unwind: "$problemDoc"
    });

    // 4. Filter by Topic
    if (topic && topic.toLowerCase() !== "all") {
        pipeline.push({
            $match: { "problemDoc.topics": topic }
        });
    }

    // 5. Group by Problem (Deduplication)
    pipeline.push({
        $group: {
            _id: "$problemDoc._id",
            title: { $first: "$problemDoc.title" },
            topics: { $first: "$problemDoc.topics" },
            isAccepted: { $max: "$accepted" }
        }
    });

    // 6. Filter by Accepted Status
    if (typeof accepted === "boolean") {
        pipeline.push({
            $match: { isAccepted: accepted }
        });
    }

    // --- PAGINATION LOGIC STARTS ---

    // 7. Sort (Required for consistent pagination pages)
    pipeline.push({
        $sort: { title: 1 } // Sort alphabetically by title
    });

    // 8. Use $facet to get Data AND Count separately
    pipeline.push({
        $facet: {
            // Sub-pipeline 1: Get Total Count of grouped items
            metadata: [{ $count: "total" }],
            // Sub-pipeline 2: Get the actual data for this page
            data: [
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        id: "$_id",
                        title: 1,
                        topics: 1,
                        accepted: "$isAccepted"
                    }
                }
            ]
        }
    });

    // Execute Aggregation
    const result = await Solution.aggregate(pipeline);

    // --- PROCESS RESULT ---
    // Facet returns an array with one object: [{ metadata: [...], data: [...] }]
    const data = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json({
        success: true,
        message: "Solved problems fetched successfully",
        data: data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage
        }
    });
});

// Your existing getUserAiInteractions code was already correct! 
// I'm keeping it here for completeness.
const getUserAiInteractions = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const { featureType } = req.query;

    const query = { userId: req.user.id };
    if (featureType) {
        query.featureType = featureType;
    }

    const [interactions, total] = await Promise.all([
        AiInteraction.find(query)
            .select("FeatureType Title userInput createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AiInteraction.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json({
        success: true,
        message: "Interactions fetched successfully",
        data: interactions,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage
        }
    });
});

export { getUserSolvedProblems, getUserAiInteractions };