import React, { useMemo } from "react";
import CodeAndTextViewer from "./CodeAndTextViewer";
import CodeReviewViewer from "./CodeReviewViewer";
import TestCasesViewer from "./TestCasesViewer";

export default function AiResponseViewer({ response, featureType, isHistory = false }) {
  // 1. Safety Checks
  if (!response) return null;
  if (!featureType) return <ErrorBadge message="Feature type is missing." />;

  // 2. Parse Response Safe Memomization
  const parsedResponse = useMemo(() => {
    try {
      // If it's already an object, return it; otherwise parse string
      const data = typeof response === "string" ? JSON.parse(response) : response;
      // Inject the featureType into the object for the children to use
      return { ...data, type: featureType };
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return null;
    }
  }, [response, featureType]);

  if (!parsedResponse) return <ErrorBadge message="Invalid AI response format." />;

  // 3. Render Strategy
  const renderContent = () => {
    switch (featureType) {
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

  // return isHistory ?
  return (
    <div className="m-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
        AI Analysis
      </h2>
      {renderContent()}
    </div>)
  // ) : (
  //   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  //     {renderContent()}
  //   </div>
  // );
}

// Micro-component for errors
const ErrorBadge = ({ message }) => (
  <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
    {message}
  </div>
);