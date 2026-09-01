import { config } from "../config";
import type { Employee } from "../types";
import { getJsonOrNullIfNotFound } from "../utils/httpClient";

export async function getEmployeeStatus(
  email: string
): Promise<Employee | null> {
  const url = `${config.hrApiBaseUrl}${config.hrEmployeesPath}/${encodeURIComponent(email)}`;
  return getJsonOrNullIfNotFound<Employee>(url, config.hrApiKey);
}
