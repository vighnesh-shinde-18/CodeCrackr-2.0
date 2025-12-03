import React from 'react';
import ViewerWrapper from './ViewerWrapper';
import CodeOutputBlock from './CodeOutputBlock';

// Reusable UI Helpers
const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2 flex items-center gap-2">
    {children}
  </h3>
);

const ContentList = ({ items }) => {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
};

const ContentParagraph = ({ label, text }) => {
  if (!text) return null;
  return (
    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
      {label && <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">{label}</span>}
      {text}
    </div>
  );
};

export default function CodeAndTextViewer({ response }) {
  // We use the 'type' we injected in the parent component
  const { title, type, ...data } = response;

  const renderBody = () => {
    switch (type) {
      // 🟢 DEBUG
      case 'debug':
        return (
          <>
            <SectionTitle>Explanation & Fixes</SectionTitle>
            <ContentParagraph text={data.explanation} />
            
            <SectionTitle>Issues Found</SectionTitle>
            <ContentList items={data.issuesFound} />

            <SectionTitle>Corrected Code</SectionTitle>
            <CodeOutputBlock code={data.correctedCode || data.code} />
          </>
        );

      // 🟢 GENERATE
      case 'generate':
        return (
          <>
            <ContentParagraph label="Overview" text={data.codeExplanation} />
            
            <SectionTitle>Generated Code</SectionTitle>
            <CodeOutputBlock code={data.generatedCode || data.code} />

            <SectionTitle>Key Steps</SectionTitle>
            <ContentList items={data.importantSteps} />
          </>
        );

      // 🟢 CONVERT
      case 'convert':
        return (
          <>
            <ContentParagraph label="Conversion Notes" text={data.conversionNotes} />
            
            <SectionTitle>Converted Code</SectionTitle>
            <CodeOutputBlock code={data.convertedCode || data.code} />

            <SectionTitle>Language Specific Tips</SectionTitle>
            <ContentList items={data.languageTips} />
          </>
        );

      // 🟢 EXPLAIN
      case 'explain':
        return (
          <>
            <ContentParagraph label="Summary" text={data.summary} />
            
            <div className="grid md:grid-cols-2 gap-4">
               <div>
                 <SectionTitle>Logic Flow</SectionTitle>
                 <ContentParagraph text={data.controlFlow} />
               </div>
               <div>
                 <SectionTitle>Important Functions</SectionTitle>
                 <ContentList items={data.importantFunctions} />
               </div>
            </div>

            <SectionTitle>Line-by-Line Breakdown</SectionTitle>
            <ContentList items={data.lineByLineExplanation} />

            <SectionTitle>Edge Cases</SectionTitle>
            <ContentList items={data.edgeCases} />
          </>
        );

      default:
        return <p className="text-gray-500 italic">No layout definition for type: {type}</p>;
    }
  };

  return (
    <ViewerWrapper title={title || "AI Response"}>
      {renderBody()}
    </ViewerWrapper>
  );
}