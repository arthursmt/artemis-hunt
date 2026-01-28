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

// Determine API base dynamically based on host
// If running on artemis-hub.replit.app, use same-origin (empty string)
// If running on Hunt domain, use own origin
const host = window.location.host;
const isOnHub = host.includes("artemis-hub");

// Set apiBase: empty for same-origin on Hub, or own origin for standalone
const apiBase = isOnHub ? "" : window.location.origin;
window.__ARTEMIS_API_BASE__ = apiBase;
window.__ARTEMIS_EMBEDDED_MODE__ = isOnHub;

console.log("[API BASE] host=", host);
console.log("[API BASE] isOnHub=", isOnHub);
console.log("[API BASE] apiBase=", apiBase || "(same-origin)");

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
  // Listen for postMessage from parent (Hub) - optional override
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === "ARTEMIS_CONFIG" && typeof data.apiBase === "string") {
        window.__ARTEMIS_API_BASE__ = data.apiBase;
        console.log("[API BASE] received apiBase via postMessage:", data.apiBase);
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
