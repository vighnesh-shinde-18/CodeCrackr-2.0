import React from "react";

// Import the new clustered viewer components
// NOTE: You only import the 3 main content clusters now, plus the Wrapper (if needed elsewhere)
import CodeAndTextViewer from "./CodeAndTextViewer.jsx"; // Merged: Debug, Generate, Convert, Explain
import CodeReviewViewer from "./CodeReviewViewer"; // Dedicated: Review
import TestCasesViewer from "./TestCasesViewer";   // Dedicated: Test Cases

export default function AiResponseViewer({ response, featureType, isHistory = false }) {
  if (!response || Object.keys(response).length === 0) return null;

  if (!featureType) {
    return (
      <div className="p-4 rounded bg-red-100 text-red-700">
        Feature type is missing.
      </div>
    );
  }

  // Ensure 'response' is a JavaScript object before proceeding
  let parsedResponse;
  try {
    parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
  } catch (err) {
    return (
      <div className="mt-4 p-3 rounded bg-red-100 text-red-600 text-sm">
        Invalid AI response format
      </div>
    );
  }

  // Add the feature type to the response object. This is CRUCIAL for
  // CodeAndTextViewer to know what content to render internally.
  const responseWithFeature = { ...parsedResponse, type: featureType };

  const renderViewer = () => {
    switch (featureType) {
      // Cluster 1: CodeAndTextViewer handles these four feature types
      case "debug":
      case "generate":
      case "convert":
      case "explain":
        // Pass the response including the 'type' field
        return <CodeAndTextViewer response={responseWithFeature} />;

      // Cluster 2: CodeReviewViewer is specialized
      case "review":
        return <CodeReviewViewer response={responseWithFeature} />;

      // Cluster 3: TestCasesViewer is specialized (table)
      case "testcases":
        return <TestCasesViewer response={responseWithFeature} />;

      default:
        return (
          <div className="mt-4 p-3 rounded bg-yellow-100 text-yellow-700 text-sm">
            Unknown feature type: **{featureType}**
          </div>
        );
    }
  };

  // History Wrapper logic remains the same
  return isHistory ? (
    <div className="m-6 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Response</h2>
      {renderViewer()}
    </div>
  ) : (
    <>
      {renderViewer()}
    </> 
  );
}