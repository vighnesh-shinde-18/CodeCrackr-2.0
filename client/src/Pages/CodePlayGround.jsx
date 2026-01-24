"use client";

import { LANGUAGES } from "../config/config.js";
import { useState } from "react";
import compilerService from "../api/CompilerServices.js";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query"; 

function CodePlayGround() {
    const [language, setLanguage] = useState(LANGUAGES[0].value);
    const [sourceCode, setSourceCode] = useState("// Write your code here...");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState(""); 

    const getOutputBoxColor = (result) => {
        if (result.compileOutput || result.error) {
            return "border-red-500 bg-red-50 dark:bg-red-950";
        } else if (result.status === "Accepted") {
            return "border-green-500 bg-green-50 dark:bg-green-950";
        }
        return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800";
    };

    // 🟢 MUTATION: Run Code
    const compileMutation = useMutation({
        mutationFn: (payload) => compilerService.compileCode(payload),
        onSuccess: (result) => {
            // result is exactly what you saw in Postman: { output: "21\n", status: "Accepted", ... }
            
            let finalOutput = "";
            let finalColor = getOutputBoxColor(result);

            if (result.compileOutput) {
                finalOutput = `Compilation Error:\n${result.compileOutput}`;
                toast.error("Code failed to compile.");
            } else if (result.error) {
                finalOutput = `Runtime Error:\n${result.error}`;
                toast.error("Code failed due to runtime error.");
            } else {
                // 🟢 FIX: Access output directly (removed .data)
                finalOutput = result.output || "No output returned.";
                toast.success("Code executed successfully!");
            }

            setOutput({
                text: finalOutput,
                color: finalColor
            });
        },
        onError: (error) => {
            setOutput({
                text: `Execution Failed: ${error.message}`,
                color: "border-red-500 bg-red-50 dark:bg-red-950"
            });
            toast.error("Execution failed: Check console for details.");
        }
    });

    const runCode = () => {
        setOutput("");
        if (!sourceCode.trim()) {
            setOutput({
                text: "Status: Execution Failed\n\n--- Output ---\nSource code cannot be empty.",
                color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
            });
            return;
        }
        // Mutation payload
        compileMutation.mutate({ sourceCode, language, input });
    };

    return (
        <div className="flex flex-1 flex-col px-4 py-6 md:px-6 space-y-6">
            <h1 className="text-2xl font-bold">Code Playground</h1>
            <div>
                <label className="block font-medium mb-1">Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border bg-white dark:bg-gray-900 p-2 rounded-md shadow-sm"
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
                    disabled={compileMutation.isPending}
                    className={`px-6 py-2 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out ${
                        compileMutation.isPending 
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                    }`}
                >
                    {compileMutation.isPending ? "Running..." : "Run Code"}
                </button>
            </div>
            
            {output.text && (
                <div className="mt-4">
                    <label className="block font-medium mb-1">Result:</label>
                    <pre className={`border-2 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono ${output.color} dark:text-gray-100 shadow-inner`}>
                        {output.text}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default CodePlayGround;