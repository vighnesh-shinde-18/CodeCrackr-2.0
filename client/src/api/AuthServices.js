import api from './axios.js';

export class AuthService {

    async createAccount({ email, password, username }) {
        const response = await api.post('/auth/register', {
            email,
            password,
            username
        });
        return response.data;
    }

    async login({ email, password }) {
        const response = await api.post('/auth/login', {
            email,
            password
        });
        // Assuming backend returns { data: { user: ... } }
        return response.data;
    }

    async sendOtp({ email }) {
        const response = await api.post('/auth/send-otp', {
            email
        });
        return response.data;
    }

    async resetPassword({ email, newPassword, otp }) {
        const response = await api.post("/auth/reset-password", { 
            email, 
            otp, 
            newPassword 
        });
        return response.data;
    }

    async logout() {
        await api.post('/auth/logout');
        return true;
    }
}

const authService = new AuthService();
export default authService;