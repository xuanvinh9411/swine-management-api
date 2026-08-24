'use strict';

// Export tất cả models từ 1 chỗ
// Dùng: const { MeatPigHerd, SowHerd, TreatmentLog } = require('./models');

module.exports = {
  MeatPigHerd:   require('./MeatPigHerd.model'),
  SowHerd:       require('./SowHerd.model'),
  TreatmentLog:  require('./TreatmentLog.model'),
  SowVaccineLog: require('./SowVaccineLog.model'),
  Medicine:      require('./Medicine.model'),
};
