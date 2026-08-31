/**
 * Kieu du lieu dung chung cho toan bo project.
 * Moi module (automation, clients, mock-services) deu noi cung
 * "ngon ngu" nay de tranh lech du lieu khi rap lai voi nhau.
 */

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerEmail: string;
  tags?: string[];
}

export interface Employee {
  email: string;
  fullName: string;
  status: "active" | "terminated";
}

export interface LmsAccount {
  email: string;
  accountStatus: "active" | "deactivated";
  lastLoginDaysAgo: number;
}

export interface ProcessResult {
  handled: boolean;
  reason?: string;
  action?: string;
}
