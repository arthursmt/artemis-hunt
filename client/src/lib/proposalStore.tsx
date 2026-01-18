import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, ProposalStatus } from "@shared/schema";

function getDefaultMemberData(memberIndex: number): Partial<Member> {
  const memberDefaults = [
    {
      firstName: "Luci",
      lastName: "Machado",
      middleName: "Maria",
      requestedAmount: "$5,000.00",
      documentType: "ssn",
      documentNumber: "123-45-6789",
      countryOfOrigin: "Brazil",
      birthDate: "1985-03-15",
      homeAddress1: "123 Main Street",
      homeAddress2: "Apt 4B",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90001",
      contact1Type: "Mobile",
      contact1Number: "(555) 123-4567",
      businessData: {
        businessName: "Luci's Bakery",
        businessType: "Retail",
        businessSector: "Food & Beverage",
        multipleBusiness: false,
        openingMonth: "March",
        openingYear: "2018",
        businessAddress1: "456 Commerce St",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90002",
        contact1Type: "Mobile",
        businessContact1: "(555) 987-6543"
      },
      pnl: {
        earningsMonthly: 8500,
        monthlySales1: 12000,
        operationalCostsMonthlyTotal: 4500,
        personalExpensesMonthlyTotal: 2500
      }
    },
    {
      firstName: "Carlos",
      lastName: "Santos",
      middleName: "Alberto",
      requestedAmount: "$4,000.00",
      documentType: "passport",
      documentNumber: "AB1234567",
      countryOfOrigin: "Mexico",
      birthDate: "1990-07-22",
      homeAddress1: "789 Oak Avenue",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90003",
      contact1Type: "Mobile",
      contact1Number: "(555) 234-5678",
      businessData: {
        businessName: "Santos Auto Repair",
        businessType: "Service",
        businessSector: "Automotive",
        multipleBusiness: false,
        openingMonth: "June",
        openingYear: "2019",
        businessAddress1: "321 Industrial Blvd",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90004",
        contact1Type: "Work",
        businessContact1: "(555) 876-5432"
      },
      pnl: {
        earningsMonthly: 7200,
        monthlySales1: 9500,
        operationalCostsMonthlyTotal: 3800,
        personalExpensesMonthlyTotal: 2200
      }
    },
    {
      firstName: "Maria",
      lastName: "Rodriguez",
      middleName: "Elena",
      requestedAmount: "$3,500.00",
      documentType: "dl_state_id",
      documentNumber: "D1234567",
      countryOfOrigin: "Guatemala",
      birthDate: "1988-11-08",
      homeAddress1: "555 Palm Drive",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90005",
      contact1Type: "Mobile",
      contact1Number: "(555) 345-6789",
      businessData: {
        businessName: "Maria's Textiles",
        businessType: "Retail",
        businessSector: "Textiles",
        multipleBusiness: false,
        openingMonth: "January",
        openingYear: "2020",
        businessAddress1: "888 Fashion Ave",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90006",
        contact1Type: "Mobile",
        businessContact1: "(555) 765-4321"
      },
      pnl: {
        earningsMonthly: 6000,
        monthlySales1: 8000,
        operationalCostsMonthlyTotal: 3200,
        personalExpensesMonthlyTotal: 1800
      }
    },
    {
      firstName: "Ana",
      lastName: "Garcia",
      middleName: "Rosa",
      requestedAmount: "$3,000.00",
      documentType: "ssn",
      documentNumber: "234-56-7890",
      countryOfOrigin: "Colombia",
      birthDate: "1992-05-20",
      homeAddress1: "777 Cedar Lane",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90007",
      contact1Type: "Mobile",
      contact1Number: "(555) 456-7890",
      businessData: {
        businessName: "Ana's Crafts",
        businessType: "Retail",
        businessSector: "Handcrafts",
        multipleBusiness: false,
        openingMonth: "April",
        openingYear: "2021",
        businessAddress1: "999 Artisan Way",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90008",
        contact1Type: "Mobile",
        businessContact1: "(555) 654-3210"
      },
      pnl: {
        earningsMonthly: 5500,
        monthlySales1: 7500,
        operationalCostsMonthlyTotal: 2800,
        personalExpensesMonthlyTotal: 1600
      }
    },
    {
      firstName: "Pedro",
      lastName: "Hernandez",
      middleName: "Jose",
      requestedAmount: "$4,500.00",
      documentType: "passport",
      documentNumber: "CD7654321",
      countryOfOrigin: "Peru",
      birthDate: "1987-09-12",
      homeAddress1: "222 Maple Street",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90009",
      contact1Type: "Mobile",
      contact1Number: "(555) 567-8901",
      businessData: {
        businessName: "Pedro's Electronics",
        businessType: "Service",
        businessSector: "Electronics",
        multipleBusiness: false,
        openingMonth: "August",
        openingYear: "2017",
        businessAddress1: "444 Tech Plaza",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90010",
        contact1Type: "Work",
        businessContact1: "(555) 543-2109"
      },
      pnl: {
        earningsMonthly: 8000,
        monthlySales1: 11000,
        operationalCostsMonthlyTotal: 4200,
        personalExpensesMonthlyTotal: 2400
      }
    }
  ];
  return memberDefaults[memberIndex] || memberDefaults[0];
}

