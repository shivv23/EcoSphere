"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTRPCClient } from "@/lib/trpc/client";
import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { KeyboardShortcuts } from "@/components/global-search";

const GlobalSearch = lazy(() => import("@/components/global-search"));

function GlobalSearchWithState() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Suspense fallback={null}>
      <GlobalSearch isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Suspense>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <SessionProvider>
      <ThemeProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
            <GlobalSearchWithState />
            <KeyboardShortcuts />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1a1a2e",
                  color: "#fff",
                  borderRadius: "12px",
                },
              }}
            />
          </QueryClientProvider>
        </trpc.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
