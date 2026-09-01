import { config } from "../config";
import type { Ticket } from "../types";
import {
  getJsonOrNullIfNotFound,
  postOrThrow,
} from "../utils/httpClient";
import { logger } from "../utils/logger";

function isOdooConfigured(): boolean {
  return config.odooBaseUrl.length > 0;
}

export async function addInternalNote(
  ticketId: string,
  note: string
): Promise<void> {
  if (!isOdooConfigured()) {
    logger.info(`[odoo mock] note ticket=${ticketId}: ${note}`);
    return;
  }

  await postOrThrow(
    `${config.odooBaseUrl}${config.odooTicketsApiPath}/${ticketId}/notes`,
    { note },
    config.odooApiKey
  );
}

export async function addTagsToTicket(
  ticketId: string,
  tags: string[]
): Promise<void> {
  if (!isOdooConfigured()) {
    logger.info(`[odoo mock] tags ticket=${ticketId}: ${tags.join(", ")}`);
    return;
  }

  await postOrThrow(
    `${config.odooBaseUrl}${config.odooTicketsApiPath}/${ticketId}/tags`,
    { tags },
    config.odooApiKey
  );
}

export async function listPendingLoginTickets(
  sinceDays?: number
): Promise<Ticket[]> {
  if (!isOdooConfigured()) {
    return [];
  }

  const days = sinceDays ?? config.catchUpDays;
  const url = `${config.odooBaseUrl}${config.odooTicketsApiPath}/pending-login?sinceDays=${days}`;
  const tickets = await getJsonOrNullIfNotFound<Ticket[]>(
    url,
    config.odooApiKey
  );

  return tickets ?? [];
}
