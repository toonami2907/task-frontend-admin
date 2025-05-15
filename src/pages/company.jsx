import CompanyDialogDemo from '@/components/company-dialog';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/context/StateProvider';

const Company = () => {
  const { companies } = useGlobalContext();
  const navigate = useNavigate();

  // Handle company card click to navigate to company-specific route and save to localStorage
  const handleCompanyClick = (company) => {
    // Replace spaces with hyphens and encode the company name for the URL
    const encodedName = company.name.toLowerCase().replace(/\s+/g, '-');
    
    // Save both company name and ID to localStorage
    localStorage.setItem('selectedCompany', JSON.stringify({ 
      name: company.name,
      id: company.id // Store the company ID
    }));
    
    navigate(`/companies/${encodedName}`);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-3xl font-bold">Companies</h1>
        <CompanyDialogDemo />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {companies.length === 0 ? (
          <p className="text-gray-500">No companies found.</p>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanyClick(company)}
              className="flex items-center gap-3 p-3 h-20 bg-white rounded-lg shadow-xs border border-gray-200 hover:border-gray-300 cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white font-medium">
                {company.name.charAt(0).toLowerCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-md font-semibold text-black">{company.name}</span>
                <span className="text-xs text-gray-700">{company.nature}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Company;
