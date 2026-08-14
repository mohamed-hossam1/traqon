import axios, { type AxiosRequestConfig } from "axios";
import { cache } from "react";
import { ApiError } from "@/lib/next-action-handler/error/errors";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/$/, "");

let clientAccessToken: string | null = null;

const getRequestStore = cache(() => ({
  accessToken: null as string | null,
}));

export async function setAccessToken(token: string | null): Promise<void> {
  if (typeof window === "undefined") {
    try {
      getRequestStore().accessToken = token;
    } catch {}

    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      if (token) {
        await cookieStore.set("access_token", token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 15 * 60,
        });
      } else {
        await cookieStore.delete("access_token");
        await cookieStore.delete("refresh_token");
      }
    } catch {}
  } else {
    clientAccessToken = token;
    if (token) {
      document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${15 * 60}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
    } else {
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    }
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const reqToken = getRequestStore().accessToken;
      if (reqToken) return reqToken;
    } catch {}

    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("access_token")?.value ?? null;
    } catch {
      return null;
    }
  }
  if (clientAccessToken) return clientAccessToken;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  const method = config.method?.toLowerCase();
  if (method && ["post", "put", "patch", "delete"].includes(method)) {
    if (
      !config.headers.get("x-idempotency-key") &&
      !config.headers.get("X-Idempotency-Key")
    ) {
      const key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      config.headers.set("x-idempotency-key", key);
    }
  }

  if (typeof window === "undefined") {
    const headers = await getServerRequestHeaders();
    for (const [name, value] of Object.entries(headers)) {
      config.headers.set(name, value);
    }
  }

  return config;
});

async function getServerRequestHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") return {};

  try {
    const { cookies, headers } = await import("next/headers");
    const cookieStore = await cookies();
    const requestHeaders = await headers();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const userAgent = requestHeaders.get("user-agent");
    const forwardedFor =
      requestHeaders.get("x-forwarded-for") || requestHeaders.get("x-real-ip");
    const result: Record<string, string> = {};

    if (cookieHeader) result.Cookie = cookieHeader;
    if (userAgent) result["User-Agent"] = userAgent;
    if (forwardedFor) result["X-Forwarded-For"] = forwardedFor;

    return result;
  } catch {
    return {};
  }
}

instance.interceptors.response.use(
  async (response) => {
    await forwardSetCookieHeaders(response.headers["set-cookie"]);
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new ApiError(500, error?.message || "Network Error", error);
    }

    const { status, data } = error.response;
    const errMsg = extractErrorMessage(data, error.message);
    const errCode =
      data && typeof data === "object" && "code" in data
        ? String((data as Record<string, unknown>).code)
        : undefined;

    const isServiceUnavailable =
      status === 503 || errCode === "AUTHORIZATION_SERVICE_UNAVAILABLE";
    if (isServiceUnavailable) {
      throw new ApiError(
        503,
        errMsg || "Authorization service is temporarily unavailable",
        error,
      );
    }

    const isStaleAuth =
      status === 401 && errCode === "STALE_AUTHORIZATION";

    if (
      status === 401 &&
      !isStaleAuth &&
      !error.config?.__isRetry
    ) {
      const isRevokedError =
        errMsg.toLowerCase().includes("revoked");

      if (isRevokedError) {
        await setAccessToken(null);
        if (typeof window !== "undefined") {
          import("@/lib/auth/revocation").then(({ triggerGlobalRevocation }) => {
            triggerGlobalRevocation();
          });
        }
        throw new ApiError(status, errMsg, error);
      }
    }

    if (status === 401 && !error.config?.__isRetry) {
      const refreshed = await tryRefreshAccessToken();
      if (refreshed && error.config) {
        error.config.__isRetry = true;
        const freshToken = await getAccessToken();
        if (freshToken) {
          error.config.headers.set("Authorization", `Bearer ${freshToken}`);
        }
        return instance.request(error.config);
      }

      if (typeof window !== "undefined") {
        import("@/lib/auth/revocation").then(({ triggerGlobalRevocation }) => {
          triggerGlobalRevocation();
        });
      }
    }

    throw new ApiError(status, errMsg, error);
  },
);

