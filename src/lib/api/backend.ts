// Server-only helper for backend base URL.
// Share centralized logic via runtimeConfig.
import { runtimeConfig, requireBackendBaseUrl } from "@/config/runtime";

export function getBackendUrl(): string | undefined {
  return runtimeConfig.backendBaseUrl;
}

export function requireBackendUrl(): string {
  return requireBackendBaseUrl();
}
