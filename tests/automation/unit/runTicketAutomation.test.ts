import type { Ticket } from "../../../src/types";

jest.mock("../../../src/automation/processLoginTicket");
jest.mock("../../../src/clients/odooClient");

import { runTicketAutomation } from "../../../src/automation/runTicketAutomation";
import { processLoginTicket } from "../../../src/automation/processLoginTicket";
import { addTagsToTicket } from "../../../src/clients/odooClient";
import { AUTOMATION_TAG } from "../../../src/constants/automationTags";

const mockedProcessLoginTicket = jest.mocked(processLoginTicket);
const mockedAddTagsToTicket = jest.mocked(addTagsToTicket);

const baseTicket: Ticket = {
  id: "TICKET-101",
  title: "Không thể đăng nhập",
  description: "Lỗi password",
  customerEmail: "teacher@mindx.edu.vn",
  tags: ["login"],
};

describe("runTicketAutomation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAddTagsToTicket.mockResolvedValue(undefined);
  });

  it("ticket đã có tag auto-resolved → skip, không gọi processLoginTicket", async () => {
    const ticket = {
      ...baseTicket,
      tags: ["login", AUTOMATION_TAG.AUTO_RESOLVED],
    };

    const result = await runTicketAutomation(ticket);

    expect(result).toEqual({ handled: false, reason: "already_processed" });
    expect(mockedProcessLoginTicket).not.toHaveBeenCalled();
    expect(mockedAddTagsToTicket).not.toHaveBeenCalled();
  });

  it("ticket đã có tag manual-review → skip", async () => {
    const ticket = {
      ...baseTicket,
      tags: [AUTOMATION_TAG.MANUAL_REVIEW],
    };

    const result = await runTicketAutomation(ticket);

    expect(result.reason).toBe("already_processed");
    expect(mockedProcessLoginTicket).not.toHaveBeenCalled();
  });

  it("handled: true → gắn tag auto-resolved", async () => {
    mockedProcessLoginTicket.mockResolvedValue({
      handled: true,
      action: "reset_password",
    });

    const result = await runTicketAutomation(baseTicket);

    expect(result.handled).toBe(true);
    expect(mockedAddTagsToTicket).toHaveBeenCalledWith(baseTicket.id, [
      AUTOMATION_TAG.AUTO_RESOLVED,
    ]);
  });

  it("not_login_issue → không gắn tag", async () => {
    mockedProcessLoginTicket.mockResolvedValue({
      handled: false,
      reason: "not_login_issue",
    });

    await runTicketAutomation(baseTicket);

    expect(mockedAddTagsToTicket).not.toHaveBeenCalled();
  });

  it("escalate → gắn tag manual-review", async () => {
    mockedProcessLoginTicket.mockResolvedValue({
      handled: false,
      reason: "employee_terminated",
    });

    await runTicketAutomation(baseTicket);

    expect(mockedAddTagsToTicket).toHaveBeenCalledWith(baseTicket.id, [
      AUTOMATION_TAG.MANUAL_REVIEW,
    ]);
  });
});
