import { Router } from "express";
import { config } from "../../src/config";
import { requireApiKey } from "../middleware/requireApiKey";
import {
  getLmsAccount,
  reactivateLmsAccount,
  resetLmsPassword,
} from "../store";

export function createLmsRouter(): Router {
  const router = Router();

  router.get(
    `${config.lmsAccountsPath}/:email`,
    requireApiKey,
    (req, res) => {
      const account = getLmsAccount(req.params.email);
      if (!account) {
        res.status(404).json({ error: "LMS account not found" });
        return;
      }

      res.json(account);
    }
  );

  router.post(
    `${config.lmsAccountsPath}/:email/reactivate`,
    requireApiKey,
    (req, res) => {
      const account = reactivateLmsAccount(req.params.email);
      if (!account) {
        res.status(404).json({ error: "LMS account not found" });
        return;
      }

      res.json({ ok: true, account });
    }
  );

  router.post(
    `${config.lmsAccountsPath}/:email/reset-password`,
    requireApiKey,
    (req, res) => {
      const tempPassword = resetLmsPassword(req.params.email);
      if (!tempPassword) {
        res.status(404).json({ error: "LMS account not found" });
        return;
      }

      res.json({ tempPassword });
    }
  );

  return router;
}
