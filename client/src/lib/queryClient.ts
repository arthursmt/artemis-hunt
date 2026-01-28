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

export function getEnvironmentInfo(): { isDev: boolean; baseUrl: string; submitUrl: string; mode: 'hub' | 'standalone'; apiBase: string; isOnHub: boolean } {
  const baseUrl = getBaseUrl();
  const isDev = baseUrl.includes('.replit.dev') || baseUrl.includes('localhost');
  
  // Get apiBase from global (set in App.tsx based on host)
  const apiBase = (window as any).__ARTEMIS_API_BASE__ as string || "";
  const isOnHub = (window as any).__ARTEMIS_EMBEDDED_MODE__ === true;
  
  // Mode: Hub (same-origin) or standalone
  const mode = isOnHub ? 'hub' : 'standalone';
  
  // Compute submit URL: apiBase + path (empty apiBase = same-origin)
  const submitUrl = `${apiBase}/api/proposals/submit`;
  
  return { isDev, baseUrl, submitUrl, mode, apiBase, isOnHub };
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
