import api from "./axios.js";

export class CompilerServices {
    
    async compileCode({ sourceCode, language, input = '' }) {
        // Because we use api.post, axios wraps the response in a 'data' object.
        // We return response.data so the component gets the clean JSON object.
        const response = await api.post('/compile', {
            sourceCode, 
            language, 
            input
        }); 
        return response.data;
    }
}

const compilerService = new CompilerServices();
export default compilerService;