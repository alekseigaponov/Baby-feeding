// ============================================
// АМИНА — Трекер кормления
// Main Application Logic
// ============================================

'use strict';

// ---- State ----
let feedings = [];
let charts = {};
let deletePendingIdx = null;
let historyPage = 1;
const HISTORY_PER_PAGE = 15;
let historyDateFilter = '';

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  feedings = AminaDB.loadData();
  sortFeedings();
  initDateDefaults();
  updateBabyAge();
  updateTodayStr();
  renderAll();
  bindEvents();
});

function sortFeedings() {
  feedings.sort((a, b) => {
    const da = a.date + 'T' + (a.time || '00:00');
    const db = b.date + 'T' + (b.time || '00:00');
    return da < db ? -1 : da > db ? 1 : 0;
  });
}

function initDateDefaults() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('form-date').value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  document.getElementById('form-time').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ---- BABY AGE ----
function updateBabyAge() {
  const born = new Date('2026-02-17');
  const now = new Date();
  const days = Math.floor((now - born) / 86400000);
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  let txt = `${days} дн.`;
  if (weeks > 0) txt = `${weeks} нед. ${rem} дн.`;
  document.getElementById('babyAge').textContent = txt;
}

function updateTodayStr() {
  const now = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('todayDateStr').textContent = now.toLocaleDateString('ru-RU', opts);
}

// ---- RENDER ALL ----
function renderAll() {
  renderDashboard();
  renderHistory();
  renderWeight();
  renderInsights();
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
  const todayStr = todayDate();
  const todayFeeds = feedings.filter(f => f.date === todayStr && hasFeeding(f));

  document.getElementById('stat-today-feedings').textContent = todayFeeds.length || '0';

  const breastToday = todayFeeds.reduce((s,f) => s + (f.breast_l||0) + (f.breast_r||0), 0);
  const formulaToday = todayFeeds.reduce((s,f) => s + (f.formula||0), 0);
  document.getElementById('stat-today-breast').textContent = breastToday + ' мл';
  document.getElementById('stat-today-formula').textContent = formulaToday + ' мл';

  // Latest weight
  const weights = feedings.filter(f => f.weight_before);
  const latest = weights[weights.length - 1];
  document.getElementById('stat-latest-weight').textContent = latest ? latest.weight_before.toFixed(3) + ' кг' : '—';

  // Last feeding
  const actuals = feedings.filter(f => hasFeeding(f));
  if (actuals.length) {
    const last = actuals[actuals.length - 1];
    document.getElementById('lastFeedingTime').textContent = formatDateTime(last.date, last.time);
    const total = (last.breast_l||0)+(last.breast_r||0)+(last.formula||0);
    document.getElementById('lastFeedingDetails').textContent =
      `Г.Л ${last.breast_l||0}мл · Г.П ${last.breast_r||0}мл · Смесь ${last.formula||0}мл · Итого ${total}мл`;

    // Next feeding suggestion
    const lastDt = new Date(`${last.date}T${last.time || '00:00'}`);
    const next = new Date(lastDt.getTime() + 3 * 3600000);
    document.getElementById('nextFeedingTime').textContent = formatTime12(next);
  }

  // Average per day
  const days = groupByDate(actuals);
  const dayCount = Object.keys(days).length;
  const avg = dayCount ? (actuals.length / dayCount).toFixed(1) : '—';
  document.getElementById('avgFeedingsPerDay').textContent = avg + (dayCount ? ' / день' : '');

  // Recent table (last 5)
  const recent = actuals.slice(-5).reverse();
  const tbody = document.getElementById('recentTableBody');
  tbody.innerHTML = recent.map(f => {
    const total = (f.breast_l||0)+(f.breast_r||0)+(f.formula||0);
    return `<tr>
      <td>${formatDateTime(f.date, f.time)}</td>
      <td>${f.breast_l||0} мл</td>
      <td>${f.breast_r||0} мл</td>
      <td>${f.formula||0} мл</td>
      <td class="td-total">${total} мл</td>
      <td>${f.weight_before ? f.weight_before.toFixed(3)+' кг' : '—'}</td>
    </tr>`;
  }).join('');

  renderDailyFeedChart();
  renderBreastSplitChart();
}

