
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  proposals,
  contracts,
  proposalSubmissions,
  type InsertProposal,
  type InsertContract,
  type Proposal,
  type Contract,
  type ProposalSubmission
} from "@shared/schema";

export interface IStorage {
  getProposals(): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  getContracts(): Promise<Contract[]>;
  submitProposal(proposalId: string, payload: any): Promise<ProposalSubmission>;
  getSubmissions(): Promise<ProposalSubmission[]>;
  getSubmissionByProposalId(proposalId: string): Promise<ProposalSubmission | null>;
}

export class DatabaseStorage implements IStorage {
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db
      .insert(proposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts);
  }

  async submitProposal(proposalId: string, payload: any): Promise<ProposalSubmission> {
    const [submission] = await db
      .insert(proposalSubmissions)
      .values({
        proposalId,
        payload: JSON.stringify(payload)
      })
      .returning();
    return submission;
  }

  async getSubmissions(): Promise<ProposalSubmission[]> {
    return await db.select().from(proposalSubmissions);
  }

  async getSubmissionByProposalId(proposalId: string): Promise<ProposalSubmission | null> {
    const [submission] = await db
      .select()
      .from(proposalSubmissions)
      .where(eq(proposalSubmissions.proposalId, proposalId));
    return submission || null;
  }
}

export const storage = new DatabaseStorage();
