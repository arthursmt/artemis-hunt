import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export function getBaseUrl(): string {
  return window.location.origin;
}

export function getEnvironmentInfo(): { isDev: boolean; baseUrl: string; submitUrl: string; mode: 'hub' | 'standalone' } {
  const baseUrl = getBaseUrl();
  const isDev = baseUrl.includes('.replit.dev') || baseUrl.includes('localhost');
  
  // Detect if running inside Hub:
  // 1. Direct access on Hub domain (window.location.host)
  // 2. Path starts with /hunt (Hub routing)
  // 3. URL param ?hub=1 (explicit flag from Hub embed)
  // 4. Referrer from Hub domain (iframe embed)
  const urlParams = new URLSearchParams(window.location.search);
  const hubParam = urlParams.get('hub') === '1';
  const referrerFromHub = document.referrer.includes('artemis-hub.replit.app');
  const hostIsHub = window.location.host.includes('artemis-hub.replit.app');
  const pathIsHunt = window.location.pathname.startsWith('/hunt');
  
  const isHub = hostIsHub || pathIsHunt || hubParam || referrerFromHub;
  const mode = isHub ? 'hub' : 'standalone';
  
  // If in Hub, submit to Hub's origin or known Hub URL; otherwise use own origin
  const hubBaseUrl = hostIsHub ? window.location.origin : 'https://artemis-hub.replit.app';
  const submitUrl = isHub 
    ? `${hubBaseUrl}/api/proposals/submit`
    : `${import.meta.env.VITE_API_BASE_URL || window.location.origin}/api/proposals/submit`;
  
  return { isDev, baseUrl, submitUrl, mode };
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
