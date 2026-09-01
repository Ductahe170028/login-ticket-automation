import axios from "axios";
import { createAxiosError, TEST_CONFIG } from "../../helpers/testFixtures";

jest.mock("axios");
jest.mock("../../../src/config", () => ({
  config: TEST_CONFIG,
}));

import {
  getAccountStatus,
  reactivateAccount,
  resetPassword,
} from "../../../src/clients/lmsClient";

const mockedGet = jest.mocked(axios.get);
const mockedPost = jest.mocked(axios.post);

const LMS_ACCOUNT = {
  email: "teacher@mindx.edu.vn",
  accountStatus: "deactivated" as const,
  lastLoginDaysAgo: 45,
};

const EMAIL = "teacher@mindx.edu.vn";
const ENCODED_EMAIL = "teacher%40mindx.edu.vn";
const BASE = "http://localhost:4001";
const HEADERS = { headers: { "x-api-key": "demo-secret-key" } };

describe("lmsClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccountStatus", () => {
    it("GET đúng URL + header → trả LmsAccount", async () => {
      mockedGet.mockResolvedValue({ status: 200, data: LMS_ACCOUNT });

      const result = await getAccountStatus(EMAIL);

      expect(result).toEqual(LMS_ACCOUNT);
      expect(mockedGet).toHaveBeenCalledWith(
        `${BASE}/lms/accounts/${ENCODED_EMAIL}`,
        HEADERS
      );
    });

    it("API 404 → null, không throw", async () => {
      mockedGet.mockRejectedValue(createAxiosError(404));

      expect(await getAccountStatus(EMAIL)).toBeNull();
    });

    it("API 500 → throw", async () => {
      mockedGet.mockRejectedValue(createAxiosError(500));

      await expect(getAccountStatus(EMAIL)).rejects.toThrow();
    });
  });

  describe("reactivateAccount", () => {
    it("POST đúng URL + header → thành công", async () => {
      mockedPost.mockResolvedValue({ status: 200, data: {} });

      await reactivateAccount(EMAIL);

      expect(mockedPost).toHaveBeenCalledWith(
        `${BASE}/lms/accounts/${ENCODED_EMAIL}/reactivate`,
        {},
        HEADERS
      );
    });

    it("API 404 → throw (account không tồn tại)", async () => {
      mockedPost.mockRejectedValue(createAxiosError(404));

      await expect(reactivateAccount(EMAIL)).rejects.toThrow();
    });
  });

  describe("resetPassword", () => {
    it("POST đúng URL → trả tempPassword từ body", async () => {
      mockedPost.mockResolvedValue({
        status: 200,
        data: { tempPassword: "TempPass123!" },
      });

      const result = await resetPassword(EMAIL);

      expect(result).toEqual({ tempPassword: "TempPass123!" });
      expect(mockedPost).toHaveBeenCalledWith(
        `${BASE}/lms/accounts/${ENCODED_EMAIL}/reset-password`,
        {},
        HEADERS
      );
    });

    it("response thiếu tempPassword → throw", async () => {
      mockedPost.mockResolvedValue({ status: 200, data: {} });

      await expect(resetPassword(EMAIL)).rejects.toThrow(/tempPassword/i);
    });

    it("API 500 → throw", async () => {
      mockedPost.mockRejectedValue(createAxiosError(500));

      await expect(resetPassword(EMAIL)).rejects.toThrow();
    });
  });
});
