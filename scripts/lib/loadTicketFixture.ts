import fs from "fs";
import path from "path";
import type { Ticket } from "../../src/types";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures", "tickets");

export function getFixturesDir(): string {
  return FIXTURES_DIR;
}

export function listTicketFixtures(): string[] {
  if (!fs.existsSync(FIXTURES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(FIXTURES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort();
}

function isValidTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.customerEmail === "string"
  );
}

export function loadTicketFixture(
  name: string,
  overrides: Partial<Ticket> = {}
): Ticket {
  const filePath = path.join(FIXTURES_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Fixture not found: ${name} (${filePath})`);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
  if (!isValidTicket(raw)) {
    throw new Error(`Invalid ticket fixture: ${name}`);
  }

  return { ...raw, ...overrides };
}