function renderDailyFeedChart() {
  const actuals = feedings.filter(f => hasFeeding(f));
  const days = groupByDate(actuals);
  const labels = Object.keys(days).sort();
  const breastData = labels.map(d => days[d].reduce((s,f)=>s+(f.breast_l||0)+(f.breast_r||0),0));
  const formulaData = labels.map(d => days[d].reduce((s,f)=>s+(f.formula||0),0));
  const shortLabels = labels.map(d => {
    const parts = d.split('-');
    return `${parts[2]}.${parts[1]}`;
  });

  if (charts.daily) { charts.daily.destroy(); }
  const ctx = document.getElementById('chartDailyFeed').getContext('2d');
  charts.daily = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: shortLabels,
      datasets: [
        { label: 'Грудь (мл)', data: breastData, backgroundColor: 'rgba(244,165,106,0.8)', borderRadius: 6, borderSkipped: false },
        { label: 'Смесь (мл)', data: formulaData, backgroundColor: 'rgba(201,184,255,0.8)', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b', maxTicksLimit: 14 } },
        y: { stacked: true, grid: { color: 'rgba(164,126,88,0.08)' }, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b' } }
      }
    }
  });
}

function renderBreastSplitChart() {
  const actuals = feedings.filter(f => hasFeeding(f));
  const totalL = actuals.reduce((s,f)=>s+(f.breast_l||0),0);
  const totalR = actuals.reduce((s,f)=>s+(f.breast_r||0),0);
  const totalFormula = actuals.reduce((s,f)=>s+(f.formula||0),0);

  if (charts.breast) { charts.breast.destroy(); }
  const ctx = document.getElementById('chartBreastSplit').getContext('2d');
  charts.breast = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Грудь Левая', 'Грудь Правая', 'Смесь'],
      datasets: [{
        data: [totalL, totalR, totalFormula],
        backgroundColor: ['rgba(244,165,106,0.85)', 'rgba(168,216,234,0.85)', 'rgba(201,184,255,0.85)'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 11 }, color: '#6b5744', boxWidth: 10, padding: 12 } }
      }
    }
  });
}

