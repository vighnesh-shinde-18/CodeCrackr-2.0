import api from "./axios.js";

export class ProblemService {

    async uploadProblem({ title, description, topics, testCases }) {
        // Preserving your data formatting logic
        let processedTopics = [];

        if (Array.isArray(topics)) {
            // It's already an array, just use it
            processedTopics = topics;
        } else {
            // It's a string, safely split it
            // String() prevents crash if topics is null/undefined
            processedTopics = String(topics || "").split(",");
        }

        // 🟢 FIX 2: Corrected .map() syntax
        // OLD (Broken): .map((t) => { t.trim(); }) -> Returns undefined
        // NEW (Working): .map((t) => t.trim().toLowerCase()) -> Returns the string

        const finalTopics = processedTopics
            .map((t) => t.trim().toLowerCase()) // Implicit return
            .filter((t) => t !== ""); // Remove empty strings

        const payload = {
            title: title.trim(),
            description: description.trim(),
            topics: finalTopics,
            testCases: testCases,
        };

        const response = await api.post("/problem/upload", payload);
        return response.data;
    }

    async fetchAllTopics() {
        const response = await api.get("/problem/topics");
        return response.data.data;
    }

    // src/api/ProblemServices.js

    // ... inside the class
    async fetchAllProblmes({ search, topic, status, page = 1, limit = 10 }) {
        const params = {
            page,   // Send page number
            limit,  // Send limit
        };

        if (search) params.search = search;
        if (topic && topic.toLowerCase() !== "all") params.topic = topic;

        if (status && status.toLowerCase() !== "all") params.status = status.toLowerCase();

        const response = await api.get("/problem/", { params });
        return response.data;
    }
    // 🟢 NEW SERVICE: Get User Uploaded Problems (POST request)
    async fetchUserUploadProblem({ topicFilter = "all", page = 1, limit = 10 }) {
        // 1. Prepare Query Params (Page & Limit) -> goes to req.query
        const params = {
            page,
            limit
        };

        // 2. Prepare Body (Topic) -> goes to req.body
        const body = {};
        const isAll = !topicFilter || topicFilter.toLowerCase() === "all";

        if (!isAll) {
            body.topic = topicFilter;
        }

        // 3. Send Request: api.post(url, body, config)
        // Notice that 'params' must be inside the 3rd argument object
        const response = await api.post("/problem/user-uploads", body, { params });

        return response.data;
    }

    async fecthProblemDetails(id) {
        const response = await api.get(`/problem/${id}`);
        return response.data;
    }

    async toggleReportProblem(id) {
        const response = await api.patch(`/problem/${id}`);
        return response.data;
    }

    async deleteProblem(id) {
        const response = await api.delete(`/problem/${id}`);
        return response.data;
    }
}

const problemService = new ProblemService();
export default problemService;