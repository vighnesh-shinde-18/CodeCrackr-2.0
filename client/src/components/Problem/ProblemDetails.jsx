"use client";

import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Flag } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import problemService from "../../api/ProblemServices.jsx";

// Fetch Admin Email from Environment Variables
const ADMIN_EMAIL_ENV = import.meta.env.VITE_ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL;

function ProblemDetails({ problem, currentUser }) {
  const navigate = useNavigate();

  // State for Admin check
  const [isAdmin, setIsAdmin] = useState(false);

  // State for Reports
  const [isReported, setIsReported] = useState(problem.isReported || false);
  const [reportCount, setReportCount] = useState(problem.reportCount || 0);

  // Check Local Storage vs Env Variable on Mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail && ADMIN_EMAIL_ENV && storedEmail === ADMIN_EMAIL_ENV) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // 🔹 REAL DELETE HANDLER
  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this problem?");
    if (!confirmDelete) return;

    try {
      // Call Service
      await problemService.deleteProblem(problem.id || problem._id);
      
      toast.success("Problem deleted successfully.");
      navigate("/problems"); // Redirect after delete
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete problem");
    }
  }, [navigate, problem]);

  // 🔹 REAL REPORT HANDLER
  const handleToggleReport = async () => {
    // Optimistic Update (Update UI immediately)
    const previousState = isReported;
    const previousCount = reportCount;
    
    setIsReported(!isReported);
    setReportCount((prev) => (!isReported ? prev + 1 : prev - 1));

    try {
        // Call Service
        await problemService.toggleReportProblem(problem.id || problem._id);
        
        toast.success(!isReported ? "Problem Reported" : "Report Removed");
    } catch (err) {
        // Revert on error
        setIsReported(previousState);
        setReportCount(previousCount);
        toast.error("Failed to update report status");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow p-6 rounded-md space-y-5 border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          {problem.username && (
            <span className="text-sm text-muted-foreground">
              Uploaded by <span className="font-medium text-blue-600">{problem.username}</span>
            </span>
          )}

          {/* REPORT BUTTON */}
          <button
            onClick={handleToggleReport}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isReported 
                ? "text-red-500 font-medium" 
                : "text-gray-500 hover:text-red-500"
            }`}
            title="Report this problem"
          >
            <Flag 
                className={`w-4 h-4 ${isReported ? "fill-current" : ""}`} 
            />
            <span>{reportCount}</span>
          </button>

          {/* DELETE BUTTON (Admin Only) */}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300">{problem.description}</p>

      <div>
        <strong>Topics:</strong>
        <div className="flex gap-2 mt-1 flex-wrap">
          {problem.topics?.map((topic, i) => (
            <span
              key={i}
              className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white text-sm font-medium px-2.5 py-0.5 rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div>
        <strong>Test Cases:</strong>
        <ul className="list-disc ml-5 mt-2 text-sm">
          {problem.testCases?.map((tc, i) => (
            <li key={i}>
              <span className="font-medium">Input:</span> {tc.input}{" "}
              <span className="font-medium ml-2">Output:</span> {tc.output}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProblemDetails;