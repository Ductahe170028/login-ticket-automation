import { listPendingLoginTickets } from "../clients/odooClient";
import { logger } from "../utils/logger";
import { runTicketAutomation } from "./runTicketAutomation";

export async function catchUpPendingTickets(): Promise<void> {
  const tickets = await listPendingLoginTickets();
  logger.info(`Catch-up: found ${tickets.length} pending ticket(s)`);

  for (const ticket of tickets) {
    await runTicketAutomation(ticket);
  }
}
