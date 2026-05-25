import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // STEP 1: Wait for Supabase to process OAuth session
        const { data: sessionData } = await supabase.auth.getSession();
        let session = sessionData.session;

        // STEP 2: If session is not ready yet, try getting user directly
        if (!session) {
          const { data: userData } = await supabase.auth.getUser();

          if (!userData.user) {
            navigate("/login");
            return;
          }

          // retry session after small delay
          const { data: retrySession } = await supabase.auth.getSession();
          session = retrySession.session;
        }

        // STEP 3: Final check
        if (!session) {
          navigate("/login");
          return;
        }

        const user = session.user;

        // STEP 4: Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // STEP 5: Create profile if missing (Google users)
        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              "User",
            email: user.email,
            role: "user",
            city: "Kathmandu",
          });

          navigate("/dashboard");
          return;
        }

        // STEP 6: Role-based redirect
        if (profile.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        navigate("/login");
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