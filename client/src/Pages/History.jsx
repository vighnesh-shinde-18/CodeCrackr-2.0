import React, { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryProblems } from "@/components/History/HistoryProblems.jsx";
import { HistoryAiFeatures } from "@/components/History/HistoryAiFeatures.jsx";

function History(){


    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">History</h2>
            <Tabs defaultValue="problems" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="problems" className="cursor-pointer">Problems</TabsTrigger>
                    <TabsTrigger value="ai" className="cursor-pointer">AI Features</TabsTrigger>
                </TabsList>

                <TabsContent  value="problems">
                    <HistoryProblems />
                </TabsContent>
                <TabsContent value="ai">
                    <HistoryAiFeatures />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default (History);
