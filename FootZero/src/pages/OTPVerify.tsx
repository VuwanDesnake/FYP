import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const OTPVerify = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verified!", description: "Your email has been verified." });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast({ title: "Resend failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code resent", description: `A new code has been sent to ${email}` });
    }
    setResending(false);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md text-center">
        <Link to="/"><Logo size="lg" className="justify-center mb-8" /></Link>
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-foreground text-2xl font-bold mb-2">Verify your email</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>
          </p>
          <div className="flex justify-center mb-8">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="bg-background border-border text-foreground h-14 w-12 text-xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} variant="hero" size="lg" className="w-full" disabled={otp.length !== 6 || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Verify & Continue
          </Button>
          <p className="text-muted-foreground text-sm mt-6">
            Didn't receive a code?{" "}
            <button onClick={handleResend} disabled={resending} className="text-primary hover:underline">
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerify;
