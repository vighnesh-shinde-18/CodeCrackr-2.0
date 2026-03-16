"use client";

import { LANGUAGES } from "../constants/languages.js";
import { useState } from "react";

import { useCompileCode } from "../hooks/Compiler/useCompileCode";

function CodePlayGround() {

  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [sourceCode, setSourceCode] = useState("// Write your code here...");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const compileMutation = useCompileCode(setOutput);

  const runCode = () => {

    setOutput("");

    if (!sourceCode.trim()) {
      setOutput({
        text: "Source code cannot be empty.",
        color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      });
      return;
    }

    compileMutation.mutate({
      sourceCode,
      language,
      input
    });
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-6 md:px-6 space-y-6">

      <h1 className="text-2xl font-bold">Code Playground</h1>

      {/* Language */}

      <div>
        <label className="block font-medium mb-1">Language</label>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2 rounded-md"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Editor */}

      <textarea
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        className="w-full h-[400px] p-4 font-mono border rounded-lg"
      />

      {/* Input */}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Custom input"
        className="border p-3 rounded-lg w-full h-20 font-mono"
      />

      {/* Run Button */}

      <button
        onClick={runCode}
        disabled={compileMutation.isPending}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        {compileMutation.isPending ? "Running..." : "Run Code"}
      </button>

      {/* Output */}

      {output.text && (
        <pre className={`border-2 p-4 rounded-lg ${output.color}`}>
          {output.text}
        </pre>
      )}

    </div>
  );
}

export default CodePlayGround;