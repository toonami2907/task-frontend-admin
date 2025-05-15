/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
   useEffect(() => {
      const verifyAuth = async () => {
        const _userstatus = await checkAdminAuth();
        setIsAuthenticated(_userstatus);
      };
      verifyAuth();
    }, [navigate]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <nav className="bg-white border border-neutral-200 relative z-50 py-2">
      <div className="px-6 md:px-8">
        <div className="flex justify-between h-16  items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex gap-7 items-center">
            <span className="text-2xl font-bold text-blue-600">
              <img src="/logo.webp" alt="" />
            </span>
          <div className="hidden md:flex sm:items-center sm:gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={` py-2 text-md font-medium ${
                  location.pathname === link.path
                    ? "text-black"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          </div>

          {/* Desktop Menu */}

          {/* Desktop Buttons */}
          {isAuthenticated ? (
            <Link
            to="/admin"
            className="px-4 py-2 hidden md:flex  text-md font-medium text-white bg-black rounded-sm hover:bg-gray-800"
          >
            Dashboard
          </Link>
          ): (
            <div className="hidden sm:flex sm:items-center sm:space-x-3">
           <Link
             to="/login"
             className="px-4 py-2 text-md font-semibold text-neutral-800 border border-gray-300 rounded-sm hover:bg-neutral-100"
           >
             Login
           </Link>
           <Link
             to="/signup"
             className="px-4 py-2 text-md font-medium text-white bg-black rounded-sm hover:bg-gray-800"
           >
             Sign Up
           </Link>
         </div>
           
          )}
          
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="navbar-styles">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40">
          <div className="flex justify-between  px-6 h-16 border border-neutral-200 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                <img src="/logo.webp" alt="" />
              </span>
            </div>
            <div className="sm:hidden flex items-center">
              <button onClick={toggleMenu} className="navbar-styles">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isAuthenticated ? (
             <div className="px-4 0 pb-3 pt-6 space-y-3 h-full flex flex-col justify-start">
             <Link
               to="/admin"
               onClick={toggleMenu}
               className="flex items-center justify-center px-3 py-2 h-10 rounded-md  bg-neutral-950 hover:bg-neutral-900 text-base font-medium text-neutral-100 hover:text-neutral-200"
             >
               Dashboard
             </Link>

             {navLinks.map((link) => (
               <Link
                 key={link.name}
                 to={link.path}
                 onClick={toggleMenu}
                 className={`block px-3 py-2 text-lg  ${
                   location.pathname === link.path
                     ? "text-black"
                     : "text-gray-600 hover:text-neutral-800"
                 }`}
               >
                 {link.name}
               </Link>
             ))}
           </div>
          ): (
            <div className="px-4 0 pb-3 pt-6 space-y-3 h-full flex flex-col justify-start">
            <Link
              to="/signup"
              onClick={toggleMenu}
              className="flex items-center justify-center px-3 py-2 h-10 rounded-md  bg-neutral-950 hover:bg-neutral-900 text-base font-medium text-neutral-100 hover:text-neutral-200"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              onClick={toggleMenu}
              className="flex items-center justify-center px-3 py-2 h-10 rounded-md  border border-neutral-300 hover:bg-neutral-100 text-base font-medium text-black"
            >
              Login
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={toggleMenu}
                className={`block px-3 py-2 text-lg  ${
                  location.pathname === link.path
                    ? "text-black"
                    : "text-gray-600 hover:text-neutral-800"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          )}
          
        </div>
      )}
    </nav>
  );
};
export default Navbar;
