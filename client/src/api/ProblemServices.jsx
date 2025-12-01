import { config } from "../config/config.js";
import axios from 'axios'
import { toast } from "sonner";

export class ProblemService {

    baseUrl = config.backendUrl + '/api/v1/problem';

    constructor() {

        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async uploadProblem({ title, description, topics, testCases }) {
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                topics: topics
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                testCases: testCases,
            };
            const response = await this.api.post("/upload",
                payload
            )
            return response.data;
        } catch (error) {
              this.handleError(error)
        }
    }

    async fetchUserUploadProblem({ topic }) {
        topic = (topic === "all" ? null : topic)

        try {
            const response = await this.api.post("/user-uploads",
                { topic }
            )
 
            return response.data.data;
        } catch (error) {
              this.handleError(error)
        }

    }

    async fetchAllProblmes() {
        try {
            const response = await this.api.get("/")
 return response.data
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

const problemService = new ProblemService()
export default problemService;