import mongoose from 'mongoose';
import Solution from '../models/Solution.Model.js';
import AIinteractions from '../models/AIinteraction.Model.js'; // Adjust path as needed
import AiInteraction from '../models/AIinteraction.Model.js';

const getUserSolvedProblems = async (req, res) => {
    try {
        const userId = req.user.id;

        // accepted: true (Accepted), false (Not Accepted), or "All"/undefined (Both)
        // topic: "Arrays", "DP", or "All"
        const { topic, accepted } = req.body;

        const pipeline = [];

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
                as: "problemDoc"
            }
        });

        // 3. Unwind the problem array
        pipeline.push({
            $unwind: "$problemDoc"
        });

        // 4. Filter by Topic
        // LOGIC: If topic exists AND it is NOT "all" (case insensitive), apply filter.
        // If topic is "All" or undefined, this block is skipped, returning all topics.
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
                // $max: true > false. If user has 10 failed and 1 success, isAccepted = true.
                isAccepted: { $max: "$accepted" }
            }
        });

        // 6. Filter by Accepted Status
        // LOGIC: Only filter if 'accepted' is strictly true or false.
        // If 'accepted' is "All", null, or undefined, we skip this match, returning both.
        if (typeof accepted === "boolean") {
            pipeline.push({
                $match: { isAccepted: accepted }
            });
        }

        // 7. Project final shape
        pipeline.push({
            $project: {
                _id: 0,
                id: "$_id",
                title: 1,
                topics: 1,
                accepted: "$isAccepted"
            }
        });

        const result = await Solution.aggregate(pipeline);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error fetching user's solved problems:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

 

const getAiInteractions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // We check req.body (as per your code) but also req.query (standard for GET requests)
    const { feature } = req.body;

    const pipeline = [];

    // Stage 1: Match by User (Always required)
    // Note: In aggregations, you MUST cast string IDs to ObjectId manually
    pipeline.push({
      $match: { 
        userId: new mongoose.Types.ObjectId(userId) 
      }
    });

    // Stage 2: Conditional Match by FeatureType
    // Only add this stage if featureType exists and is not "All"
    if (feature && feature !== 'All') {
      pipeline.push({
        $match: { 
          FeatureType: feature 
        }
      });
    }

    // Stage 3: Sort by CreatedAt (Descending)
    pipeline.push({
      $sort: { 
        createdAt: -1 
      }
    });

    // Execute the pipeline
    const interactions = await AiInteraction.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions
    });

  } catch (error) {
    next(error);
  }
};

export { getUserSolvedProblems, getAiInteractions };