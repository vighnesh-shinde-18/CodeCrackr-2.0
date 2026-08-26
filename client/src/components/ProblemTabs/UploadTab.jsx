"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import { useUploadProblem } from "../../hooks/Problems/useUploadProblem.js";

function UploadTab() {

  const uploadMutation = useUploadProblem();

  const [form, setForm] = useState({
    title: "",
    description: "",
    topics: "",
    testCases: [{ input: "", output: "" }],
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestCaseChange = (index, key, value) => {
    const updated = [...form.testCases];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, testCases: updated }));
  };

  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      toast.error("Please fill title and description");
      return;
    }

    const topicsString = String(form.topics || "");

    if (!topicsString.trim()) {
      toast.error("At least one topic is required");
      return;
    }

    uploadMutation.mutate({
      ...form,
      topics: topicsString
    });

    setForm({
      title: "",
      description: "",
      topics: "",
      testCases: [{ input: "", output: "" }],
    });
  };

  return (
    <TabsContent value="upload">
      <div className="space-y-4">

        <p className="text-sm text-muted-foreground">
          Submit a problem with title, description, topics, and test cases.
        </p>

        <Separator />

        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter problem title"
        />

        <Label>Description</Label>
        <Textarea
          rows={6}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the problem"
        />

        <Label>Topics (comma separated)</Label>
        <Input
          value={form.topics}
          onChange={(e) => handleChange("topics", e.target.value)}
          placeholder="arrays, dp, sliding window"
        />

        <Label>Test Cases</Label>

        {form.testCases.map((tc, index) => (
          <div key={index} className="flex gap-4">
            <Input
              value={tc.input}
              onChange={(e) =>
                handleTestCaseChange(index, "input", e.target.value)
              }
              placeholder="Input"
            />
            <Input
              value={tc.output}
              onChange={(e) =>
                handleTestCaseChange(index, "output", e.target.value)
              }
              placeholder="Expected Output"
            />
          </div>
        ))}

        <div className="flex gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={addTestCase}
          >
            + Add Test Case
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit Problem"
            )}
          </Button>

        </div>
      </div>
    </TabsContent>
  );
}

export default UploadTab;