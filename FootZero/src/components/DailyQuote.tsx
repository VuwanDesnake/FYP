import { Quote } from "lucide-react";

const quotes = [
  { text: "The greatest threat to our planet is the belief that someone else will save it.", author: "Robert Swan" },
  { text: "We do not inherit the earth from our ancestors, we borrow it from our children.", author: "Native American Proverb" },
  { text: "The environment is where we all meet; where we all have a mutual interest.", author: "Lady Bird Johnson" },
  { text: "What we are doing to the forests is but a mirror reflection of what we are doing to ourselves.", author: "Mahatma Gandhi" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Every day is Earth Day.", author: "Anonymous" },
  { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
];

export function DailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start gap-3">
        <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground text-sm italic leading-relaxed">"{quote.text}"</p>
          <p className="text-muted-foreground text-xs mt-1.5">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
