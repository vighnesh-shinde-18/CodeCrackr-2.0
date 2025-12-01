import { config } from "../config/config.js";
import axios from "axios";

export class HistoryService {

    baseUrl = config.backendUrl + '/api/v1/history';

    constructor() {
        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': "application/json"
            },
        });
    }

    // Fixed: Added the body payload { topic, accepted } to the post request
    async UserSolvedProblems({ topic, accepted }) {
        try {
            const response = await this.api.post('/solved-problems', {
                topic,
                accepted
            });
 
            return response.data;

        } catch (error) {
            this.handleError(error)
        }
    }

    async UserAiInteraction(feature) {
        try {
            const response = await this.api.post('/ai-interactions', {
                feature
            });
            console.log("User ai interactions ", response)
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

const historyService = new HistoryService();
export default historyService;