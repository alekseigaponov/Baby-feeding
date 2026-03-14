// ============================================
// АМИНА — Данные кормлений
// Базовые данные + localStorage persistence
// ============================================

const INITIAL_DATA = [
  {"date":"2026-02-17","time":"12:00","weight_before":2.71,"comment":"Birth weight"},
  {"date":"2026-02-26","time":"09:00","breast_l":40,"breast_r":35,"formula":30,"weight_before":3.035,"weight_after_l":3.075,"weight_after_r":3.11},
  {"date":"2026-02-26","time":"16:00","breast_l":40,"breast_r":20,"formula":0,"weight_before":3.04,"weight_after_l":3.08,"weight_after_r":3.1},
  {"date":"2026-02-26","time":"19:00","breast_l":25,"breast_r":20,"formula":50,"weight_before":3.06,"weight_after_l":3.085,"weight_after_r":3.105},
  {"date":"2026-02-26","time":"22:00","breast_l":25,"breast_r":40,"formula":50,"weight_before":3.02,"weight_after_l":3.045,"weight_after_r":3.085},
  {"date":"2026-02-27","time":"02:00","breast_l":50,"breast_r":25,"formula":50,"weight_before":3.03,"weight_after_l":3.08,"weight_after_r":3.105},
  {"date":"2026-02-28","time":"06:00","breast_l":20,"breast_r":40,"formula":30,"weight_before":3.055,"weight_after_l":3.075,"weight_after_r":3.115},
  {"date":"2026-02-28","time":"09:00","breast_l":40,"breast_r":20,"formula":60,"weight_before":3.045,"weight_after_l":3.085,"weight_after_r":3.105},
  {"date":"2026-02-28","time":"12:30","breast_l":35,"breast_r":35,"formula":30,"weight_before":3.05,"weight_after_l":3.085,"weight_after_r":3.12},
  {"date":"2026-02-28","time":"15:30","breast_l":40,"breast_r":30,"formula":30,"weight_before":3.045,"weight_after_l":3.085,"weight_after_r":3.115},
  {"date":"2026-02-28","time":"18:00","breast_l":50,"breast_r":10,"formula":30,"weight_before":3.07,"weight_after_l":3.12,"weight_after_r":3.13},
  {"date":"2026-02-28","time":"22:00","breast_l":45,"breast_r":25,"formula":30,"weight_before":3.08,"weight_after_l":3.125,"weight_after_r":3.15},
  {"date":"2026-03-01","time":"02:00","breast_l":45,"breast_r":35,"formula":30,"weight_before":3.075,"weight_after_l":3.12,"weight_after_r":3.155},
  {"date":"2026-03-01","time":"06:00","breast_l":30,"breast_r":25,"formula":50,"weight_before":3.12,"weight_after_l":3.15,"weight_after_r":3.175},
  {"date":"2026-03-01","time":"09:00","breast_l":30,"breast_r":50,"formula":30,"weight_before":3.115,"weight_after_l":3.145,"weight_after_r":3.195},
  {"date":"2026-03-01","time":"12:00","breast_l":20,"breast_r":25,"formula":40,"weight_before":3.14,"weight_after_l":3.16,"weight_after_r":3.185},
  {"date":"2026-03-01","time":"15:00","breast_l":40,"breast_r":20,"formula":60,"weight_before":3.13,"weight_after_l":3.17,"weight_after_r":3.19},
  {"date":"2026-03-01","time":"18:00","breast_l":30,"breast_r":35,"formula":60,"weight_before":3.185,"weight_after_l":3.215,"weight_after_r":3.25},
  {"date":"2026-03-01","time":"21:30","breast_l":40,"breast_r":20,"formula":20,"weight_before":3.16,"weight_after_l":3.2,"weight_after_r":3.22},
  {"date":"2026-03-02","time":"01:30","breast_l":15,"breast_r":40,"formula":60,"weight_before":3.16,"weight_after_l":3.175,"weight_after_r":3.215},
  {"date":"2026-03-02","time":"07:00","breast_l":45,"breast_r":25,"formula":30,"weight_before":3.14,"weight_after_l":3.185,"weight_after_r":3.21},
  {"date":"2026-03-02","time":"09:30","breast_l":35,"breast_r":20,"formula":30,"weight_before":3.18,"weight_after_l":3.215,"weight_after_r":3.235},
  {"date":"2026-03-02","time":"13:00","breast_l":40,"breast_r":35,"formula":30,"weight_before":3.125,"weight_after_l":3.165,"weight_after_r":3.2},
  {"date":"2026-03-02","time":"17:00","breast_l":45,"breast_r":30,"formula":30,"weight_before":3.165,"weight_after_l":3.21,"weight_after_r":3.24},
  {"date":"2026-03-02","time":"20:00","breast_l":35,"breast_r":30,"formula":30,"weight_before":3.165,"weight_after_l":3.2,"weight_after_r":3.23},
  {"date":"2026-03-03","time":"01:00","breast_l":50,"breast_r":25,"formula":30,"weight_before":3.165,"weight_after_l":3.215,"weight_after_r":3.24},
  {"date":"2026-03-03","time":"04:00","breast_l":60,"breast_r":20,"formula":30,"weight_before":3.18,"weight_after_l":3.24,"weight_after_r":3.26},
  {"date":"2026-03-03","time":"08:30","breast_l":30,"breast_r":45,"formula":30,"weight_before":3.175,"weight_after_l":3.205,"weight_after_r":3.25},
  {"date":"2026-03-03","time":"11:30","breast_l":45,"breast_r":20,"formula":60,"weight_before":3.16,"weight_after_l":3.205,"weight_after_r":3.225},
  {"date":"2026-03-03","time":"16:00","breast_l":45,"breast_r":35,"formula":30,"weight_before":3.2,"weight_after_l":3.245,"weight_after_r":3.28},
  {"date":"2026-03-03","time":"19:30","breast_l":50,"breast_r":40,"formula":30,"weight_before":3.16,"weight_after_l":3.21,"weight_after_r":3.25},
  {"date":"2026-03-03","time":"23:55","breast_l":75,"breast_r":35,"formula":0,"weight_before":3.165,"weight_after_l":3.24,"weight_after_r":3.275},
  {"date":"2026-03-04","time":"03:30","breast_l":50,"breast_r":25,"formula":30,"weight_before":3.21,"weight_after_l":3.26,"weight_after_r":3.285},
  {"date":"2026-03-04","time":"06:30","breast_l":35,"breast_r":50,"formula":30,"weight_before":3.22,"weight_after_l":3.255,"weight_after_r":3.305},
  {"date":"2026-03-04","time":"09:30","breast_l":30,"breast_r":25,"formula":30,"weight_before":3.23,"weight_after_l":3.26,"weight_after_r":3.285},
  {"date":"2026-03-04","time":"12:30","breast_l":40,"breast_r":30,"formula":30,"weight_before":3.225,"weight_after_l":3.265,"weight_after_r":3.295},
  {"date":"2026-03-04","time":"16:00","breast_l":50,"breast_r":30,"formula":30,"weight_before":3.24,"weight_after_l":3.29,"weight_after_r":3.32},
  {"date":"2026-03-04","time":"20:00","breast_l":40,"breast_r":30,"formula":60,"weight_before":3.24,"weight_after_l":3.28,"weight_after_r":3.31},
  {"date":"2026-03-05","time":"00:00","breast_l":45,"breast_r":35,"formula":30,"weight_before":3.255,"weight_after_l":3.3,"weight_after_r":3.335},
  {"date":"2026-03-05","time":"04:00","breast_l":40,"breast_r":25,"formula":30,"weight_before":3.27,"weight_after_l":3.31,"weight_after_r":3.335},
  {"date":"2026-03-05","time":"08:00","breast_l":40,"breast_r":30,"formula":30,"weight_before":3.27,"weight_after_l":3.31,"weight_after_r":3.35},
  {"date":"2026-03-05","time":"14:30","breast_l":45,"breast_r":35,"formula":30,"weight_before":3.285,"weight_after_l":3.33,"weight_after_r":3.365},
  {"date":"2026-03-05","time":"18:00","breast_l":50,"breast_r":40,"formula":30,"weight_before":3.28,"weight_after_l":3.33,"weight_after_r":3.37},
  {"date":"2026-03-05","time":"22:00","breast_l":30,"breast_r":55,"formula":30,"weight_before":3.285,"weight_after_l":3.315,"weight_after_r":3.37},
  {"date":"2026-03-06","time":"02:00","breast_l":45,"breast_r":35,"formula":60,"weight_before":3.29,"weight_after_l":3.335,"weight_after_r":3.37},
  {"date":"2026-03-06","time":"06:00","breast_l":50,"breast_r":35,"formula":30,"weight_before":3.31,"weight_after_l":3.36,"weight_after_r":3.395},
  {"date":"2026-03-06","time":"09:30","breast_l":35,"breast_r":30,"formula":50,"weight_before":3.325,"weight_after_l":3.36,"weight_after_r":3.39},
  {"date":"2026-03-06","time":"13:00","breast_l":40,"breast_r":30,"formula":50,"weight_before":3.335,"weight_after_l":3.375,"weight_after_r":3.405},
  {"date":"2026-03-06","time":"17:00","breast_l":35,"breast_r":40,"formula":60,"weight_before":3.35,"weight_after_l":3.385,"weight_after_r":3.425},
  {"date":"2026-03-06","time":"21:00","breast_l":40,"breast_r":45,"formula":30,"weight_before":3.37,"weight_after_l":3.41,"weight_after_r":3.455},
  {"date":"2026-03-07","time":"01:00","breast_l":55,"breast_r":45,"formula":30,"weight_before":3.385,"weight_after_l":3.44,"weight_after_r":3.485},
  {"date":"2026-03-07","time":"05:00","breast_l":65,"breast_r":35,"formula":30,"weight_before":3.405,"weight_after_l":3.47,"weight_after_r":3.505},
  {"date":"2026-03-07","time":"09:30","breast_l":40,"breast_r":50,"formula":30,"weight_before":3.435,"weight_after_l":3.475,"weight_after_r":3.525},
  {"date":"2026-03-07","time":"13:00","breast_l":35,"breast_r":25,"formula":60,"weight_before":3.45,"weight_after_l":3.485,"weight_after_r":3.51},
  {"date":"2026-03-07","time":"16:00","breast_l":50,"breast_r":30,"formula":30,"weight_before":3.48,"weight_after_l":3.53,"weight_after_r":3.56},
  {"date":"2026-03-08","time":"03:30","breast_l":45,"breast_r":35,"formula":60,"weight_before":3.45,"weight_after_l":3.495,"weight_after_r":3.53},
  {"date":"2026-03-08","time":"09:30","breast_l":40,"breast_r":30,"formula":60,"weight_before":3.485,"weight_after_l":3.525,"weight_after_r":3.555},
  {"date":"2026-03-08","time":"13:30","breast_l":45,"breast_r":40,"formula":30,"weight_before":3.495,"weight_after_l":3.54,"weight_after_r":3.58},
  {"date":"2026-03-08","time":"18:00","breast_l":30,"breast_r":45,"formula":60,"weight_before":3.51,"weight_after_l":3.54,"weight_after_r":3.585},
  {"date":"2026-03-08","time":"22:00","breast_l":40,"breast_r":35,"formula":60,"weight_before":3.47,"weight_after_l":3.51,"weight_after_r":3.545},
  {"date":"2026-03-09","time":"03:00","breast_l":60,"breast_r":40,"formula":30,"weight_before":3.495,"weight_after_l":3.555,"weight_after_r":3.595},
  {"date":"2026-03-09","time":"07:00","breast_l":40,"breast_r":45,"formula":30,"weight_before":3.52,"weight_after_l":3.56,"weight_after_r":3.605},
  {"date":"2026-03-09","time":"11:30","breast_l":45,"breast_r":30,"formula":60,"weight_before":3.515,"weight_after_l":3.56,"weight_after_r":3.59},
  {"date":"2026-03-09","time":"16:00","breast_l":40,"breast_r":45,"formula":30,"weight_before":3.55,"weight_after_l":3.59,"weight_after_r":3.635},
  {"date":"2026-03-09","time":"20:00","breast_l":50,"breast_r":30,"formula":60,"weight_before":3.525,"weight_after_l":3.575,"weight_after_r":3.605},
  {"date":"2026-03-12","time":"20:00","breast_l":40,"breast_r":25,"formula":60,"weight_before":3.62,"weight_after_l":3.66,"weight_after_r":3.685},
  {"date":"2026-03-13","time":"02:00","breast_l":55,"breast_r":40,"formula":30,"weight_before":3.59,"weight_after_l":3.645,"weight_after_r":3.685},
  {"date":"2026-03-13","time":"06:00","breast_l":60,"breast_r":35,"formula":30,"weight_before":3.585,"weight_after_l":3.645,"weight_after_r":3.68},
  {"date":"2026-03-13","time":"10:00","breast_l":50,"breast_r":30,"formula":30,"weight_before":3.6,"weight_after_l":3.65,"weight_after_r":3.68},
  {"date":"2026-03-13","time":"14:00","breast_l":45,"breast_r":45,"formula":30,"weight_before":3.625,"weight_after_l":3.67,"weight_after_r":3.715},
  {"date":"2026-03-13","time":"17:30","breast_l":40,"breast_r":30,"formula":60,"weight_before":3.62,"weight_after_l":3.66,"weight_after_r":3.69},
  {"date":"2026-03-13","time":"21:00","breast_l":45,"breast_r":30,"formula":30,"weight_before":3.61,"weight_after_l":3.655,"weight_after_r":3.685},
  {"date":"2026-03-14","time":"03:00","breast_l":60,"breast_r":50,"formula":30,"weight_before":3.62,"weight_after_l":3.68,"weight_after_r":3.73},
  {"date":"2026-03-14","time":"07:00","breast_l":50,"breast_r":40,"formula":30,"weight_before":3.615,"weight_after_l":3.665,"weight_after_r":3.705},
  {"date":"2026-03-14","time":"10:00","weight_before":3.51,"comment":"Baseline weight (naked)"}
];

const STORAGE_KEY = 'amina_feedings_v1';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch(e) { /* ignore */ }
  // First run — seed with initial data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return [...INITIAL_DATA];
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    console.warn('Could not save data to localStorage');
  }
}

// Expose globally
window.AminaDB = { loadData, saveData, INITIAL_DATA };
