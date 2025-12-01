import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Problem from "../models/Problem.Model.js";
import mongoose from "mongoose";

const fetchAllProblems = asyncHandler(async (req, res) => {
    try {
        // Retrieve userId from the request (set by authentication middleware)
        const userId = req.user.id;
        // Convert the string ID to a MongoDB ObjectId for direct comparison in aggregation
        const userIdObjectId = new mongoose.Types.ObjectId(userId);


        const pipeline = [
            // 1. Join Problems with all Solutions
            {
                $lookup: {
                    from: "solutions", // Name of the solutions collection
                    localField: "_id",     // Problem's ID
                    foreignField: "problem", // Solution's reference to the Problem ID
                    as: "user_solutions",    // Temporary field for all joined solutions
                },
            },

            // 2. Filter the joined solutions to ONLY include those submitted by the current user
            {
                $addFields: {
                    user_solutions: {
                        $filter: {
                            input: "$user_solutions",
                            as: "sol",
                            // Cond: Match the solution's 'uploader' field to the current userId
                            cond: { $eq: ["$$sol.uploader", userIdObjectId] },
                        },
                    },
                },
            },

            // 3. Calculate the required status fields based on the user's filtered solutions
            {
                $addFields: {
                    // 'replied': True if the user has submitted AT LEAST ONE solution.
                    replied: {
                        // Check if the filtered array has a size greater than 0
                        $gt: [{ $size: "$user_solutions" }, 0]
                        // The original logic using $anyElementTrue on $map: "$$sol.accepted" 
                        // would only be true if they had an *accepted* solution.
                        // Corrected to check if the array is non-empty for 'replied'.
                    },

                    // 'accepted': True if ANY of the user's solutions is accepted: true
                    accepted: {
                        $anyElementTrue: {
                            $map: {
                                input: "$user_solutions",
                                as: "sol",
                                in: "$$sol.accepted", // Check if any solution has accepted: true
                            }
                        }
                    }
                }
            },

            // 4. Project (Shape) the final output document
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    topics: 1,
                    replied: 1, // User has submitted a solution (true/false)
                    accepted: 1, // User has an accepted solution (true/false)
                    // user_solutions: 0 // Exclude the temporary solution array
                }
            }
        ];

        // Execute the pipeline on the Problem model
        const response = await Problem.aggregate(pipeline);

        res.status(200).json({ success: true, message: "All Problem Fetch Successfully", data: response });
    } catch (error) {
        console.error("Error fetching problems:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)

    }
});


const uploadProblem = asyncHandler(async (req, res) => {
    try {

        const userId = req.user.id;
        const { title, description, topics, testCases } = req.body;

        if (!title || !description || !Array.isArray(topics) || !Array.isArray(testCases)) {
            throw new ApiError(400, "All Fields Are Required");
        }

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

        res.status(201).json({ success: true, message: "Problem uploaded successfully", data: newProblem._id });
    } catch (error) {
        console.error("Error fetching solutions:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
});

const fetchUserProblem = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { topic } = req.body;

        const matchStage = {
            uploader: new mongoose.Types.ObjectId(userId), // Ensure userId is an ObjectId
        };


        if (topic) {
            // Using $in for array matching is safer if 'topics' is an array
            matchStage.topics = { $in: [topic] };
        }

        const enrichedProblems = await Problem.aggregate([
            // Stage 1: Filter problems by uploader and topic (if provided)
            { $match: matchStage },

            // Stage 2: Join with the Solution collection
            {
                $lookup: {
                    from: "solutions", // The target collection name (must be the plural collection name)
                    localField: "_id", // Field from the Problem collection
                    foreignField: "problem", // Field from the Solution collection
                    as: "solutionsList" // The resulting array field in the output documents
                }
            },

            // Stage 3: Calculate the solution count using $size on the new array
            {
                $addFields: {
                    solutionCount: { $size: "$solutionsList" }
                }
            },

            // Stage 4: Project and shape the final output
            {
                $project: {
                    _id: 0, // Exclude original _id
                    id: "$_id", // Rename _id to id for frontend
                    title: 1,
                    topics: 1,
                    description: 1,
                    createdAt: 1,
                    solutionCount: 1,
                    // Exclude the bulky solutionsList array
                }
            }
        ]);

        return res.status(200).json({ success: true, data: enrichedProblems, message: "successfully fecth required problems" });
    } catch (error) {
        console.error("Error fetching fetching all problems:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
});

const fecthProblemById = asyncHandler(async (req, res) => {
    try {
        const problemId = req.params.id;

        const problem = await Problem.findById(problemId)
            .populate("uploader", "username")
            .lean()

        if (!problem) {
            throw new ApiError(404, "Problem Not Found")
        }

        const responseObj = {
            id: problemId,
            title: problem.title,
            description: problem.description,
            topics: problem.topics,
            testCases: problem.testCases,
            username: problem.uploader.username,
            uploader: problem.uploader._id
        }

        return res.status(200).json({ success: true, data: responseObj, message: "successfully fecth problem details" });

    } catch (error) {
        console.error("Error fetching fetching problem: ", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
})



export { fetchAllProblems, fetchUserProblem, uploadProblem, fecthProblemById }