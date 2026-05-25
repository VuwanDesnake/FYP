import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => (
  <div className="min-h-screen bg-background px-4 py-12">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-foreground text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="bg-card rounded-2xl border border-border p-8 space-y-4 text-muted-foreground text-sm leading-relaxed">
        <p>Your privacy is important to us. This policy explains how FootZero collects, uses, and protects your information.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">1. Data We Collect</h2>
        <p>We collect your name, email, city, and activity data (transport, diet, energy usage) that you voluntarily log. We do not track browsing activity or sell data to third parties.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">2. How We Use Data</h2>
        <p>Your data is used to calculate carbon emissions, display charts, award badges, and provide personalized tips. Aggregated, anonymized data may be used for platform-wide statistics.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">3. Data Security</h2>
        <p>All data is encrypted in transit and at rest. We use Supabase's security infrastructure including Row Level Security for database access control.</p>
        <h2 className="text-foreground font-semibold text-lg pt-2">4. Your Rights</h2>
        <p>You can request data export or deletion at any time through the Settings page. We will process requests within 30 days.</p>
        <p className="pt-4 text-xs text-muted-foreground">Last updated: March 30, 2026</p>
      </div>
    </div>
  </div>
);

export default Privacy;
