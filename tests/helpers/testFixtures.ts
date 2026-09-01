/** Config giả dùng chung cho test clients Module 3. */
export const TEST_CONFIG = {
  port: 3000,
  mockApiPort: 4001,
  mockApiKey: "demo-secret-key",
  hrApiBaseUrl: "http://localhost:4001",
  lmsApiBaseUrl: "http://localhost:4001",
  hrApiKey: "demo-secret-key",
  lmsApiKey: "demo-secret-key",
  odooBaseUrl: "",
  odooApiKey: "",
  odooLogin: "",
  odooDatabase: "localhost",
  odooHelpdeskTicketModel: "helpdesk.ticket",
  odooHelpdeskTagModel: "helpdesk.tag",
  catchUpDays: 7,
  logDir: "logs",
  logFile: "app.log",
  apiKeyHeader: "x-api-key",
  hrEmployeesPath: "/hr/employees",
  lmsAccountsPath: "/lms/accounts",
  loginKeywords: [
    "đăng nhập",
    "dang nhap",
    "login",
    "password",
    "mật khẩu",
    "mat khau",
  ],
  loginTags: ["login"],
  tagAutoResolved: "auto-resolved",
  tagManualReview: "manual-review",
} as const;

/** Object reject giống axios error — tránh AxiosError class lỗi với jest.mock('axios'). */
export function createAxiosError(
  status: number,
  message = "Request failed"
): { message: string; response: { status: number } } {
  return {
    message,
    response: { status },
  };
}

/** mockRejectedValue(createAxiosError) đôi khi không propagate — dùng helper này cho reject có status. */
export function mockAxiosReject(
  mockFn: jest.Mock,
  status: number,
  message = "Request failed"
): void {
  mockFn.mockImplementation(() =>
    Promise.reject(createAxiosError(status, message))
  );
}
