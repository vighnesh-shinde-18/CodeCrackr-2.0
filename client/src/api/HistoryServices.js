import api from "./axios.js";

export class HistoryService {

    async UserSolvedProblems({ topic, accepted, page = 1, limit = 10 }) {
        // This one uses POST because your backend likely expects body data for the complex filter
        // (If your backend expects query params here too, you should change this to GET as well)
        const response = await api.post('/history/solved-problems', {
            topic,
            accepted,
            page,
            limit
        });
        return response.data;
    }

    // 🟢 CORRECTED METHOD
    async UserAiInteraction({ filter, page = 1, limit = 10 }) {
        const params = {
            page,
            limit
        };

        // Handle "All" filter logic
        if (filter && filter !== "All") {
            params.featureType = filter; // Backend expects 'featureType'
        }

        // Using GET sends 'params' as ?page=1&limit=10&featureType=Debug
        const response = await api.get('/history/ai-interactions', { params });
        
        return response.data;
    }
}

const historyService = new HistoryService();
export default historyService;