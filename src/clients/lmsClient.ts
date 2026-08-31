import type { LmsAccount } from "../types";

/** Stub — Module 3 sẽ hiện thực gọi LMS API thật. */
export async function getAccountStatus(
  _email: string
): Promise<LmsAccount | null> {
  return null;
}

export async function reactivateAccount(_email: string): Promise<void> {}

export async function resetPassword(
  _email: string
): Promise<{ tempPassword: string }> {
  return { tempPassword: "" };
}
