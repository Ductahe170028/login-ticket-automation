import { config } from "../config";
import type { Ticket } from "../types";

/** Tag Odoo gắn sau khi automation xử lý — support lọc queue. */
export const AUTOMATION_TAG = {
  AUTO_RESOLVED: config.tagAutoResolved,
  MANUAL_REVIEW: config.tagManualReview,
} as const;

export type AutomationTag =
  (typeof AUTOMATION_TAG)[keyof typeof AUTOMATION_TAG];

/** Tag đánh dấu ticket đã qua automation (đủ để bỏ qua khi catch-up). */
export const PROCESSED_AUTOMATION_TAGS: readonly AutomationTag[] = [
  AUTOMATION_TAG.AUTO_RESOLVED,
  AUTOMATION_TAG.MANUAL_REVIEW,
];

export function ticketHasProcessedTag(ticket: Ticket): boolean {
  const ticketTags = (ticket.tags ?? []).map((tag) => tag.toLowerCase().trim());

  return PROCESSED_AUTOMATION_TAGS.some((processedTag) =>
    ticketTags.includes(processedTag.toLowerCase())
  );
}
