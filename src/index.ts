import { catchUpPendingTickets } from "./automation/catchUpPendingTickets";
import { config } from "./config";
import { createApp } from "./server";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  await catchUpPendingTickets();

  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`Automation server listening on http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Failed to start server: ${message}`);
  process.exit(1);
});
