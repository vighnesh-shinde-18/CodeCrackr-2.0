import api from "./axios.js";

export class AiService {
    async runAi({ feature, code, language = '' }) {
        // Ensure feature is not undefined before sending!
        const response = await api.post('/ai', {
            FeatureType: feature,
            UserInput: code,
            TargetLanguage: language
        });
        return response.data;
    }
}

const aiService = new AiService();
export default aiService;