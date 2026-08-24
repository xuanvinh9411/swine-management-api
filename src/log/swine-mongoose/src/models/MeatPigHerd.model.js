'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── Sub-schema: Vaccine record ──────────────────────────────────────────────
const VaccineRecordSchema = new Schema(
  {
    vaccine_name: {
      type:     String,
      required: [true, 'Vaccine name is required'],
      trim:     true,
    },
    vaccinated_at: {
      type:     Date,
      required: [true, 'Vaccination date is required'],
    },
    note: {
      type:    String,
      default: null,
    },
  },
  { _id: true }
);

// ─── Main Schema ─────────────────────────────────────────────────────────────
// id format: ddmmyy_penId_seq  ví dụ: 061226_01_01
const MeatPigHerdSchema = new Schema(
  {
    _id: {
      type:     String,
      // format: ddmmyy_penId_seq — tự generate trong pre('save')
    },

    // Số thứ tự trong ngày (dùng để build _id)
    seq: {
      type:     Number,
      required: true,
      min:      [1, 'Sequence must be >= 1'],
    },

    pen_id: {
      type:     Number,
      required: [true, 'Pen ID (chuồng) is required'],
      min:      [1, 'Pen ID must be >= 1'],
    },

    birth_date: {
      type:     Date,
      required: [true, 'Birth date or catch date is required'],
    },

    // Ngày cai sữa — phải sau birth_date
    weaning_date: {
      type:    Date,
      default: null,
    },

    // Danh sách lịch vaccine
    vaccine_records: {
      type:    [VaccineRecordSchema],
      default: [],
    },

    // Số con trong đàn
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be >= 1'],
    },

    is_deleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    _id:        false,      // tắt auto _id vì mình tự build
    timestamps: true,       // createdAt, updatedAt
    collection: 'meat_pig_herds',
  }
);

// ─── Validation: weaning_date phải sau birth_date ────────────────────────────
MeatPigHerdSchema.pre('validate', function (next) {
  if (this.weaning_date && this.birth_date) {
    if (this.weaning_date <= this.birth_date) {
      return next(new Error('weaning_date must be after birth_date'));
    }
  }
  next();
});

// ─── Pre-save: tự build _id từ birth_date + pen_id + seq ─────────────────────
MeatPigHerdSchema.pre('save', function (next) {
  if (this.isNew) {
    const d   = this.birth_date;
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const yy  = String(d.getFullYear()).slice(-2);
    const pen = String(this.pen_id).padStart(2, '0');
    const seq = String(this.seq).padStart(2, '0');
    this._id  = `${dd}${mm}${yy}_${pen}_${seq}`; // 061226_01_01
  }
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Thêm vaccine — không cho trùng tên + ngày
MeatPigHerdSchema.methods.addVaccineRecord = async function (record) {
  const exists = this.vaccine_records.some(
    (v) =>
      v.vaccine_name === record.vaccine_name &&
      v.vaccinated_at.toDateString() === new Date(record.vaccinated_at).toDateString()
  );
  if (exists) throw new Error(`Vaccine "${record.vaccine_name}" already recorded on this date`);
  this.vaccine_records.push(record);
  return this.save();
};

// Cập nhật số lượng — không cho âm
MeatPigHerdSchema.methods.updateQuantity = async function (newQuantity) {
  if (newQuantity < 0) throw new Error('Quantity cannot be negative');
  this.quantity = newQuantity;
  return this.save();
};

// Soft delete
MeatPigHerdSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return this.save();
};

// ─── Static Methods ───────────────────────────────────────────────────────────

// Tìm đàn theo chuồng, bỏ qua đã xóa
MeatPigHerdSchema.statics.findByPen = function (penId) {
  return this.find({ pen_id: penId, is_deleted: false });
};

// Tìm đàn chưa cai sữa
MeatPigHerdSchema.statics.findNotWeaned = function () {
  return this.find({ weaning_date: null, is_deleted: false });
};

// ─── Index ────────────────────────────────────────────────────────────────────
MeatPigHerdSchema.index({ pen_id: 1, is_deleted: 1 });
MeatPigHerdSchema.index({ birth_date: -1 });

module.exports = mongoose.model('MeatPigHerd', MeatPigHerdSchema);
