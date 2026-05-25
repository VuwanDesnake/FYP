import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Get session from URL hash after OAuth redirect
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/login");
        return;
      }

      const user = session.user;

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // If no profile, create one (for Google Sign In users)
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
          name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
          email: user.email,
          role: "user",
          city: "Kathmandu",
        });
        navigate("/dashboard");
        return;
      }

      // Redirect based on role
      if (profile.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
