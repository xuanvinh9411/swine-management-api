'use strict';

// ════════════════════════════════════════════════════════════════════
//  DEMO: Cách dùng các Mongoose models
//  Chạy: node demo.js (cần MongoDB đang chạy)
// ════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');
const { MeatPigHerd, SowHerd, TreatmentLog, Medicine } = require('./src/models');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/swine_management');
  console.log('✓ MongoDB connected\n');

  // ── 1. Tạo đàn heo thịt ──────────────────────────────────────────
  console.log('--- CREATE MeatPigHerd ---');
  const herd = new MeatPigHerd({
    seq:        1,
    pen_id:     1,
    birth_date: new Date('2026-12-06'), // 061226_01_01
    quantity:   20,
  });
  await herd.save();
  console.log('Herd ID:', herd._id);   // → 061226_01_01
  console.log('Quantity:', herd.quantity);

  // ── 2. Thêm lịch vaccine vào đàn ─────────────────────────────────
  console.log('\n--- ADD VACCINE RECORD ---');
  await herd.addVaccineRecord({
    vaccine_name:  'PRRS Vaccine',
    vaccinated_at: new Date('2026-12-10'),
    note:          'Tiêm lần 1',
  });
  console.log('Vaccine records:', herd.vaccine_records.length);

  // Thêm trùng → bắt lỗi
  try {
    await herd.addVaccineRecord({
      vaccine_name:  'PRRS Vaccine',
      vaccinated_at: new Date('2026-12-10'),
    });
  } catch (err) {
    console.log('Duplicate vaccine caught:', err.message);
  }

  // ── 3. Tạo thuốc ─────────────────────────────────────────────────
  console.log('\n--- CREATE MEDICINE ---');
  const medicine = await Medicine.create({
    name:        'Amoxicillin 50%',
    category:    'medicine',
    description: 'Kháng sinh phổ rộng',
    usage:       'Điều trị nhiễm khuẩn đường hô hấp',
    ingredients: [{ name: 'Amoxicillin trihydrate', amount: '50%' }],
  });
  await medicine.addDosageInstruction({
    animal_type:   'meat',
    dose_amount:   1,
    dose_unit:     'ml',
    frequency:     '2 lần/ngày',
    duration_days: 5,
  });
  console.log('Medicine:', medicine.name, '| Dosages:', medicine.dosage_instructions.length);

  // ── 4. Log điều trị ───────────────────────────────────────────────
  console.log('\n--- CREATE TREATMENT LOG ---');
  const log = await TreatmentLog.create({
    herd_id:       herd._id,
    herd_type:     'meat',
    symptoms:      ['sốt', 'bỏ ăn', 'ho'],
    medicine_name: 'Amoxicillin 50%',
    quantity:      20,
    unit:          'ml',
    description:   'Tiêm bắp, theo dõi 3 ngày',
    treated_by:    'Nguyễn Văn Nam',
  });
  console.log('Treatment log ID:', log._id);
  console.log('Symptoms:', log.symptoms.join(', '));

  // ── 5. Query theo đàn ─────────────────────────────────────────────
  console.log('\n--- QUERY ---');
  const logs = await TreatmentLog.findByHerd(herd._id);
  console.log(`Logs for herd ${herd._id}:`, logs.length);

  // ── 6. Soft delete ────────────────────────────────────────────────
  console.log('\n--- SOFT DELETE ---');
  await herd.softDelete();
  console.log('Herd is_deleted:', herd.is_deleted);

  // findByPen bỏ qua is_deleted=true
  const activeHerds = await MeatPigHerd.findByPen(1);
  console.log('Active herds in pen 1:', activeHerds.length); // → 0

  // Cleanup demo
  await mongoose.connection.dropDatabase();
  console.log('\n✓ Demo complete, DB cleaned up');
}

main()
  .catch(err => console.error('Error:', err.message))
  .finally(() => mongoose.disconnect());
