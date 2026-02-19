import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { Toaster as UI } from "@/components/ui/toaster";
import Loading from "@/components/Loading";
import StateProvider from "./context/StateProvider";
import HomePage from "./components/home-page";
import UserLayout from "./components/layout/userlayout";
import Login from "./pages/login";
import Signup from "./pages/sign-up";
import AdminLayout from "./components/layout/admin-layout";
import Job from "./pages/jobs";
import CompanyLayout from "./components/layout/company-layout";
import EmployeesPage from "./pages/employee";
import TeamsPage from "./pages/team";
import Settings from "./pages/settings";
import RolesPage from "./pages/roles";

const CompanyDetail = () => (
  <div className="flex h-[400px] flex-col items-center justify-center">
    <h2 className="text-2xl">Company Detail Page - Coming Soon!</h2>
  </div>
);

const ComingSoon = ({ title }) => (
  <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
    <h2 className="text-2xl font-semibold text-slate-900">{title} coming soon</h2>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />} />

      <Route path="/companies" element={<CompanyLayout />}>
        <Route index element={<Navigate to="jobs" replace />} />
        <Route path="jobs" element={<Job />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path=":companyName" element={<CompanyDetail />} />
      </Route>

      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="features" element={<ComingSoon title="Features" />} />
        <Route path="about" element={<ComingSoon title="About" />} />
        <Route path="contact" element={<ComingSoon title="Contact" />} />
        <Route path="pricing" element={<ComingSoon title="Pricing" />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="flex h-[400px] flex-col items-center justify-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="mb-6 text-xl">Page not found</p>
            <a href="/" className="text-blue-500 hover:underline">
              Go back home
            </a>
          </div>
        }
      />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StateProvider>
      <Toaster />
      <UI />
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </StateProvider>
  </BrowserRouter>
);
