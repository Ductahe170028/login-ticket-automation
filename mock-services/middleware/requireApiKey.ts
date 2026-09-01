import type { NextFunction, Request, Response } from "express";
import { config } from "../../src/config";

export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerValue = req.headers[config.apiKeyHeader.toLowerCase()];

  if (headerValue !== config.mockApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
