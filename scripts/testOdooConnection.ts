import { authenticate } from "../src/clients/odooRpc";
import { config } from "../src/config";

async function main(): Promise<void> {
  console.log("ODOO_BASE_URL:", config.odooBaseUrl);
  console.log("ODOO_DATABASE:", config.odooDatabase);
  console.log("ODOO_LOGIN:", config.odooLogin);
  console.log("JSON-RPC URL:", `${config.odooBaseUrl}/jsonrpc`);

  const uid = await authenticate();
  console.log("OK — authenticated uid:", uid);
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
