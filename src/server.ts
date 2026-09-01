import express from "express";
import { runTicketAutomation } from "./automation/runTicketAutomation";
import type { Ticket } from "./types";
import { logger } from "./utils/logger";

function isValidTicket(body: unknown): body is Ticket {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.customerEmail === "string"
  );
}

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/webhook/odoo-ticket", async (req, res) => {
    if (!isValidTicket(req.body)) {
      res.status(400).json({ error: "Invalid ticket payload" });
      return;
    }

    try {
      const result = await runTicketAutomation(req.body);
      res.status(200).json({ ok: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Webhook processing failed: ${message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}
