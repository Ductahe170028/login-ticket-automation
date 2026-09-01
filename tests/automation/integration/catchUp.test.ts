jest.mock("../../../src/clients/odooClient");
jest.mock("../../../src/automation/runTicketAutomation");

import { catchUpPendingTickets } from "../../../src/automation/catchUpPendingTickets";
import { runTicketAutomation } from "../../../src/automation/runTicketAutomation";
import { listPendingLoginTickets } from "../../../src/clients/odooClient";
import type { Ticket } from "../../../src/types";

const mockedListPending = jest.mocked(listPendingLoginTickets);
const mockedRunTicketAutomation = jest.mocked(runTicketAutomation);

const pendingTickets: Ticket[] = [
  {
    id: "TICKET-A",
    title: "Login issue A",
    description: "password",
    customerEmail: "a@mindx.edu.vn",
  },
  {
    id: "TICKET-B",
    title: "Login issue B",
    description: "login failed",
    customerEmail: "b@mindx.edu.vn",
  },
];

describe("catchUpPendingTickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRunTicketAutomation.mockResolvedValue({ handled: true });
  });

  it("gọi runTicketAutomation cho từng ticket pending", async () => {
    mockedListPending.mockResolvedValue(pendingTickets);

    await catchUpPendingTickets();

    expect(mockedListPending).toHaveBeenCalledTimes(1);
    expect(mockedRunTicketAutomation).toHaveBeenCalledTimes(2);
    expect(mockedRunTicketAutomation).toHaveBeenNthCalledWith(1, pendingTickets[0]);
    expect(mockedRunTicketAutomation).toHaveBeenNthCalledWith(2, pendingTickets[1]);
  });

  it("không có ticket pending → không gọi runTicketAutomation", async () => {
    mockedListPending.mockResolvedValue([]);

    await catchUpPendingTickets();

    expect(mockedRunTicketAutomation).not.toHaveBeenCalled();
  });
});
