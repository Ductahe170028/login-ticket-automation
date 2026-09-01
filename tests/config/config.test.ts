const ORIGINAL_ENV = process.env;

describe("config", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("đọc HR/LMS base URL và API key từ process.env", async () => {
    process.env.HR_API_BASE_URL = "http://hr.example";
    process.env.HR_API_KEY = "hr-secret";
    process.env.LMS_API_BASE_URL = "http://lms.example";
    process.env.LMS_API_KEY = "lms-secret";
    process.env.ODOO_BASE_URL = "http://odoo.example";
    process.env.ODOO_API_KEY = "odoo-secret";

    const { config } = await import("../../src/config");

    expect(config.hrApiBaseUrl).toBe("http://hr.example");
    expect(config.hrApiKey).toBe("hr-secret");
    expect(config.lmsApiBaseUrl).toBe("http://lms.example");
    expect(config.lmsApiKey).toBe("lms-secret");
    expect(config.odooBaseUrl).toBe("http://odoo.example");
    expect(config.odooApiKey).toBe("odoo-secret");
  });

  it("bỏ trailing slash ở base URL", async () => {
    process.env.HR_API_BASE_URL = "http://hr.example/";
    process.env.LMS_API_BASE_URL = "http://lms.example///";

    const { config } = await import("../../src/config");

    expect(config.hrApiBaseUrl).toBe("http://hr.example");
    expect(config.lmsApiBaseUrl).toBe("http://lms.example");
  });

  it("PORT mặc định 3000 khi không set", async () => {
    delete process.env.PORT;

    const { config } = await import("../../src/config");

    expect(config.port).toBe(3000);
  });

  it("ODOO_BASE_URL trống → odooBaseUrl rỗng (chế độ mock)", async () => {
    process.env.ODOO_BASE_URL = "";
    process.env.ODOO_API_KEY = "";
    process.env.ODOO_LOGIN = "";
    process.env.ODOO_DATABASE = "";

    const { config } = await import("../../src/config");

    expect(config.odooBaseUrl).toBe("");
    expect(config.odooApiKey).toBe("");
  });

  it("CATCHUP_DAYS mặc định 7 khi không set", async () => {
    delete process.env.CATCHUP_DAYS;

    const { config } = await import("../../src/config");

    expect(config.catchUpDays).toBe(7);
  });

  it("đọc LOGIN_KEYWORDS và LOGIN_TAGS từ env (CSV)", async () => {
    process.env.LOGIN_KEYWORDS = "login,forgot password";
    process.env.LOGIN_TAGS = "auth,login";

    const { config } = await import("../../src/config");

    expect(config.loginKeywords).toEqual(["login", "forgot password"]);
    expect(config.loginTags).toEqual(["auth", "login"]);
  });

  it("bỏ /odoo khỏi ODOO_BASE_URL (path web UI, không phải API)", async () => {
    process.env.ODOO_BASE_URL = "https://anhduchelpdeskw4.odoo.com/odoo";

    const { config } = await import("../../src/config");

    expect(config.odooBaseUrl).toBe("https://anhduchelpdeskw4.odoo.com");
  });

  it("suy ra ODOO_DATABASE từ subdomain khi không set", async () => {
    process.env.ODOO_BASE_URL = "https://anhduchelpdeskw4.odoo.com";
    delete process.env.ODOO_DATABASE;

    const { config } = await import("../../src/config");

    expect(config.odooDatabase).toBe("anhduchelpdeskw4");
  });
});
