import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import OnGoingProposals from "@/pages/OnGoingProposals";
import UnderEvaluationProposals from "@/pages/UnderEvaluationProposals";
import CompletedProposals from "@/pages/CompletedProposals";
import RenewalsScreen from "@/pages/RenewalsScreen";
import CollectionsScreen from "@/pages/CollectionsScreen";
import NewProposalScreen from "@/pages/NewProposalScreen";

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
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
