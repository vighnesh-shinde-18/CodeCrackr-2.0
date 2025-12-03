import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import AiInteraction from "../models/AIinteraction.Model.js";
import mongoose from "mongoose";


const getInteractions = asyncHandler(async (req, res) => {
    try {

        const { featureType } = req.query; // 🔹 Standard: Use Query Params for filtering, not Body

        // Build the query object
        const query = { userId: req.user.id };

        // If featureType exists in query, add it to filter
        if (featureType) {
            query.featureType = featureType;
        }

        const interactions = await AiInteraction.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: interactions.length,
            data: interactions,
            message: featureType
                ? `Successfully fetched ${featureType} interactions`
                : "Successfully fetched all interactions"
        });
    } catch (error) {
        console.error("Error fetching Interactions:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
});


const getInteractionById = asyncHandler(async (req, res) => {
    try {
            const interaction = await AiInteraction.findOne({
                _id: req.params.id,
                userId: req.user._id, // Ensure user owns the data
            });

            if (!interaction) {
                throw new ApiError(404, "Interaction not found");
            }

            return res.status(200).json({
                success: true,
                data: interaction,
                message: "Interaction fetched successfully"
            });
        
    } catch (error) {
        console.error("Error fetching Interactions:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
});

/**
 * @desc    Delete interaction by ID
 * @route   DELETE /api/interactions/:id
 * @access  Private
*/
const deleteInteractionById = asyncHandler(async (req, res) => {
    try {

        const deletedInteraction = await AiInteraction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deletedInteraction) {
            throw new ApiError(404, "Interaction not found or already deleted");
        }

        return res.status(200).json({
            success: true,
            message: "Interaction deleted successfully",
        });
    } catch (error) {
        console.error("Error fetching Interactions:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
}
);

/**
 * @desc    Clear all interactions for the user
 * @route   DELETE /api/interactions/clear
 * @access  Private
*/
const deleteAllInteractions = asyncHandler(async (req, res) => {
    try {
        await AiInteraction.deleteMany({ userId: req.user._id });

        return res.status(200).json({
            success: true,
            message: "All history cleared successfully",
        });
    } catch (error) {
        console.error("Error fetching Interactions:", error);
        // If using custom ApiError, pass it through, otherwise 500
        const statusCode = error.statusCode || 500;
        const message = error.message || "Server Error";
        throw new ApiError(statusCode, message)
    }
});

export {
    getInteractions,
    getInteractionById,
    deleteInteractionById,
    deleteAllInteractions
};