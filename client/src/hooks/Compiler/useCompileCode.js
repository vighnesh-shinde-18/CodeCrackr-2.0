import { useMutation } from "@tanstack/react-query";
import compilerService from "../../api/CompilerServices.js";
import { toast } from "sonner";

function useCompileCode(setOutput) {

  const getOutputBoxColor = (result) => {
    if (result.compileOutput || result.error) {
      return "border-red-500 bg-red-50 dark:bg-red-950";
    }
    if (result.status === "Accepted") {
      return "border-green-500 bg-green-50 dark:bg-green-950";
    }
    return "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800";
  };

  return useMutation({
    mutationFn: compilerService.compileCode,

    onSuccess: (result) => {

      let finalOutput = "";
      let finalColor = getOutputBoxColor(result);

      if (result.compileOutput) {
        finalOutput = `Compilation Error:\n${result.compileOutput}`;
        toast.error("Code failed to compile.");
      } else if (result.error) {
        finalOutput = `Runtime Error:\n${result.error}`;
        toast.error("Code failed due to runtime error.");
      } else {
        finalOutput = result.output || "No output returned.";
        toast.success("Code executed successfully!");
      }

      setOutput({
        text: finalOutput,
        color: finalColor
      });
    },

    onError: (error) => {
      setOutput({
        text: `Execution Failed: ${error.message}`,
        color: "border-red-500 bg-red-50 dark:bg-red-950"
      });

      toast.error("Execution failed");
    }
  });
}

export { useCompileCode };