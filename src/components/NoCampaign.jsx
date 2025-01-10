const NoCampaign = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-gray-400">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search filters to find what you`re looking for.
      </p>
    </div>
  );

  export default NoCampaign