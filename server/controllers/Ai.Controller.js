import generateContentFromPrompt from '../utils/GoogleGeminiApi.js';
import promptsObj from '../utils/Prompts.js';
import AiInteraction from '../models/AIinteraction.Model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const processAIRequest = asyncHandler(async (req, res, next) => {
        let { FeatureType, UserInput, TargetLanguage } = req.body;
 
        
        const basePrompt = promptsObj[FeatureType];
    
        
        if (!basePrompt) { 
            throw new ApiError(400, "Invalid feature type.")
        } 
        let finalPrompt = basePrompt.trim();
        
        
        if (FeatureType === 'ConvertCode' && TargetLanguage) { 
            finalPrompt = finalPrompt.replace('Target Language:', `Target Language: ${TargetLanguage}`);
        }
         
        finalPrompt += `\n${UserInput}`;
         
        const aiRawText = await generateContentFromPrompt(finalPrompt);
         
        
        let AiOutput = null; 
        
        if (aiRawText) {
            try { 
                
                const match = aiRawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                
                const jsonText = match ? match[1] : aiRawText;
                jsonText.replaceAll
                AiOutput = JSON.parse(jsonText);
                 
            } catch (err) {
                console.error("❌ Failed to parse AI JSON:", err);
                console.log("Raw text for debugging:", aiRawText);
            }
        } else { 
            throw new ApiError(500, "No AI text found.")
        }
         
        const newInteraction = new AiInteraction({
            userId: req.user.id,
            FeatureType,
            UserInput,
            AiOutput,
            Title: AiOutput.title   // or any meaningful default
        }); 
        await newInteraction.save();
         
        return res.status(201).json({
            success: true,
            message: 'AI response generated successfully',
            data: newInteraction
        });
 
});

export default processAIRequest;
