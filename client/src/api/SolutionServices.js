import api from "./axios.js";

export class SolutionService {

    async fetchAllSolutions(id, { accepted, submittedByMe }) {
        const queryParams = new URLSearchParams();
        
        if (accepted !== undefined) {
            queryParams.append("accepted", accepted);
        }
        if (submittedByMe !== undefined) {
            queryParams.append("submittedByMe", submittedByMe);
        }

        const response = await api.get(`/solution/problem/${id}?${queryParams.toString()}`);
        return response.data;
    }

    async fetchSolutionDetails(id) {
        const response = await api.get(`/solution/${id}`);
        return response.data;
    }

    async SubmitSolution(id, { code, explanation, language }) {
        const payload = { code, explanation, language };
        const response = await api.post(`/solution/problem/${id}`, payload);
        return response.data;
    }

    async toggleSolutionAccept(id) {
        const response = await api.patch(`/solution/accept/${id}`);
        return response.data;
    }

    /** ------------------------- NEW METHODS ------------------------- **/

    // 👍 Toggle Like
    async toggleLike(solutionId) {
        const response = await api.patch(`/solution/${solutionId}/like`);
        return response.data; // { likesCount, liked }
    }

    // 🚩 Toggle Report
    async toggleReport(solutionId) {
        const response = await api.patch(`/solution/${solutionId}/report`);
        return response.data; // { reportCount, reported }
    }

    /** ---------------------------------------------------------------- **/

    async deleteSolution(id) {
        const response = await api.delete(`/solution/${id}`);
        return response.data;
    }
}

const solutionService = new SolutionService();
export default solutionService;