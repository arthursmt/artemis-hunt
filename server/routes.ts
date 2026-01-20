
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Proposals
  app.get(api.proposals.list.path, async (req, res) => {
    const proposals = await storage.getProposals();
    res.json(proposals);
  });

  app.post(api.proposals.create.path, async (req, res) => {
    try {
      const input = api.proposals.create.input.parse(req.body);
      const proposal = await storage.createProposal(input);
      res.status(201).json(proposal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Contracts
  app.get(api.contracts.list.path, async (req, res) => {
    const contracts = await storage.getContracts();
    res.json(contracts);
  });

  // KPIs (Mocked for backend structure compliance, though frontend uses local mocks)
  app.get(api.kpis.get.path, async (req, res) => {
    res.json({
      creditPortfolio: 120000,
      activeClients: 85,
      delinquencyRate: "4.8%",
    });
  });

  // Proposal Submissions
  app.post("/api/proposals/submit", async (req, res) => {
    try {
      const { proposalId, payload } = req.body;
      
      if (!proposalId || !payload) {
        return res.status(400).json({
          message: "proposalId and payload are required"
        });
      }
      
      const submission = await storage.submitProposal(proposalId, payload);
      res.status(201).json(submission);
    } catch (err: any) {
      if (err.code === "23505") {
        return res.status(409).json({
          message: "Proposal already submitted"
        });
      }
      console.error("Submission error:", err);
      res.status(500).json({
        message: "Failed to submit proposal"
      });
    }
  });

  app.get("/api/proposals/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions.map(s => ({
        proposalId: s.proposalId,
        submittedAt: s.submittedAt
      })));
    } catch (err) {
      console.error("Error fetching submissions:", err);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/proposals/submissions/:proposalId", async (req, res) => {
    try {
      const { proposalId } = req.params;
      const submission = await storage.getSubmissionByProposalId(proposalId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json({
        ...submission,
        payload: JSON.parse(submission.payload)
      });
    } catch (err) {
      console.error("Error fetching submission:", err);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  return httpServer;
}
