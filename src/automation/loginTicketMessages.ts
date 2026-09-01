export function noteMissingCustomerEmail(): string {
  return "Ticket thiếu email khách. Cần support xử lý tay.";
}

export function noteEmployeeNotFound(email: string): string {
  return `Không tìm thấy nhân sự ${email} trên HR. Cần support xử lý tay.`;
}

export function noteEmployeeTerminated(fullName: string): string {
  return `Nhân sự ${fullName} đã nghỉ việc. Không kích hoạt lại LMS — chuyển support xử lý tay.`;
}

export function noteLmsAccountNotFound(email: string): string {
  return `Không tìm thấy tài khoản LMS cho ${email}. Cần support xử lý tay.`;
}

export function noteReactivatedAndReset(email: string): string {
  return `Đã kích hoạt lại tài khoản LMS và reset mật khẩu cho ${email}.`;
}

export function notePasswordReset(email: string): string {
  return `Đã reset mật khẩu LMS cho ${email}.`;
}

function buildCustomerEmailBody(
  fullName: string,
  resolutionParagraph: string,
  tempPassword: string
): string {
  return [
    `Chào ${fullName},`,
    `${resolutionParagraph} Mật khẩu mới: ${tempPassword}`,
    "Nếu đăng nhập thành công, nhờ bạn phản hồi giúp team để đóng phiếu hỗ trợ. Trong trường hợp bạn vẫn gặp sự cố liên quan tới đăng nhập, nhờ bạn báo lại giúp team kèm thêm ảnh chụp màn hình.",
    "Cảm ơn bạn đã hỗ trợ!",
    "Trân trọng,\nMindX Support Team",
  ].join("\n\n");
}

export function buildReactivateCustomerEmail(
  fullName: string,
  tempPassword: string
): string {
  return buildCustomerEmailBody(
    fullName,
    "Team đã kiểm tra và kích hoạt lại tài khoản LMS, đồng thời reset mật khẩu cho bạn.",
    tempPassword
  );
}

export function buildResetPasswordCustomerEmail(
  fullName: string,
  tempPassword: string
): string {
  return buildCustomerEmailBody(
    fullName,
    "Team đã kiểm tra tài khoản LMS và hỗ trợ reset mật khẩu cho bạn.",
    tempPassword
  );
}

export function buildCustomerEmailSubject(ticketTitle: string): string {
  return `RE: ${ticketTitle}`;
}
