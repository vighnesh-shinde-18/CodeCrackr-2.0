import React from 'react';
import { flexRender } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// 🟢 Accept pagination props
function ProblemDataTable({ table, columns, visitProblem, pagination, onNextPage, onPrevPage }) {
   
    const { page, totalPages, hasNextPage } = pagination;

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    className="cursor-pointer hover:bg-muted/50 transition-colors" 
                                    onClick={() => visitProblem(row.original._id, row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8 h-24">
                                    No problems found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 🟢 Server-Side Pagination Controls */}
            <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onPrevPage} 
                        disabled={page === 1} // Disable if on Page 1
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onNextPage} 
                        disabled={!hasNextPage} // Disable if no more pages
                    >
                        Next
                    </Button>
                </div>
            </div>
        </>
    );
}

export default ProblemDataTable;