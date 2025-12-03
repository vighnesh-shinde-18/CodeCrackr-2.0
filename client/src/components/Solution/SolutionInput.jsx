"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react"; 
import solutionService from "../../api/SolutionServices.jsx"; 
import replyService from "../../api/ReplyServices.jsx"; // 👈 Import Reply Service

function useMonacoTheme() {
  const [theme, setTheme] = useState("vs");

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "vs-dark" : "vs");
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export default function SolutionInput({
  showEditor,
  selectedSolution,
  isUploader, 
  handleAcceptSolution, 
  fetchSolutions,
  problemId,
}) {
  const theme = useMonacoTheme();
  
  // LocalStorage Check
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
     return typeof window !== "undefined" ? localStorage.getItem("email") || "" : "";
  });

  // Form State
  const [code, setCode] = useState("// Write your solution...");
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  // Reply State
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false); // Added separate loading state for reply

  const languageOptions = useMemo(
    () => [
      "cpp", "python", "java", "c", "go", "javascript", "kotlin",
      "php", "r", "rust", "scala", "sql", "swift", "typescript", "csharp"
    ],
    []
  );

  // Reset form when showing editor
  useEffect(() => {
    if (showEditor) {
      setCode("// Write your solution...");
      setExplanation("");
      setLanguage("javascript");
    }
  }, [showEditor]);

  // 🔹 FETCH REPLIES when a solution is selected
  useEffect(() => {
    const loadReplies = async () => {
        // If we have a selected solution, fetch its replies
        if (selectedSolution && (selectedSolution.id || selectedSolution._id)) {
            try {
                const solutionId = selectedSolution.id || selectedSolution._id;
                const response = await replyService.fetchAllReplies(solutionId);
                
                // Assuming backend returns { data: [...] }
                if(response && response.data) {
                    setReplies(response.data);
                } else {
                    setReplies([]);
                }
            } catch (error) {
                console.error("Failed to load replies:", error);
                setReplies([]); 
            }
        } else {
            setReplies([]);
        }
    };

    loadReplies();
  }, [selectedSolution]);

  // 🔹 SUBMIT NEW SOLUTION
  const handleSubmit = useCallback(async () => {
    if (!code.trim() || !explanation.trim()) {
      toast.warning("Please enter both code and explanation.");
      return;
    }

    setIsSubmitting(true);
    try {
      await solutionService.SubmitSolution(problemId, { code, explanation, language });
      
      toast.success("Solution submitted successfully!");
      fetchSolutions(); 
      
      // Reset fields
      setCode("// Write your solution...");
      setExplanation("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, explanation, language, problemId, fetchSolutions]);

  // 🔹 POST REPLY (Real API Integration)
  const handlePostReply = useCallback(async () => {
    if (!replyText.trim()) {
      toast.warning("Please enter your reply.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const solutionId = selectedSolution.id || selectedSolution._id;
      
      // Call Service
      const newReply = await replyService.SubmitReply(solutionId, { reply: replyText });

      // Update UI: Append new reply to list
      // Note: We check if newReply has 'replier' populated. 
      // If the backend returns just ID, we might need to manually add username for optimistic UI.
      
      setReplies(prev => [newReply, ...prev]); // Add to top
      setReplyText("");
      toast.success("Reply posted.");
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  }, [replyText, selectedSolution]);


  // 🔹 ACCEPT / UNACCEPT SOLUTION
  const handleToggleAccept = useCallback(async () => {
    try {
        await solutionService.toggleSolutionAccept(selectedSolution.id || selectedSolution._id);
        toast.success("Solution status updated.");
        handleAcceptSolution(); 
    } catch (err) {
        console.error(err);
    }
  }, [selectedSolution, handleAcceptSolution]);

  // 🔹 DELETE SOLUTION 
  const handleDeleteSolution = useCallback(async () => {
    if(!window.confirm("Delete this solution?")) return;
    try {
      await solutionService.deleteSolution(selectedSolution.id || selectedSolution._id);
      toast.success("Solution deleted.");
      fetchSolutions(); 
    } catch (err) {
      console.error(err);
    }
  }, [selectedSolution, fetchSolutions]);


  // 🔹 RENDER: VIEW SOLUTION MODE
  if (selectedSolution && !showEditor) {
    return (
      <div className="space-y-4 border p-4 rounded-md bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {selectedSolution.username || selectedSolution.uploaderName || "User"}'s Solution
          </h3>
          {selectedSolution.accepted && (
            <span className="text-green-600 flex items-center gap-1 font-medium bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm">
              <CheckCircle2 className="size-4" /> Accepted
            </span>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden h-[300px]">
            <Editor
                height="100%"
                language={selectedSolution.language || "javascript"}
                theme={theme}
                value={selectedSolution.code}
                options={{ readOnly: true, minimap: { enabled: false } }}
            />
        </div>

        <div className="p-4 rounded-md border bg-gray-50 dark:bg-zinc-800 text-sm">
          <strong>Explanation:</strong>
          <p className="mt-2 whitespace-pre-wrap">{selectedSolution.explanation || selectedSolution.description}</p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-4">
            {isUploader && (
                <Button 
                    onClick={handleToggleAccept} 
                    className={`flex-1 gap-2 font-semibold text-white ${
                        selectedSolution.accepted ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {selectedSolution.accepted ? (
                        <><X className="w-4 h-4" /> Unaccept</>
                    ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Mark as Accepted</>
                    )}
                </Button>
            )}

             <Button onClick={handleDeleteSolution} variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
             </Button>
        </div>

        {/* REPLIES SECTION */}
        <div className="mt-6 border-t pt-4">
           <div className="flex justify-between items-center mb-3">
             <h4 className="text-sm text-muted-foreground font-medium flex items-center gap-2">
               <MessageCircle className="w-4 h-4" /> Discussion ({replies.length})
             </h4>
           </div>

           {/* Reply Input */}
           <div className="flex flex-col gap-2 mb-4">
             <textarea
               rows="2"
               className="w-full p-2 border rounded-md text-sm bg-background"
               placeholder="Ask a question or provide feedback..."
               value={replyText}
               onChange={(e) => setReplyText(e.target.value)}
             />
             <Button 
               size="sm" 
               onClick={handlePostReply} 
               disabled={isSubmittingReply}
               className="self-end"
             >
               {isSubmittingReply ? "Posting..." : "Post Reply"}
             </Button>
           </div>
          
           {/* Replies List */}
           <div className="space-y-3 max-h-60 overflow-y-auto">
             {replies.length === 0 && <p className="text-xs text-gray-400">No replies yet. Be the first!</p>}
             
             {replies.map((r, i) => (
                <div key={r.id || r._id || i} className="border p-3 rounded bg-gray-50 dark:bg-zinc-800 text-sm">
                    <div className="flex justify-between mb-1">
                        {/* Check if replier is populated object or just ID/string */}
                        <span className="font-bold text-blue-600">
                           {r.replier?.username || r.username || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                           {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </span>
                    </div>
                    <p>{r.reply}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // 🔹 DEFAULT RETURN: EDITOR MODE
  return (
    <div className="space-y-4 border p-4 rounded-md bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-lg font-semibold">Your Solution</h3>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Choose Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-2 py-1 rounded bg-white text-black dark:bg-zinc-800 dark:text-white text-sm"
        >
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm h-[400px]">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={(val) => setCode(val)}
          options={{ minimap: { enabled: false } }}
        />
      </div>

      <textarea
        rows="4"
        className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:text-white"
        placeholder="Explain your approach (Time/Space Complexity)..."
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      />

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Solution"}
      </Button>
    </div>
  );
}