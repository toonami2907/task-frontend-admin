import React, { useEffect, useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { ErrorToast } from "@/hooks/customToast";
import axios from "axios";
import { API_URL } from "@/functions/features/StateProvider";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "@/services/Google/auth.service";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const authService = new AuthService();

  const handleGoogleSignIn = async () => {
    const authUrl = await authService.initiateGoogleSignIn();
    window.location.href = authUrl;
  };



  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email) {
      return ErrorToast(`Email field cant be empty`);
    }
    if (!name) {
      return ErrorToast(`Name field cant be empty`);
    }
    if (!password || !password.length > 0) {
      return ErrorToast(`Password field cant be empty`);
    }
    if (password.length < 6) {
      return ErrorToast(
        `Password length must be greater than ${password.length}`
      );
    }
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_URL}/auth/v1/register`,
        {
          email,
          password,
        }
      );
      if (response.status === 201 || response.status === 200) {
        setLoading(false)
        toast.success("User registered successfully");
        setEmail("");
        setName("");
        setPassword("");
        setIsSignIn(true);
      }
    } catch (error) {
      setLoading(false)
      if (import.meta.env.NODE_ENV != "Production") {
        console.log(error.response.data);
      }
      return ErrorToast(error.response?.data?.message);
    }
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      return ErrorToast("Please enter your email address");
    }
    if (!password || !password.length > 0) {
      return ErrorToast("Please enter your password");
    }
    if (password.length < 6) {
      return ErrorToast("Password must be at least 6 characters long");
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/v1/login`, {
        email,
        password,
      });
      const { accessToken, refreshToken, UserId } = response.data;
      if (response.status === 201 || response.status === 200) {
        toast.success("Welcome back! Login successful");
        setLoading(false);
        localStorage.setItem("UserId", UserId);
        Cookies.set("access_token", accessToken);
        Cookies.set("refresh_token", refreshToken);
        setEmail("");
        setName("");
        setPassword("");
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message?.includes('Google Sign-In')) {
        return ErrorToast("This account uses Google Sign-In. Please click 'Continue with Google' to access your account.");
      }
      return ErrorToast(error.response?.data?.message || 'Invalid credentials. Please check your email and password.');
    }
  };
  

  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {isSignIn ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignIn
                ? "Sign in to your account"
                : "Start your journey with us"}
            </p>
            
          </div>

          <div className="mt-8">
          <button 
           onClick={handleGoogleSignIn}
          className="w-full flex justify-center items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <form className="mt-6 space-y-6">
              {!isSignIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      required
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isSignIn && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                  to={`/auth/forgotten/password`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
              {isSignIn ? (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => handleSignIn(e)}
                  className="w-full flex justify-center disabled:bg-indigo-400 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  {loading ? 'Signing in ' : 'Sign in'}
                </button>
              ) : (
                <button
                  onClick={(e) => handleSignUp(e)}
                  disabled={loading}
                  className="w-full flex justify-center disabled:bg-indigo-400 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                 {loading ? 'Registerring ' : 'Register'}
                </button>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignIn
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        {isSignIn ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/auth1.webp"
            alt="Authentication background"
          />
        ) : (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/auth2.jpg"
            alt="Authentication background"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 to-indigo-600/40 mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold text-white">
              Transform Your Digital Experience
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Join our platform and discover a new way to manage your
              digital presence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