// ============================================
// HISTORY
// ============================================
function renderHistory() {
  const actuals = feedings.filter(f => hasFeeding(f));
  let filtered = actuals;
  if (historyDateFilter) {
    filtered = actuals.filter(f => f.date === historyDateFilter);
  }
  const sorted = [...filtered].reverse();
  const total = sorted.length;
  const pages = Math.ceil(total / HISTORY_PER_PAGE);
  historyPage = Math.min(historyPage, Math.max(1, pages));
  const start = (historyPage - 1) * HISTORY_PER_PAGE;
  const slice = sorted.slice(start, start + HISTORY_PER_PAGE);

  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = slice.map(f => {
    const realIdx = feedings.indexOf(f);
    const total = (f.breast_l||0)+(f.breast_r||0)+(f.formula||0);
    const gain = f.weight_after_r && f.weight_before
      ? Math.round((f.weight_after_r - f.weight_before) * 1000)
      : null;
    const gainClass = gain !== null ? (gain >= 0 ? 'td-gain' : 'td-gain negative') : '';
    return `<tr>
      <td>${formatDate(f.date)}</td>
      <td>${f.time || '—'}</td>
      <td>${f.breast_l||0} мл</td>
      <td>${f.breast_r||0} мл</td>
      <td>${f.formula||0} мл</td>
      <td class="td-total">${total} мл</td>
      <td>${f.weight_before ? f.weight_before.toFixed(3)+' кг' : '—'}</td>
      <td class="${gainClass}">${gain !== null ? (gain>=0?'+':'')+gain+' г' : '—'}</td>
      <td style="color:var(--text-3);font-size:0.8rem">${f.comment || ''}</td>
      <td><button class="btn-table-del" onclick="openDeleteModal(${realIdx})">✕</button></td>
    </tr>`;
  }).join('');

  // Pagination
  const pag = document.getElementById('historyPagination');
  if (pages <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn${i===historyPage?' active-page':''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function gotoPage(n) { historyPage = n; renderHistory(); }

function clearHistoryFilter() {
  document.getElementById('historyFilter').value = '';
  historyDateFilter = '';
  historyPage = 1;
  renderHistory();
}

// ============================================
// WEIGHT PAGE
// ============================================
function renderWeight() {
  // Build weight timeline: use weight_before from first entry of each date, prefer explicit weight entries
  const weightPoints = [];
  feedings.forEach(f => {
    if (f.weight_before) {
      weightPoints.push({ date: f.date, time: f.time || '00:00', w: f.weight_before, comment: f.comment });
    }
  });
  // Deduplicate: one point per date (last weight of the day)
  const byDate = {};
  weightPoints.forEach(p => {
    byDate[p.date] = p;
  });
  const sorted = Object.values(byDate).sort((a,b) => a.date < b.date ? -1 : 1);

  const birthW = 2.71;
  const latest = sorted[sorted.length - 1];
  const latestW = latest ? latest.w : birthW;
  const gainTotal = Math.round((latestW - birthW) * 1000);

  const born = new Date('2026-02-17');
  const lastDate = latest ? new Date(latest.date) : born;
  const daysSince = Math.max(1, Math.floor((lastDate - born) / 86400000));
  const dailyAvg = Math.round(gainTotal / daysSince);

  document.getElementById('w-current').textContent = latestW.toFixed(3) + ' кг';
  document.getElementById('w-gain').textContent = (gainTotal >= 0 ? '+' : '') + gainTotal + ' г';
  document.getElementById('w-daily').textContent = (dailyAvg >= 0 ? '+' : '') + dailyAvg + ' г/день';

  // Weight chart
  const labels = sorted.map(p => formatShortDate(p.date));
  const data = sorted.map(p => p.w);

  if (charts.weight) charts.weight.destroy();
  const ctx1 = document.getElementById('chartWeight').getContext('2d');
  const grad = ctx1.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, 'rgba(244,165,106,0.25)');
  grad.addColorStop(1, 'rgba(244,165,106,0)');
  charts.weight = new Chart(ctx1, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Вес (кг)',
        data,
        borderColor: '#f4a56a',
        backgroundColor: grad,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#f4a56a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toFixed(3)} кг`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b', maxTicksLimit: 12 } },
        y: {
          grid: { color: 'rgba(164,126,88,0.08)' },
          ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b', callback: v => v.toFixed(2)+' кг' }
        }
      }
    }
  });

  // Daily gain chart
  const gainLabels = [];
  const gainData = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i-1];
    const curr = sorted[i];
    const dayDiff = Math.max(1, Math.round((new Date(curr.date) - new Date(prev.date)) / 86400000));
    const g = Math.round(((curr.w - prev.w) * 1000) / dayDiff);
    gainLabels.push(formatShortDate(curr.date));
    gainData.push(g);
  }

  if (charts.gain) charts.gain.destroy();
  const ctx2 = document.getElementById('chartDailyGain').getContext('2d');
  charts.gain = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: gainLabels,
      datasets: [{
        label: 'Прибавка (г/день)',
        data: gainData,
        backgroundColor: gainData.map(v => v >= 0 ? 'rgba(184,230,200,0.85)' : 'rgba(252,165,165,0.85)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b', maxTicksLimit: 14 } },
        y: {
          grid: { color: 'rgba(164,126,88,0.08)' },
          ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9e856b', callback: v => v+' г' }
        }
      }
    }
  });
}

