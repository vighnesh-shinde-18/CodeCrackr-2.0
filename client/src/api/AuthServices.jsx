
import config from '../config/config.js';
import axios from 'axios';

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

            console.log("Success Response:", response.data);
            return response.data;

        } catch (error) { 
            if (error.response && error.response.data) {
                console.error("API Error Response Data:", error.response.data);

                const serverMessage = error.response.data.message || "Registration failed due to server issue.";
                throw new Error(serverMessage);

            } else if (error.message) { 
                console.error("Network or Unknown Error:", error.message);
                throw new Error(error.message);
            } else { 
                throw new Error("An unexpected error occurred during registration.");
            }
        }
    }
    /**
     * Logs in the user via POST request to the login endpoint.
     */
    async login({ email, password }) {
       try {
            const response = await this.api.post('/login', {
                email,
                password
            });

            console.log("Success Response:", response.data);
            return response.data;

        } catch (error) { 
            if (error.response && error.response.data) {
                console.error("API Error Response Data:", error.response.data);

                const serverMessage = error.response.data.message || "Registration failed due to server issue.";
                throw new Error(serverMessage);

            } else if (error.message) { 
                console.error("Network or Unknown Error:", error.message);
                throw new Error(error.message);
            } else { 
                throw new Error("An unexpected error occurred during registration.");
            }
        }
    }

    /**
     * Fetches the currently authenticated user's details.
     * This relies on the session token (cookie/JWT) being sent with the request.
     */
    async getCurrentUser() {
        try {
            const response = await this.api.get('/current-user');

            // Assuming a successful response contains the user object
            return response.data.user || response.data;
        } catch (error) {
            // Log for debugging but return null for unauthenticated state
            console.log("Custom backend service :: getCurrentUser :: error", error);
            return null;
        }
    }

    /**
     * Invalidates the user's session via POST request to the logout endpoint.
     */
    async logout() {
        try {
            // The backend handles clearing the session/cookie
            await this.api.post('/logout');
            return true; // Indicate successful logout
        } catch (error) {
            console.log("Custom backend service :: logout :: error", error);
            // Even if the request fails, the user is likely logged out,
            // but log the error for diagnostics.
        }
    }
}

const authService = new AuthService();
export default authService;