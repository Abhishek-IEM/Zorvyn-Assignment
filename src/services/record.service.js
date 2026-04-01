import { Types } from "mongoose";

import { FinancialRecord } from "../models/FinancialRecord.js";
import { httpError } from "../utils/httpError.js";

function buildRecordFilter({ type, category, startDate, endDate }) {
  const filter = { isDeleted: false };

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.recordDate = {};
    if (startDate) filter.recordDate.$gte = new Date(startDate);
    if (endDate) filter.recordDate.$lte = new Date(endDate);
  }

  return filter;
}

async function listRecords(query) {
  const { page, limit, ...filterInput } = query;
  const filter = buildRecordFilter(filterInput);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort({ recordDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username fullName role")
      .lean(),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    data: rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function createRecord(payload, userId) {
  const record = await FinancialRecord.create({
    ...payload,
    recordDate: new Date(payload.recordDate),
    createdBy: userId,
  });

  return record;
}

async function updateRecord(id, payload) {
  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid record id");
  }

  const updatePayload = { ...payload };
  if (updatePayload.recordDate) {
    updatePayload.recordDate = new Date(updatePayload.recordDate);
  }

  const updated = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updatePayload,
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updated) {
    throw httpError(404, "Record not found");
  }

  return updated;
}

async function softDeleteRecord(id) {
  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid record id");
  }

  const deleted = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  ).lean();

  if (!deleted) {
    throw httpError(404, "Record not found");
  }
}

export {
  buildRecordFilter,
  listRecords,
  createRecord,
  updateRecord,
  softDeleteRecord,
};
