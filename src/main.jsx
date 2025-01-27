import ReactDOM from "react-dom/client";
import "./index.css";
import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./extra/routes";
import Loading from "./components/Loading";
import { Toaster } from "react-hot-toast";
import { Toaster as UI } from "@/components/ui/toaster"
import StateProvider from "./functions/features/StateProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <StateProvider>
        <Toaster />
        <UI />
        <AppRoutes />
      </StateProvider>
    </Suspense>
  </BrowserRouter>
);
