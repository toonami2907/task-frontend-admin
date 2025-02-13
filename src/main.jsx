import ReactDOM from "react-dom/client";
import "./index.css";
import  { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./extra/routes";
import Loading from "./components/Loading";
import { Toaster } from "react-hot-toast";
import { Toaster as UI } from "@/components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster />
    <UI />
    <Suspense fallback={<Loading />}>
      <AppRoutes />
    </Suspense>
  </BrowserRouter>
);
