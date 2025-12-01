// src/components/ProblemTable/ProblemFilters.jsx

import React from 'react';
import { Input } from "@/components/ui/input";

function ProblemFilters({
    filter,
    setFilter,
    selectedTopic,
    setSelectedTopic,
    acceptedFilter,
    setAcceptedFilter,
    repliedFilter,
    setRepliedFilter,
    topicOptions,
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Input
                placeholder="Search problems by title..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-sm"
            />

            <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)} 
                className="dark:bg-zinc-800 dark:text-white px-3 py-2 border rounded-md text-sm"
            >
                {topicOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
                value={acceptedFilter} 
                onChange={(e) => setAcceptedFilter(e.target.value)} 
                className="dark:bg-zinc-800 dark:text-white px-3 py-2 border rounded-md text-sm"
            >
                <option value="All">Accepted: All</option>
                <option value="Accepted">Accepted</option>
                <option value="Not Accepted">Not Accepted</option>
            </select>

            <select 
                value={repliedFilter} 
                onChange={(e) => setRepliedFilter(e.target.value)} 
                className="dark:bg-zinc-800 dark:text-white px-3 py-2 border rounded-md text-sm"
            >
                <option value="All">Replied: All</option>
                <option value="Replied">Replied</option>
                <option value="Not Replied">Not Replied</option>
            </select>
        </div>
    );
}

export default ProblemFilters;