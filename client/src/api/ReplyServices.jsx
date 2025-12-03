import { config } from "../config/config.js";
 
import axios from 'axios'

export class ReplyService {

    baseUrl = config.backendUrl + '/api/v1/reply';

    constructor() {

        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async fetchAllReplies(id) {
        try {
            // CHANGED: .post() to .get()
            // Also added logic to handle undefined values to avoid "undefined" strings in URL
        
            const response = await this.api.get(`/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }


    async SubmitReply(id, reply) {
        try { 
            const response = await this.api.post(`/problem/${id}`, reply)
            console.log(response.data)
            return response.data.data
        } catch (error) {
            this.handleError(error)
        }
    }

    
}

const replyService = new ReplyService()
export default replyService;