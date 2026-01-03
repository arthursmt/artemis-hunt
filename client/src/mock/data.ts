import { Proposal, Contract } from "@shared/schema";

export const MOCK_KPIS = {
  creditPortfolio: 450000,
  activeClients: 124,
  delinquencyRate: "2.4%",
};

export const MOCK_PROPOSALS: Proposal[] = [
  { id: 1, clientName: "Maria Silva", amount: "5000", status: "on_going", createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-03-10') },
  { id: 2, clientName: "João Santos", amount: "12000", status: "under_evaluation", createdAt: new Date('2024-03-12'), updatedAt: new Date('2024-03-12') },
  { id: 3, clientName: "Padaria Central", amount: "25000", status: "completed", createdAt: new Date('2024-03-01'), updatedAt: new Date('2024-03-15') },
  { id: 4, clientName: "Ana Costa", amount: "3500", status: "on_going", createdAt: new Date('2024-03-14'), updatedAt: new Date('2024-03-14') },
  { id: 5, clientName: "Oficina Mecânica", amount: "15000", status: "under_evaluation", createdAt: new Date('2024-03-11'), updatedAt: new Date('2024-03-11') },
  { id: 6, clientName: "Mercadinho Feliz", amount: "8000", status: "completed", createdAt: new Date('2024-02-28'), updatedAt: new Date('2024-03-10') },
  { id: 7, clientName: "Carlos Oliveira", amount: "4200", status: "on_going", createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-03-15') },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 1, clientName: "José Pereira", amount: "10000", status: "active", maturityDate: new Date('2024-06-15'), createdAt: new Date('2023-12-15') },
  { id: 2, clientName: "Salão Beleza Pura", amount: "5000", status: "renewal_due", maturityDate: new Date('2024-03-20'), createdAt: new Date('2023-09-20') },
  { id: 3, clientName: "Lanchonete da Esquina", amount: "8000", status: "delinquent", maturityDate: new Date('2024-02-28'), createdAt: new Date('2023-08-28') },
  { id: 4, clientName: "Fernanda Lima", amount: "3000", status: "active", maturityDate: new Date('2024-07-10'), createdAt: new Date('2024-01-10') },
  { id: 5, clientName: "Roberto Souza", amount: "15000", status: "renewal_due", maturityDate: new Date('2024-03-25'), createdAt: new Date('2023-09-25') },
];
