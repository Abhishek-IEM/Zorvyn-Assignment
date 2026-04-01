import { createUser, listUsers, updateUser } from "../services/user.service.js";

async function getUsers(req, res) {
  const users = await listUsers();
  res.json({ data: users });
}

async function createUserHandler(req, res) {
  const user = await createUser(req.body);
  res.status(201).json({ data: user });
}

async function updateUserHandler(req, res) {
  const updated = await updateUser(req.params.id, req.body);
  res.json({ data: updated });
}

export { getUsers, createUserHandler, updateUserHandler };
