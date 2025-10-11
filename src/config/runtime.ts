// Centralized runtime config for environment-dependent values
// Stage policy:
// - dev: local development, default backend/analytics base to http://localhost:8080 if not provided
// - deploy: production/staging deploy, require explicit envs by callers when needed

type AppStage = "dev" | "deploy";

const DEFAULT_LOCAL = "http://localhost:8080" as const;

function trimEndSlash(v?: string | null): string | undefined {
  const s = v?.trim();
  return s ? s.replace(/\/$/, "") : undefined;
}

function detectStage(): AppStage {
  const env = process.env.APP_ENV?.trim() as AppStage | undefined;
  if (env === "dev" || env === "deploy") return env;
  // Fallback: map NODE_ENV
  return process.env.NODE_ENV === "development" ? "dev" : "deploy";
}

const stage = detectStage();

// These read from process.env but do not throw; callers can enforce via helpers below
const configuredBackend = trimEndSlash(process.env.BACKEND_URL);
const configuredAnalytics = trimEndSlash(process.env.ANALYTICS_PROXY_BASE);

const backendBaseUrl = ((): string | undefined => {
  if (configuredBackend) return configuredBackend;
  if (stage === "dev") return DEFAULT_LOCAL;
  return undefined;
})();

const analyticsBaseUrl = ((): string | undefined => {
  if (configuredAnalytics) return configuredAnalytics;
  // default to backend base if present, otherwise local for dev only
  if (backendBaseUrl) return backendBaseUrl;
  if (stage === "dev") return DEFAULT_LOCAL;
  return undefined;
})();

export const runtimeConfig = {
  stage,
  backendBaseUrl,
  analyticsBaseUrl,
  defaults: { localBackend: DEFAULT_LOCAL },
} as const;

export function requireBackendBaseUrl(): string {
  if (!runtimeConfig.backendBaseUrl) {
    throw new Error(
      "BACKEND_URL is required in deploy stage. Set BACKEND_URL to your backend base URL."
    );
  }
  return runtimeConfig.backendBaseUrl;
}

export function requireAnalyticsBaseUrl(): string {
  if (!runtimeConfig.analyticsBaseUrl) {
    throw new Error(
      "ANALYTICS_PROXY_BASE is required in deploy stage. Set it to your analytics proxy base URL."
    );
  }
  return runtimeConfig.analyticsBaseUrl;
}