function getDefaultLoanDetails(): LoanDetails {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  if (futureDate.getDate() > 15) {
    futureDate.setDate(10);
  }
  
  return {
    loanValue: "$5,500.00",
    loanType: "Working capital",
    installments: 6,
    gracePeriodDays: 0,
    interestRateApr: 14,
    firstPaymentDate: futureDate.toISOString().split('T')[0],
    loanGoal: "Inventory",
    otherGoal: "",
    borrowersInsurance: true,
    optionalInsurance1: "None",
    optionalInsurance2: "None",
    optionalInsurance3: "None"
  };
}

function fillMemberDefaults(member: Member, memberIndex: number): Member {
  const defaults = getDefaultMemberData(memberIndex);
  const defaultBusiness = defaults.businessData;
  const defaultPnl = defaults.pnl;
  
  const filledMember: Member = {
    ...member,
    firstName: member.firstName || defaults.firstName || "Member",
    lastName: member.lastName || defaults.lastName || `${memberIndex + 1}`,
    middleName: member.middleName || defaults.middleName || "",
    requestedAmount: member.requestedAmount || defaults.requestedAmount || "$3,000.00",
    documentType: member.documentType || defaults.documentType || "ssn",
    documentNumber: member.documentNumber || defaults.documentNumber || `DOC-${Date.now()}-${memberIndex}`,
    countryOfOrigin: member.countryOfOrigin || defaults.countryOfOrigin || "USA",
    birthDate: member.birthDate || defaults.birthDate || "1990-01-01",
    homeAddress1: member.homeAddress1 || defaults.homeAddress1 || `${100 + memberIndex} Main St`,
    homeAddress2: member.homeAddress2 || defaults.homeAddress2 || "",
    state: member.state || defaults.state || "CA",
    city: member.city || defaults.city || "Los Angeles",
    zipCode: member.zipCode || defaults.zipCode || "90001",
    contact1Type: member.contact1Type || defaults.contact1Type || "Mobile",
    contact1Number: member.contact1Number || defaults.contact1Number || `(555) ${100 + memberIndex}-${1000 + memberIndex}`,
    businessData: {
      businessName: member.businessData?.businessName || defaultBusiness?.businessName || `Business ${memberIndex + 1}`,
      businessType: member.businessData?.businessType || defaultBusiness?.businessType || "Retail",
      otherBusinessType: member.businessData?.otherBusinessType || "",
      businessSector: member.businessData?.businessSector || defaultBusiness?.businessSector || "General",
      multipleBusiness: member.businessData?.multipleBusiness ?? defaultBusiness?.multipleBusiness ?? false,
      openingMonth: member.businessData?.openingMonth || defaultBusiness?.openingMonth || "January",
      openingYear: member.businessData?.openingYear || defaultBusiness?.openingYear || "2020",
      businessAddress1: member.businessData?.businessAddress1 || defaultBusiness?.businessAddress1 || `${200 + memberIndex} Commerce St`,
      businessAddress2: member.businessData?.businessAddress2 || "",
      state: member.businessData?.state || defaultBusiness?.state || "CA",
      city: member.businessData?.city || defaultBusiness?.city || "Los Angeles",
      zipCode: member.businessData?.zipCode || defaultBusiness?.zipCode || "90002",
      contact1Type: member.businessData?.contact1Type || defaultBusiness?.contact1Type || "Mobile",
      businessContact1: member.businessData?.businessContact1 || defaultBusiness?.businessContact1 || `(555) ${200 + memberIndex}-${2000 + memberIndex}`,
      contact2Type: member.businessData?.contact2Type || "",
      businessContact2: member.businessData?.businessContact2 || ""
    },
    pnl: {
      earningsMonthly: member.pnl?.earningsMonthly || defaultPnl?.earningsMonthly || 5000 + memberIndex * 500,
      monthlySales1: member.pnl?.monthlySales1 || defaultPnl?.monthlySales1 || 7000 + memberIndex * 500,
      operationalCostsMonthlyTotal: member.pnl?.operationalCostsMonthlyTotal || defaultPnl?.operationalCostsMonthlyTotal || 2500 + memberIndex * 200,
      personalExpensesMonthlyTotal: member.pnl?.personalExpensesMonthlyTotal || defaultPnl?.personalExpensesMonthlyTotal || 1500 + memberIndex * 100
    }
  };
  
  return filledMember;
}

