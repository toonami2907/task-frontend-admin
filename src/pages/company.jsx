import CompanyDialogDemo from "@/components/company-dialog";
import { Building2, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useGlobalContext } from "@/context/StateProvider";

const getCompanyId = (company) => company?.id || company?._id;

const Company = () => {
  const { companies } = useGlobalContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return companies;
    }

    return companies.filter((company) =>
      company?.name?.toLowerCase().includes(normalized)
    );
  }, [companies, query]);

  const handleCompanyClick = (company) => {
    localStorage.setItem(
      "selectedCompany",
      JSON.stringify({
        id: getCompanyId(company),
        name: company.name,
        nature: company.nature,
      })
    );

    navigate("/admin");
  };

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.55)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Company Access
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Companies</h1>
        </div>
        <CompanyDialogDemo />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search company"
          className="h-10 rounded-xl border-slate-300 pl-9"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <p className="text-base font-semibold text-slate-900">No company found</p>
          <p className="mt-1 text-sm text-slate-600">
            Create a company, then select it to enter the admin panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <button
              key={getCompanyId(company)}
              type="button"
              onClick={() => handleCompanyClick(company)}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-cyan-500 hover:shadow-[0_14px_32px_-24px_rgba(6,182,212,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                {company.name?.charAt(0)?.toUpperCase()}
              </span>
              <span className="flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {company.name}
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {company.nature || "Company"}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-cyan-600" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Company;
