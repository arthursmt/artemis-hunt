import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, ProposalStatus } from "@shared/schema";

interface Group {
  groupId: string;
  leaderId: number;
  members: any[];
}

interface ProposalData {
  group: Group;
  [key: string]: any;
}

interface ProposalWithData extends Omit<Proposal, "amount"> {
  amount: string;
  data: ProposalData;
  totalAmount: number;
}

interface ProposalContextType {
  proposals: ProposalWithData[];
  saveProposal: (proposal: ProposalWithData) => void;
  getProposal: (id: string) => ProposalWithData | undefined;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<ProposalWithData[]>(() => {
    const saved = localStorage.getItem("artemis_proposals");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("artemis_proposals", JSON.stringify(proposals));
  }, [proposals]);

  const saveProposal = (proposal: ProposalWithData) => {
    setProposals(prev => {
      const proposalId = String(proposal.id);
      const exists = prev.find(p => String(p.id) === proposalId);
      if (exists) {
        return prev.map(p => String(p.id) === proposalId ? proposal : p);
      }
      return [...prev, proposal];
    });
  };

  const getProposal = (id: string) => {
    return proposals.find(p => p.id === id);
  };

  return (
    <ProposalContext.Provider value={{ proposals, saveProposal, getProposal }}>
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposalStore = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposalStore must be used within a ProposalProvider");
  }
  return context;
};
