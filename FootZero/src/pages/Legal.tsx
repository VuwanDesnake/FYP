import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Legal = () => (
  <div className="min-h-screen bg-background px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-foreground text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="bg-card rounded-2xl border border-border p-8 space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>Welcome to FootZero. By accessing or using our service, you agree to be bound by these terms.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">1. Use of Service</h2>
        <p>FootZero provides carbon footprint tracking tools for personal, non-commercial use. You must be at least 16 years old to create an account.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">2. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">3. Data Accuracy</h2>
        <p>Emission calculations are estimates based on publicly available data and the Climatiq API. They are for informational purposes only.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">4. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.</p>
        <p className="pt-4 text-xs text-muted-foreground">Last updated: March 30, 2026</p>
      </div>
    </div>
  </div>
);

export default Legal;
