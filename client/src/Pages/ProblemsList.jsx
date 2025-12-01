
import ProblemTable  from "@/components/problem/ProblemTable.jsx";

function ProblemList () {


  return (
        <div className="flex flex-1 flex-col px-4 py-6 md:px-6">
          <h1 className="text-2xl font-bold mb-4">DSA Problems</h1>
          <ProblemTable />
        </div>
  );
};

export default ProblemList;
