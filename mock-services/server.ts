import express from "express";
import { config } from "../src/config";
import { createHrRouter } from "./routes/hrRoutes";
import { createLmsRouter } from "./routes/lmsRoutes";

export function createMockApiApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "mock-hr-lms" });
  });

  app.use(createHrRouter());
  app.use(createLmsRouter());

  return app;
}

function startServer(): void {
  const app = createMockApiApp();

  app.listen(config.mockApiPort, () => {
    console.log(
      `Mock HR/LMS API: http://localhost:${config.mockApiPort} (key: ${config.mockApiKey})`
    );
    console.log(`  HR  GET ${config.hrEmployeesPath}/:email`);
    console.log(`  LMS GET ${config.lmsAccountsPath}/:email`);
    console.log(`  LMS POST ${config.lmsAccountsPath}/:email/reactivate`);
    console.log(`  LMS POST ${config.lmsAccountsPath}/:email/reset-password`);
  });
}

if (require.main === module) {
  startServer();
}