function autoFillLuciMachadoProposal(proposal: ProposalWithData): ProposalWithData {
  const filledMembers = proposal.data.group.members.map((member, index) => 
    fillMemberDefaults(member, index)
  );
  
  const loanDetailsByMember: Record<number, LoanDetails> = { ...(proposal.data.loanDetailsByMember || {}) };
  filledMembers.forEach((member, index) => {
    if (!loanDetailsByMember[member.id]) {
      const defaults = getDefaultLoanDetails();
      defaults.loanValue = `$${(5500 - index * 500).toLocaleString()}.00`;
      loanDetailsByMember[member.id] = defaults;
    } else {
      const existing = loanDetailsByMember[member.id];
      const defaults = getDefaultLoanDetails();
      loanDetailsByMember[member.id] = {
        loanValue: existing.loanValue || defaults.loanValue,
        loanType: existing.loanType || defaults.loanType,
        installments: existing.installments ?? defaults.installments,
        gracePeriodDays: existing.gracePeriodDays ?? defaults.gracePeriodDays,
        interestRateApr: existing.interestRateApr ?? defaults.interestRateApr,
        firstPaymentDate: existing.firstPaymentDate || defaults.firstPaymentDate,
        loanGoal: existing.loanGoal || defaults.loanGoal,
        otherGoal: existing.otherGoal || defaults.otherGoal,
        borrowersInsurance: existing.borrowersInsurance ?? defaults.borrowersInsurance,
        optionalInsurance1: existing.optionalInsurance1 || defaults.optionalInsurance1,
        optionalInsurance2: existing.optionalInsurance2 || defaults.optionalInsurance2,
        optionalInsurance3: existing.optionalInsurance3 || defaults.optionalInsurance3
      };
    }
  });
  
  const totalAmount = filledMembers.reduce((sum, m) => {
    const digits = String(m.requestedAmount).replace(/\D/g, "");
    return sum + (parseInt(digits) || 0) / 100;
  }, 0);
  
  return {
    ...proposal,
    amount: totalAmount.toString(),
    totalAmount: totalAmount,
    data: {
      ...proposal.data,
      group: {
        ...proposal.data.group,
        members: filledMembers
      },
      loanDetailsByMember
    }
  };
}

