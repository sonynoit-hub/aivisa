import { z } from "zod";

// Server-only variables (never exposed to the browser)
const serverSchema = z.object({
  // Example secrets – add as needed
  API_SECRET_KEY: z.string().min(16).optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  BACKEND_URL: z.string().url().optional(),
  ANALYTICS_PROXY_BASE: z.string().url().optional(),
  APP_ENV: z.enum(["dev", "deploy"]).default("dev").optional(),
  DEV_ALLOWED_ORIGINS: z.string().optional(),
});

// Client-exposed variables (must be prefixed with NEXT_PUBLIC_)
const clientSchema = z.object({
  // In development, allow this to be undefined and default to http://localhost:3000
  NEXT_PUBLIC_API_BASE: z.string().url().optional(),
});

// Build-time variables used for toggles, etc.
const buildSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const processEnv = {
  // server
  API_SECRET_KEY: process.env.API_SECRET_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
  BACKEND_URL: process.env.BACKEND_URL,
  // client
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  // build
  NODE_ENV: process.env.NODE_ENV as any,
};

const merged = serverSchema.merge(clientSchema).merge(buildSchema);
const parsed = merged.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

// Apply sane defaults after validation for development ergonomics
const data = parsed.data as typeof processEnv & { NEXT_PUBLIC_API_BASE?: string };
if (!data.NEXT_PUBLIC_API_BASE && data.NODE_ENV !== 'production') {
  data.NEXT_PUBLIC_API_BASE = 'http://localhost:3000';
}
export const env = data as Readonly<typeof data>;

// Provide a client-safe projection to ensure no server secrets leak into the browser bundle
export const clientEnv = {
  NEXT_PUBLIC_API_BASE: env.NEXT_PUBLIC_API_BASE,
  NODE_ENV: env.NODE_ENV,
} as const;

// Helper for server code to assert presence of secrets when needed at runtime
export function requireServerSecret(name: keyof typeof env) {
  const value = env[name as keyof typeof env];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${String(name)}`);
  }
  return value as string;
}
