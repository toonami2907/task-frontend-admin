import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function Breadcrumb() {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    
    // Show breadcrumb if path starts with "companies"
    const isCompaniesPath = pathSegments[0] === "companies";
    if (!isCompaniesPath) return;

    const breadcrumbItems = [
      { name: 'Companies', path: '/admin/companies', isLast: false }
    ];
    
    // Check localStorage for saved company name
    const savedCompany = JSON.parse(localStorage.getItem('selectedCompany') || '{}');
    const savedCompanyName = savedCompany.name || '';
    
    // Always use the saved company name if available when on /companies route
    if (savedCompanyName) {
      breadcrumbItems.push({
        name: savedCompanyName,
        path: null, // Last item, no link
        isLast: true
      });
    }
    
    setBreadcrumbs(breadcrumbItems);
  }, [location.pathname]);
  
  if (breadcrumbs.length === 0) return null;
  
  return (
    <div className="flex items-center text-sm text-gray-600">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="mx-2" size={16} />
          )}
          {breadcrumb.isLast ? (
            <span className="hover:underline text-black font-semibold text-[15px] cursor-pointer">{breadcrumb.name}</span>
          ) : (
            <Link 
              to={breadcrumb.path} 
              className=" hover:underline text-black font-semibold text-[16px] transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default Breadcrumb;