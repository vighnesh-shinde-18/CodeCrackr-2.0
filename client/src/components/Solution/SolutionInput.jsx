"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import solutionService from "../../api/SolutionServices.js";
import replyService from "../../api/ReplyServices.js";

// 🟢 1. Import React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  problemId,
}) {
  const theme = useMonacoTheme();
  const queryClient = useQueryClient();

  // Form State
  const [code, setCode] = useState("// Write your solution...");
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [replyText, setReplyText] = useState("");

  const languageOptions = useMemo(
    () => ["cpp", "python", "java", "c", "go", "javascript", "typescript", "c#", "php", "rust"],
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

  // Handle ID consistency (MongoDB _id vs id)
  const solutionId = selectedSolution?.id || selectedSolution?._id;

  // 🟢 2. QUERY: Fetch Specific Solution Details (NEW)
  // This fetches the full details (code, full explanation) when viewing a solution
  const { data: solutionDetails, isLoading: isSolutionLoading } = useQuery({
    queryKey: ["solution-details", solutionId],
    queryFn: () => solutionService.fetchSolutionDetails(solutionId),
    enabled: !!solutionId && !showEditor, // Only fetch if we have an ID and we are NOT in editor mode
    staleTime: 1000 * 60 * 5, // 5 Minutes
  });

  // Determine which data to show: The fetched detailed data OR the initial prop data
 

  // 🟢 3. QUERY: Fetch Replies
  const { data: replies = [] } = useQuery({
    queryKey: ["replies", solutionId],
    queryFn: async () => {
        if (!solutionId) return [];
        const res = await replyService.fetchAllReplies(solutionId);
        return res?.data || [];
    },
    enabled: !!solutionId && !showEditor,
    staleTime: 1000 * 30,
  });

  console.log("replies ",replies)
  // 🟢 4. MUTATION: Submit Solution
  const submitSolutionMutation = useMutation({
    mutationFn: (payload) => solutionService.SubmitSolution(problemId, payload),
    onSuccess: () => {
      toast.success("Solution submitted successfully!");
      queryClient.invalidateQueries(["solutions", problemId]);
      setCode("// Write your solution...");
      setExplanation("");
    },
    onError: () => toast.error("Failed to submit solution")
  });

  // 🟢 5. MUTATION: Post Reply
  const replyMutation = useMutation({
    mutationFn: (payload) => replyService.SubmitReply(solutionId, payload),
    onSuccess: () => {
      toast.success("Reply posted.");
      setReplyText("");
      queryClient.invalidateQueries(["replies", solutionId]);
      queryClient.invalidateQueries(["solutions", problemId]); 
    },
    onError: () => toast.error("Failed to post reply")
  });

  // 🟢 6. MUTATION: Accept/Unaccept
  const toggleAcceptMutation = useMutation({
    mutationFn: (id) => solutionService.toggleSolutionAccept(id),
    onSuccess: (data) => {
        const isAccepted = data?.accepted; 
        toast.success(isAccepted ? "Marked as Accepted" : "Unaccepted");
        // Invalidate both the list and the specific detail view
        queryClient.invalidateQueries(["solutions", problemId]);
        queryClient.invalidateQueries(["solution-details", solutionId]);
    },
    onError: () => toast.error("Failed to update status")
  });

  // 🟢 7. MUTATION: Delete Solution
  const deleteSolutionMutation = useMutation({
    mutationFn: (id) => solutionService.deleteSolution(id),
    onSuccess: () => {
        toast.success("Solution deleted.");
        queryClient.invalidateQueries(["solutions", problemId]);
        // Parent component should ideally handle switching back to editor mode here
        // forcing a reload for now, but better to use a callback prop like `onDeleteSuccess`
        window.location.reload(); 
    },
    onError: () => toast.error("Failed to delete solution")
  });

  const handleSubmit = () => {
    if (!code.trim() || !explanation.trim()) {
      toast.warning("Please enter both code and explanation.");
      return;
    }
    submitSolutionMutation.mutate({ code, explanation, language });
  };

  const handlePostReply = () => {
    if (!replyText.trim()) return toast.warning("Please enter your reply.");
    replyMutation.mutate({ reply: replyText });
  };

  const handleToggleAccept = () => {
    toggleAcceptMutation.mutate(solutionId);
  };

  const handleDeleteSolution = () => {
    if (confirm("Delete this solution?")) {
        deleteSolutionMutation.mutate(solutionId);
    }
  };
 
  // 🔹 RENDER: VIEW SOLUTION MODE
  if (selectedSolution && !showEditor) {
    
    // Show a small loader if fetching full details
    if (isSolutionLoading) {
        return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
      <div className="space-y-4 border p-4 rounded-md bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {/* Use activeSolution to display data */}
            {solutionDetails.data.uploader || solutionDetails.uploader || "User"}'s Solution
          </h3>
          {solutionDetails.data.accepted && (
            <span className="text-green-600 flex items-center gap-1 font-medium bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm">
              <CheckCircle2 className="size-4" /> Accepted
            </span>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden h-[300px]">
          <Editor
            height="100%"
            // Use activeSolution data
            language={solutionDetails.data.language || "javascript"}
            theme={theme}
            value={solutionDetails.data.code}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>

        <div className="p-4 rounded-md border bg-gray-50 dark:bg-zinc-800 text-sm">
          <strong>Explanation:</strong>
          {/* Handle both 'explanation' and 'description' keys depending on API consistency */}
          <p className="mt-2 whitespace-pre-wrap">
            {solutionDetails.data.explanation || solutionDetails.description || "No explanation provided."}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-4">
          {isUploader && (
            <Button
              onClick={handleToggleAccept}
              disabled={toggleAcceptMutation.isPending}
              className={`gap-2 font-semibold text-white ${solutionDetails.accepted ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
            >
               {solutionDetails.data.accepted ? (
                 <><X className="w-4 h-4" /> Unaccept</>
               ) : (
                 <><CheckCircle2 className="w-4 h-4" /> Mark as Accepted</>
               )}
            </Button>
          )}

          {/* Optional: Allow user to delete their own solution */}
          {( isUploader) && (
             <Button 
                onClick={handleDeleteSolution} 
                disabled={deleteSolutionMutation.isPending}
                variant="destructive" 
                className="flex items-center gap-2"
            >
                {deleteSolutionMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          )}
        </div>

        {/* REPLIES SECTION */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4" /> Discussion ({replies.length})
          </h4>

          {/* Reply Input */}
          <div className="flex flex-col gap-2 mb-4">
            <textarea
              rows="2"
              className="w-full p-2 border rounded-md text-sm bg-background"
              placeholder="Ask a question..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handlePostReply}
              disabled={replyMutation.isPending}
              className="self-end"
            >
              {replyMutation.isPending ? "Posting..." : "Post Reply"}
            </Button>
          </div>

          {/* Replies List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {replies.length === 0 && <p className="text-xs text-gray-400">No replies yet.</p>}
            {replies.map((r, i) => (
              <div key={r.id || r._id || i} className="border p-3 rounded bg-gray-50 dark:bg-zinc-800 text-sm">
                <div className="flex justify-between mb-1">
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
        placeholder="Explain your approach..."
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      />

      <Button onClick={handleSubmit} disabled={submitSolutionMutation.isPending} className="w-full">
        {submitSolutionMutation.isPending ? "Submitting..." : "Submit Solution"}
      </Button>
    </div>
  );
}
