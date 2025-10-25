import { Happy_Monkey } from "next/font/google";

interface LogoProps {
  className?: string;
  variant?: "icon" | "text"; // default: icon
  size?: number; // only for icon variant, px
}

// Playful display face as requested: Happy Monkey (single weight)
const LogoFont = Happy_Monkey({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function Logo({ className, variant = "icon", size }: LogoProps) {
  if (variant === "icon") {
    const px = Math.max(24, Math.min(128, Math.round(size ?? 40))); // sane bounds
    const letterSize = Math.round(px * 0.75);
    return (
      <span
        className={`${LogoFont.className} app-icon inline-flex select-none ${className ?? ""}`}
        aria-label="AIVisa logo"
        style={{ width: px, height: px, fontSize: letterSize }}
        suppressHydrationWarning
      >
        <span className="app-icon__letter">A</span>
      </span>
    );
  }

  // text variant: AIVisa wordmark with brand gradient on "AI"
  return (
    <span
      className={
        `${LogoFont.className} inline-flex items-baseline leading-none ` +
        `${className ?? "text-2xl sm:text-3xl md:text-4xl tracking-[-0.01em]"}`
      }
      aria-label="AIVisa"
      suppressHydrationWarning
    >
      <span
        className="bg-clip-text text-transparent [letter-spacing:0.005em]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--ai-gradient-light-start), var(--ai-gradient-light-end))",
        }}
      >
        AI
      </span>
      <span className="text-slate-800">Visa</span>
    </span>
  );
}