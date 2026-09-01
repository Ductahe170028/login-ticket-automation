import express from "express";
import { runTicketAutomation } from "./automation/runTicketAutomation";
import { config } from "./config";
import { logger } from "./utils/logger";
import {
  resolveWebhookTicket,
  TicketNotFoundError,
  WebhookPayloadError,
} from "./webhook/parseOdooWebhook";

function isWebhookAuthorized(req: express.Request): boolean {
  if (!config.webhookSecret) {
    return true;
  }

  const header = req.header("x-webhook-secret");
  return header === config.webhookSecret;
}

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/webhook/odoo-ticket", async (req, res) => {
    if (!isWebhookAuthorized(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const ticket = await resolveWebhookTicket(req.body);
      const result = await runTicketAutomation(ticket);
      res.status(200).json({ ok: true, result });
    } catch (error) {
      if (error instanceof WebhookPayloadError) {
        res.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof TicketNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Webhook processing failed: ${message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}
