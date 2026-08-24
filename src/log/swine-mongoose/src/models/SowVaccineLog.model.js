'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SowVaccineLogSchema = new Schema(
  {
    sow_id: {
      type:     String,
      required: [true, 'Sow ID is required'],
      trim:     true,
    },

    vaccine_id: {
      type:     Schema.Types.ObjectId,
      ref:      'Medicine',
      required: [true, 'Vaccine ID is required'],
    },

    vaccinated_at: {
      type:    Date,
      default: Date.now,
    },

    // Mô tả phản ứng sau tiêm
    post_injection_note: {
      type:    String,
      default: null,
    },

    next_dose_date: {
      type:    Date,
      default: null,
    },

    administered_by: {
      type:    String,
      default: null,
    },

    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'sow_vaccine_logs',
  }
);

// ─── Validation: next_dose_date phải sau vaccinated_at ───────────────────────
SowVaccineLogSchema.pre('validate', function (next) {
  if (this.next_dose_date && this.vaccinated_at) {
    if (this.next_dose_date <= this.vaccinated_at) {
      return next(new Error('next_dose_date must be after vaccinated_at'));
    }
  }
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
SowVaccineLogSchema.methods.addPostNote = async function (note) {
  if (!note || note.trim() === '') throw new Error('Note cannot be empty');
  this.post_injection_note = note.trim();
  return this.save();
};

SowVaccineLogSchema.methods.setNextDose = async function (date) {
  if (new Date(date) <= this.vaccinated_at) {
    throw new Error('Next dose date must be after vaccination date');
  }
  this.next_dose_date = date;
  return this.save();
};

SowVaccineLogSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return this.save();
};

// ─── Statics ──────────────────────────────────────────────────────────────────
SowVaccineLogSchema.statics.findBySow = function (sowId) {
  return this.find({ sow_id: sowId, is_deleted: false })
    .populate('vaccine_id')
    .sort({ vaccinated_at: -1 });
};

// Tìm các heo nái cần tiêm nhắc lại
SowVaccineLogSchema.statics.findUpcomingDoses = function (daysAhead = 7) {
  const now   = new Date();
  const limit = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return this.find({
    next_dose_date: { $gte: now, $lte: limit },
    is_deleted:     false,
  }).populate('vaccine_id');
};

SowVaccineLogSchema.index({ sow_id: 1, vaccinated_at: -1 });
SowVaccineLogSchema.index({ next_dose_date: 1 });

module.exports = mongoose.model('SowVaccineLog', SowVaccineLogSchema);
