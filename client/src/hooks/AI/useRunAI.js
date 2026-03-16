import { useMutation } from "@tanstack/react-query";
import aiService from "../../api/AiServices.js";
import { toast } from "sonner";

function useRunAI(setAiResponse, scrollRef) {

  return useMutation({

    mutationFn: aiService.runAi,

    onSuccess: (result) => {

      if (!result.success) {
        toast.error(result.message || "Failed to generate response");
        return;
      }

      setAiResponse(result.data);
      toast.success("AI Response Generated");

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);
    },

    onError: () => {
      toast.error("AI request failed");
    }

  });

}

export { useRunAI };