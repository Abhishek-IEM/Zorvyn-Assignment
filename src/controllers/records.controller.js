import {
  createRecord,
  listRecords,
  softDeleteRecord,
  updateRecord,
} from "../services/record.service.js";

async function getRecords(req, res) {
  const result = await listRecords(req.query);
  res.json(result);
}

async function createRecordHandler(req, res) {
  const record = await createRecord(req.body, req.user.id);
  res.status(201).json({ data: record });
}

async function updateRecordHandler(req, res) {
  const updated = await updateRecord(req.params.id, req.body);
  res.json({ data: updated });
}

async function deleteRecordHandler(req, res) {
  await softDeleteRecord(req.params.id);
  res.status(204).send();
}

export {
  getRecords,
  createRecordHandler,
  updateRecordHandler,
  deleteRecordHandler,
};
