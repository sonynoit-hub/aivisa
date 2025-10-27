import { Happy_Monkey } from "next/font/google";

interface LogoProps {
  className?: string;
  variant?: "icon" | "text"; // default: icon
  size?: number; // only for icon variant, px
  // Scale of the inner letter relative to the icon box (0.5 - 0.9 recommended)
  letterScale?: number;
  // Corner radius percentage for the icon box; if not provided, uses CSS default (22%)
  radiusPct?: number;
}

// Playful display face as requested: Happy Monkey (single weight)
const LogoFont = Happy_Monkey({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function Logo({ className, variant = "icon", size, letterScale, radiusPct }: LogoProps) {
  if (variant === "icon") {
    // Overall icon size (background). Default slightly smaller for a lighter header look.
    const px = Math.max(20, Math.min(128, Math.round(size ?? 36))); // sane bounds
    // Inner "A" size as a ratio of the box size; default tuned for better breathing room.
    const ratio = Math.max(0.5, Math.min(0.9, letterScale ?? 0.66));
    const letterSize = Math.round(px * ratio);
    const styleBorderRadius = typeof radiusPct === "number" ? `${Math.max(0, Math.min(50, radiusPct))}%` : undefined;
    return (
      <span
        className={`${LogoFont.className} app-icon inline-flex select-none ${className ?? ""}`}
        aria-label="AIVisa logo"
        style={{ width: px, height: px, fontSize: letterSize, borderRadius: styleBorderRadius }}
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