import React, { useMemo } from "react";
import CodeAndTextViewer from "./CodeAndTextViewer";
import CodeReviewViewer from "./CodeReviewViewer";
import TestCasesViewer from "./TestCasesViewer";

function AiResponseViewer({ response, featureType, isHistory = false }) {
  
  // 1. Safety Checks
  if (!response) return null;
  if (!featureType) return <ErrorBadge message="Feature type is missing." />;
 
  // 2. Parse Response
  const parsedResponse = useMemo(() => {
    try {
      const data = typeof response === "string" ? JSON.parse(response) : response;
      return { ...data, type: featureType };
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return null;
    }
  }, [response, featureType]);

  if (!parsedResponse) return <ErrorBadge message="Invalid AI response format." />;

  // 3. Render Strategy
  // 🟢 FIX: Matching keys to the slugs in AIFeature.jsx
  const renderContent = () => {
    // Normalize to ensure matching
    
    const type = featureType.toLowerCase().replace("code", "").trim(); 
    // e.g. "debugcode" -> "debug", "debug" -> "debug"
    
    
    switch (type) {
      // Cluster 1: Text + Code Mixed
      case "debug":
      case "generate":
      case "convert":
      case "explain":
        return <CodeAndTextViewer response={parsedResponse} />;

      // Cluster 2: Structured Review Data
      case "review":
        return <CodeReviewViewer response={parsedResponse} />;

      // Cluster 3: Tabular Data
      case "testcases":
        return <TestCasesViewer response={parsedResponse} />;

      default:
        return <ErrorBadge message={`Unknown feature type: ${featureType}`} />;
    }
  };

  return (
      <div className="w-full">
        {renderContent()}
      </div>
  );
}

// Micro-component for errors
const ErrorBadge = ({ message }) => (
  <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
    {message}
  </div>
);

export default AiResponseViewer;