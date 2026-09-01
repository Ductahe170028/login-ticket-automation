import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

describe("logger", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("info ghi ra console", async () => {
    const { logger } = await import("../../../src/utils/logger");

    logger.info("Ticket TICKET-101 processed");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ticket TICKET-101 processed")
    );
  });

  it("info append vào logs/app.log", async () => {
    const { logger } = await import("../../../src/utils/logger");

    logger.info("Automation started");

    expect(fs.existsSync(LOG_FILE)).toBe(true);
    const content = fs.readFileSync(LOG_FILE, "utf-8");
    expect(content).toContain("Automation started");
  });

  it("error ghi cả console và file", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { logger } = await import("../../../src/utils/logger");

    logger.error("HR API failed");

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("HR API failed")
    );
    expect(fs.readFileSync(LOG_FILE, "utf-8")).toContain("HR API failed");

    errorSpy.mockRestore();
  });
});
