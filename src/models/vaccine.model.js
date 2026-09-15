'use strict';

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
            type: Number,
            required: [true, 'Vaccination date is required'],
        },
        note: {
            type: String,
            default: null,
        },
    },
    {
        collection: 'vaccine',
        timestamps: true,
    },
);

module.exports = mongoose.model('VaccineRecordModel', VaccineRecordSchema);                     