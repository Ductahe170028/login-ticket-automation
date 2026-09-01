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
import {
  buildCustomerEmailSubject,
  buildReactivateCustomerEmail,
  buildResetPasswordCustomerEmail,
  noteEmployeeNotFound,
  noteEmployeeTerminated,
  noteLmsAccountNotFound,
  noteMissingCustomerEmail,
  notePasswordReset,
  noteReactivatedAndReset,
} from "./loginTicketMessages";

export async function processLoginTicket(
  ticket: Ticket
): Promise<ProcessResult> {
  if (!isLoginIssue(ticket)) {
    return { handled: false, reason: "not_login_issue" };
  }

  const { id: ticketId, customerEmail } = ticket;
  const email = customerEmail.trim();

  if (!email) {
    await addInternalNote(ticketId, noteMissingCustomerEmail());
    return { handled: false, reason: "missing_customer_email" };
  }

  const employee = await getEmployeeStatus(email);
  if (!employee) {
    await addInternalNote(ticketId, noteEmployeeNotFound(email));
    return { handled: false, reason: "employee_not_found" };
  }

  if (employee.status === "terminated") {
    await addInternalNote(
      ticketId,
      noteEmployeeTerminated(employee.fullName)
    );
    return { handled: false, reason: "employee_terminated" };
  }

  const lmsAccount = await getAccountStatus(email);
  if (!lmsAccount) {
    await addInternalNote(ticketId, noteLmsAccountNotFound(email));
    return { handled: false, reason: "lms_account_not_found" };
  }

  const emailSubject = buildCustomerEmailSubject(ticket.title);

  if (lmsAccount.accountStatus === "deactivated") {
    await reactivateAccount(email);
    const { tempPassword } = await resetPassword(email);

    await addInternalNote(ticketId, noteReactivatedAndReset(email));
    await sendEmail({
      ticketId,
      to: email,
      subject: emailSubject,
      body: buildReactivateCustomerEmail(employee.fullName, tempPassword),
    });

    return {
      handled: true,
      action: "reactivated_and_reset_password",
    };
  }

  const { tempPassword } = await resetPassword(email);

  await addInternalNote(ticketId, notePasswordReset(email));
  await sendEmail({
    ticketId,
    to: email,
    subject: emailSubject,
    body: buildResetPasswordCustomerEmail(employee.fullName, tempPassword),
  });

  return { handled: true, action: "reset_password" };
}