// ============================================
// INSIGHTS
// ============================================
function renderInsights() {
  const actuals = feedings.filter(f => hasFeeding(f));
  const days = groupByDate(actuals);
  const dayKeys = Object.keys(days).sort();

  const insights = [];

  // 1. Total milk stats
  const totalBreast = actuals.reduce((s,f)=>s+(f.breast_l||0)+(f.breast_r||0),0);
  const totalFormula = actuals.reduce((s,f)=>s+(f.formula||0),0);
  const totalAll = totalBreast + totalFormula;
  const breastPct = totalAll > 0 ? Math.round(totalBreast / totalAll * 100) : 0;
  insights.push({
    emoji: '🍼',
    title: 'Соотношение питания',
    text: `За всё время Амина получила ${totalAll} мл пищи. ${breastPct}% — грудное молоко (${totalBreast} мл), ${100-breastPct}% — смесь (${totalFormula} мл).`,
    tag: 'info'
  });

  // 2. Weight gain
  const weightPoints = feedings.filter(f => f.weight_before).map(f => ({ date: f.date, w: f.weight_before }));
  const byDate = {};
  weightPoints.forEach(p => { byDate[p.date] = p; });
  const wSorted = Object.values(byDate).sort((a,b) => a.date < b.date ? -1 : 1);
  if (wSorted.length >= 2) {
    const first = wSorted[0];
    const last = wSorted[wSorted.length - 1];
    const gainG = Math.round((last.w - 2.71) * 1000);
    const days2 = Math.max(1, Math.round((new Date(last.date) - new Date('2026-02-17')) / 86400000));
    const avg = Math.round(gainG / days2);
    const status = avg >= 20 ? 'good' : avg >= 15 ? 'info' : 'warn';
    const comment = avg >= 20 ? 'Отличная прибавка!' : avg >= 15 ? 'Хороший темп роста.' : 'Прибавка чуть ниже нормы, стоит обсудить с педиатром.';
    insights.push({
      emoji: '⚖️',
      title: 'Динамика веса',
      text: `С рождения (2,71 кг) прибавка составила +${gainG} г за ${days2} дней — в среднем ${avg} г/сутки. Норма ВОЗ для новорождённых: 20–30 г/сутки. ${comment}`,
      tag: status
    });
  }

  // 3. Average daily intake
  const avgIntake = dayKeys.length > 0
    ? Math.round(dayKeys.map(d => days[d].reduce((s,f)=>s+(f.breast_l||0)+(f.breast_r||0)+(f.formula||0),0)).reduce((a,b)=>a+b,0) / dayKeys.length)
    : 0;
  const weight = wSorted.length ? wSorted[wSorted.length-1].w : 3.5;
  const expected = Math.round(weight * 1000 * 0.2); // ~20% of body weight/day for newborn
  insights.push({
    emoji: '📊',
    title: 'Суточный объём питания',
    text: `Среднесуточный объём: ${avgIntake} мл. По норме для текущего веса (${weight.toFixed(2)} кг): ~${expected} мл/сутки. ${avgIntake >= expected * 0.9 ? '✅ Всё в порядке!' : '⚠️ Немного меньше нормы.'}`,
    tag: avgIntake >= expected * 0.9 ? 'good' : 'warn'
  });

  // 4. Feeding frequency
  const avgFeeds = dayKeys.length > 0
    ? (actuals.length / dayKeys.length).toFixed(1)
    : '—';
  insights.push({
    emoji: '🕐',
    title: 'Частота кормлений',
    text: `В среднем ${avgFeeds} кормлений в день. Норма для новорождённых — 8–12 раз в сутки. Промежутки между кормлениями хорошо отслеживаются в истории.`,
    tag: parseFloat(avgFeeds) >= 7 ? 'good' : 'info'
  });

  // 5. Left vs Right breast
  const totalL = actuals.reduce((s,f)=>s+(f.breast_l||0),0);
  const totalR = actuals.reduce((s,f)=>s+(f.breast_r||0),0);
  const lPct = totalL + totalR > 0 ? Math.round(totalL / (totalL+totalR) * 100) : 50;
  const balanceMsg = Math.abs(lPct - 50) <= 10 ? 'Нагрузка хорошо сбалансирована.' : `Левая грудь нагружается ${lPct > 50 ? 'больше' : 'меньше'} — стоит чередовать равномерно.`;
  insights.push({
    emoji: '⚖️',
    title: 'Баланс левой и правой груди',
    text: `Левая: ${totalL} мл (${lPct}%), правая: ${totalR} мл (${100-lPct}%). ${balanceMsg}`,
    tag: Math.abs(lPct-50) <= 10 ? 'good' : 'tip'
  });

  // 6. Night feedings
  const nightFeeds = actuals.filter(f => {
    const h = parseInt((f.time || '12:00').split(':')[0]);
    return h >= 0 && h < 6;
  });
  const nightPct = actuals.length > 0 ? Math.round(nightFeeds.length / actuals.length * 100) : 0;
  insights.push({
    emoji: '🌙',
    title: 'Ночные кормления (00:00–06:00)',
    text: `${nightFeeds.length} кормлений из ${actuals.length} — это ${nightPct}%. Ночные кормления важны для поддержания лактации. Для новорождённых это абсолютно нормально.`,
    tag: 'info'
  });

  // 7. Formula trend
  const recentDays = dayKeys.slice(-5);
  const earlyDays = dayKeys.slice(0, 5);
  if (recentDays.length && earlyDays.length) {
    const recentFormula = recentDays.map(d => days[d].reduce((s,f)=>s+(f.formula||0),0)).reduce((a,b)=>a+b,0) / recentDays.length;
    const earlyFormula = earlyDays.map(d => days[d].reduce((s,f)=>s+(f.formula||0),0)).reduce((a,b)=>a+b,0) / earlyDays.length;
    const trend = recentFormula < earlyFormula * 0.9 ? 'снижается' : recentFormula > earlyFormula * 1.1 ? 'растёт' : 'стабильна';
    const trendTag = trend === 'снижается' ? 'good' : trend === 'растёт' ? 'warn' : 'info';
    insights.push({
      emoji: '🥛',
      title: 'Тренд по смеси',
      text: `Средний объём смеси в начале: ${Math.round(earlyFormula)} мл/день → последние дни: ${Math.round(recentFormula)} мл/день. Использование смеси ${trend}.`,
      tag: trendTag
    });
  }

  // 8. Breast milk volume measurement
  const measuredFeeds = actuals.filter(f => f.weight_after_r && f.weight_before);
  if (measuredFeeds.length) {
    const measuredGains = measuredFeeds.map(f => (f.weight_after_r - f.weight_before) * 1000);
    const avgGain = measuredGains.reduce((a,b)=>a+b,0) / measuredGains.length;
    insights.push({
      emoji: '📏',
      title: 'Точность взвешивания',
      text: `Проведено ${measuredFeeds.length} контрольных взвешиваний. Средняя прибавка за одно кормление: +${Math.round(avgGain)} г. Взвешивание до и после — надёжный способ отслеживать объём грудного молока.`,
      tag: 'tip'
    });
  }

  // 9. Today summary
  const todayStr = todayDate();
  const todayFeeds = feedings.filter(f => f.date === todayStr && hasFeeding(f));
  if (todayFeeds.length > 0) {
    const todayTotal = todayFeeds.reduce((s,f)=>s+(f.breast_l||0)+(f.breast_r||0)+(f.formula||0),0);
    insights.push({
      emoji: '📅',
      title: 'Сегодняшнее питание',
      text: `Сегодня уже ${todayFeeds.length} кормлений, суммарно ${todayTotal} мл. Отлично! Продолжай вести записи.`,
      tag: 'good'
    });
  }

  // Render
  const grid = document.getElementById('insightsGrid');
  grid.innerHTML = insights.map((ins, i) => `
    <div class="insight-card" style="animation-delay:${i * 0.05}s">
      <div class="insight-emoji">${ins.emoji}</div>
      <div class="insight-title">${ins.title}</div>
      <div class="insight-text">${ins.text}</div>
      <span class="insight-tag ${ins.tag}">${tagLabel(ins.tag)}</span>
    </div>
  `).join('');
}

