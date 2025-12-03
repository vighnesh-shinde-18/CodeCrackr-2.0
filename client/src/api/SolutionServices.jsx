import { config } from "../config/config.js";
 
import axios from 'axios'

export class SolutionService {

    baseUrl = config.backendUrl + '/api/v1/solution';

    constructor() {

        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async fetchAllSolutions(id, { accepted, submittedByMe }) {
        try {
            // CHANGED: .post() to .get()
            // Also added logic to handle undefined values to avoid "undefined" strings in URL
            const queryParams = new URLSearchParams();
            if (accepted !== undefined) queryParams.append("accepted", accepted);
            if (submittedByMe !== undefined) queryParams.append("submittedByMe", submittedByMe);

            const response = await this.api.get(`/problem/${id}?${queryParams.toString()}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async fetchSolutionDetails(id) {
        try {
            const response = await this.api.post(`/${id}`)

            return response.data.data;
        } catch (error) {
            this.handleError(error)
        }

    }

    async SubmitSolution(id, { code, explanation, language }) {
        try {
            const payload = {
                code, explanation, language
            }
            const response = await this.api.post(`/problem/${id}`, payload)
            console.log(response.data)
            return response.data.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async toggleSolutionAccept(id) {
        try {
            const response = await this.api.patch(`accept/${id}`)
            console.log(response.data)
            return response.data;
        } catch (error) {
            this.handleError(error)
        }
    }

    async toggleSolutionInteraction(id, action) {
        try {
            const response = await this.api.patch(`/toggle/${id}?action=${action}`)
            console.log(response.data)
            return response.data.data
        } catch (error) {
            this.handleError(error)
        }
    }

    async deleteSolution(id) {
        try {
            const response = await this.api.delete(`/${id}`)
            console.log(response.data)
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

const solutionService = new SolutionService()
export default solutionService;