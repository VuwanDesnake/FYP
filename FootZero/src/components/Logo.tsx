import logoImg from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoImg} alt="FootZero" className={`${sizes[size]} rounded-xl object-contain`} />
      {showText && <span className="font-bold text-xl text-foreground">FootZero</span>}
    </div>
  );
}
