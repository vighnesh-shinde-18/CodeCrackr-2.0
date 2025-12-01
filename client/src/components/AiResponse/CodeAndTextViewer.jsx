import React from 'react';
import ViewerWrapper from './ViewerWrapper.jsx'; // Ensure path is correct
import CodeOutputBlock from './CodeOutput.jsx'; // Ensure path is correct

// Reusable micro-components for cleaner rendering logic
const SectionTitle = ({ children }) => (
  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{children}</h3>
);

const ContentList = ({ items }) => (
  <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
    {/* Ensure items is an array before mapping */}
    {Array.isArray(items) && items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const ContentParagraph = ({ label, text, boldLabel = true }) => (
  <p className="text-gray-700 dark:text-gray-300">
    {boldLabel ? <strong>{label}:</strong> : <>{label}:</>} {text}
  </p>
);

export default function CodeAndTextViewer({ response }) {
  // Destructure the title and the required 'type' field from the response
  const { title, type, ...data } = response;

  const renderContent = () => {
    switch (type) {
      // --- Code Debug ---
      case 'codeDebug':
        return (
          <>
            <div>
              <SectionTitle>Corrected Code</SectionTitle>
              <CodeOutputBlock code={data.correctedCode} language="javascript" />
            </div>
            <div>
              <SectionTitle>Explanation</SectionTitle>
              <p className="text-gray-700 dark:text-gray-300">{data.explanation}</p>
            </div>
            <div>
              <SectionTitle>Issues Found</SectionTitle>
              <ContentList items={data.issuesFound} />
            </div>
          </>
        );

      // --- Code Generation ---
      case 'codeGeneration':
        return (
          <>
            <div>
              <SectionTitle>Generated Code</SectionTitle>
              <CodeOutputBlock code={data.generatedCode} language="javascript" />
            </div>
            <ContentParagraph label="Explanation" text={data.codeExplanation} />
            <div>
              <SectionTitle>Important Steps</SectionTitle>
              <ContentList items={data.importantSteps} />
            </div>
          </>
        );

      // --- Convert Code ---
      case 'convertCode':
        return (
          <>
            <div>
              <SectionTitle>Converted Code</SectionTitle>
              <CodeOutputBlock code={data.convertedCode} language="javascript" />
            </div>
            <ContentParagraph label="Conversion Notes" text={data.conversionNotes} />
            <div>
              <SectionTitle>Language Tips</SectionTitle>
              <ContentList items={data.languageTips} />
            </div>
          </>
        );

      // --- Explain Code ---
      case 'explainCode':
        return (
          <>
            <ContentParagraph label="Summary" text={data.summary} />
            <ContentParagraph label="Control Flow" text={data.controlFlow} />
            <div>
              <SectionTitle>Line-by-Line Explanation</SectionTitle>
              <ContentList items={data.lineByLineExplanation} />
            </div>
            <div>
              <SectionTitle>Important Functions</SectionTitle>
              <ContentList items={data.importantFunctions} />
            </div>
            <div>
              <SectionTitle>Edge Cases</SectionTitle>
              <ContentList items={data.edgeCases} />
            </div>
          </>
        );

      default:
        // Handle cases where the type is unexpected or missing
        return <p className="text-red-500">Error: Unknown or unsupported viewer type: **{type}**</p>;
    }
  };

  if (!type) {
    return <p className="text-red-500">Error: Response is missing a 'type' field.</p>;
  }

  return (
    <ViewerWrapper title={title}>
      {renderContent()}
    </ViewerWrapper>
  );
}