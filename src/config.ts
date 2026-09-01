import dotenv from "dotenv";

dotenv.config();

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Trình duyệt Odoo dùng /odoo/... — JSON-RPC nằm ở domain gốc /jsonrpc */
function normalizeOdooBaseUrl(url: string): string {
  return trimTrailingSlash(url).replace(/\/odoo$/i, "");
}

function ensureLeadingSlash(pathSegment: string): string {
  return pathSegment.startsWith("/") ? pathSegment : `/${pathSegment}`;
}

function readInt(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function readString(name: string, defaultValue = ""): string {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return defaultValue;
  }
  return raw;
}

function readCsv(name: string, defaultValue: readonly string[]): string[] {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return [...defaultValue];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const DEFAULT_LOGIN_KEYWORDS = [
  "đăng nhập",
  "dang nhap",
  "login",
  "password",
  "mật khẩu",
  "mat khau",
] as const;

function inferOdooDatabase(baseUrl: string): string {
  if (!baseUrl) {
    return "";
  }

  try {
    const hostname = new URL(baseUrl).hostname;
    return hostname.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

const odooBaseUrl = normalizeOdooBaseUrl(readString("ODOO_BASE_URL"));

export const config = {
  port: readInt("PORT", 3000),

  mockApiPort: readInt("MOCK_API_PORT", 4001),
  mockApiKey: readString("MOCK_API_KEY", "demo-secret-key"),

  hrApiBaseUrl: trimTrailingSlash(readString("HR_API_BASE_URL")),
  lmsApiBaseUrl: trimTrailingSlash(readString("LMS_API_BASE_URL")),
  hrApiKey: readString("HR_API_KEY"),
  lmsApiKey: readString("LMS_API_KEY"),

  odooBaseUrl,
  odooApiKey: readString("ODOO_API_KEY"),
  odooLogin: readString("ODOO_LOGIN"),
  odooDatabase:
    readString("ODOO_DATABASE") || inferOdooDatabase(odooBaseUrl),
  odooHelpdeskTicketModel: readString(
    "ODOO_HELPDESK_TICKET_MODEL",
    "helpdesk.ticket"
  ),
  odooHelpdeskTagModel: readString("ODOO_HELPDESK_TAG_MODEL", "helpdesk.tag"),

  catchUpDays: readInt("CATCHUP_DAYS", 7),

  logDir: readString("LOG_DIR", "logs"),
  logFile: readString("LOG_FILE", "app.log"),

  apiKeyHeader: readString("API_KEY_HEADER", "x-api-key"),

  hrEmployeesPath: ensureLeadingSlash(
    readString("HR_EMPLOYEES_PATH", "/hr/employees")
  ),
  lmsAccountsPath: ensureLeadingSlash(
    readString("LMS_ACCOUNTS_PATH", "/lms/accounts")
  ),

  loginKeywords: readCsv("LOGIN_KEYWORDS", DEFAULT_LOGIN_KEYWORDS),
  loginTags: readCsv("LOGIN_TAGS", ["login"]),

  tagAutoResolved: readString("TAG_AUTO_RESOLVED", "auto-resolved"),
  tagManualReview: readString("TAG_MANUAL_REVIEW", "manual-review"),

  /** Tùy chọn — Odoo/ngrok gửi header x-webhook-secret khớp giá trị này */
  webhookSecret: readString("WEBHOOK_SECRET"),
};
