import { config } from "../config";
import type { LmsAccount } from "../types";
import {
  getJsonOrNullIfNotFound,
  postJsonOrThrow,
  postOrThrow,
} from "../utils/httpClient";

export async function getAccountStatus(
  email: string
): Promise<LmsAccount | null> {
  const url = `${config.lmsApiBaseUrl}${config.lmsAccountsPath}/${encodeURIComponent(email)}`;
  return getJsonOrNullIfNotFound<LmsAccount>(url, config.lmsApiKey);
}

export async function reactivateAccount(email: string): Promise<void> {
  const url = `${config.lmsApiBaseUrl}${config.lmsAccountsPath}/${encodeURIComponent(email)}/reactivate`;
  await postOrThrow(url, {}, config.lmsApiKey);
}

export async function resetPassword(
  email: string
): Promise<{ tempPassword: string }> {
  const url = `${config.lmsApiBaseUrl}${config.lmsAccountsPath}/${encodeURIComponent(email)}/reset-password`;
  const data = await postJsonOrThrow<{ tempPassword?: string }>(
    url,
    {},
    config.lmsApiKey
  );

  if (!data.tempPassword) {
    throw new Error("LMS resetPassword response missing tempPassword");
  }

  return { tempPassword: data.tempPassword };
}
