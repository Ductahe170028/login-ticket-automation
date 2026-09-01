import { AUTOMATION_TAG, type AutomationTag } from "../constants/automationTags";
import type { ProcessResult } from "../types";

/**
 * Map kết quả processLoginTicket → tag Odoo (nếu có).
 * not_login_issue không gắn tag — ticket không thuộc phạm vi automation.
 */
export function resolveAutomationTag(
  result: ProcessResult
): AutomationTag | null {
  if (result.reason === "not_login_issue") {
    return null;
  }

  if (result.handled) {
    return AUTOMATION_TAG.AUTO_RESOLVED;
  }

  return AUTOMATION_TAG.MANUAL_REVIEW;
}
