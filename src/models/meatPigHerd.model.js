'use strict'

const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Sub-schema: Vaccine record
const VaccineRecordSchema = new Schema(
    {
        vaccine_name: {
            type: String,
            required: [true, 'Vaccine name is required'],
            trim: true,
        },
        description: {
            type: String,
        },
        vaccinated_at: {
            type: Date,
            required: [true, 'Vaccination date is required'],
        },
        note: {
            type: String,
            default: null,
        },
    }
);

// --- Main Schema
// id format: ddmmyy_penId_seq  ví dụ: 061226_01_01
const MeatPigHerdSchema = new Schema(
    {
        _id: {
            type: String,
            // format: ddmmyy_penId_seq — tự generate trong pre('save')
        },
        pen_id: {
            type: Number,
            required: [true, 'Pen ID (chuồng) is required'],
            min: [1, 'Pen ID must be >= 1'],
        },
        morther: {
            type: String,
        },
        birth_date: {
            type: Number,
            required: [true, 'Birth date or catch date is required'],
        },
        // Ngày cai sữa 
        weaning_date: {
            type: Date,
            default: null,
        },
        vaccine_records: {
            type: [{VaccineRecordSchema,
                active: {type:Boolean,default:false}
            }],
            default: [],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be >= 1'],
        },
        note: {
            type: String,
            default: null,
        },
    },
    {
        collection: 'meat_pig_herds',
        timestamps: true,
        _id: false,
    }
);

// --Validation: weaning_date > birth_date ----
// MeatPigHerdSchema.pre('validate', function (next) {
//     if (this.weaning_date && this.weaning_date <= this.birth_date) {
//         this.invalidate('weaning_date', 'Weaning date must be after birth date');
//     }
//     if (this.weaning_date && this.weaning_date > Date.now()) {
//         this.invalidate('weaning_date', 'Weaning date must be in the past');
//     }
//     if (this.birth_date && this.birth_date > Date.now()) {
//         this.invalidate('birth_date', 'Birth date must be in the past');
//     }
//     next();
// })

// MeatPigHerdSchema.pre('save', function (next) {
//     if (this.isNew) {
//         const d = this.birth_date;
//         const dd = String(d.getDate().padStart(2, '0'));
//         const mm = String(d.getMonth() + 1).padStart(2, '0');
//         const yy = String(d.getFullYear()).slice(-2);
//         const penIdStr = String(this.pen_id).padStart(2, '0');
//         const seqStr = String(this.seq).padStart(2, '0');
//         this._id = `${dd}${mm}${yy}_${penIdStr}_${seqStr}`;
//         console.log(`Generated _id for MeatPigHerd: ${this._id}`);
//     }
// })

module.exports = mongoose.model('MeatPigHerd', MeatPigHerdSchema);
module.exports = mongoose.model('VaccineRecor', VaccineRecordSchema);