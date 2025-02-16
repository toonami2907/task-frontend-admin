/* eslint-disable react/prop-types */
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import Layout from "./Layout2";
import FacebookCallback from "@/components/FBCallback";
import AuthPages from "@/components/AuthPages";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ShopifyConnectionSuccess from "@/components/ConnectionSuccessPage";
import FbSucess from "@/components/FbSucess";
import AccountSettings from "@/components/AccountSettings";
import PricingPage from "@/pages/PricingPage";
import RulesPage from "@/test/Entry";
import EmailVerification from "@/components/EmailVerification";
import GoogleCallback from "@/services/Google/GoogleCallback";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "react-hot-toast";
import { Toaster as UI } from "@/components/ui/toaster"
import { AdminDashboard } from "@/components/Admin/Dashboard/AdminDashboard";
import AdminLayout from "@/components/Admin/AdminLayout";
import { AdminLogin } from "@/components/Admin/Auth/AdminLogin";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CheckEmail from "@/pages/CheckEmail";
import StateProvider from "@/functions/features/StateProvider";
// import { AdminStateProvider } from "@/functions/features/AdminStateProvider";
import { RulesProvider } from "@/services/RulesContext";
import MailComposer from "@/services/AdminMail/Mail";
import { AdminProvider } from "@/components/Admin/Providers/AdminProvider";
import UsersPage from "@/pages/Admin/Users/UsersPage";
import Loading from "@/components/Loading";
import { CreatePlan } from "@/pages/Admin/Plans/CreatePlan";
import { ManagePlans } from "@/pages/Admin/Plans/ManagePlans";
import { SubscriptionSuccess } from "@/pages/subscription/success";
import { SubscriptionCancel } from "@/pages/subscription/cancel";
import FAQs from "@/pages/FAQs";
import ManageFAQs from "@/pages/Admin/FAQs/ManageFAQs";
import { PurchaseReport } from "@/pages/Reports/PurchaseReport";
import { DetailedOrders } from "@/pages/Reports/DetailedOrders";


const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem("UserId");
  return userInfo ? children : <Navigate to="/auth" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const adminInfo = localStorage.getItem("AdminId");
  return adminInfo ? children : <Navigate to="/admin/login" replace />;
};

const PublicRoute = ({ children }) => {
  const userInfo = localStorage.getItem("UserId");
  return userInfo ? <Navigate to="/" replace /> : children;
};

const AdminPublicRoute = ({ children }) => {
  const adminInfo = localStorage.getItem("AdminId");
  return adminInfo ? <Navigate to="/admin/dashboard" replace /> : children;
};

const App = lazy(() => import("../App"));
const PlatformConnectionPage = lazy(() => import("@/components/PlatformConnector"));
// const DetailedOrders = lazy(() => import("@/pages/Reports/DetailedOrders"));
// const PurchaseReport = lazy(() => import("@/pages/Reports/PurchaseReport"));
const PricingDetailsPage = lazy(() => import("@/pages/PricingDetailsPage"));

const UserRoutes = () => (
  <StateProvider>
    <RulesProvider>
      <Toaster />
      <UI />
      <Routes>
        <Route path="/auth" element={<PublicRoute><AuthPages /></PublicRoute>} />
        <Route path="/auth/forgotten/password" element={<ForgotPassword />} />
        <Route path="/check-email" element={<PublicRoute><CheckEmail /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/auth/google/callback" element={<PublicRoute><GoogleCallback /></PublicRoute>} />
        <Route path="/info/faqs" element={<PublicRoute><FAQs/></PublicRoute>} />
        <Route path="/pricing" element={<PricingDetailsPage />} />
        <Route path="/shopify/success" element={<ProtectedRoute><ShopifyConnectionSuccess /></ProtectedRoute>} />
        <Route 
          path="/subscription/success"
          element={
          <ProtectedRoute>
          <SubscriptionSuccess/>
          </ProtectedRoute>}
           />
        <Route 
          path="/subscription/cancel"
          element={
          <ProtectedRoute>
          <SubscriptionCancel/>
          </ProtectedRoute>}
           />
        <Route path="/facebook/success" element={<ProtectedRoute><FbSucess /></ProtectedRoute>} />
        <Route path="/config" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="/verify-email/:token" element={<ProtectedRoute><EmailVerification /></ProtectedRoute>} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/Rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
          <Route path="/user/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          <Route path="/billing/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path="/user/platform" element={<ProtectedRoute><PlatformConnectionPage /></ProtectedRoute>} />
          <Route path="/facebook/callback" element={<ProtectedRoute><FacebookCallback /></ProtectedRoute>} />
          <Route path="/report/orders" element={<ProtectedRoute><DetailedOrders /></ProtectedRoute>} />
          <Route path="/report/purchases" element={<ProtectedRoute><PurchaseReport /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RulesProvider>
  </StateProvider>
);

const AdminRoutes = () => (
    <AdminProvider>
    <Toaster /><UI /><Routes>
      <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route path="/admin/dashboard"  element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersPage/>} />
        <Route path="/admin/plan/create" element={<CreatePlan/>} />
        <Route path="/admin/mail/create" element={<MailComposer/>} />
        <Route path="/admin/faq" element={<ManageFAQs/>} />
        <Route path="/admin/plan/manage" element={<ManagePlans/>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    </AdminProvider>
);

const AppRoutes = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  return isAdminRoute ? <AdminRoutes /> : <UserRoutes />;
};

export default AppRoutes;
