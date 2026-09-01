import type { Ticket } from "../types";

/** Stub — Module 3 sẽ hiện thực ghi note lên Odoo thật. */
export async function addInternalNote(
  _ticketId: string,
  _note: string
): Promise<void> {}

/** Stub — Module 3: gắn tag auto-resolved / manual-review sau xử lý. */
export async function addTagsToTicket(
  _ticketId: string,
  _tags: string[]
): Promise<void> {}

/**
 * Stub — Module 3: ticket login chưa có tag automation (catch-up khi server bật lại).
 * @param sinceDays giới hạn tuổi ticket (mặc định đọc từ config)
 */
export async function listPendingLoginTickets(
  _sinceDays?: number
): Promise<Ticket[]> {
  return [];
}
