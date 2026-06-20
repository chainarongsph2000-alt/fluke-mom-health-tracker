// ===== Telegram WebApp =====
let tg = null;
try {
  tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
} catch(e) { /* not running inside Telegram */ }

// ===== Sample Data (for demo) =====
// In production, data comes from URL params sent by the bot
function getDataFromParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    streak: parseInt(params.get('streak') || '0'),
    maxStreak: parseInt(params.get('max_streak') || '0'),
    points: parseInt(params.get('points') || '0'),
    totalDays: parseInt(params.get('days') || '0'),
    option: params.get('option') || 'ยังไม่เลือก',
    money: parseInt(params.get('money') || '0'),
    history: params.get('history') || '',
    achievements: params.get('ach') || '',
    startDate: params.get('start') || '2026-06-20'
  };
}

let data = getDataFromParams();
// If no params, use demo/empty data
if (!data.points && !data.streak) {
  // Don't show demo - show empty state
}

// ===== Render =====
function render() {
  // Streak
  document.getElementById('streakValue').textContent = data.streak;
  document.getElementById('maxStreak').textContent = data.maxStreak || data.streak;
  document.getElementById('pointsValue').textContent = data.points;
  document.getElementById('moneyValue').textContent = (data.money || data.points * 100).toLocaleString();
  document.getElementById('totalDays').textContent = data.totalDays;

  // Progress
  const nextMilestone = getNextMilestone(data.points);
  const progress = nextMilestone.total > 0 ? (data.points / nextMilestone.total) * 100 : 0;
  document.getElementById('progressBar').style.width = Math.min(progress, 100) + '%';
  document.getElementById('progressText').textContent = nextMilestone.text;

  // Rewards
  renderRewards();

  // Achievements
  renderAchievements();
}

function getNextMilestone(points) {
  const milestones = [
    { target: 5, reward: '🍦 ไอศกรีม/ขนมตามใจ' },
    { target: 10, reward: '🥩 บุฟเฟ่ต์เนื้อ 2 คน' },
    { target: 15, reward: '🛍️ ช้อปปิ้ง 1 วัน' },
    { target: 20, reward: '🏞️ เที่ยว 1 วัน' },
    { target: 25, reward: '💆 สปา/นวด' },
    { target: 30, reward: '🌊 ทริปทะเล 2 วัน 1 คืน' },
    { target: 40, reward: '✈️ ทริปเครื่องบิน' },
    { target: 50, reward: '✈️ ทริปภูเก็ต/กระบี่ 3 วัน' }
  ];
  
  for (const m of milestones) {
    if (points < m.target) {
      return { total: m.target, text: `🎁 อีก ${m.target - points} แต้ม → ${m.reward}` };
    }
  }
  return { total: 0, text: '🏆 ทุกระดับผ่านแล้ว! เก็บแต้มไปเรื่อยๆ 💰' };
}

function renderRewards() {
  const rewards = [
    { target: 5, name: '🍦 ไอศกรีม/ขนมตามใจ' },
    { target: 10, name: '🥩 บุฟเฟ่ต์เนื้อ 2 คน' },
    { target: 15, name: '🛍️ ช้อปปิ้ง 1 วัน' },
    { target: 20, name: '🏞️ เที่ยว 1 วัน' },
    { target: 25, name: '💆 สปา/นวด' },
    { target: 30, name: '🌊 ทริปทะเล 2 วัน 1 คืน' },
    { target: 40, name: '✈️ ทริปเครื่องบิน' },
    { target: 50, name: '✈️ ทริปภูเก็ต/กระบี่ 3 วัน' }
  ];

  const list = document.getElementById('rewardList');
  list.innerHTML = '';
  
  let foundCurrent = false;
  for (const r of rewards) {
    const div = document.createElement('div');
    div.className = 'reward-item';
    
    if (data.points >= r.target) {
      div.classList.add('unlocked');
      div.textContent = `✅ ${r.name}`;
    } else if (!foundCurrent) {
      div.classList.add('current-target');
      div.textContent = `🎯 ${r.name}`;
      foundCurrent = true;
    } else {
      div.textContent = `🔒 ${r.name}`;
    }
    
    list.appendChild(div);
  }
}

function renderAchievements() {
  const achList = data.achievements ? data.achievements.split(',') : [];
  const achievements = [
    { key: '🌟', name: 'First Star', threshold: 'star' },
    { key: '🔥', name: '7-Day', threshold: 'streak7' },
    { key: '💪', name: '14-Day', threshold: 'streak14' },
    { key: '💎', name: '30-Day', threshold: 'streak30' },
    { key: '🏆', name: '90-Day', threshold: 'streak90' }
  ];

  const grid = document.getElementById('achievementGrid');
  grid.innerHTML = '';
  
  for (const a of achievements) {
    const div = document.createElement('div');
    const unlocked = achList.includes(a.threshold) || 
                     (data.maxStreak >= parseInt(a.threshold.replace('streak','')) && a.threshold.startsWith('streak'));
    div.className = 'achievement ' + (unlocked ? 'unlocked' : 'locked');
    div.innerHTML = `<div class="ach-icon">${a.key}</div><div class="ach-name">${a.name}</div>`;
    grid.appendChild(div);
  }
}

// ===== Actions =====
function handleCheckin() {
  if (tg) {
    tg.sendData(JSON.stringify({ action: 'checkin' }));
    showToast('✅ ส่ง check-in ไปแล้ว!');
  } else {
    showToast('🔗 เปิดผ่าน Telegram เพื่อ check-in');
  }
}

function handleFail() {
  if (tg) {
    tg.sendData(JSON.stringify({ action: 'fail' }));
    showToast('📝 ส่งข้อมูลไปแล้ว');
  } else {
    showToast('🔗 เปิดผ่าน Telegram เพื่อบันทึก');
  }
}

function showHistory() {
  const modal = document.getElementById('historyModal');
  modal.classList.add('show');
  
  const historyStr = data.history;
  const body = document.getElementById('historyBody');
  
  if (historyStr) {
    const entries = historyStr.split('|').filter(e => e);
    if (entries.length > 0) {
      let html = '<table class="history-table">';
      for (const entry of entries.reverse().slice(0, 60)) {
        const [date, status] = entry.split(':');
        if (date) {
          const isOk = status === '✅' || status === '1';
          html += `<tr>
            <td class="date-col">${date}</td>
            <td class="status-col ${isOk ? 'status-ok' : 'status-fail'}">${isOk ? '✅' : '❌'}</td>
          </tr>`;
        }
      }
      html += '</table>';
      body.innerHTML = html;
    } else {
      body.innerHTML = '<p class="loading-text">ยังไม่มีประวัติ check-in</p>';
    }
  } else {
    body.innerHTML = '<p class="loading-text">ยังไม่มีประวัติ check-in</p>';
  }
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

// Close modal on overlay click
document.getElementById('historyModal').addEventListener('click', function(e) {
  if (e.target === this) closeHistory();
});

// ===== Toast =====
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
render();

// ===== Telegram Back Button =====
if (tg) {
  tg.BackButton.onClick(() => {
    tg.close();
  });
}
