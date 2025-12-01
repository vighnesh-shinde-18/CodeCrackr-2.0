
import { config } from '../config/config.js';
import axios from 'axios';
import { toast } from 'sonner';
export class AuthService {

    baseUrl = config.backendUrl + '/api/v1/auth';

    constructor() {
        // You might set up an axios instance with headers here if needed
        this.api = axios.create({
            baseURL: this.baseUrl,
            withCredentials: true, // Important for sending cookies/session tokens
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }


    async createAccount({ email, password, username }) {
        try {
            const response = await this.api.post('/register', {
                email,
                password,
                username
            });
 
            return response.data;

        } catch (error) {
            this.handleError(error);
        }
    }

    async login({ email, password }) {
        try {
            const response = await this.api.post('/login', {
                email,
                password
            });
 
            return response.data.data.user;

        } catch (error) {
            this.handleError(error);
        }
    }

    async sendOtp({ email }) {
        try {
            const response = await this.api.post('/send-otp', {
                email
            });
 
            return response.message;

        } catch (error) {
            this.handleError(error);
        }
    }
    async resetPassword({ email, newPassword, otp }) {
        try {

            const response = await this.api.post("/reset-password",
                { email, otp, newPassword }
            );
 
            return response.message;
        } catch (error) {
            this.handleError(error);
        }
    }


    /**
     * Invalidates the user's session via POST request to the logout endpoint.
     */
    async logout() {
        try {
            await this.api.post('/logout');


            return true;
        } catch (error) {
            this.handleError(error);
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
const authService = new AuthService();
export default authService;