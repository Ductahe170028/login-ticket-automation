import { getTicketById } from "../clients/odooClient";
import type { Ticket } from "../types";

export class WebhookPayloadError extends Error {
  constructor(message = "Invalid ticket payload") {
    super(message);
    this.name = "WebhookPayloadError";
  }
}

export class TicketNotFoundError extends Error {
  constructor(ticketId: string) {
    super(`Odoo ticket ${ticketId} not found`);
    this.name = "TicketNotFoundError";
  }
}

export function isFullTicketPayload(body: unknown): body is Ticket {
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

/** Odoo Send Webhook gửi `_id` số — chỉ cần id để tool tự đọc ticket qua RPC. */
export function extractOdooTicketId(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as Record<string, unknown>;
  const rawId = candidate._id ?? candidate.id;

  if (typeof rawId === "number" && Number.isInteger(rawId)) {
    return String(rawId);
  }

  if (typeof rawId === "string" && /^\d+$/.test(rawId)) {
    return rawId;
  }

  return null;
}

export async function resolveWebhookTicket(body: unknown): Promise<Ticket> {
  if (isFullTicketPayload(body)) {
    return body;
  }

  const odooId = extractOdooTicketId(body);
  if (!odooId) {
    throw new WebhookPayloadError();
  }

  const ticket = await getTicketById(odooId);
  if (!ticket) {
    throw new TicketNotFoundError(odooId);
  }

  return ticket;
}
