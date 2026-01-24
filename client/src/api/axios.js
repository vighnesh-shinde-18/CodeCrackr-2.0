// src/api/axios.js
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    withCredentials: true, 
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 🔐 RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 1. Handle Request Cancellation (if you use AbortController)
        if (axios.isCancel(error)) {
            return Promise.reject(error); // Silently fail
        }

        // 2. Define the Error Message (Logic from your old handleError)
        let errorMessage = "An unexpected error occurred.";

        if (error.response) {
            // Server responded with a status code outside 2xx
            const status = error.response.status;
            
            // Extract the message from backend (e.g., { message: "Invalid Password" })
            if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }

            // Auto logout on 401
            if (status === 401) {
                localStorage.removeItem("user");
                window.location.href = "/login";
            }
        } else if (error.request) {
            // Request was made but no response received (Network Error)
            errorMessage = "Network Error: Unable to reach the server.";
        } else {
            // Something happened in setting up the request
            errorMessage = error.message;
        }

        console.error("API Error:", errorMessage);

        // 3. Reject with a clean Error object
        // This allows your UI to just do: catch (err) { toast.error(err.message) }
        return Promise.reject(new Error(errorMessage));
    }
);

export default api;