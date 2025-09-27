import type { NextRequest } from "next/server";

export type TransportName = "http" | "sse" | "ws";

export interface TransportConfig {
  name: TransportName;
  upstreamPath: string;
  method: "GET" | "POST";
  isStream: boolean;
  defaultEnabled: boolean;
}

const TRANSPORT_REGISTRY_INTERNAL: Record<TransportName, TransportConfig> = {
  http: {
    name: "http",
    upstreamPath: "/mcp/http",
    method: "POST",
    isStream: false,
    defaultEnabled: true,
  },
  sse: {
    name: "sse",
    upstreamPath: "/mcp/sse",
    method: "GET",
    isStream: true,
    defaultEnabled: true,
  },
  ws: {
    name: "ws",
    upstreamPath: "/mcp/ws",
    method: "GET",
    isStream: true,
    defaultEnabled: false,
  },
};

const MCP_SUPPORTED_TRANSPORTS_ENV = "MCP_SUPPORTED_TRANSPORTS";

function isTransportName(value: string): value is TransportName {
  return value === "http" || value === "sse" || value === "ws";
}

function parseTransportList(rawList: string | undefined): TransportName[] | null {
  if (!rawList) {
    return null;
  }

  const transports = rawList
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(value => value.length > 0 && isTransportName(value))
    .map(value => value as TransportName);

  return transports.length > 0 ? transports : null;
}

function computeEnabledTransports(): Set<TransportName> {
  const fromEnv = parseTransportList(process.env[MCP_SUPPORTED_TRANSPORTS_ENV]);

  if (fromEnv) {
    return new Set(fromEnv);
  }

  const defaults = Object.values(TRANSPORT_REGISTRY_INTERNAL)
    .filter(config => config.defaultEnabled)
    .map(config => config.name);

  return new Set(defaults);
}

const ENABLED_TRANSPORTS_CACHE = computeEnabledTransports();

export const TRANSPORT_REGISTRY = TRANSPORT_REGISTRY_INTERNAL;

export function normalizeTransportName(value: string | null | undefined): TransportName | null {
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase();
  return isTransportName(lower) ? lower : null;
}

export function isTransportEnabled(transport: string): boolean {
  const normalized = normalizeTransportName(transport);
  if (!normalized) {
    return false;
  }

  return ENABLED_TRANSPORTS_CACHE.has(normalized);
}

export function getEnabledTransports(): TransportName[] {
  return Array.from(ENABLED_TRANSPORTS_CACHE.values());
}

export function getTransportConfig(transport: TransportName): TransportConfig {
  return TRANSPORT_REGISTRY_INTERNAL[transport];
}

export function resolveUpstreamOrigin(request: NextRequest): string {
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (envOrigin) {
    try {
      return new URL(envOrigin).origin;
    } catch {
      // Fall back to headers if the env value is malformed.
    }
  }

  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(/:$/, "") ??
    "https";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;

  return `${forwardedProto}://${forwardedHost}`;
}