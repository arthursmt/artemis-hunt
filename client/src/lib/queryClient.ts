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

export function getEnvironmentInfo(): { isDev: boolean; baseUrl: string; submitUrl: string; mode: 'hub' | 'standalone'; isEmbedded: boolean; referrer: string } {
  const baseUrl = getBaseUrl();
  const isDev = baseUrl.includes('.replit.dev') || baseUrl.includes('localhost');
  
  // Detect if embedded in iframe
  const isEmbedded = window.top !== window;
  const referrer = document.referrer || '';
  const isFromHub = referrer.includes('artemis-hub.replit.app');
  
  // Hub mode: embedded iframe from Hub OR direct access on Hub domain
  const hostIsHub = window.location.host.includes('artemis-hub.replit.app');
  const isHub = (isEmbedded && isFromHub) || hostIsHub;
  const mode = isHub ? 'hub' : 'standalone';
  
  // If in Hub (embedded or direct), submit to Hub proxy; otherwise use own origin
  const submitUrl = isHub 
    ? 'https://artemis-hub.replit.app/api/proposals/submit'
    : `${import.meta.env.VITE_API_BASE_URL || window.location.origin}/api/proposals/submit`;
  
  return { isDev, baseUrl, submitUrl, mode, isEmbedded, referrer };
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
