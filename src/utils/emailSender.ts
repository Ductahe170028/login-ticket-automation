import { logger } from "./logger";

export async function sendEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  logger.info(
    `[email mock] to=${input.to} subject=${input.subject} body=${input.body}`
  );
}
