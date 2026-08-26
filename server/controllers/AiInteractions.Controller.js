import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import AiInteraction from "../models/AIinteraction.Model.js";


const getInteractionById = asyncHandler(async (req, res) => {

    const interaction = await AiInteraction.findOne({
        _id: req.params.id,
        userId: req.user._id, // Ensure user owns the data
    }).select("FeatureType UserInput AiOutput Title");
 
    if (!interaction) {
        throw new ApiError(404, "Interaction not found");
    }

    return res.status(200).json({
        success: true,
        data: interaction,
        message: "Interaction fetched successfully"
    });

});

const deleteInteractionById = asyncHandler(async (req, res) => {

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
}
);

const deleteAllInteractions = asyncHandler(async (req, res) => {
    await AiInteraction.deleteMany({ userId: req.user._id });

    return res.status(200).json({
        success: true,
        message: "All history cleared successfully",
    });

});

export { 
    getInteractionById,
    deleteInteractionById,
    deleteAllInteractions
};