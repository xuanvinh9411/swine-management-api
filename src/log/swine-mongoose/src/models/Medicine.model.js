'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── Sub-schema: Dosage instruction ──────────────────────────────────────────
const DosageSchema = new Schema(
  {
    animal_type:   { type: String, required: true },  // 'sow', 'meat', 'piglet'
    dose_amount:   { type: Number, required: true, min: 0 },
    dose_unit:     { type: String, required: true },  // ml/mg/g
    frequency:     { type: String, required: true },  // '1 lần/ngày', '2 lần/ngày'
    duration_days: { type: Number, default: null },
    note:          { type: String, default: null },
  },
  { _id: false }
);

// ─── Sub-schema: Ingredient ───────────────────────────────────────────────────
const IngredientSchema = new Schema(
  {
    name:     { type: String, required: true },
    amount:   { type: String, default: null },  // '100mg', '5%'
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────
// Gộp thuoc_chua_benh + thuc_pham_bo_sung vào 1 collection
// Phân biệt bằng field `category`
const MedicineSchema = new Schema(
  {
    name: {
      type:     String,
      required: [true, 'Medicine name is required'],
      trim:     true,
      unique:   true,
    },

    category: {
      type:     String,
      required: true,
      enum:     {
        values:  ['medicine', 'supplement', 'vaccine'],
        message: 'category must be medicine | supplement | vaccine',
      },
    },

    description: {
      type:    String,
      default: null,
    },

    // Tác dụng / công dụng
    usage: {
      type:    String,
      default: null,
    },

    ingredients: {
      type:    [IngredientSchema],
      default: [],
    },

    // Hướng dẫn liều dùng theo từng loại heo
    dosage_instructions: {
      type:    [DosageSchema],
      default: [],
    },

    image_urls: {
      type:    [String],
      default: [],
      validate: {
        validator: (arr) => arr.every(url => /^https?:\/\/.+/.test(url)),
        message:   'Each image URL must start with http:// or https://',
      },
    },

    is_available: {
      type:    Boolean,
      default: true,
    },

    is_deleted: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'medicines',
  }
);

// ─── Methods ──────────────────────────────────────────────────────────────────
MedicineSchema.methods.addDosageInstruction = async function (dosage) {
  // Không cho trùng animal_type
  const exists = this.dosage_instructions.some(
    (d) => d.animal_type === dosage.animal_type
  );
  if (exists) {
    throw new Error(`Dosage for "${dosage.animal_type}" already exists. Use update instead.`);
  }
  this.dosage_instructions.push(dosage);
  return this.save();
};

MedicineSchema.methods.updateDosage = async function (animalType, newDosage) {
  const idx = this.dosage_instructions.findIndex((d) => d.animal_type === animalType);
  if (idx === -1) throw new Error(`No dosage found for animal type "${animalType}"`);
  this.dosage_instructions[idx] = { ...this.dosage_instructions[idx], ...newDosage };
  return this.save();
};

MedicineSchema.methods.addImageUrl = async function (url) {
  if (!/^https?:\/\/.+/.test(url)) throw new Error('Invalid URL format');
  if (this.image_urls.includes(url)) throw new Error('URL already exists');
  this.image_urls.push(url);
  return this.save();
};

MedicineSchema.methods.softDelete = async function () {
  this.is_deleted   = true;
  this.is_available = false;
  return this.save();
};

// ─── Statics ──────────────────────────────────────────────────────────────────
MedicineSchema.statics.findByCategory = function (category) {
  return this.find({ category, is_deleted: false, is_available: true });
};

MedicineSchema.statics.findVaccines = function () {
  return this.find({ category: 'vaccine', is_deleted: false });
};

// ─── Index ────────────────────────────────────────────────────────────────────
MedicineSchema.index({ name: 'text' });           // full-text search theo tên
MedicineSchema.index({ category: 1, is_deleted: 1 });

module.exports = mongoose.model('Medicine', MedicineSchema);
