import { AUTOMATION_TAG, ticketHasProcessedTag } from "../../../src/constants/automationTags";
import type { Ticket } from "../../../src/types";

function makeTicket(tags?: string[]): Ticket {
  return {
    id: "T-1",
    title: "test",
    description: "test",
    customerEmail: "a@b.vn",
    tags,
  };
}

describe("ticketHasProcessedTag", () => {
  it("có auto-resolved → true", () => {
    expect(
      ticketHasProcessedTag(makeTicket(["login", AUTOMATION_TAG.AUTO_RESOLVED]))
    ).toBe(true);
  });

  it("có manual-review (viết hoa) → true", () => {
    expect(
      ticketHasProcessedTag(makeTicket(["MANUAL-REVIEW"]))
    ).toBe(true);
  });

  it("chưa có tag processed → false", () => {
    expect(ticketHasProcessedTag(makeTicket(["login", "LMS"]))).toBe(false);
    expect(ticketHasProcessedTag(makeTicket())).toBe(false);
  });
});
