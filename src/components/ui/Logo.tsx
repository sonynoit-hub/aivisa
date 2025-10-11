interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width, height }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="AI Visa Logo"
      width={width || 40}
      height={height || 40}
      className={className || "h-15 w-auto"}
      suppressHydrationWarning={true}
    />
  );
}