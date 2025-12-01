import React from 'react';
import ViewerWrapper from './ViewerWrapper.jsx';
import CodeOutputBlock from './CodeOutput.jsx';

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
    oldTimeComplexity,
    newTimeComplexity,
    oldSpaceComplexity,
    newSpaceComplexity,
  } = response;

  return (
    <ViewerWrapper title={title}>
      <p className="text-gray-700 dark:text-gray-300"><strong>Summary:</strong> {reviewSummary}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Performance Issues:</strong> {performanceIssues}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Readability Suggestions:</strong> {readabilitySuggestions}</p>
      <p className="text-gray-700 dark:text-gray-300"><strong>Optimization Suggestions:</strong> {optimizationSuggestions}</p>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Best Practices</h3>
        <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
          {Array.isArray(bestPractices) && bestPractices.map((tip, idx) => <li key={idx}>{tip}</li>)}
        </ul>
      </div>

      <p className="text-gray-700 dark:text-gray-300"><strong>Code Rating:</strong> {codeRating}/10</p>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Old Code</h3>
        <CodeOutputBlock code={oldCode} language="javascript" />
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Optimized Code</h3>
        <CodeOutputBlock code={optimizedCode} language="javascript" />
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Old Time Complexity:</strong> {oldTimeComplexity}</p>
        <p><strong>New Time Complexity:</strong> {newTimeComplexity}</p>
        <p><strong>Old Space Complexity:</strong> {oldSpaceComplexity}</p>
        <p><strong>New Space Complexity:</strong> {newSpaceComplexity}</p>
      </div>
    </ViewerWrapper>
  );
}