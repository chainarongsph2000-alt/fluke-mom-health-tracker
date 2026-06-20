// ===== Telegram WebApp =====
let tg = null;
try {
  tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
} catch(e) {}

// ===== Parse URL Params (fallback when API unavailable) =====
function getUrlData() {
  const p = new URLSearchParams(window.location.search);
  return {
    api_url: p.get('api_url') || null,
    streak: parseInt(p.get('streak') || '0'),
    maxStreak: parseInt(p.get('max_streak') || '0'),
    points: parseInt(p.get('points') || '0'),
    totalDays: parseInt(p.get('days') || '0'),
    money: parseInt(p.get('money') || '0'),
    bonus: parseInt(p.get('bonus') || '0'),
    match: parseInt(p.get('match') || '0'),
    weekly: parseInt(p.get('weekly') || '0'),
    challenge: parseInt(p.get('challenge') || '0'),
    option: p.get('option') || 'hybrid',
    history: p.get('history') || '',
    ach: p.get('ach') || '',
    startDate: p.get('start') || '2026-06-20'
  };
}

// ===== API =====
let API_URL = null;
function getApiUrl() { if (!API_URL) API_URL = getUrlData().api_url; return API_URL; }

async function fetchFreshData() {
  const url = getApiUrl();
  if (!url) return null;
  try {
    const res = await fetch(url + '/api/status', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret: 'mom'})
    });
    const d = await res.json();
    return d.ok ? d : null;
  } catch(e) { return null; }
}

async function checkinViaApi() {
  const url = getApiUrl();
  if (!url) return null;
  try {
    const res = await fetch(url + '/api/checkin', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret: 'mom'})
    });
    const d = await res.json();
    return d.ok ? d : null;
  } catch(e) { return null; }
}

async function failViaApi() {
  const url = getApiUrl();
  if (!url) return null;
  try {
    const res = await fetch(url + '/api/fail', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret: 'mom'})
    });
    const d = await res.json();
    return d.ok ? d : null;
  } catch(e) { return null; }
}

// ===== State =====
let data = getUrlData();

// On load: fetch fresh data from API
(async function() {
  const fresh = await fetchFreshData();
  if (fresh) {
    data.streak = fresh.streak;
    data.maxStreak = fresh.max_streak;
    data.points = fresh.points;
    data.totalDays = fresh.total_days;
    data.money = fresh.grand_total;
    data.bonus = fresh.total_money;
    data.match = fresh.fund_match;
    data.weekly = fresh.weekly_bonus;
    data.challenge = fresh.challenge_money;
    render();
  }
})();

// ===== Render =====
function render() {
  renderHeader();
  renderStats();
  renderFinances();
  renderProgress();
  renderRewards();
  renderAchievements();
}

function renderHeader() {
  document.getElementById('streakValue').textContent = data.streak;
  document.getElementById('maxStreak').textContent = data.maxStreak || data.streak;
  document.getElementById('pointsValue').textContent = data.points;
  document.getElementById('totalDays').textContent = data.totalDays;
}

function renderStats() {
  document.getElementById('moneyValue').textContent = data.money.toLocaleString();
}

function renderFinances() {
  const totalDaily = data.points * 100;
  document.getElementById('dailyTotal').textContent = totalDaily.toLocaleString();
  document.getElementById('weeklyTotal').textContent = data.weekly.toLocaleString();
  document.getElementById('challengeTotal').textContent = data.challenge.toLocaleString();
  document.getElementById('bonusTotal').textContent = data.bonus.toLocaleString();
  document.getElementById('matchTotal').textContent = data.match.toLocaleString();
  document.getElementById('grandTotal').textContent = data.money.toLocaleString();
}

const MILESTONES = [
  { target: 5, reward: '🍦 ไอศกรีม/ขนมตามใจ' },
  { target: 10, reward: '🥩 บุฟเฟ่ต์เนื้อ 2 คน' },
  { target: 15, reward: '🛍️ ช้อปปิ้ง 1 วัน' },
  { target: 20, reward: '🏞️ เที่ยว 1 วัน' },
  { target: 25, reward: '💆 สปา/นวด' },
  { target: 30, reward: '🌊 ทริปทะเล 2 วัน 1 คืน' },
  { target: 40, reward: '✈️ ทริปเครื่องบิน' },
  { target: 50, reward: '✈️ ทริปภูเก็ต 3 วัน' }
];

