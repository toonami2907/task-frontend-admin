import { Routes, Route } from "react-router-dom";
import Layout from "./Layout2";
import { lazy } from "react";
import FacebookCallback from "@/components/FBCallback";



const App = lazy(() => import("../App"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
      <Route index element={<App />} />
      <Route path="/facebook/callback" element={<FacebookCallback/>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;