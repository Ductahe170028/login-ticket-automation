import axios from "axios";
import type { Server } from "http";
import { createMockApiApp } from "../../mock-services/server";
import { resetStore } from "../../mock-services/store";
import { config } from "../../src/config";

describe("mock HR/LMS API", () => {
  let server: Server;
  let baseUrl: string;
  const authHeaders = { headers: { [config.apiKeyHeader]: config.mockApiKey } };

  beforeAll((done) => {
    const app = createMockApiApp();
    server = app.listen(0, () => {
      const address = server.address();
      const port =
        typeof address === "object" && address !== null ? address.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(() => done());
  });

  beforeEach(() => {
    resetStore();
  });

  it("GET employee active → 200", async () => {
    const response = await axios.get(
      `${baseUrl}${config.hrEmployeesPath}/teacher%40mindx.edu.vn`,
      authHeaders
    );

    expect(response.data).toMatchObject({
      email: "teacher@mindx.edu.vn",
      status: "active",
    });
  });

  it("GET employee không tồn tại → 404", async () => {
    await expect(
      axios.get(
        `${baseUrl}${config.hrEmployeesPath}/unknown%40mindx.edu.vn`,
        authHeaders
      )
    ).rejects.toMatchObject({ response: { status: 404 } });
  });

  it("thiếu API key → 401", async () => {
    await expect(
      axios.get(`${baseUrl}${config.hrEmployeesPath}/teacher%40mindx.edu.vn`)
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  it("LMS deactivated → reactivate → active", async () => {
    const email = "teacher%40mindx.edu.vn";

    const before = await axios.get(
      `${baseUrl}${config.lmsAccountsPath}/${email}`,
      authHeaders
    );
    expect(before.data.accountStatus).toBe("deactivated");

    await axios.post(
      `${baseUrl}${config.lmsAccountsPath}/${email}/reactivate`,
      {},
      authHeaders
    );

    const after = await axios.get(
      `${baseUrl}${config.lmsAccountsPath}/${email}`,
      authHeaders
    );
    expect(after.data.accountStatus).toBe("active");
  });

  it("POST reset-password → trả tempPassword", async () => {
    const response = await axios.post(
      `${baseUrl}${config.lmsAccountsPath}/active.user%40mindx.edu.vn/reset-password`,
      {},
      authHeaders
    );

    expect(response.data.tempPassword).toMatch(/^TempPass\d+!$/);
  });
});
