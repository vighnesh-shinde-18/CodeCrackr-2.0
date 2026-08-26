import api from "./axios.js";

export class StatsService {

    async getStats() {
        // Path becomes /api/v1/stats/
        const response = await api.get('/stats/');
        return response.data;
    }
}

const statsService = new StatsService();
export default statsService;