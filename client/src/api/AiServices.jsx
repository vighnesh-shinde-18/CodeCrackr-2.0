import { config } from "../config/config";
import axios from 'axios'
export class AiService {

    baseUrl = config.backendUrl + '/api/v1/ai';

    constructor() {
        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async runAi({ feature, code, language = '' }) {
        try {
            const response = await this.api.post('/', {
                FeatureType: feature,
                UserInput: code,
                TargetLanguage: language
            });
 
            return response.data;

        } catch (error) {
         this.handleError(error)
        }
    }

    handleError(error) {
        if (axios.isCancel(error)) {
            throw error; // Let the component handle aborts silently
        }
        if (error.response && error.response.data) {
            console.error("API Error:", error.response.data);
            const serverMessage = error.response.data.message || "Request failed.";
            throw new Error(serverMessage);
        } else if (error.message) {
            console.error("Network Error:", error.message);
            throw new Error(error.message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}

const aiService = new AiService();
export default aiService;