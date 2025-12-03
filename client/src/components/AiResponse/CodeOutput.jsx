import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Check, Copy } from "lucide-react";

// Internal Copy Button Component
const CopyBtn = ({ content }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600 text-gray-300 transition-all flex items-center gap-1.5 text-xs font-medium border border-gray-600"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function CodeOutputBlock({ code = "", language = "javascript", height = "350px" }) {
  return (
    <div className="relative group my-4 border rounded-lg overflow-hidden shadow-md dark:border-gray-700 bg-[#1e1e1e]">
      {/* Header / Actions Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
        <CopyBtn content={code} />
      </div>

      {/* Editor */}
      <Editor
        height={height}
        defaultLanguage={language}
        value={code || "// No code provided"}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "none",
          padding: { top: 16 },
          fontFamily: "'Fira Code', 'Consolas', monospace"
        }}
      />
    </div>
  );
}