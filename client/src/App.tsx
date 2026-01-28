import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Extend Window interface for apiBase config
declare global {
  interface Window {
    __ARTEMIS_API_BASE__?: string;
    __ARTEMIS_EMBEDDED_MODE__?: boolean;
  }
}

// localStorage key for apiBase persistence (standalone mode only)
const ARTEMIS_API_BASE_KEY = "ARTEMIS_API_BASE";

// Initialize from query params
const qp = new URLSearchParams(window.location.search);
const embeddedMode = qp.get("embed") === "1";
const apiBaseFromQuery = qp.get("apiBase");

// Store embeddedMode flag globally
window.__ARTEMIS_EMBEDDED_MODE__ = embeddedMode;

console.log("[HUNT EMBED] embeddedMode=", embeddedMode);
console.log("[HUNT EMBED] apiBase(query)=", apiBaseFromQuery);

if (embeddedMode) {
  // Embedded mode: only use in-memory, no localStorage
  if (apiBaseFromQuery) {
    window.__ARTEMIS_API_BASE__ = apiBaseFromQuery;
    console.log("[HUNT EMBED] apiBase set from query (in-memory only)");
  }
} else {
  // Standalone mode: use localStorage fallback
  const apiBaseFromStorage = localStorage.getItem(ARTEMIS_API_BASE_KEY);
  if (apiBaseFromQuery) {
    localStorage.setItem(ARTEMIS_API_BASE_KEY, apiBaseFromQuery);
    window.__ARTEMIS_API_BASE__ = apiBaseFromQuery;
    console.log("[HUNT CONFIG] apiBase from query:", apiBaseFromQuery);
  } else if (apiBaseFromStorage) {
    window.__ARTEMIS_API_BASE__ = apiBaseFromStorage;
    console.log("[HUNT CONFIG] apiBase from localStorage:", apiBaseFromStorage);
  }
}

console.log("[HUNT EMBED] apiBase(memory)=", window.__ARTEMIS_API_BASE__);

// Pages
import Home from "@/pages/Home";
import OnGoingProposals from "@/pages/OnGoingProposals";
import UnderEvaluationProposals from "@/pages/UnderEvaluationProposals";
import CompletedProposals from "@/pages/CompletedProposals";
import RenewalsScreen from "@/pages/RenewalsScreen";
import CollectionsScreen from "@/pages/CollectionsScreen";
import NewProposalScreen from "@/pages/NewProposalScreen";
import CreditValidationScreen from "@/pages/CreditValidationScreen";
import ProductConfigScreen from "@/pages/ProductConfigScreen";
import ProposalDetailsPage from "@/pages/ProposalDetailsPage";
import ContractScreen from "@/pages/ContractScreen";

import { ProposalProvider } from "@/lib/proposalStore";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ongoing" component={OnGoingProposals} />
      <Route path="/under-evaluation" component={UnderEvaluationProposals} />
      <Route path="/completed" component={CompletedProposals} />
      <Route path="/renewals" component={RenewalsScreen} />
      <Route path="/collections" component={CollectionsScreen} />
      <Route path="/new-proposal" component={NewProposalScreen} />
      <Route path="/credit-validation" component={CreditValidationScreen} />
      <Route path="/product-config" component={ProductConfigScreen} />
      <Route path="/product-config/:id" component={ProductConfigScreen} />
      <Route path="/ongoing/:id/details" component={ProposalDetailsPage} />
      <Route path="/contract/:id" component={ContractScreen} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Listen for postMessage from parent (Hub) to set apiBase
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === "ARTEMIS_CONFIG" && typeof data.apiBase === "string") {
        // In embedded mode, only store in-memory
        if (window.__ARTEMIS_EMBEDDED_MODE__) {
          window.__ARTEMIS_API_BASE__ = data.apiBase;
          console.log("[HUNT EMBED] received apiBase via postMessage (in-memory):", data.apiBase);
        } else {
          localStorage.setItem(ARTEMIS_API_BASE_KEY, data.apiBase);
          window.__ARTEMIS_API_BASE__ = data.apiBase;
          console.log("[HUNT CONFIG] received apiBase via postMessage:", data.apiBase);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProposalProvider>
          <Toaster />
          <Router />
        </ProposalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
