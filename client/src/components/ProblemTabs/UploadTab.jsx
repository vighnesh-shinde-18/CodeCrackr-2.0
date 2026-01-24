"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useState } from "react";
import problemService from "../../api/ProblemServices.js";
import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";

function UploadTab() {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        title: "",
        description: "",
        topics: "",
        testCases: [{ input: "", output: "" }],
    });

    const uploadMutation = useMutation({
        mutationFn: (formData) => problemService.uploadProblem(formData),
        
        onSuccess: () => {
            toast.success("Problem submitted successfully!");
            setForm({
                title: "",
                description: "",
                topics: "",
                testCases: [{ input: "", output: "" }],
            });
            queryClient.invalidateQueries(["my-problems"]);
            queryClient.invalidateQueries(["problems"]); 
        },
        
        onError: (error) => { 
            toast.error(error.message || "Submission failed");
            console.error("Submit Error:", error.message);
        }
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    const handleTestCaseChange = (index, key, value) => {
        const updated = [...form.testCases];
        updated[index][key] = value;
        handleChange("testCases", updated);
    }

    const addTestCase = () => {
        handleChange("testCases", [...form.testCases, { input: "", output: "" }]);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!form.title || !form.description) {
            toast.error("Please fill title and description");
            return;
        }

        // 🟢 FIX: PREPARE DATA AS STRING
        // The Service expects a String to call .split(",") on.
        // We must ensure we do NOT send an array.
        
        let topicsString = "";

        if (Array.isArray(form.topics)) {
            // If it's an array (["dp", "array"]), join it back to string ("dp,array")
            topicsString = form.topics.join(",");
        } else {
            // If it's already a string, just use it
            topicsString = String(form.topics || "");
        }

        // Simple validation on the string
        if (!topicsString.trim()) {
            toast.error("At least one topic is required");
            return;
        }

        const submissionData = {
            ...form,
            topics: topicsString // 🟢 Sending STRING, so Service won't crash
        };

        uploadMutation.mutate(submissionData);
    }

    return (
        <TabsContent value="upload">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Submit a problem with title, description, topics, and test cases.
                </p>
                <Separator />
                
                <Label>Title</Label>
                <Input
                    placeholder="Enter problem title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                /> 
                
                <Label>Description</Label>
                <Textarea
                    placeholder="Describe the problem in detail"
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
                
                <Label>Topics (comma separated)</Label>
                <Input
                    placeholder="e.g. arrays, dp, sliding window"
                    value={form.topics}
                    onChange={(e) => handleChange("topics", e.target.value)}
                />
                
                <Label>Test Cases</Label>
                {form.testCases.map((tc, index) => (
                    <div key={index} className="flex gap-4 mb-2">
                        <Input
                            placeholder="Input"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                        />
                        <Input
                            placeholder="Expected Output"
                            value={tc.output}
                            onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                        />
                    </div>
                ))}
                
                <div className="flex items-center gap-2 mt-2">
                    <Button type="button" variant="outline" onClick={addTestCase}>
                        + Add Test Case
                    </Button>
                    
                    <Button 
                        onClick={handleSubmit} 
                        disabled={uploadMutation.isPending}
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Problem"
                        )}
                    </Button>
                </div>
            </div>
        </TabsContent>
    )
}

export default UploadTab;