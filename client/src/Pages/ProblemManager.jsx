"use client";
 ;
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import UploadTab from "../components/ProblemTabs/UploadTab.jsx";
import ProblemTab from "../components/ProblemTabs/ProblemTab.jsx";



const ProblemManager = () => {
    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Manage Your Problems</h2>

            <Tabs defaultValue="upload" className="space-y-4">
                <TabsList>
                    <TabsTrigger className="cursor-pointer"  value="upload">Upload Problem</TabsTrigger>
                    <TabsTrigger className="cursor-pointer" value="myproblems">My Problems</TabsTrigger>
                </TabsList> 
                <UploadTab /> 
                <ProblemTab />
            </Tabs>
        </div>
    );
};

export default ProblemManager;