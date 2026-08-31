import { getEmployeeStatus } from "../clients/hrClient";
import {
  getAccountStatus,
  reactivateAccount,
  resetPassword,
} from "../clients/lmsClient";
import { addInternalNote } from "../clients/odooClient";
import type { ProcessResult, Ticket } from "../types";
import { sendEmail } from "../utils/emailSender";
import { isLoginIssue } from "./detectLoginIssue";

export async function processLoginTicket(
  ticket: Ticket
): Promise<ProcessResult> {
  if (!isLoginIssue(ticket)) {
    return { handled: false, reason: "not_login_issue" };
  }

  const { id: ticketId, customerEmail } = ticket;
  const email = customerEmail.trim();

  if (!email) {
    await addInternalNote(
      ticketId,
      "Missing customer email on ticket. Manual review required."
    );
    return { handled: false, reason: "missing_customer_email" };
  }

  const employee = await getEmployeeStatus(email);
  if (!employee) {
    await addInternalNote(
      ticketId,
      `Employee not found in HR for email ${email}. Manual review required.`
    );
    return { handled: false, reason: "employee_not_found" };
  }

  if (employee.status === "terminated") {
    await addInternalNote(
      ticketId,
      `Employee ${employee.fullName} is terminated. Escalate for manual review — do not reactivate LMS account.`
    );
    return { handled: false, reason: "employee_terminated" };
  }

  const lmsAccount = await getAccountStatus(email);
  if (!lmsAccount) {
    await addInternalNote(
      ticketId,
      `No LMS account found for ${email}. Manual review required.`
    );
    return { handled: false, reason: "lms_account_not_found" };
  }

  if (lmsAccount.accountStatus === "deactivated") {
    await reactivateAccount(email);
    const { tempPassword } = await resetPassword(email);

    await addInternalNote(
      ticketId,
      `Reactivated LMS account for ${email} and reset password.`
    );
    await sendEmail({
      to: email,
      subject: `RE: ${ticket.title} - Ticket #${ticketId}`,
      body: `Your LMS account has been reactivated. Temporary password: ${tempPassword}`,
    });

    return {
      handled: true,
      action: "reactivated_and_reset_password",
    };
  }

  const { tempPassword } = await resetPassword(email);

  await addInternalNote(
    ticketId,
    `Reset LMS password for ${email}.`
  );
  await sendEmail({
    to: email,
    subject: `RE: ${ticket.title} - Ticket #${ticketId}`,
    body: `Your LMS password has been reset. Temporary password: ${tempPassword}`,
  });

  return { handled: true, action: "reset_password" };
}
