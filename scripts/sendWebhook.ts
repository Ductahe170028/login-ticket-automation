import axios from "axios";
import { config } from "../../src/config";
import type { Ticket } from "../../src/types";
import {
  listTicketFixtures,
  loadTicketFixture,
} from "./lib/loadTicketFixture";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function printUsage(): void {
  const fixtures = listTicketFixtures();
  console.log("Giả lập Odoo gửi webhook — POST /webhook/odoo-ticket\n");
  console.log("Usage:");
  console.log("  npm run send-webhook -- <fixture> [--id TICKET-ID] [--email user@x.vn]\n");
  console.log("Fixtures:");
  for (const name of fixtures) {
    console.log(`  - ${name}`);
  }
  console.log("\nVí dụ:");
  console.log("  npm run send-webhook -- login-deactivated --id TICKET-12345");
}

function parseArgs(argv: string[]): {
  fixtureName?: string;
  overrides: Partial<Ticket>;
} {
  const overrides: Partial<Ticket> = {};
  let fixtureName: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--id" && argv[i + 1]) {
      overrides.id = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--email" && argv[i + 1]) {
      overrides.customerEmail = argv[i + 1];
      i += 1;
      continue;
    }

    if (!arg.startsWith("-") && !fixtureName) {
      fixtureName = arg;
    }
  }

  return { fixtureName, overrides };
}

export async function sendWebhookTicket(
  fixtureName: string,
  overrides: Partial<Ticket> = {}
): Promise<void> {
  const ticket = loadTicketFixture(fixtureName, overrides);
  const baseUrl =
    process.env.AUTOMATION_BASE_URL ?? `http://localhost:${config.port}`;
  const url = `${trimTrailingSlash(baseUrl)}/webhook/odoo-ticket`;

  const response = await axios.post(url, ticket, {
    headers: { "Content-Type": "application/json" },
    validateStatus: () => true,
  });

  console.log(`POST ${url}`);
  console.log(`Ticket id=${ticket.id} email=${ticket.customerEmail}`);
  console.log(`Status: ${response.status}`);
  console.log(JSON.stringify(response.data, null, 2));

  if (response.status >= 400) {
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  const { fixtureName, overrides } = parseArgs(process.argv.slice(2));

  if (!fixtureName) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  await sendWebhookTicket(fixtureName, overrides);
}

if (require.main === module) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}
