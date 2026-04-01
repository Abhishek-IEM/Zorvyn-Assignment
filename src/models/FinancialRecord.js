import mongoose from "mongoose";

const recordTypes = ["income", "expense"];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: recordTypes, required: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    recordDate: { type: Date, required: true },
    notes: { type: String, maxlength: 500 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

financialRecordSchema.index({ recordDate: 1, type: 1, category: 1 });
financialRecordSchema.index({ isDeleted: 1, recordDate: -1 });

const FinancialRecord = mongoose.model(
  "FinancialRecord",
  financialRecordSchema,
);

export { FinancialRecord, recordTypes };
