import { LANGUAGES } from "../config/config.js";
import { useState, useCallback } from "react";
import compilerService from "../api/CompilerServices.jsx";
import { toast } from "sonner";

function CodePlayGround() {
    const [language, setLanguage] = useState(LANGUAGES[0].value);
    const [sourceCode, setSourceCode] = useState("// Write your code here...");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const getOutputBoxColor = (result) => {
        if (result.compileOutput || result.error) {
            return "border-red-500 bg-red-50 dark:bg-red-950";
        } else if (result.status === "Accepted") {
            return "border-green-500 bg-green-50 dark:bg-green-950";
        }
        return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800";
    };

    const runCode = useCallback(async () => {
        setLoading(true);
        setOutput("");

        if (!sourceCode.trim()) {
            setOutput({
                text: "Status: Execution Failed\n\n--- Output ---\nSource code cannot be empty.",
                color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
            });
            setLoading(false);
            return;
        }

        try {
            const result = await compilerService.compileCode({ sourceCode, language, input });

            let finalOutput = "";
            let finalStatus = result.data.status;
            let finalColor = getOutputBoxColor(result);

            // Prioritize error messages over standard output
            if (result.compileOutput) {
                finalOutput = `Compilation Error:\n${result.compileOutput}`;
                finalStatus = "Compilation Error";
                toast.error("Code failed to compile.");
            } else if (result.error) {
                finalOutput = `Runtime Error:\n${result.error}`;
                finalStatus = "Runtime Error";
                toast.error("Code failed due to runtime error.");
            } else {
                finalOutput = result.data.output;
                toast.success("Code executed successfully!");
            }

            setOutput({
                text: `${finalOutput}`,
                color: finalColor
            });

        } catch (error) {
            // Error caught here is the thrown error from the service (server or network message)
            setOutput({
                text: `Execution Failed: ${error.message}`,
                color: "border-red-500 bg-red-50 dark:bg-red-950"
            });
            toast.error("Execution failed: Check console for details.");
        } finally {
            setLoading(false);
        }
    }, [sourceCode, language, input]);


    return (
        <div className="flex flex-1 flex-col px-4 py-6 md:px-6 space-y-6">
            <h1 className="text-2xl font-bold">Code Playground</h1>
            <div>
                <label className="block font-medium mb-1">Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border bg-white dark:bg-gray-900 p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="border rounded-lg overflow-hidden shadow-lg" style={{ height: "400px" }}>
                <textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:ring-0 dark:bg-gray-900 dark:text-gray-200"
                    placeholder="// Start coding here..."
                />
            </div>
            <div>
                <label className="block font-medium mb-1">Custom Input (optional):</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border p-3 rounded-lg w-full h-20 font-mono text-sm dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Enter input if required..."
                />
            </div>
            <div>
                <button
                    onClick={runCode}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out ${loading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                        }`}
                >
                    {loading ? "Running..." : "Run Code"}
                </button>
            </div>
            {output.text && (
                <div className="mt-4">
                    <label className="block font-medium mb-1">Result:</label>
                    <pre
                        className={`border-2 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono ${output.color} dark:text-gray-100 shadow-inner`}
                    >
                        {output.text}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default CodePlayGround;