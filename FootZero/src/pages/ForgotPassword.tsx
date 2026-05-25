import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Check your email", description: "A password reset link has been sent to your email." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 gradient-hero opacity-[0.07]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-md">
          <Logo size="lg" className="mb-8" />
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">Reset your password</h2>
          <p className="text-muted-foreground leading-relaxed">
            Enter your email and we'll send you a link to reset your password and get back to tracking your carbon footprint.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-foreground text-2xl font-bold">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link in your email to set a new password.
              </p>
              <Link to="/login" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-foreground text-2xl font-bold">Forgot password?</h2>
                <p className="text-muted-foreground text-sm mt-1">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-card border-border text-foreground h-11 rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" variant="hero" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
                <p className="text-center">
                  <Link to="/login" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                  </Link>
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