function tagLabel(t) {
  return { good: '✅ Хорошо', info: 'ℹ️ Инфо', warn: '⚠️ Внимание', tip: '💡 Совет' }[t] || t;
}

// ============================================
// FORM — LOG FEEDING
// ============================================
function saveFeeding() {
  const date = document.getElementById('form-date').value;
  const time = document.getElementById('form-time').value;
  if (!date || !time) { alert('Укажи дату и время'); return; }

  const entry = {
    date,
    time,
    breast_l: parseFloat(document.getElementById('form-bl').value) || 0,
    breast_r: parseFloat(document.getElementById('form-br').value) || 0,
    formula: parseFloat(document.getElementById('form-formula').value) || 0,
  };

  const wb = document.getElementById('form-wb').value;
  const wal = document.getElementById('form-wal').value;
  const war = document.getElementById('form-war').value;
  const comment = document.getElementById('form-comment').value.trim();

  if (wb) entry.weight_before = parseFloat(wb);
  if (wal) entry.weight_after_l = parseFloat(wal);
  if (war) entry.weight_after_r = parseFloat(war);
  if (comment) entry.comment = comment;

  feedings.push(entry);
  sortFeedings();
  AminaDB.saveData(feedings);

  // Show success
  document.getElementById('formSuccess').style.display = 'block';
  setTimeout(() => document.getElementById('formSuccess').style.display = 'none', 2500);

  resetForm();
  renderAll();
}

