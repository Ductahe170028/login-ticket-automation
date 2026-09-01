import type { Employee, LmsAccount } from "../src/types";

/**
 * Dữ liệu mẫu cho mock HR/LMS.
 * Xem README — bảng email demo khi chạy npm run mock-api.
 */
export const INITIAL_EMPLOYEES: Record<string, Employee> = {
  "teacher@mindx.edu.vn": {
    email: "teacher@mindx.edu.vn",
    fullName: "Nguyễn Văn A",
    status: "active",
  },
  "active.user@mindx.edu.vn": {
    email: "active.user@mindx.edu.vn",
    fullName: "Lê Văn C",
    status: "active",
  },
  "terminated@mindx.edu.vn": {
    email: "terminated@mindx.edu.vn",
    fullName: "Trần Thị B",
    status: "terminated",
  },
  "no-lms@mindx.edu.vn": {
    email: "no-lms@mindx.edu.vn",
    fullName: "Phạm Văn D",
    status: "active",
  },
};

export const INITIAL_LMS_ACCOUNTS: Record<string, LmsAccount> = {
  "teacher@mindx.edu.vn": {
    email: "teacher@mindx.edu.vn",
    accountStatus: "deactivated",
    lastLoginDaysAgo: 45,
  },
  "active.user@mindx.edu.vn": {
    email: "active.user@mindx.edu.vn",
    accountStatus: "active",
    lastLoginDaysAgo: 14,
  },
  "terminated@mindx.edu.vn": {
    email: "terminated@mindx.edu.vn",
    accountStatus: "active",
    lastLoginDaysAgo: 7,
  },
};
