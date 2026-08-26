"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useRunAI } from "../hooks/AI/useRunAI";

import AiResponseViewer from "../components/AiResponse/AiResponseViewer.jsx";

const TARGET_LANGUAGES = [
  "Python","JavaScript","Java","C++","C#",
  "TypeScript","Go","Rust","Swift","Kotlin","PHP","C"
];

function AIFeature() {

  const { feature } = useParams();

  const responseRef = useRef(null);

  const [sourceCode, setSourceCode] = useState("");
  const [language, setLanguage] = useState("");
  const [aiResponse, setAiResponse] = useState(null);

  const slugToFeature = useMemo(() => ({
    debug: ["Debug Code","DebugCode"],
    review: ["Review Code","ReviewCode"],
    generate: ["Generate Code","GenerateCode"],
    convert: ["Convert Code","ConvertCode"],
    explain: ["Explain Code","ExplainCode"],
    testcases: ["Generate Test Cases","GenerateTestCases"]
  }), []);

  const featureDetails = slugToFeature[feature?.toLowerCase()];
  const featureKey = featureDetails?.[1];
  const featureTitle = featureDetails?.[0];

  const aiMutation = useRunAI(setAiResponse, responseRef);

  useEffect(() => {
    setLanguage("");
    setAiResponse(null);
    setSourceCode("");
  }, [feature]);

  const handleRunAI = () => {

    if (!featureKey) return;

    if (!sourceCode.trim()) return;

    if (feature === "convert" && !language) return;

    aiMutation.mutate({
      feature: featureKey,
      code: sourceCode,
      language
    });

  };

  return (
    <div className="px-6 py-6 space-y-6">

      <h1 className="text-2xl font-bold">
        {featureTitle}
      </h1>

      <textarea
        value={sourceCode}
        onChange={(e)=>setSourceCode(e.target.value)}
        className="w-full h-[400px] border rounded-lg p-4 font-mono"
      />

      {feature === "convert" && (
        <select
          value={language}
          onChange={(e)=>setLanguage(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">Target Language</option>
          {TARGET_LANGUAGES.map((l)=>(
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      )}

      <button
        onClick={handleRunAI}
        disabled={aiMutation.isPending}
        className="px-6 py-2 bg-black text-white rounded-lg flex gap-2 items-center"
      >
        {aiMutation.isPending && <Loader2 className="animate-spin h-4 w-4"/>}
        {aiMutation.isPending ? "Generating..." : "Run AI"}
      </button>

      <div ref={responseRef}>
        {aiResponse && (
          <AiResponseViewer
            isHistory={false}
            response={aiResponse.AiOutput}
            featureType={feature}
          />
        )}
      </div>

    </div>
  );
}

export default AIFeature;