const AUTH_REFRESH_LOCK = "auth-refresh";
const AUTH_REFRESH_CHANNEL = "project_name_auth_refresh";

let refreshPromise: Promise<boolean> | null = null;

let lastRefreshTimestamp = 0;

async function tryRefreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") {
    return doRefresh();
  }

  if (refreshPromise) return refreshPromise;

  if ("locks" in navigator) {
    refreshPromise = acquireRefreshLock().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function acquireRefreshLock(): Promise<boolean> {
  return navigator.locks.request(AUTH_REFRESH_LOCK, async () => {
    const currentToken = await getAccessToken();
    if (currentToken && lastRefreshTimestamp > Date.now() - 5_000) {
      return true;
    }

    const result = await doRefresh();

    if (result) {
      broadcastRefreshSuccess();
    }

    return result;
  });
}

async function doRefresh(): Promise<boolean> {
  try {
    const headers = await getServerRequestHeaders();
    const res = await axios.post(`${BASE_URL}/auth/refresh`, undefined, {
      withCredentials: true,
      headers,
    });

    await forwardSetCookieHeaders(res.headers["set-cookie"]);

    const newToken = res.data?.accessToken;
    if (newToken) {
      await setAccessToken(newToken);
      lastRefreshTimestamp = Date.now();
      return true;
    }
    return false;
  } catch {
    await setAccessToken(null);
    return false;
  }
}

function broadcastRefreshSuccess(): void {
  if (typeof window === "undefined") return;
  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_REFRESH_CHANNEL);
      channel.postMessage({ type: "TOKEN_REFRESHED", timestamp: Date.now() });
      channel.close();
    }
  } catch {}
}

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  const refreshChannel = new BroadcastChannel(AUTH_REFRESH_CHANNEL);
  refreshChannel.onmessage = (event) => {
    if (event.data?.type === "TOKEN_REFRESHED") {
      lastRefreshTimestamp = event.data.timestamp ?? Date.now();
    }
  };
}

async function forwardSetCookieHeaders(
  setCookieHeader: string | string[] | undefined,
) {
  if (typeof window !== "undefined" || !setCookieHeader) return;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const cookieStrings = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    for (const raw of cookieStrings) {
      const parsed = parseSetCookie(raw);
      if (parsed) {
        try {
          await cookieStore.set(parsed);
        } catch {}
      }
    }
  } catch {}
}

function parseSetCookie(raw: string) {
  const parts = raw.split(";").map((p) => p.trim());
  const [head, ...rest] = parts;
  const eqIdx = head.indexOf("=");
  if (eqIdx <= 0) return null;

  const name = head.substring(0, eqIdx);
  const value = head.substring(eqIdx + 1);

  let maxAge: number | undefined;
  let path: string | undefined = "/";
  let httpOnly = false;
  let secure = false;
  let sameSite: "lax" | "strict" | "none" | undefined;

  for (const part of rest) {
    const [k, v] = part.split("=");
    const key = (k || "").toLowerCase();
    if (key === "max-age" && v) maxAge = parseInt(v, 10);
    if (key === "path" && v) path = v;
    if (key === "httponly") httpOnly = true;
    if (key === "secure") secure = true;
    if (key === "samesite" && v) {
      const s = v.toLowerCase();
      if (s === "lax" || s === "strict" || s === "none") sameSite = s;
    }
  }

  return {
    name,
    value,
    path,
    httpOnly,
    secure,
    sameSite,
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.message)) return d.message.join(", ");
  if (typeof d.message === "string") return d.message;
  return fallback;
}

declare module "axios" {
  interface InternalAxiosRequestConfig {
    __isRetry?: boolean;
  }
}

export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get<T>(url, config);
    return response.data;
  },

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.post<T>(url, data, config);
    return response.data;
  },

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.patch<T>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.delete<T>(url, config);
    return response.data;
  },
};
