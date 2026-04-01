import { loginUser } from "../services/auth.service.js";

async function login(req, res) {
  const result = await loginUser(req.body);
  res.json(result);
}

export { login };
