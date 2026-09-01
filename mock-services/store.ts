import type { Employee, LmsAccount } from "../src/types";
import { INITIAL_EMPLOYEES, INITIAL_LMS_ACCOUNTS } from "./fixtures";

function cloneEmployees(): Record<string, Employee> {
  return structuredClone(INITIAL_EMPLOYEES);
}

function cloneLmsAccounts(): Record<string, LmsAccount> {
  return structuredClone(INITIAL_LMS_ACCOUNTS);
}

let employees = cloneEmployees();
let lmsAccounts = cloneLmsAccounts();

function normalizeEmail(email: string): string {
  return decodeURIComponent(email).trim().toLowerCase();
}

export function resetStore(): void {
  employees = cloneEmployees();
  lmsAccounts = cloneLmsAccounts();
}

export function getEmployee(email: string): Employee | null {
  return employees[normalizeEmail(email)] ?? null;
}

export function getLmsAccount(email: string): LmsAccount | null {
  return lmsAccounts[normalizeEmail(email)] ?? null;
}

export function reactivateLmsAccount(email: string): LmsAccount | null {
  const key = normalizeEmail(email);
  const account = lmsAccounts[key];
  if (!account) {
    return null;
  }

  account.accountStatus = "active";
  return account;
}

export function resetLmsPassword(email: string): string | null {
  const account = getLmsAccount(email);
  if (!account) {
    return null;
  }

  const suffix = Date.now().toString().slice(-6);
  return `TempPass${suffix}!`;
}
