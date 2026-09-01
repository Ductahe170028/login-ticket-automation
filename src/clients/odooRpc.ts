import axios from "axios";
import { config } from "../config";

let cachedUid: number | null = null;

export function isOdooRpcConfigured(): boolean {
  return (
    config.odooBaseUrl.length > 0 &&
    config.odooApiKey.length > 0 &&
    config.odooLogin.length > 0 &&
    config.odooDatabase.length > 0
  );
}

export function resetOdooRpcSession(): void {
  cachedUid = null;
}

function getJsonRpcUrl(): string {
  return `${config.odooBaseUrl}/jsonrpc`;
}

async function jsonRpc(
  service: string,
  method: string,
  args: unknown[]
): Promise<unknown> {
  try {
    const response = await axios.post<{
      result?: unknown;
      error?: { message: string; data?: { message?: string } };
    }>(getJsonRpcUrl(), {
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Date.now(),
    });

    if (response.data.error) {
      const message =
        response.data.error.data?.message ?? response.data.error.message;
      throw new Error(message);
    }

    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body =
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data);
      throw new Error(
        `Odoo RPC HTTP ${error.response.status} at ${getJsonRpcUrl()}: ${body.slice(0, 200)}`
      );
    }
    throw error;
  }
}

export async function authenticate(): Promise<number> {
  if (cachedUid !== null) {
    return cachedUid;
  }

  const uid = await jsonRpc("common", "authenticate", [
    config.odooDatabase,
    config.odooLogin,
    config.odooApiKey,
    {},
  ]);

  if (!uid || typeof uid !== "number") {
    throw new Error("Odoo authentication failed — check ODOO_LOGIN and ODOO_API_KEY");
  }

  cachedUid = uid;
  return uid;
}

export async function executeKw<T>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {}
): Promise<T> {
  const uid = await authenticate();

  return (await jsonRpc("object", "execute_kw", [
    config.odooDatabase,
    uid,
    config.odooApiKey,
    model,
    method,
    args,
    kwargs,
  ])) as T;
}
