import React from 'react';
import ViewerWrapper from './ViewerWrapper.jsx';

export default function TestCasesViewer({ response }) {
  const { title, testCases } = response;

  return (
    <ViewerWrapper title={title}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <th className="border p-2 dark:border-gray-600">Description</th>
              <th className="border p-2 dark:border-gray-600">Input</th>
              <th className="border p-2 dark:border-gray-600">Expected Output</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(testCases) && testCases.map((tc, idx) => (
              <tr key={idx} className="border-t dark:border-gray-700">
                <td className="border px-2 py-1 dark:border-gray-700 text-gray-700 dark:text-gray-300">{tc.description}</td>
                <td className="border px-2 py-1 whitespace-pre-wrap dark:border-gray-700 text-gray-700 dark:text-gray-300">{tc.input}</td>
                <td className="border px-2 py-1 whitespace-pre-wrap dark:border-gray-700 text-gray-700 dark:text-gray-300">{tc.expectedOutput}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ViewerWrapper>
  );
}