const CHALLENGES = [
  { days: 5,  name: '🔰 The Start', reward: '🍦 ไอศกรีม', money: 50 },
  { days: 7,  name: '🌟 7-Day Streak', reward: '🍜 ชาบูเดท', money: 100 },
  { days: 14, name: '🔥 14-Day Streak', reward: '🏕️ ปิกนิก', money: 200 },
  { days: 21, name: '🎯 21-Day Streak', reward: '💆 สปา/นวด', money: 300 },
  { days: 30, name: '💎 30-Day Streak', reward: '✈️ ตั๋วเครื่องบิน', money: 500 },
  { days: 60, name: '🏅 60-Day Streak', reward: '🌴 รีสอร์ท 3 วัน', money: 800 },
  { days: 90, name: '🏆 Mega 90-Day', reward: '🌏 เที่ยวต่างประเทศ', money: 2000 }
];

function renderProgress() {
  const nextM = getNextMilestone();
  const progress = nextM.target > 0 ? ((data.points % 5) / 5) * 100 : 100;
  document.getElementById('progressBar').style.width = Math.min(progress, 100) + '%';
  document.getElementById('progressText').textContent = nextM.text;
}

function getNextMilestone() {
  for (const m of MILESTONES) {
    if (data.points < m.target) {
      return { target: m.target, text: `🎁 อีก ${m.target - data.points} แต้ม → ${m.reward}` };
    }
  }
  return { target: 0, text: '🏆 ทุกระดับผ่านแล้ว! 💰' };
}

function renderRewards() {
  const list = document.getElementById('rewardList');
  list.innerHTML = '';
  let foundCurrent = false;
  for (const r of MILESTONES) {
    const div = document.createElement('div');
    if (data.points >= r.target) {
      div.className = 'reward-item unlocked';
      div.textContent = `✅ ${r.reward}`;
    } else if (!foundCurrent) {
      div.className = 'reward-item current-target';
      div.textContent = `🎯 ${r.reward}`;
      foundCurrent = true;
    } else {
      div.className = 'reward-item';
      div.textContent = `🔒 ${r.reward}`;
    }
    list.appendChild(div);
  }
}

function renderAchievements() {
  const achList = data.ach ? data.ach.split(',') : [];
  const grid = document.getElementById('achievementGrid');
  grid.innerHTML = '';

  const allAch = [
    { icon: '🌟', name: 'First Star', key: 'streak1' },
    { icon: '🔥', name: '7-Day', key: 'streak7' },
    { icon: '💪', name: '14-Day', key: 'streak14' },
    { icon: '💎', name: '30-Day', key: 'streak30' },
    { icon: '🏆', name: '90-Day', key: 'streak90' }
  ];

  for (const a of allAch) {
    const div = document.createElement('div');
    const unlocked = achList.includes(a.key) || 
      (a.key.startsWith('streak') && data.maxStreak >= parseInt(a.key.replace('streak','')));
    div.className = 'achievement ' + (unlocked ? 'unlocked' : 'locked');
    div.innerHTML = `<div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div>`;
    grid.appendChild(div);
  }
}

// ===== Actions =====
function handleCheckin() {
  if (tg) {
    tg.HapticFeedback.impactOccurred('medium');
    showToast('📱 กำลังเปิดแชท — กดส่ง "ไม่กิน" เดี๋ยวเดียว!');
    setTimeout(() => {
      tg.openTelegramLink('https://t.me/SUPPER_V2_BOT?text=ไม่กิน');
      tg.close();
    }, 600);
  }
}

function handleFail() {
  if (tg) {
    tg.HapticFeedback.impactOccurred('medium');
    showToast('📱 กำลังเปิดแชท — พิมพ์ "กินแล้ว" ส่งเลย!');
    setTimeout(() => {
      tg.openTelegramLink('https://t.me/SUPPER_V2_BOT?text=กินแล้ว');
      tg.close();
    }, 600);
  }
}

// ===== History Modal =====
function showHistory() {
  const modal = document.getElementById('historyModal');
  modal.classList.add('show');
  const body = document.getElementById('historyBody');

  if (data.history) {
    const entries = data.history.split('|').filter(e => e);
    if (entries.length > 0) {
      let html = '<table class="history-table">';
      for (const entry of entries.slice(0, 60)) {
        const [date, status] = entry.split(':');
        if (date) {
          const isOk = status === '✅';
          html += `<tr>
            <td class="date-col">${date}</td>
            <td class="status-col ${isOk ? 'status-ok' : 'status-fail'}">${isOk ? '✅' : '❌'}</td>
          </tr>`;
        }
      }
      html += '</table>';
      body.innerHTML = html;
    } else {
      body.innerHTML = '<p class="loading-text">ยังไม่มีประวัติ</p>';
    }
  } else {
    body.innerHTML = '<p class="loading-text">ยังไม่มีประวัติ</p>';
  }
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

document.getElementById('historyModal').addEventListener('click', function(e) {
  if (e.target === this) closeHistory();
});

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== Init =====
if (tg) {
  tg.BackButton.onClick(() => tg.close());
}
