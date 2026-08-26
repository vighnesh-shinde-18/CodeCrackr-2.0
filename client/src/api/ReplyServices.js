import api from "./axios.js";

export class ReplyService {

    async fetchAllReplies(id) {
        // Base API is /api/v1, so we append /reply
        const response = await api.get(`/reply/solution/${id}`);
         
        return response.data;
    }

    async SubmitReply(id, reply) {
        const response = await api.post(`/reply/solution/${id}`, reply);
        
        return response.data;
    }
}

const replyService = new ReplyService();
export default replyService;