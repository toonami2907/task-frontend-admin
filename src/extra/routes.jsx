/* eslint-disable react/prop-types */
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import Layout from "./Layout2";
import FacebookCallback from "@/components/FBCallback";
import AuthPages from "@/components/AuthPages";
import IntegrationsPage from "@/pages/IntegrationsPage";
import { useGlobalContext } from "@/functions/features/StateProvider";
import ShopifyConnectionSuccess from "@/components/ConnectionSuccessPage";
import FbSucess from "@/components/FbSucess";
import AccountSettings from "@/components/AccountSettings";



// Protected Route Component
const ProtectedRoute = ({ children }) => {
   const userInfo  = localStorage.getItem('UserId');

  return userInfo ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (for auth pages)
const PublicRoute = ({ children }) => {
  const userInfo  = localStorage.getItem('UserId');

  return userInfo ? <Navigate to="/" replace /> : children;
};

const App = lazy(() => import("../App"));
const PlatformConnectionPage = lazy(() => import("@/components/PlatformConnector"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPages />
          </PublicRoute>
        }
      />
      
      <Route
        path="/shopify/success"
        element={
          <ProtectedRoute>
            <ShopifyConnectionSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facebook/success"
        element={
          <ProtectedRoute>
            <FbSucess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/config"
        element={
          <ProtectedRoute>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
        path="/user/account"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />
        <Route
        path="/user/platform"
        element={
          <ProtectedRoute>
            <PlatformConnectionPage />
          </ProtectedRoute>
        }
      />
        <Route
          path="/facebook/callback"
          element={
            <ProtectedRoute>
              <FacebookCallback />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
