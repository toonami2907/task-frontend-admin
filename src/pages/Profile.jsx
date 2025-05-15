import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/StateProvider";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  const { adminInfo } = useGlobalContext();
  console.log(adminInfo);
  const handleLogout = () => {
    Cookies.remove("admin_access_token");
    Cookies.remove("admin_refresh_token");
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-[400px]">
        <h1 className="text-2xl md:text-4xl  font-semibold text-gray-800">Welcome {"   "} <span className="font-bold text-black">{adminInfo.fullName || 'Adminstrator'}</span></h1>
      <Button onClick={handleLogout} className='bg-red-700 hover:bg-red-600'>Logout</Button>
    </div>
  );
};

export default Profile;
