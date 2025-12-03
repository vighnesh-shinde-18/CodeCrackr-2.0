import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import problemService from "../../api/ProblemServices.jsx";
import { toast } from "sonner";

function UploadTab() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        topics: "",
        testCases: [{ input: "", output: "" }],
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title || !form.description || !form.topics) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            const problemId = await problemService.uploadProblem(form)
            console.log("1")
            toast.success("Problem submitted successfully!");
            console.log("2")
            setForm({
                title: "",
                description: "",
                topics: "",
                testCases: [{ input: "", output: "" }],
            });
            console.log("3")
            // fetchMyProblems();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Submission failed");
            console.error("Submit Error:", err);
        }
    }

    return (
        <TabsContent value="upload">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Submit a problem with title, description, topics, and test cases.
                </p>
                <Separator className="" />
                <Label>Title</Label>
                <Input
                    placeholder="Enter problem title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                />

                {/* Description */}
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
                            onChange={(e) =>
                                handleTestCaseChange(index, "input", e.target.value)
                            }
                        />
                        <Input
                            placeholder="Expected Output"
                            value={tc.output}
                            onChange={(e) =>
                                handleTestCaseChange(index, "output", e.target.value)
                            }
                        />
                    </div>
                ))}
                <Button type="button" className="mx-1 my-1" variant="outline" onClick={addTestCase}>
                    + Add Test Case
                </Button>

                <Button className="mx-2 my-1" onClick={(e) => handleSubmit(e)}>Submit Problem</Button>
            </div>
        </TabsContent>
    )
}

export default UploadTab;