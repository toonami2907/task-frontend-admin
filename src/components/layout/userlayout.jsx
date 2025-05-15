/* eslint-disable no-unused-vars */
import  Navbar  from "@/components/navbar";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
// import { Header } from "../header";

import { useGlobalContext } from "@/context/StateProvider";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";

function UserLayout() {

  return (
    <div className='hide-scrollbar theme-dark'>
      <Navbar />
      {/* <Navbar /> */}
      <main className="px-6 md:px-4">
        <Outlet />
      </main>
    </div>
  );
}
export default UserLayout;
