'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Đơn vị thuốc
const UNITS = ['ml', 'mg', 'g', 'tablet', 'bottle', 'sachet', 'other'];

const TreatmentLogSchema = new Schema(
  {
    // Tham chiếu đến đàn heo — có thể là MeatPigHerd hoặc SowHerd
    herd_id: {
      type:     String,
      required: [true, 'Herd ID is required'],
      trim:     true,
    },

    herd_type: {
      type:     String,
      required: true,
      enum:     {
        values:  ['meat', 'sow'],
        message: 'herd_type must be "meat" or "sow"',
      },
    },

    // Triệu chứng — lưu dạng mảng string để linh hoạt
    symptoms: {
      type:     [String],
      required: [true, 'At least one symptom is required'],
      validate: {
        validator: (v) => v.length > 0,
        message:   'symptoms cannot be empty',
      },
    },

    medicine_name: {
      type:     String,
      required: [true, 'Medicine name is required'],
      trim:     true,
    },

    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [0.01, 'Quantity must be > 0'],
    },

    unit: {
      type:     String,
      required: [true, 'Unit is required'],
      enum:     { values: UNITS, message: `Unit must be one of: ${UNITS.join(', ')}` },
    },

    description: {
      type:    String,
      default: null,
    },

    treated_at: {
      type:    Date,
      default: Date.now,
    },

    treated_by: {
      type:    String,
      default: null,   // tên người điều trị
    },

    // Soft delete — không xóa cứng log điều trị
    is_deleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'treatment_logs',
  }
);

// ─── Pre-save: không cho log nếu đàn không tồn tại ───────────────────────────
// (validate ở service layer, schema chỉ đảm bảo format)

// ─── Methods ──────────────────────────────────────────────────────────────────

// Soft delete — không được xóa cứng log điều trị vì cần audit trail
TreatmentLogSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return this.save();
};

// Cập nhật mô tả sau điều trị
TreatmentLogSchema.methods.updateDescription = async function (desc) {
  if (!desc || desc.trim() === '') throw new Error('Description cannot be empty');
  this.description = desc.trim();
  return this.save();
};

// ─── Statics ──────────────────────────────────────────────────────────────────
TreatmentLogSchema.statics.findByHerd = function (herdId) {
  return this.find({ herd_id: herdId, is_deleted: false }).sort({ treated_at: -1 });
};

TreatmentLogSchema.statics.findByDateRange = function (from, to) {
  return this.find({
    treated_at: { $gte: from, $lte: to },
    is_deleted: false,
  }).sort({ treated_at: -1 });
};

// ─── Index ────────────────────────────────────────────────────────────────────
TreatmentLogSchema.index({ herd_id: 1, treated_at: -1 });
TreatmentLogSchema.index({ medicine_name: 1 });

module.exports = mongoose.model('TreatmentLog', TreatmentLogSchema);
