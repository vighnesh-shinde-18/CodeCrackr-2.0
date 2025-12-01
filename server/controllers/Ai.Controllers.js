import generateContentFromPrompt from '../utils/GoogleGeminiApi.js';
import promptsObj from '../utils/Prompts.js';
import AiInteraction from '../models/AIinteraction.Model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const processAIRequest = asyncHandler(async (req, res, next) => {
    try {
        let { FeatureType, UserInput, TargetLanguage } = req.body;
        console.log(1)
        
        if (!FeatureType || !UserInput) {
            console.log(2)
            throw new ApiError(400, "Feature type and user input are required.")
        }
        
        console.log(3)
        const basePrompt = promptsObj[FeatureType];
        console.log(4)
        
        if (!basePrompt) {
            console.log(5)
            throw new ApiError(400, "Invalid feature type.")
        }
        console.log(6)
        
        let finalPrompt = basePrompt.trim();
        
        console.log(7)
        if (FeatureType === 'ConvertCode' && TargetLanguage) {
            console.log(8)
            finalPrompt = finalPrompt.replace('Target Language:', `Target Language: ${TargetLanguage}`);
        }
        
        console.log(9)
        finalPrompt += `\n${UserInput}`;
        
        console.log(10)
        const aiRawText = await generateContentFromPrompt(finalPrompt);
        
        console.log(11)
        
        let AiOutput = null;
        console.log(12)
        
        if (aiRawText) {
            try {
                console.log(13)
                
                const match = aiRawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                
                console.log(14)
                const jsonText = match ? match[1] : aiRawText;
                
                console.log(15)
                AiOutput = JSON.parse(jsonText);
                
                console.log(16)
            } catch (err) {
                console.error("❌ Failed to parse AI JSON:", err);
                console.log("Raw text for debugging:", aiRawText);
            }
        } else {
            console.log(17)
            throw new ApiError(500, "No AI text found.")
        }
        
        console.log(18)
        const newInteraction = new AiInteraction({
            userId: req.user.id,
            FeatureType,
            UserInput,
            AiOutput,
            Title: AiOutput.title   // or any meaningful default
        });
        console.log(19)
        await newInteraction.save();
        
        console.log(20)
        return res.status(201).json({
            success: true,
            message: 'AI response generated successfully',
            data: newInteraction
        });

    } catch (error) {
        console.error('Error processing AI request:', error);
        return next(error);
    }
});

export default processAIRequest;
