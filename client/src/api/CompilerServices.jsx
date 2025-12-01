import { config } from "../config/config.js";
import axios from 'axios'
import { toast } from "sonner";

export class CompilerServices {
    baseUrl = config.backendUrl + '/api/v1/compile';

    constructor() {
        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    
    async compileCode({ sourceCode, language, input = '' }) {
        try {
            const response = await this.api.post('/', {
                sourceCode, language, input
            }) 
            return response;
        }
        catch (error) {
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

const compilerService = new CompilerServices()
export default compilerService;