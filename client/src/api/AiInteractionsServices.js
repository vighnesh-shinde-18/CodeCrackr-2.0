import api from "./axios.js";

export class AiInteractionService {
    
    // Base path for this service relative to the global API URL
    // Global API: .../api/v1
    // This Service: .../api/v1/ai-interactions
    
    async getInteractionById(id) {
        // No try/catch needed - the interceptor handles errors!
        const response = await api.get(`/aiInteractions/${id}`);
        return response.data;
    }

    async deleteInteractionById(id) {
        const response = await api.delete(`/aiInteractions/${id}`);
        console.log("Interaction deleted:", response);
        return response.data;
    }

    async deleteAllInteractions() {
        const response = await api.delete('/aiInteractions/');
        console.log("All interactions deleted:", response);
        return response.data;
    }
}

const aiInteractionService = new AiInteractionService();
export default aiInteractionService;