import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, KeyRound, Mail, Loader2 } from "lucide-react";
import api from "@/functions/resources/axiosConfig";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/admin/login", formData);
      const data = response.data;
      const { accessToken, refreshToken, admin } = data.data;
      Cookies.set("admin_access_token", accessToken);
      Cookies.set("admin_refresh_token", refreshToken);
      localStorage.setItem("AdminId", admin.id)
      toast.success('Admin Logged In sucessfully')
      navigate("/admin/dashboard")
      window.location.reload()()
    } catch (error) {
      setError("Invalid credentials. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="w-full max-w-[400px] p-4">
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Admin Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Secure access to administration dashboard
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                className="pl-9"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <Button
            className="w-full h-11 text-base"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating
              </>
            ) : (
              "Sign in to Dashboard"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Protected by enterprise-grade security
        </div>
      </div>
    </div>
  );
}
