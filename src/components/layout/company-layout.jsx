import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/StateProvider";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";

const getCompanyId = (company) => String(company?.id || company?._id || "");

const navGroups = [
  {
    name: "Employees",
    icon: Users,
    path: "/companies/employees",
  },
  {
    name: "Jobs List",
    icon: Briefcase,
    path: "/companies/jobs",
  },
  {
    name: "Teams",
    icon: UsersRound,
    path: "/companies/teams",
  },
  {
    name: "Permissions",
    icon: ShieldCheck,
    path: "/companies/roles",
  },
  {
    name: "Settings",
    icon: SlidersHorizontal,
    path: "/companies/settings",
  },
];

const isGroupActive = (groupPath, locationPathname) => locationPathname === groupPath;

function CompanyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companies } = useGlobalContext();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const companyOptions = useMemo(
    () =>
      (companies || []).map((company) => ({
        ...company,
        id: getCompanyId(company),
      })),
    [companies]
  );

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

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (!storedCompany) {
      navigate("/admin", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(storedCompany);
      const selected = companyOptions.find(
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
        navigate("/admin", { replace: true });
      }
    } catch {
      navigate("/admin", { replace: true });
    }
  }, [companyOptions, navigate]);

  const handleSwitchCompany = (event) => {
    const nextCompanyId = String(event.target.value);
    const target = companyOptions.find((company) => company.id === nextCompanyId);
    if (!target) {
      return;
    }

    const payload = {
      id: target.id,
      name: target.name,
      nature: target.nature,
    };

    localStorage.setItem("selectedCompany", JSON.stringify(payload));
    setSelectedCompany(payload);
    navigate("/companies/jobs");
  };

  const handleExitWorkspace = () => {
    localStorage.removeItem("selectedCompany");
    navigate("/admin");
  };

  const handleGroupClick = (group) => {
    navigate(group.path);
    setIsSidebarOpen(false);
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 md:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } transition-opacity duration-200`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900 text-slate-200 transition-all duration-200 ${
          isSidebarCollapsed ? "md:w-20" : "md:w-72"
        } ${
          isSidebarOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className={`flex h-20 border-b border-slate-800 ${
            isSidebarCollapsed
              ? "items-center justify-center gap-1 px-1 py-2"
              : "items-center justify-between px-4 py-4"
          }`}
        >
          <Link to="/companies/jobs" className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <img src="/plain.svg" alt="Teamer" className="h-5 w-5 object-contain" />
            </span>
            {!isSidebarCollapsed && (
              <span>
                <span className="block text-xs uppercase tracking-[0.2em] text-slate-200">Teamer</span>
              </span>
            )}
          </Link>

          <div className={`flex items-center ${isSidebarCollapsed ? "gap-0" : "gap-1"}`}>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((previous) => !previous)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:border-blue-400 hover:text-blue-300 md:inline-flex"
            >
              {isSidebarCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:border-blue-400 hover:text-blue-300 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const groupActive = isGroupActive(group.path, location.pathname) 

            return (
              <div key={group.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleGroupClick(group)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    groupActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <GroupIcon className="h-4 w-4" />
                  {!isSidebarCollapsed && <span>{group.name}</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-800 p-3">
          {!isSidebarCollapsed ? (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Company</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{selectedCompany?.name || "Not selected"}</p>
              <p className="truncate text-xs text-slate-400">{selectedCompany?.nature || ""}</p>
              <button
                type="button"
                onClick={handleExitWorkspace}
                className="mt-3 text-xs font-semibold text-blue-300 hover:text-blue-200"
              >
                Switch Company
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                <img src="/plain-icon.svg" alt="Teamer" className="h-5 w-5 object-contain" />
              </span>
            </div>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-200 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-72"}`}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Management</p>
                <h1 className="text-xl font-semibold text-slate-900">
                  {selectedCompany?.name || "Workspace"}
                </h1>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search tasks, employees, teams"
                  className="h-10 w-72 rounded-lg border-slate-300 pl-9"
                />
              </div>

              <select
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                value={selectedCompany?.id || ""}
                onChange={handleSwitchCompany}
              >
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <Button variant="outline" className="h-10 w-10 rounded-lg border-slate-300 p-0">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <Outlet context={{ selectedCompany, searchQuery }} />
        </main>
      </div>
    </div>
  );
}

export default CompanyLayout;
