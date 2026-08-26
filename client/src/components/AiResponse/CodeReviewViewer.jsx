import React from 'react';
import ViewerWrapper from './ViewerWrapper';
import CodeOutputBlock from './CodeOutputBlock.jsx';

// Helper to handle Array or String content safely
const InfoItem = ({ label, content }) => {
  if (!content) return null;
  return (
    <div className="mb-3">
      <strong className="text-gray-900 dark:text-gray-100 block text-sm mb-1">{label}:</strong>
      {Array.isArray(content) ? (
        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 text-sm">
          {content.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 text-sm">{content}</p>
      )}
    </div>
  );
};

export default function CodeReviewViewer({ response }) {
  const {
    title,
    reviewSummary,
    performanceIssues,
    readabilitySuggestions,
    optimizationSuggestions,
    bestPractices,
    codeRating,
    oldCode,
    optimizedCode,
    // Complexity fields might be strings or objects, handle gracefully
    oldTimeComplexity,
    newTimeComplexity,
  } = response;

  return (
    <ViewerWrapper title={title || "Code Review"}>
      
      {/* 1. Rating Badge */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
        <span className="font-semibold text-blue-900 dark:text-blue-100">Quality Score</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{codeRating || "?"}/10</span>
      </div>

      {/* 2. Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
           <InfoItem label="Summary" content={reviewSummary} />
           <InfoItem label="Performance" content={performanceIssues} />
        </div>
        <div>
           <InfoItem label="Readability" content={readabilitySuggestions} />
           <InfoItem label="Optimization" content={optimizationSuggestions} />
        </div>
      </div>

      {/* 3. Code Comparison */}
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div>
          <h4 className="font-semibold mb-2 text-red-500 text-sm">Original Code</h4>
          <CodeOutputBlock code={oldCode} height="300px" />
          <p className="text-xs text-gray-500 mt-1">Time: {oldTimeComplexity}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-green-500 text-sm">Optimized Code</h4>
          <CodeOutputBlock code={optimizedCode} height="300px" />
          <p className="text-xs text-gray-500 mt-1">Time: {newTimeComplexity}</p>
        </div>
      </div>

      {/* 4. Best Practices */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
        <InfoItem label="Best Practices & Tips" content={bestPractices} />
      </div>

    </ViewerWrapper>
  );
}