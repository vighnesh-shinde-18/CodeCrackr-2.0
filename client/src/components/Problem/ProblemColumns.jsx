import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../ui/badge.jsx";

export function createProblemColumns(page, limit) {
  return [
    {
      id: "index",
      header: "Sr.No.",
      cell: ({ row }) => (
        <div className="font-medium">
          {(page - 1) * limit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "topics",
      header: "Topics",
      cell: ({ row }) => {
        const topics = row.getValue("topics") || [];
        return topics.map((topic, i) => (
          <Badge className="mx-0.5" variant="secondary" key={i}>
            {topic}
          </Badge>
        ));
      },
    },
    {
      accessorKey: "replied",
      header: "You Replied",
      cell: ({ row }) =>
        row.getValue("replied") ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="size-4" /> Replied
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-500">
            <XCircle className="size-4" /> Not Replied
          </div>
        ),
    },
    {
      accessorKey: "accepted",
      header: "Accepted",
      cell: ({ row }) =>
        row.getValue("accepted") ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="size-4" /> Accepted
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-500">
            <XCircle className="size-4" /> Not Accepted
          </div>
        ),
    },
  ];
}