import { sendCustomerEmail } from "../clients/odooClient";
import { isOdooRpcConfigured } from "../clients/odooRpc";
import { logger } from "./logger";

export async function sendEmail(input: {
  ticketId: string;
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  if (!isOdooRpcConfigured()) {
    logger.info(
      `[email mock] ticket=${input.ticketId} to=${input.to} subject=${input.subject} body=${input.body}`
    );
    return;
  }

  await sendCustomerEmail(input.ticketId, {
    to: input.to,
    subject: input.subject,
    body: input.body,
  });
}
