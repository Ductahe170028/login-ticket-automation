/** Tag Odoo gắn sau khi automation xử lý — support lọc queue. */
export const AUTOMATION_TAG = {
  AUTO_RESOLVED: "auto-resolved",
  MANUAL_REVIEW: "manual-review",
} as const;

export type AutomationTag =
  (typeof AUTOMATION_TAG)[keyof typeof AUTOMATION_TAG];

/** Tag đánh dấu ticket đã qua automation (đủ để bỏ qua khi catch-up). */
export const PROCESSED_AUTOMATION_TAGS: readonly AutomationTag[] = [
  AUTOMATION_TAG.AUTO_RESOLVED,
  AUTOMATION_TAG.MANUAL_REVIEW,
];
