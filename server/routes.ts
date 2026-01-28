
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
  const proposalSubmissionSchema = z.object({
    proposalId: z.string().min(1, "Proposal ID is required"),
    payload: z.record(z.unknown()).refine((val) => val !== null && typeof val === 'object', {
      message: "Payload must be an object"
    })
  });

  app.post("/api/proposals/submit", async (req, res) => {
    try {
      // Log request info for debugging
      const contentLength = req.headers['content-length'] || 'unknown';
      const payloadKeys = Object.keys(req.body || {});
      console.log("[SUBMIT] Received:", {
        contentLength,
        keys: payloadKeys,
        proposalId: req.body?.proposalId
      });
      
      const parsed = proposalSubmissionSchema.parse(req.body);
      const { proposalId, payload } = parsed;
      
      // Cast payload for type-safe property access
      const typedPayload = payload as { data?: { group?: { id?: string; leaderId?: number; members?: any[] } } };
      
      // Count photos in payload
      const members = typedPayload?.data?.group?.members || [];
      let photoCount = 0;
      for (const m of members) {
        const evidence = m.evidence || {};
        for (const val of Object.values(evidence)) {
          if (val && typeof val === 'object' && 'uri' in (val as any)) {
            photoCount++;
          }
        }
      }
      console.log("[SUBMIT] Processing:", {
        proposalId,
        memberCount: members.length,
        photoCount
      });
      
      const submission = await storage.submitProposal(proposalId, payload);
      
      // Extract leader name from payload
      const group = typedPayload?.data?.group;
      const leader = group?.members?.find((m: any) => m.id === group?.leaderId) || group?.members?.[0];
      const leaderName = leader ? `${leader.firstName} ${leader.lastName}` : 'Unknown';
      
      // Return small response object (not full payload)
      const sizeBytes = JSON.stringify(payload).length;
      console.log("[SUBMIT] Success:", {
        proposalId,
        sizeBytes,
        submittedAt: submission.submittedAt
      });
      
      res.status(201).json({
        proposalId: submission.proposalId,
        submittedAt: submission.submittedAt,
        groupId: group?.id || null,
        leaderName,
        sizeBytes
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      if (err.code === "23505") {
        return res.status(409).json({
          message: "Proposal already submitted"
        });
      }
      console.error("[SUBMIT] Error:", err);
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
