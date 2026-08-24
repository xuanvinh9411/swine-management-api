'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const VaccineRecordSchema = new Schema(
  {
    vaccine_name:  { type: String, required: true, trim: true },
    vaccinated_at: { type: Date,   required: true },
    note:          { type: String, default: null },
  },
  { _id: true }
);

const SowHerdSchema = new Schema(
  {
    _id: { type: String },   // format: ddmmyy_penId_seq

    seq: {
      type:     Number,
      required: true,
      min:      [1, 'Sequence must be >= 1'],
    },

    pen_id: {
      type:     Number,
      required: [true, 'Pen ID is required'],
    },

    birth_date: {
      type:     Date,
      required: [true, 'Birth date or catch date is required'],
    },

    weaning_date: {
      type:    Date,
      default: null,
    },

    vaccine_records: {
      type:    [VaccineRecordSchema],
      default: [],
    },

    // Số lứa đã đẻ
    litter_count: {
      type:    Number,
      default: 0,
      min:     [0, 'Litter count cannot be negative'],
    },

    quantity: {
      type:     Number,
      required: true,
      min:      [1, 'Quantity must be >= 1'],
    },

    is_deleted: { type: Boolean, default: false },
  },
  {
    _id:        false,
    timestamps: true,
    collection: 'sow_herds',
  }
);

// ─── Pre-validate ─────────────────────────────────────────────────────────────
SowHerdSchema.pre('validate', function (next) {
  if (this.weaning_date && this.birth_date) {
    if (this.weaning_date <= this.birth_date) {
      return next(new Error('weaning_date must be after birth_date'));
    }
  }
  next();
});

// ─── Pre-save: build _id ──────────────────────────────────────────────────────
SowHerdSchema.pre('save', function (next) {
  if (this.isNew) {
    const d   = this.birth_date;
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const yy  = String(d.getFullYear()).slice(-2);
    const pen = String(this.pen_id).padStart(2, '0');
    const seq = String(this.seq).padStart(2, '0');
    this._id  = `${dd}${mm}${yy}_${pen}_${seq}`;
  }
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
SowHerdSchema.methods.addVaccineRecord = async function (record) {
  const exists = this.vaccine_records.some(
    (v) =>
      v.vaccine_name === record.vaccine_name &&
      v.vaccinated_at.toDateString() === new Date(record.vaccinated_at).toDateString()
  );
  if (exists) throw new Error(`Vaccine "${record.vaccine_name}" already recorded on this date`);
  this.vaccine_records.push(record);
  return this.save();
};

// Tăng litter count khi đẻ lứa mới
SowHerdSchema.methods.recordNewLitter = async function () {
  this.litter_count += 1;
  return this.save();
};

SowHerdSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return this.save();
};

// ─── Statics ──────────────────────────────────────────────────────────────────
SowHerdSchema.statics.findByPen    = function (penId) {
  return this.find({ pen_id: penId, is_deleted: false });
};
SowHerdSchema.statics.findActive   = function () {
  return this.find({ is_deleted: false });
};

SowHerdSchema.index({ pen_id: 1, is_deleted: 1 });

module.exports = mongoose.model('SowHerd', SowHerdSchema);
