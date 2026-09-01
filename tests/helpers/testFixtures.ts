import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/** Config giả dùng chung cho test clients Module 3. */
export const TEST_CONFIG = {
  port: 3000,
  hrApiBaseUrl: "http://localhost:4001",
  lmsApiBaseUrl: "http://localhost:4001",
  hrApiKey: "demo-secret-key",
  lmsApiKey: "demo-secret-key",
  odooBaseUrl: "",
  odooApiKey: "",
  catchUpDays: 7,
} as const;

export function createAxiosError(
  status: number,
  message = "Request failed"
): AxiosError {
  const error = new AxiosError(message);
  error.response = {
    status,
    data: {},
    statusText: message,
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  } as AxiosResponse;
  return error;
}
