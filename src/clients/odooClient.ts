import { config } from "../config";
import { PROCESSED_AUTOMATION_TAGS } from "../constants/automationTags";
import type { Ticket } from "../types";
import { buildEmailSentChatterNote, plainTextToHtmlEmail } from "../utils/odooMailFormat";
import { logger } from "../utils/logger";
import {
  executeKw,
  isOdooRpcConfigured,
} from "./odooRpc";

interface HelpdeskTicketRecord {
  id: number;
  name: string;
  description: string | false;
  partner_email: string | false;
  tag_ids: number[];
}

interface HelpdeskTagRecord {
  id: number;
  name: string;
}

function isOdooConfigured(): boolean {
  return isOdooRpcConfigured();
}

function parseOdooTicketId(ticketId: string): number {
  const parsed = Number.parseInt(ticketId, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid Odoo ticket id: ${ticketId}`);
  }
  return parsed;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getCutoffDateString(sinceDays: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - sinceDays);
  return cutoff.toISOString().slice(0, 19).replace("T", " ");
}

async function getTagNamesByIds(tagIds: number[]): Promise<string[]> {
  if (tagIds.length === 0) {
    return [];
  }

  const tags = await executeKw<HelpdeskTagRecord[]>(
    config.odooHelpdeskTagModel,
    "read",
    [tagIds],
    { fields: ["name"] }
  );

  return tags.map((tag) => tag.name);
}

async function findOrCreateTagIds(tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];

  for (const name of tagNames) {
    const existing = await executeKw<HelpdeskTagRecord[]>(
      config.odooHelpdeskTagModel,
      "search_read",
      [[["name", "=", name]]],
      { fields: ["id", "name"], limit: 1 }
    );

    if (existing.length > 0) {
      ids.push(existing[0].id);
      continue;
    }

    const createdId = await executeKw<number>(
      config.odooHelpdeskTagModel,
      "create",
      [{ name }]
    );
    ids.push(createdId);
  }

  return ids;
}

function mapHelpdeskRecordToTicket(
  record: HelpdeskTicketRecord,
  tagNames: string[]
): Ticket {
  const description =
    typeof record.description === "string"
      ? stripHtml(record.description)
      : "";

  return {
    id: String(record.id),
    title: record.name,
    description,
    customerEmail:
      typeof record.partner_email === "string" ? record.partner_email : "",
    tags: tagNames,
  };
}

function hasProcessedTag(tagNames: string[]): boolean {
  const normalized = tagNames.map((tag) => tag.toLowerCase().trim());
  return PROCESSED_AUTOMATION_TAGS.some((processedTag) =>
    normalized.includes(processedTag.toLowerCase())
  );
}

/** Gửi email khách qua mail.mail + ghi lại nội dung trên ticket (chatter). */
export async function sendCustomerEmail(
  ticketId: string,
  input: { to: string; subject: string; body: string }
): Promise<void> {
  if (!isOdooConfigured()) {
    logger.info(
      `[odoo mock] email ticket=${ticketId} to=${input.to} subject=${input.subject} body=${input.body}`
    );
    return;
  }

  const odooId = parseOdooTicketId(ticketId);
  const mailId = await executeKw<number>("mail.mail", "create", [
    {
      subject: input.subject,
      body_html: plainTextToHtmlEmail(input.body),
      body: input.body,
      email_to: input.to,
      model: config.odooHelpdeskTicketModel,
      res_id: odooId,
      auto_delete: true,
    },
  ]);

  await executeKw<boolean>("mail.mail", "send", [[mailId]]);

  // Ghi lại mail đã gửi trên ticket — mail.mail alone không luôn hiện trên chatter Helpdesk.
  await executeKw<boolean>(config.odooHelpdeskTicketModel, "message_post", [
    [odooId],
  ], {
    body: buildEmailSentChatterNote({
      to: input.to,
      subject: input.subject,
      body: input.body,
    }),
    message_type: "comment",
    subtype_xmlid: "mail.mt_note",
  });

  logger.info(
    `Odoo mail sent for ticket ${ticketId} (to=${input.to}, mailId=${mailId})`
  );
}

export async function addInternalNote(
  ticketId: string,
  note: string
): Promise<void> {
  if (!isOdooConfigured()) {
    logger.info(`[odoo mock] note ticket=${ticketId}: ${note}`);
    return;
  }

  const odooId = parseOdooTicketId(ticketId);
  await executeKw<boolean>(config.odooHelpdeskTicketModel, "message_post", [
    [odooId],
  ], {
    body: note,
    message_type: "comment",
    subtype_xmlid: "mail.mt_note",
  });
}

export async function addTagsToTicket(
  ticketId: string,
  tags: string[]
): Promise<void> {
  if (!isOdooConfigured()) {
    logger.info(`[odoo mock] tags ticket=${ticketId}: ${tags.join(", ")}`);
    return;
  }

  if (tags.length === 0) {
    return;
  }

  const odooId = parseOdooTicketId(ticketId);
  const newTagIds = await findOrCreateTagIds(tags);
  const [ticket] = await executeKw<HelpdeskTicketRecord[]>(
    config.odooHelpdeskTicketModel,
    "read",
    [[odooId]],
    { fields: ["tag_ids"] }
  );

  const mergedTagIds = [...new Set([...(ticket?.tag_ids ?? []), ...newTagIds])];
  await executeKw<boolean>(config.odooHelpdeskTicketModel, "write", [
    [odooId],
    { tag_ids: [[6, 0, mergedTagIds]] },
  ]);
}

export async function listPendingLoginTickets(
  sinceDays?: number
): Promise<Ticket[]> {
  if (!isOdooConfigured()) {
    return [];
  }

  const days = sinceDays ?? config.catchUpDays;
  const records = await executeKw<HelpdeskTicketRecord[]>(
    config.odooHelpdeskTicketModel,
    "search_read",
    [[["create_date", ">=", getCutoffDateString(days)]]],
    {
      fields: ["id", "name", "description", "partner_email", "tag_ids"],
      order: "create_date desc",
    }
  );

  const tickets: Ticket[] = [];

  for (const record of records) {
    const tagNames = await getTagNamesByIds(record.tag_ids);
    if (hasProcessedTag(tagNames)) {
      continue;
    }

    tickets.push(mapHelpdeskRecordToTicket(record, tagNames));
  }

  return tickets;
}