function createCompleteLuciMachadoProposal(): ProposalWithData {
  const members: Member[] = [
    {
      id: 1001,
      firstName: "Luci",
      lastName: "Machado",
      middleName: "Maria",
      requestedAmount: "$5,000.00",
      documentType: "ssn",
      documentNumber: "123-45-6789",
      countryOfOrigin: "Brazil",
      birthDate: "1985-03-15",
      homeAddress1: "123 Main Street",
      homeAddress2: "Apt 4B",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90001",
      contact1Type: "Mobile",
      contact1Number: "(555) 123-4567",
      businessData: {
        businessName: "Luci's Bakery",
        businessType: "Retail",
        businessSector: "Food & Beverage",
        multipleBusiness: false,
        openingMonth: "March",
        openingYear: "2018",
        businessAddress1: "456 Commerce St",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90002",
        contact1Type: "Mobile",
        businessContact1: "(555) 987-6543"
      },
      pnl: {
        earningsMonthly: 8500,
        monthlySales1: 12000,
        operationalCostsMonthlyTotal: 4500,
        personalExpensesMonthlyTotal: 2500
      }
    },
    {
      id: 1002,
      firstName: "Carlos",
      lastName: "Santos",
      middleName: "Alberto",
      requestedAmount: "$4,000.00",
      documentType: "passport",
      documentNumber: "AB1234567",
      countryOfOrigin: "Mexico",
      birthDate: "1990-07-22",
      homeAddress1: "789 Oak Avenue",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90003",
      contact1Type: "Mobile",
      contact1Number: "(555) 234-5678",
      businessData: {
        businessName: "Santos Auto Repair",
        businessType: "Service",
        businessSector: "Automotive",
        multipleBusiness: false,
        openingMonth: "June",
        openingYear: "2019",
        businessAddress1: "321 Industrial Blvd",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90004",
        contact1Type: "Work",
        businessContact1: "(555) 876-5432"
      },
      pnl: {
        earningsMonthly: 7200,
        monthlySales1: 9500,
        operationalCostsMonthlyTotal: 3800,
        personalExpensesMonthlyTotal: 2200
      }
    },
    {
      id: 1003,
      firstName: "Maria",
      lastName: "Rodriguez",
      middleName: "Elena",
      requestedAmount: "$3,500.00",
      documentType: "dl_state_id",
      documentNumber: "D1234567",
      countryOfOrigin: "Guatemala",
      birthDate: "1988-11-08",
      homeAddress1: "555 Palm Drive",
      state: "CA",
      city: "Los Angeles",
      zipCode: "90005",
      contact1Type: "Mobile",
      contact1Number: "(555) 345-6789",
      businessData: {
        businessName: "Maria's Textiles",
        businessType: "Retail",
        businessSector: "Textiles",
        multipleBusiness: false,
        openingMonth: "January",
        openingYear: "2020",
        businessAddress1: "888 Fashion Ave",
        state: "CA",
        city: "Los Angeles",
        zipCode: "90006",
        contact1Type: "Mobile",
        businessContact1: "(555) 765-4321"
      },
      pnl: {
        earningsMonthly: 6000,
        monthlySales1: 8000,
        operationalCostsMonthlyTotal: 3200,
        personalExpensesMonthlyTotal: 1800
      }
    }
  ];

  const group: Group = {
    groupId: "GRP-LUCI-001",
    leaderId: 1001,
    members
  };

  const loanDetailsByMember: Record<number, LoanDetails> = {
    1001: {
      loanValue: "$5,000.00",
      loanType: "Working capital",
      interestRateApr: 14,
      installments: 12,
      firstPaymentDate: "2026-02-15",
      gracePeriodDays: 28,
      loanGoal: "Inventory",
      otherGoal: "",
      borrowersInsurance: true,
      optionalInsurance1: "None",
      optionalInsurance2: "None",
      optionalInsurance3: "None"
    },
    1002: {
      loanValue: "$4,000.00",
      loanType: "Working capital",
      interestRateApr: 14,
      installments: 10,
      firstPaymentDate: "2026-02-15",
      gracePeriodDays: 28,
      loanGoal: "Equipment purchase",
      otherGoal: "",
      borrowersInsurance: true,
      optionalInsurance1: "None",
      optionalInsurance2: "None",
      optionalInsurance3: "None"
    },
    1003: {
      loanValue: "$3,500.00",
      loanType: "Working capital",
      interestRateApr: 14,
      installments: 8,
      firstPaymentDate: "2026-02-15",
      gracePeriodDays: 28,
      loanGoal: "Inventory",
      otherGoal: "",
      borrowersInsurance: true,
      optionalInsurance1: "None",
      optionalInsurance2: "None",
      optionalInsurance3: "None"
    }
  };

  return {
    id: "luci-machado-demo" as any,
    groupId: group.groupId,
    clientName: "Luci Machado",
    leaderName: "Luci Machado",
    amount: "12500",
    totalAmount: 12500,
    status: "on_going",
    dateCreated: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      group,
      loanDetailsByMember,
      validationCompleted: true
    }
  };
}

export interface Member {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
  countryOfOrigin?: string;
  birthDate?: string;
  homeAddress1?: string;
  homeAddress2?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  contact1Type?: string;
  contact1Number?: string;
  contact2Type?: string;
  contact2Number?: string;
  contact3Type?: string;
  contact3Number?: string;
  referenceName1?: string;
  referenceNumber1?: string;
  referenceName2?: string;
  referenceNumber2?: string;
  businessData?: {
    businessName: string;
    businessType: string;
    otherBusinessType?: string;
    businessSector: string;
    multipleBusiness: boolean;
    openingMonth: string;
    openingYear: string;
    businessAddress1: string;
    businessAddress2?: string;
    state: string;
    city: string;
    zipCode: string;
    contact1Type: string;
    businessContact1: string;
    businessName2?: string;
    businessType2?: string;
    businessSector2?: string;
    businessName3?: string;
    businessType3?: string;
    businessSector3?: string;
    contact2Type?: string;
    businessContact2?: string;
  };
  pnl?: {
    earningsMonthly: number;
    monthlySales1: number;
    operationalCostsMonthlyTotal: number;
    personalExpensesMonthlyTotal: number;
    monthlySales2?: number;
    monthlySales3?: number;
    receivablesFactoring?: number;
    extraIncome?: number;
    deductions?: number;
    payroll?: number;
    sga?: number;
    facilitiesRent?: number;
    cogs?: number;
    investmentsCapex?: number;
    operationalOther?: number;
    financialCostsMonthly?: number;
    shortTermLoans?: number;
    longTermLoans?: number;
    accountsPayable?: number;
    homeRent?: number;
    clothing?: number;
    nutrition?: number;
    water?: number;
    power?: number;
    education?: number;
    subscriptions?: number;
    transportation?: number;
    personalOther?: number;
    savings?: number;
    monthlySavings?: number;
    totalSavings?: number;
    financialDebts?: number;
    institution1Name?: string;
    institution1Amount?: number;
    institution2Name?: string;
    institution2Amount?: number;
    institution3Name?: string;
    institution3Amount?: number;
  };
}

