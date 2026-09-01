import { addTagsToTicket } from "../clients/odooClient";
import { ticketHasProcessedTag } from "../constants/automationTags";
import type { ProcessResult, Ticket } from "../types";
import { logger } from "../utils/logger";
import { processLoginTicket } from "./processLoginTicket";
import { resolveAutomationTag } from "./resolveAutomationTag";

export async function runTicketAutomation(
  ticket: Ticket
): Promise<ProcessResult> {
  if (ticketHasProcessedTag(ticket)) {
    logger.info(`Skip ticket ${ticket.id} — already has processed tag`);
    return { handled: false, reason: "already_processed" };
  }

  const result = await processLoginTicket(ticket);
  const tag = resolveAutomationTag(result);

  if (tag) {
    await addTagsToTicket(ticket.id, [tag]);
    logger.info(`Tagged ticket ${ticket.id} with ${tag}`);
  }

  return result;
}
