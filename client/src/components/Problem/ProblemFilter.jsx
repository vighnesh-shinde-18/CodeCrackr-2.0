import React from 'react';
import { Input } from "@/components/ui/input";

function ProblemFilters({
    filter,
    setFilter,
    selectedTopic,
    setSelectedTopic,
    statusFilter,      // 🟢 New single prop
    setStatusFilter,   // 🟢 New single prop
    topicOptions,
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <Input
                placeholder="Search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-sm"
            />

            {/* Topic Dropdown (Correct Data now) */}
            <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)} 
                className="dark:bg-zinc-800 dark:text-white px-3 py-2 border rounded-md text-sm"
            >
                {topicOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* 🟢 Unified Status Dropdown */}
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="dark:bg-zinc-800 dark:text-white px-3 py-2 border rounded-md text-sm"
            >
                <option value="All">All Status</option>
                <option value="Accepted">Accepted</option>
                <option value="Replied">Replied</option>
                <option value="Not Replied">Not Replied</option>
            </select>
        </div>
    );
}

export default ProblemFilters;