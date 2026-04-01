import { getDashboardSummary } from "../services/dashboard.service.js";

async function getSummary(req, res) {
  const summary = await getDashboardSummary(req.query);
  res.json({ data: summary });
}

export { getSummary };
