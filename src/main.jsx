import { StrictMode, Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { Toaster as UI } from "@/components/ui/toaster";
import Loading from '@/components/Loading';
import StateProvider from "./context/StateProvider";
import HomePage from "./components/home-page";
import UserLayout from "./components/layout/userlayout";
import Login from "./pages/login";
import Signup from "./pages/sign-up";
import Layout from "./components/layout/admin-layout";
import Job from "./pages/jobs";
import Company from "./pages/company";
import CompanyLayout from "./components/layout/company-layout";
import EmployeesPage from "./pages/employee";
import TeamsPage from "./pages/team";
import Settings from './pages/settings'
import Profile from "./pages/Profile";
// Placeholder component for individual company page
const CompanyDetail = () => (
  <div className="flex flex-col items-center justify-center h-[400px]">
    <h2 className="text-2xl">Company Detail Page - Coming Soon!</h2>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Layout/>}>
        <Route index element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Admin Dashboard coming soon!</h2></div>} />
        <Route path="/admin/supports" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Supports page coming soon!</h2></div>} />
        <Route path="/admin/log" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Log page coming soon!</h2></div>} />
        <Route path="/admin/settings" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Settings page coming soon!</h2></div>} />
        <Route path="/admin/supports" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Supports page coming soon!</h2></div>} />
        <Route path="/admin/companies" element={<Company/>} />
        <Route path="/admin/profile" element={<Profile/>} />
      </Route>
      <Route path="/companies" element={<CompanyLayout/>}>
        <Route path="jobs" element={<Job/>} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path=":companyName" element={<CompanyDetail />} />
      </Route>
      <Route path="/" element={<UserLayout/>}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/features" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Features coming soon!</h2></div>} />
        <Route path="/about" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">About coming soon!</h2></div>} />
        <Route path="/contact" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Contact coming soon!</h2></div>} />
        <Route path="/pricing" element={<div className="flex flex-col items-center justify-center h-[400px]"><h2 className="text-2xl">Pricing coming soon!</h2></div>} />
      </Route>
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center h-[400px]">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl mb-6">Page not found</p>
          <a href="/" className="text-blue-500 hover:underline">Go back home</a>
        </div>
      } />
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