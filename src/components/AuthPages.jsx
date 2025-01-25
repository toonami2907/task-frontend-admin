import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { ErrorToast } from "@/hooks/customToast";
import axios from "axios";
import { API_URL } from "@/functions/features/StateProvider";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("");
  const navigate = useNavigate();

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
      return ErrorToast(`Email field cant be empty`);
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
      const response = await axios.post(`${API_URL}/auth/v1/login`, {
        email,
        password,
      });
      console.log(response.data);
      const { accessToken, refreshToken, UserId } = response.data;
      if (response.status === 201 || response.status === 200) {
        toast.success("User Logged successfully");
        setLoading(false)
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
      setLoading(false)
      if (import.meta.env.NODE_ENV != "Production") {
        console.log(error.response.data);
      }
      return ErrorToast(error.response?.data?.message);
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
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
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
