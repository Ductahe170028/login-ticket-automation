import { AUTOMATION_TAG } from "../../../src/constants/automationTags";
import { resolveAutomationTag } from "../../../src/automation/resolveAutomationTag";

describe("resolveAutomationTag", () => {
  it("handled: true → auto-resolved", () => {
    expect(
      resolveAutomationTag({ handled: true, action: "reset_password" })
    ).toBe(AUTOMATION_TAG.AUTO_RESOLVED);
  });

  it("handled: false + not_login_issue → null (không gắn tag)", () => {
    expect(
      resolveAutomationTag({ handled: false, reason: "not_login_issue" })
    ).toBeNull();
  });

  it.each([
    "missing_customer_email",
    "employee_not_found",
    "employee_terminated",
    "lms_account_not_found",
  ])("escalate %s → manual-review", (reason) => {
    expect(resolveAutomationTag({ handled: false, reason })).toBe(
      AUTOMATION_TAG.MANUAL_REVIEW
    );
  });
});
