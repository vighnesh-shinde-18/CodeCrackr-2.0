import axios from "axios";
import dotenv from "dotenv";
import asyncHandler from "../utils/asyncHandler.js";
// 🟢 FIX: Load config BEFORE accessing process.env
dotenv.config();

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_KEY; 

const languageMap = {
    "c-gcc-14": 103,
    "cpp-gcc-14": 105,
    "csharp": 51,
    "java-17": 91,
    "go-1.23": 107,
    "javascript-22": 102,
    "php-8": 98,
    "python-3.13": 109,
    "ruby": 72,
    "rust-1.85": 108,
    "sql": 82,
    "swift": 83,
    "typescript-5.6": 101,
};

const CompileCode = asyncHandler(async (req, res) => {
    const { language, sourceCode, input } = req.body;

    // 1. Validation
    if (!languageMap[language]) { 
        // With asyncHandler, you can also throw new ApiError(400, "Msg") if you have that class
        return res.status(400).json({ error: "Language not supported" });
    } 

    // 2. Prepare Data
    const submissionData = {
        source_code: sourceCode,
        language_id: languageMap[language],
        stdin: input || "" 
    }; 

    // 3. Request to Judge0
    const submission = await axios.post(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        submissionData,
        {
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": JUDGE0_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
        }
    ); 

    const result = submission.data;

    // 4. Send Response
    return res.status(200).json({
        output: result.stdout,
        error: result.stderr,
        compileOutput: result.compile_output,
        status: result.status ? result.status.description : null
    }); 
});

export default CompileCode;