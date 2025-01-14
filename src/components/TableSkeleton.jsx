const TableSkeleton = ({ columns }) => {
    return (
      <div className="animate-pulse">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex border-b">
            <div className="w-12 p-4">
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>
            <div className="w-20 p-4">
              <div className="h-4 w-10 bg-gray-200 rounded" />
            </div>
            <div className="min-w-[200px] p-4">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>
            {columns.map((_, idx) => (
              <div key={idx} className="min-w-[120px] p-4">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  

  export default TableSkeleton