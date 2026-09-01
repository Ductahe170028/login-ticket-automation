import fs from "fs";
import path from "path";
import { config } from "../config";

const LOG_DIR = path.join(process.cwd(), config.logDir);
const LOG_FILE = path.join(LOG_DIR, config.logFile);

function appendToFile(level: string, message: string): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  const line = `[${new Date().toISOString()}] ${level} ${message}\n`;
  fs.appendFileSync(LOG_FILE, line, "utf-8");
}

export const logger = {
  info(message: string): void {
    console.log(message);
    appendToFile("INFO", message);
  },

  error(message: string): void {
    console.error(message);
    appendToFile("ERROR", message);
  },
};