export interface Group {
  groupId: string;
  leaderId: number;
  members: Member[];
}

export interface LoanDetails {
  loanValue: string;
  loanType: string;
  interestRateApr: number;
  installments: number | null;
  firstPaymentDate: string;
  gracePeriodDays: number;
  loanGoal: string;
  otherGoal: string;
  borrowersInsurance: boolean;
  optionalInsurance1: string;
  optionalInsurance2: string;
  optionalInsurance3: string;
}

export interface ProposalData {
  group: Group;
  loanDetailsByMember?: Record<number, LoanDetails>;
  [key: string]: any;
}

export interface ProposalWithData extends Omit<Proposal, "amount" | "status"> {
  amount: string;
  status: string;
  data: ProposalData;
  totalAmount: number;
  dateCreated: string;
  leaderName: string;
  groupId: string;
}

interface ProposalContextType {
  proposals: ProposalWithData[];
  createProposalFromGroup: (group: Group) => ProposalWithData;
  updateProposal: (proposalId: string, updater: (p: ProposalWithData) => ProposalWithData) => void;
  getProposalById: (id: string) => ProposalWithData | undefined;
  deleteProposal: (id: string) => void;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<ProposalWithData[]>(() => {
    const saved = localStorage.getItem("artemis_proposals");
    const existing: ProposalWithData[] = saved ? JSON.parse(saved) : [];
    
    const luciProposalIndex = existing.findIndex((p: ProposalWithData) => 
      p.leaderName?.toLowerCase().includes("luci") && 
      p.leaderName?.toLowerCase().includes("machado")
    );
    
    if (luciProposalIndex >= 0) {
      const luciProposal = existing[luciProposalIndex];
      const autoFilled = autoFillLuciMachadoProposal(luciProposal);
      existing[luciProposalIndex] = autoFilled;
      return existing;
    }
    
    return [...existing, createCompleteLuciMachadoProposal()];
  });

  useEffect(() => {
    localStorage.setItem("artemis_proposals", JSON.stringify(proposals));
  }, [proposals]);

  const createProposalFromGroup = (group: Group) => {
    const id = Date.now().toString();
    const leader = group.members.find(m => m.id === group.leaderId) || group.members[0];
    const totalAmount = group.members.reduce((sum, m) => {
      const digits = String(m.requestedAmount).replace(/\D/g, "");
      return sum + (parseInt(digits) || 0) / 100;
    }, 0);

    const newProposal: ProposalWithData = {
      id: id as any,
      groupId: group.groupId,
      clientName: `${leader.firstName} ${leader.lastName}`,
      leaderName: `${leader.firstName} ${leader.lastName}`,
      amount: totalAmount.toString(),
      totalAmount: totalAmount,
      status: "on_going",
      dateCreated: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {
        group: group
      }
    };

    setProposals(prev => [...prev, newProposal]);
    return newProposal;
  };

  const updateProposal = (proposalId: string, updater: (p: ProposalWithData) => ProposalWithData) => {
    setProposals(prev => prev.map(p => {
      if (String(p.id) === String(proposalId)) {
        const updated = updater(p);
        const leader = updated.data.group.members.find(m => m.id === updated.data.group.leaderId) || updated.data.group.members[0];
        return {
          ...updated,
          clientName: `${leader.firstName} ${leader.lastName}`,
          leaderName: `${leader.firstName} ${leader.lastName}`,
        };
      }
      return p;
    }));
  };

  const getProposalById = (id: string) => {
    return proposals.find(p => String(p.id) === String(id));
  };

  const deleteProposal = (id: string) => {
    setProposals(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  return (
    <ProposalContext.Provider value={{ proposals, createProposalFromGroup, updateProposal, getProposalById, deleteProposal }}>
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
