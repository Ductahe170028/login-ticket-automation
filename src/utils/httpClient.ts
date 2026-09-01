import { config } from "../config";
import axios from "axios";

export function apiKeyHeaders(
  apiKey: string
): { headers: Record<string, string> } {
  return { headers: { [config.apiKeyHeader]: apiKey } };
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
}

export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

export async function getJsonOrNullIfNotFound<T>(
  url: string,
  apiKey: string
): Promise<T | null> {
  try {
    const response = await axios.get<T>(url, apiKeyHeaders(apiKey));
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

export async function postJsonOrThrow<T>(
  url: string,
  body: unknown,
  apiKey: string
): Promise<T> {
  const response = await axios.post<T>(url, body, apiKeyHeaders(apiKey));
  return response.data;
}

export async function postOrThrow(
  url: string,
  body: unknown,
  apiKey: string
): Promise<void> {
  await postJsonOrThrow(url, body, apiKey);
}
