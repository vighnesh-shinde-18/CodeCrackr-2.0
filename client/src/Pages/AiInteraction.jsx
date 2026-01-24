"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import aiService from "../api/AiServices.js";
import { useParams } from 'react-router-dom';
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import AiResponseViewer from "../components/AiResponse/AiResponseViewer.jsx";

const TARGET_LANGUAGES = [
    "Python", "JavaScript", "Java", "C++", "C#", 
    "TypeScript", "Go", "Rust", "Swift", "Kotlin", "PHP", "C"
];

function AIFeature() {
    // URL param (e.g., "debug", "generate", "convert")
    const { feature } = useParams(); 
    
    const responseRef = useRef(null);
    const [sourceCode, setSourceCode] = useState("");
    const [language, setLanguage] = useState("");
    const [aiResponse, setAiResponse] = useState(null); 

    // 🟢 FIX 1: Updated keys to match URL slugs (removed 'code' suffix from keys)
    const slugToFeature = useMemo(() => ({
        "debug": ["Debug Code", 'DebugCode'],
        "review": ["Review & Refactor Code", "ReviewCode"],
        "generate": ["Generate Code", "GenerateCode"],
        "convert": ["Convert Code", "ConvertCode"],
        "explain": ["Explain Code", "ExplainCode"],
        "testcases": ["Generate Test Cases", "GenerateTestCases"]
    }), []);

    // Helper to get the Backend Key (e.g. "DebugCode")
    // Safe access using ?. to prevent crashes if feature is invalid
    const featureDetails = slugToFeature[feature?.toLowerCase()];
    const featureKey = featureDetails?.[1];
    const featureTitle = featureDetails?.[0];

    const aiMutation = useMutation({
        mutationFn: (payload) => aiService.runAi(payload),
        onSuccess: (result) => { 
            if (!result.success) {
                toast.error(result.message || "Failed to generate response");
                return;
            }

            setAiResponse(result.data); 
            toast.success("AI Response Generated Successfully");
            
            setTimeout(() => {
                responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        },
        onError: (err) => {
            console.error("❌ Request Error:", err);
            toast.error("Failed to run AI request. Please try again.");
        }
    });

    useEffect(() => {
        setLanguage("");
        setAiResponse(null);
        setSourceCode(""); 
    }, [feature]);

    const handleRunAI = () => {
        // 🟢 FIX 2: Validation to prevent 'undefined' error
        if (!featureKey) {
            toast.error(`Invalid Feature: ${feature}`);
            console.error("Feature key not found for slug:", feature);
            return;
        }

        if (!sourceCode.trim()) {
            toast.warning("Please enter some code first.");
            return;
        }

        // Check if current feature is 'convert' (slug)
        if (feature === 'convert' && !language) {
            toast.warning("Please select a target language.");
            return;
        }
 
        aiMutation.mutate({ 
            feature: featureKey, // Must be string like "DebugCode"
            code: sourceCode, 
            language: language 
        });
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {featureTitle || "AI Feature"}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Use AI to assist to {featureTitle?.toLowerCase()}.
                        </p>
                    </div>

                    <div className="px-4 lg:px-6 mt-6">
                        <div className="border rounded-lg overflow-hidden shadow-lg" style={{ height: "400px" }}>
                            <textarea
                                value={sourceCode}
                                onChange={(e) => setSourceCode(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:ring-0 dark:bg-gray-900 dark:text-gray-200"
                                placeholder="// Write or paste your code here..."
                            />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center my-5">
                            {feature === 'convert' && (
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white cursor-pointer"
                                >
                                    <option value="" disabled>Select Target Language</option>
                                    {TARGET_LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            )}

                            <button
                                onClick={handleRunAI}
                                disabled={aiMutation.isPending}
                                className={`cursor-pointer px-6 py-2 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out flex items-center gap-2 ${
                                    aiMutation.isPending 
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                                    : "bg-black dark:bg-white dark:text-black text-white hover:opacity-90"
                                }`}
                            >
                                {aiMutation.isPending && <Loader2 className="animate-spin h-4 w-4" />}
                                {aiMutation.isPending ? "Generating..." : "Run AI"}
                            </button>
                        </div>
                    </div>
                </div>

                <div ref={responseRef} className="px-4 lg:px-6 pb-10">
                    {aiResponse && (
                         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">AI Response</h2>
                             </div>
                             
                             {/* 🟢 Pass the SLUG (e.g. 'debug') to the viewer */}
                             <AiResponseViewer 
                                isHistory={false} 
                                response={aiResponse.AiOutput} 
                                featureType={feature} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AIFeature;