function resetForm() {
  ['form-bl','form-br','form-formula','form-wb','form-wal','form-war','form-comment'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('formPreview').style.display = 'none';
  initDateDefaults();
}

// ============================================
// DELETE
// ============================================
function openDeleteModal(idx) {
  deletePendingIdx = idx;
  document.getElementById('deleteModal').style.display = 'flex';
}
function closeDeleteModal() {
  deletePendingIdx = null;
  document.getElementById('deleteModal').style.display = 'none';
}
function confirmDelete() {
  if (deletePendingIdx !== null) {
    feedings.splice(deletePendingIdx, 1);
    AminaDB.saveData(feedings);
    renderAll();
  }
  closeDeleteModal();
}

// ============================================
// NAVIGATION
// ============================================
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  document.querySelector(`.nav-btn[data-page="${name}"]`)?.classList.add('active');
  closeSidebar();

  // Re-render charts when switching to chart pages
  if (name === 'weight') renderWeight();
  if (name === 'dashboard') renderDashboard();
}

function bindEvents() {
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Form live preview
  ['form-bl','form-br','form-formula'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateFormPreview);
  });

  // History filter
  document.getElementById('historyFilter').addEventListener('change', e => {
    historyDateFilter = e.target.value;
    historyPage = 1;
    renderHistory();
  });
}

function updateFormPreview() {
  const l = parseFloat(document.getElementById('form-bl').value) || 0;
  const r = parseFloat(document.getElementById('form-br').value) || 0;
  const f = parseFloat(document.getElementById('form-formula').value) || 0;
  const total = l + r + f;
  if (total > 0) {
    document.getElementById('formPreview').style.display = 'flex';
    document.getElementById('previewTotal').textContent = total + ' мл';
  } else {
    document.getElementById('formPreview').style.display = 'none';
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ============================================
// HELPERS
// ============================================
function hasFeeding(f) {
  return (f.breast_l > 0) || (f.breast_r > 0) || (f.formula > 0);
}

function groupByDate(arr) {
  const res = {};
  arr.forEach(f => {
    if (!res[f.date]) res[f.date] = [];
    res[f.date].push(f);
  });
  return res;
}

function todayDate() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y,m,d] = dateStr.split('-');
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [,m,d] = dateStr.split('-');
  return `${parseInt(d)}.${m}`;
}

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '—';
  return `${formatDate(dateStr)}, ${timeStr || ''}`;
}

function formatTime12(dt) {
  const pad = n => String(n).padStart(2,'0');
  return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

// Expose for inline handlers
window.switchPage = switchPage;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.saveFeeding = saveFeeding;
window.resetForm = resetForm;
window.clearHistoryFilter = clearHistoryFilter;
window.gotoPage = gotoPage;
