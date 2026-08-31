import type { ProcessResult, Ticket } from "../types";

/** Stub — feat commit sẽ hiện thực logic quyết định. */
export async function processLoginTicket(
  _ticket: Ticket
): Promise<ProcessResult> {
  throw new Error("processLoginTicket not implemented");
}
