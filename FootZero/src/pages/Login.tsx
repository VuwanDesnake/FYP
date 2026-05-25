import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role || "user";

    if (tab === "admin") {
      if (adminKey !== "Vuwan1") {
        toast({ title: "Invalid key", description: "The admin secret key is incorrect.", variant: "destructive" });
        setLoading(false);
        return;
      }
      if (role !== "admin") {
        toast({ title: "Access denied", description: "You don't have admin privileges.", variant: "destructive" });
        setLoading(false);
        return;
      }
      navigate("/admin/dashboard");
    } else {
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 gradient-hero opacity-[0.07]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md">
          <Logo size="lg" className="mb-8" />
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">Track your impact.<br /><span className="gradient-text">Save the planet.</span></h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Join thousands of users reducing their carbon footprint with data-driven insights and personalized recommendations.
          </p>
          <div className="space-y-4">
            {[
              { icon: "📊", text: "Real-time emission tracking across 4 categories" },
              { icon: "🎯", text: "Smart goals that adapt to your lifestyle" },
              { icon: "🏆", text: "Earn badges and celebrate milestones" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-muted-foreground text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Logo size="lg" />
            </Link>
          </div>
          <div className="mb-8">
            <h2 className="text-foreground text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue your green journey</p>
          </div>

          {/* Role Tabs */}
          <div className="flex mb-6 bg-card rounded-xl p-1 border border-border">
            <button
              onClick={() => setTab("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "user" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Users className="h-4 w-4" />
              User
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === "admin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>

          {/* Google Sign In */}
          <Button type="button" variant="outline" className="w-full h-11 rounded-xl mb-4 border-border text-foreground hover:bg-muted" onClick={handleGoogleSignIn}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-card border-border text-foreground h-11 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
                <Link to="/forgot-password" className="text-primary text-xs hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-card border-border text-foreground h-11 rounded-xl" required />
            </div>
            {tab === "admin" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                <Label htmlFor="adminKey" className="text-foreground text-sm">Admin Secret Key</Label>
                <Input id="adminKey" type="password" placeholder="Enter admin key" value={adminKey} onChange={e => setAdminKey(e.target.value)} className="bg-card border-border text-foreground h-11 rounded-xl" />
              </motion.div>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl" variant="hero" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">Create one free</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
