import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How is my carbon footprint calculated?",
    a: "FootZero uses verified emission factors to calculate your CO₂ emissions. For transport, we multiply your distance by the emission factor for your chosen mode — for example, a car produces 0.21 kg CO₂ per km, a bus produces 0.089 kg CO₂ per km, and walking or cycling produces zero emissions. For diet, each meal type has a fixed emission value — vegan meals produce 0.7 kg, mixed meals 2.5 kg, and meat-heavy meals 4.5 kg. For energy, we multiply your kWh usage by the grid emission factor."
  },
  {
    q: "What is the OpenWeatherMap API and how is it used?",
    a: "FootZero integrates the OpenWeatherMap API to show you real-time weather conditions and Air Quality Index (AQI) data for your city directly on your dashboard. This helps you connect your personal carbon emissions to the real environmental conditions around you. You can also search for any city to check its air quality."
  },
  {
    q: "How do I log my carbon activities?",
    a: "Click on 'Calculator' in the sidebar. Select your activity category — Transport, Diet, Energy, or Shopping — fill in the details such as distance travelled or meal type, and click Calculate. Your result will be saved automatically to your dashboard and history."
  },
  {
    q: "How do badges and achievements work?",
    a: "Badges are awarded automatically when you reach milestones. You earn 'First Step' for logging your first activity, 'Green Week' for staying under 50 kg CO₂ in a week, 'Streak Master' for logging activities 7 days in a row, and 'Carbon Cutter' for reducing your emissions by 20% compared to the previous week."
  },
  {
    q: "How do I set or change my city for weather data?",
    a: "Go to Settings and update your city in the Profile section, then save. Your dashboard weather and AQI widget will automatically update to show data for your new city. You can also search for any city directly in the weather widget on the dashboard."
  },
  {
    q: "What data does FootZero store?",
    a: "FootZero stores the activity data you voluntarily log — transport mode and distance, meal types, and energy usage. It also stores your profile information such as name, email, and city. Your data is stored securely in a PostgreSQL database hosted on Supabase."
  },
];

const Help = () => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div>
      <h2 className="text-foreground text-2xl font-bold mb-2">Help Center</h2>
      <p className="text-muted-foreground">Frequently asked questions about FootZero.</p>
    </div>

    <div className="bg-card rounded-2xl border border-border p-6">
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border">
            <AccordionTrigger className="text-foreground text-sm font-medium hover:text-primary hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>

    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
      <p className="text-foreground text-sm font-medium mb-1">Still need help?</p>
      <p className="text-muted-foreground text-sm">
        Reach out to us at{" "}
        <a href="mailto:support@footzero.com" className="text-primary hover:underline font-medium">
          support@footzero.com
        </a>
      </p>
    </div>
  </div>
);

export default Help;
