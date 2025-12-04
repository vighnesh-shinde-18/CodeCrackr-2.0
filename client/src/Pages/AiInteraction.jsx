import { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import { Button } from '../components/ui/button.jsx' // You can use this if you have a Select component in UI kit
import aiService from "../api/AiServices.jsx";
import { useParams } from 'react-router-dom';
import { toast } from "sonner";

// Define available languages for conversion
const TARGET_LANGUAGES = [
    "Python", "JavaScript", "Java", "C++", "C#", 
    "TypeScript", "Go", "Rust", "Swift", "Kotlin", "PHP",'C'
];

function AIFeature() {
    const { feature } = useParams();

    const [loading, setLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState(null);
    const responseRef = useRef(null);

    const [sourceCode, setSourceCode] = useState("")
    
    // State for the selected language
    const [language, setLanguage] = useState("")

    const slugToFeature = useMemo(() => ({
        debug: ["Debug Code", 'DebugCode'],
        review: ["Review & Refactor Code", "ReviewCode"],
        generate: ["Generate Code", "GenerateCode"],
        convert: ["Convert Code", "ConvertCode"], // Note: Ensure API endpoint matches your backend
        explain: ["Explain Code", "ExplainCode"],
        testcases: ["Generate Test Cases", "GenerateTestCases"]
    }), []);


    useEffect(() => {
        if (aiResponse && responseRef.current) {
            responseRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [aiResponse]);

    // Reset language when switching features
    useEffect(() => {
        setLanguage("");
    }, [feature]);

    const handleRunAI = useCallback(async (featureKey, code, selectedLang) => {
        
        // Basic validation for convert feature
        if (feature === 'convert' && !selectedLang) {
            toast.warning("Please select a target language.");
            return;
        }

        setLoading(true)

        try {
            // Pass the language to the service
            const result = await aiService.runAi({ feature: featureKey, code, language: selectedLang })

            if (!result.data.success) {
                console.error("❌ AI Error:", result.data.message || "Failed to generate AI response");
                return;
            }
            console.log(result)
            setAiResponse(result.data);
            toast.success("AI Response Generate Successfully")
        } catch (err) {
            console.error("❌ Request Error:", err);
        } finally {
            setLoading(false)
        }
    }, [feature]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {slugToFeature[feature]?.[0] || "AI Feature"}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Use AI to assist to {slugToFeature[feature]?.[0]?.toLowerCase()}.
                        </p>
                    </div>

                    <div className="px-4 lg:px-6 mt-6">
                        <div className="border rounded-lg overflow-hidden shadow-lg" style={{ height: "400px" }}>
                            <textarea
                                value={sourceCode}
                                onChange={(e) => setSourceCode(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:ring-0 dark:bg-gray-900 dark:text-gray-200"
                                placeholder="// Write code here..."
                            />
                        </div>
                        
                        {/* Control Bar: Language Select + Button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center my-5">
                            
                            {/* Conditional Rendering: Only show for 'convert' feature */}
                            {feature === 'convert' && (
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Target Language</option>
                                    {TARGET_LANGUAGES.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    handleRunAI(slugToFeature[feature][1], sourceCode, language) 
                                }}
                                disabled={loading}
                                className={`cursor-pointer px-6 py-2 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out dark:bg-white dark:text-black ${
                                    loading 
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                                    : "bg-black text-white hover:bg-gray-700 active:bg-gray-800"
                                }`}
                            >
                                {loading ? "Running..." : "Run AI"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Response Viewer Area (Uncommented for context) */}
                {/* <div ref={responseRef}>
                    {aiResponse && (
                        <div>Response Loaded</div> // Placeholder
                    )}
                </div> */}
            </div>
        </div>
    );
}

export default AIFeature;