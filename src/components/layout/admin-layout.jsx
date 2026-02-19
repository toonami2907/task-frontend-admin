import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddCompanyDialog from "@/components/addcomapny";
import { useGlobalContext } from "@/context/StateProvider";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import Cookies from "js-cookie";

const getCompanyId = (company) => String(company?.id || company?._id || "");

function AdminLayout() {
  const navigate = useNavigate();
  const { companies } = useGlobalContext();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    let mounted = true;

    const verifyAuth = async () => {
      try {
        const authState = await checkAdminAuth();
        if (!mounted) {
          return;
        }
        setIsAuthenticated(authState);
        if (!authState) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    };

    verifyAuth();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const companyList = useMemo(
    () =>
      (companies || []).map((company) => ({
        ...company,
        id: getCompanyId(company),
      })),
    [companies]
  );

  useEffect(() => {
    const stored = localStorage.getItem("selectedCompany");
    if (!stored) {
      setSelectedCompany(null);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const selected = companyList.find(
        (company) => company.id === String(parsed?.id || "")
      );
      if (selected) {
        setSelectedCompany({
          id: selected.id,
          name: selected.name,
          nature: selected.nature,
        });
        return;
      }

      if (parsed?.id) {
        setSelectedCompany({
          id: String(parsed.id),
          name: parsed.name || "Selected Company",
          nature: parsed.nature || "",
        });
      } else {
        setSelectedCompany(null);
      }
    } catch {
      setSelectedCompany(null);
    }
  }, [companyList]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return companyList;
    }

    return companyList.filter((company) =>
      company?.name?.toLowerCase().includes(query)
    );
  }, [companyList, searchQuery]);

  const handleSelectCompany = (company) => {
    const payload = {
      id: company.id,
      name: company.name,
      nature: company.nature,
    };

    localStorage.setItem("selectedCompany", JSON.stringify(payload));
    setSelectedCompany(payload);
    navigate("/companies/jobs");
  };

  const handleEnterWorkspace = () => {
    if (!selectedCompany?.id) {
      return;
    }
    navigate("/companies/jobs");
  };

  const handleClearSelection = () => {
    localStorage.removeItem("selectedCompany");
    setSelectedCompany(null);
  };

  const handleLogout = () => {
    Cookies.remove("admin_access_token");
    Cookies.remove("admin_refresh_token");
    localStorage.removeItem("selectedCompany");
    localStorage.removeItem("adminId");
    navigate("/login", { replace: true });
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8">
      <main className="mx-auto max-w-5xl rounded-md border border-slate-300 bg-white p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Select Company</h1>
            <p className="mt-1 text-sm text-slate-600">
              Choose a company to open the admin workspace.
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <Button
              onClick={() => setIsCompanyDialogOpen(true)}
              className="h-10 rounded-md bg-blue-700 px-4 text-white hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-10 rounded-md border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {selectedCompany && (
          <section className="mt-5 rounded-md border border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Current Company</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{selectedCompany.name}</h2>
                <p className="text-sm text-slate-600">{selectedCompany.nature || "Company"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleEnterWorkspace}
                  className="h-9 rounded-md bg-blue-700 px-4 text-white hover:bg-blue-600"
                >
                  Enter Workspace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearSelection}
                  className="h-9 rounded-md border-slate-400 bg-white text-slate-700 hover:bg-slate-100"
                >
                  Change
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Company List</p>
            <p className="text-sm text-slate-500">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? "result" : "results"}
            </p>
          </div>

          <div className="relative mb-4 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search company name"
              className="h-10 rounded-md border-slate-300 bg-white pl-9"
            />
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="rounded-md border border-slate-300 bg-slate-50 px-6 py-8 text-center">
              <p className="text-base font-semibold text-slate-900">No companies found</p>
              <p className="mt-1 text-sm text-slate-600">Create a company to continue.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-300">
              <div className="grid grid-cols-[1.2fr_1fr_120px] bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <span>Company</span>
                <span>Type</span>
                <span className="text-right">Action</span>
              </div>
              {filteredCompanies.map((company) => {
                const isSelected = selectedCompany?.id === company.id;

                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => handleSelectCompany(company)}
                    className={`grid w-full grid-cols-[1.2fr_1fr_120px] items-center border-t px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? "border-slate-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {company.name}
                    </span>
                    <span className="truncate text-sm text-slate-600">
                      {company.nature || "Company"}
                    </span>
                    <span className={`text-right text-xs font-semibold ${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <AddCompanyDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
      />
    </div>
  );
}

export default AdminLayout;
