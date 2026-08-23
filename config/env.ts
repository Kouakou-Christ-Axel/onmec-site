export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getApiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (url) return url;
  if (isProduction()) {
    throw new Error("API_BASE_URL manquante en production");
  }
  return "http://localhost:8081/api/v1";
}
