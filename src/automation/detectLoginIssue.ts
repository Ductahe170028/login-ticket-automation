import { config } from "../config";
import type { Ticket } from "../types";

export function isLoginIssue(ticket: Ticket): boolean {
  const loginTags = config.loginTags.map((tag) => tag.toLowerCase().trim());
  const tags = (ticket.tags ?? []).map((tag) => tag.toLowerCase().trim());
  if (tags.some((tag) => loginTags.includes(tag))) {
    return true;
  }

  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  return config.loginKeywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}
