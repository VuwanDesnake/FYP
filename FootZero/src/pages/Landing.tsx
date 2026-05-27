import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Target, Lightbulb, ArrowRight, Globe, TrendingDown, ChevronRight, Shield, Leaf, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const features = [
  { icon: BarChart3, title: "Track Emissions", desc: "Log daily activities and see your carbon footprint breakdown with beautiful interactive charts." },
  { icon: Target, title: "Set Goals", desc: "Define weekly reduction targets and track progress toward a greener lifestyle." },
  { icon: Lightbulb, title: "Get Tips", desc: "Receive personalized eco-tips based on your habits and emission patterns." },
  { icon: Shield, title: "Earn Badges", desc: "Get rewarded for milestones like your first log, green weeks, and logging streaks." },
];

const facts = [
  { value: "4 Categories", label: "Transport, Diet, Energy & Shopping", icon: Globe },
  { value: "Real-Time AQI", label: "Live Air Quality for Your City", icon: Wind },
  { value: "Free Forever", label: "No Credit Card Required", icon: TrendingDown },
];

const steps = [
  { step: "01", title: "Sign Up Free", desc: "Create your account in seconds — no credit card required." },
  { step: "02", title: "Log Activities", desc: "Record transport, diet, energy, and shopping habits daily." },
  { step: "03", title: "See Your Impact", desc: "View detailed breakdowns and charts of your carbon footprint." },
  { step: "04", title: "Reduce & Earn", desc: "Follow tips, hit goals, and earn badges as you go green." },
];

const whyCards = [
  {
    icon: Leaf,
    title: "Localised for Nepal",
    desc: "Built with emission factors and defaults relevant to the Nepali lifestyle — not just Western markets.",
  },
  {
    icon: Wind,
    title: "Live Air Quality Data",
    desc: "See real-time AQI and weather conditions for your city via the OpenWeatherMap API, directly on your dashboard.",
  },
  {
    icon: Shield,
    title: "Gamified Sustainability",
    desc: "Earn badges, maintain streaks, and complete weekly challenges to stay motivated on your green journey.",
  },
  {
    icon: BarChart3,
    title: "Beautiful Analytics",
    desc: "Interactive charts show your daily, weekly, and monthly emissions so you always know where you stand.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const Landing = () => (
  <div className="min-h-screen bg-background overflow-hidden">
    {/* Nav */}
    <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
      <Logo size="md" />
      <div className="flex items-center gap-3">
        <Link to="/login"><Button variant="ghost" className="text-foreground">Log in</Button></Link>
        <Link to="/signup"><Button variant="hero" size="sm" className="rounded-xl">Sign Up Free</Button></Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative px-6 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <motion.div initial="hidden" animate="visible" className="relative z-10">
        <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 text-sm text-primary">
          <Logo size="sm" showText={false} />
          Personal Carbon Footprint Tracker
          <ChevronRight className="h-3 w-3" />
        </motion.div>
        <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
          <span className="gradient-text">Measure.</span>{" "}<span className="text-foreground">Reduce.</span>{" "}<span className="gradient-text">Thrive.</span>
        </motion.h1>
        <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Track your personal carbon emissions, set reduction goals, and discover actionable ways to live more sustainably — all in one beautiful app.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup"><Button variant="hero" size="lg" className="text-lg px-10 py-6 rounded-xl">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          <Link to="/login"><Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-border text-foreground hover:bg-card">I have an account</Button></Link>
        </motion.div>
      </motion.div>
    </section>

    {/* Facts Bar — real facts only */}
    <section className="border-y border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-10 grid grid-cols-3 gap-6">
        {facts.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-foreground text-xl md:text-2xl font-bold">{s.value}</p>
            <p className="text-muted-foreground text-sm">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="px-6 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Features</span>
        <h2 className="text-foreground text-3xl md:text-4xl font-bold mt-3">Everything you need to go green</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Powerful tools to understand, track, and reduce your environmental impact.</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card rounded-2xl p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-foreground font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* How It Works */}
    <section className="px-6 md:px-8 py-20 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">How It Works</span>
          <h2 className="text-foreground text-3xl md:text-4xl font-bold mt-3">Get started in 4 simple steps</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
              <span className="text-5xl font-extrabold text-primary/10">{s.step}</span>
              <h3 className="text-foreground font-semibold text-lg mt-2 mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-6 -right-3 text-primary/20"><ArrowRight className="h-5 w-5" /></div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why FootZero — replaces fake testimonials */}
    <section className="px-6 md:px-8 py-20 md:py-28 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <span className="text-primary text-sm font-semibold uppercase tracking-wider">Why FootZero</span>
        <h2 className="text-foreground text-3xl md:text-4xl font-bold mt-3">Built for real impact</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">FootZero was designed from the ground up to make carbon tracking meaningful, accurate, and engaging.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        {whyCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card rounded-2xl p-7 flex gap-5 hover:border-primary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <card.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Final CTA */}
    <section className="px-6 md:px-8 py-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center bg-card rounded-3xl p-10 md:p-16 border border-border relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="relative z-10">
          <Logo size="xl" showText={false} className="justify-center mb-5" />
          <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">Ready to reduce your footprint?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Start tracking your carbon footprint today. It's free, no credit card required.</p>
          <Link to="/signup"><Button variant="hero" size="lg" className="text-lg px-10 py-6 rounded-xl">Start Tracking Now <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
        </div>
      </motion.div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">Your personal carbon footprint tracker. Measure, understand, and reduce your environmental impact one day at a time.</p>
          </div>
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4">Product</h4>
            <div className="space-y-2">
              <Link to="/signup" className="block text-muted-foreground text-sm hover:text-primary transition-colors">Get Started</Link>
              <Link to="/login" className="block text-muted-foreground text-sm hover:text-primary transition-colors">Sign In</Link>
            </div>
          </div>
          <div>
            <h4 className="text-foreground font-semibold text-sm mb-4">Legal</h4>
            <div className="space-y-2">
              <Link to="/legal" className="block text-muted-foreground text-sm hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="block text-muted-foreground text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-muted-foreground text-sm">© 2026 FootZero. All rights reserved.</span>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Logo size="sm" showText={false} className="mr-1" /> For a greener planet 🌍
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
