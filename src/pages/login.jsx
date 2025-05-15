import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/context/StateProvider";
import { Eye, EyeClosed } from "lucide-react";
import Cookie from 'js-cookie'

const Login = () => {
  const [email, setEmail] = useState("ikemm50@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
 useEffect(() => {
    const verifyAuth = async () => {
      const _userstatus = await checkAdminAuth();
      setIsAuthenticated(_userstatus);
      if (_userstatus) {
        navigate("/admin");
      }
    };
    verifyAuth();
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${api}/api/v1/admin/login`, {
        email,
        password
      });
      
      toast.success("Login successful!");
      console.log("Login successful:", response.data);
      const {admin, accessToken, refreshToken}  = response.data
      Cookie.set('admin_access_token', accessToken, { expires: 1 });
      Cookie.set('admin_refresh_token', refreshToken, { expires: 7 });
      localStorage.setItem('adminId', admin?.id);
      // Store tokens if needed
      // localStorage.setItem("accessToken", response.data.accessToken);
      
      // // Navigate to dashboard
      navigate("/admin");
      window.location.reload()
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Display appropriate error message
      if (error.response) {
        toast.error(error.response.data.error || "Invalid credentials");
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[500px] flex items-center justify-center bg-white">
      <Toaster position="top-center" reverseOrder={false} />
      <form onSubmit={handleSubmit} className="w-full max-w-3xl p-6">
        <h2 className="text-2xl font-bold mb-6">Log In</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md "
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md "
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeClosed /> : <Eye />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
