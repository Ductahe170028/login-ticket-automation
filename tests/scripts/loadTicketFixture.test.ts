import fs from "fs";
import path from "path";
import {
  getFixturesDir,
  listTicketFixtures,
  loadTicketFixture,
} from "../../scripts/lib/loadTicketFixture";

describe("loadTicketFixture", () => {
  const fixturesDir = getFixturesDir();

  it("listTicketFixtures trả các file .json", () => {
    const fixtures = listTicketFixtures();

    expect(fixtures).toContain("login-deactivated");
    expect(fixtures).toContain("not-login-issue");
  });

  it("loadTicketFixture đọc ticket hợp lệ", () => {
    const ticket = loadTicketFixture("login-deactivated");

    expect(ticket.customerEmail).toBe("teacher@mindx.edu.vn");
    expect(ticket.tags).toContain("login");
  });

  it("loadTicketFixture merge override --id", () => {
    const ticket = loadTicketFixture("login-deactivated", {
      id: "TICKET-REAL-99",
    });

    expect(ticket.id).toBe("TICKET-REAL-99");
  });

  it("fixture không tồn tại → throw", () => {
    expect(() => loadTicketFixture("does-not-exist")).toThrow(/not found/i);
  });

  it("fixture JSON invalid → throw", () => {
    const badPath = path.join(fixturesDir, "_bad-fixture.json");
    fs.writeFileSync(badPath, JSON.stringify({ id: "only-id" }), "utf-8");

    try {
      expect(() => loadTicketFixture("_bad-fixture")).toThrow(/invalid/i);
    } finally {
      fs.unlinkSync(badPath);
    }
  });
});
