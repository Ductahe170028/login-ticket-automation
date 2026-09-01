import { Router } from "express";
import { config } from "../../src/config";
import { requireApiKey } from "../middleware/requireApiKey";
import { getEmployee } from "../store";

export function createHrRouter(): Router {
  const router = Router();

  router.get(
    `${config.hrEmployeesPath}/:email`,
    requireApiKey,
    (req, res) => {
      const employee = getEmployee(req.params.email);
      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      res.json(employee);
    }
  );

  return router;
}
