// ====== Пароль и вход ======
const correctPassword = "2309";
const loginScreen = document.getElementById("login");
const appScreen = document.getElementById("app");
const errorMsg = document.getElementById("error");

document.getElementById("login-btn").addEventListener("click", () => {
  const input = document.getElementById("password").value;
  if (input === correctPassword) {
    loginScreen.style.display = "none";
    appScreen.style.display = "block";
    localStorage.setItem("unlocked", "true");
  } else {
    errorMsg.textContent = "❌ Неверный пароль";
  }
});

// Если уже входили
if (localStorage.getItem("unlocked") === "true") {
  loginScreen.style.display = "none";
  appScreen.style.display = "block";
}

// ====== Переключение вкладок ======
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    // убрать активный
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.add("hidden"));

    // показать нужный
    tab.classList.add("active");
    document.getElementById(target).classList.remove("hidden");
  });
});

// ====== Статы и уровень ======
let stats = JSON.parse(localStorage.getItem("stats")) || {
  strength: 0,
  spirit: 0,
  intellect: 0,
  endurance: 0,
  agility: 0,
  charisma: 0,
  xp: 0,
  level: 1
};

function updateStatsUI() {
  document.getElementById("strength").textContent = stats.strength;
  document.getElementById("spirit").textContent = stats.spirit;
  document.getElementById("intellect").textContent = stats.intellect;
  document.getElementById("endurance").textContent = stats.endurance;
  document.getElementById("agility").textContent = stats.agility;
  document.getElementById("charisma").textContent = stats.charisma;

  document.getElementById("level").textContent = stats.level;
  document.getElementById("xp").textContent = stats.xp + " / 150";

  let percent = (stats.xp / 150) * 100;
  document.getElementById("xp-bar").style.width = percent + "%";
}

// ====== Добавление XP ======
function addXP(stat, amount) {
  stats[stat] += amount;
  stats.xp += amount;

  if (stats.xp >= 150) {
    stats.level++;
    stats.xp = 0;
    alert("🔥 Уровень повышен! Теперь уровень " + stats.level);
  }

  localStorage.setItem("stats", JSON.stringify(stats));
  updateStatsUI();
}

// ====== Ежедневные задания ======
const dailyTasks = document.querySelectorAll(".daily-task input");

dailyTasks.forEach(task => {
  task.addEventListener("change", () => {
    if (task.checked) {
      const stat = task.getAttribute("data-stat");
      addXP(stat, 0.5); // 0.5 XP за задание
    }
  });
});

// Первоначальное обновление
updateStatsUI();

// ====== Пропущенные намазы ======
let missedPrayers = JSON.parse(localStorage.getItem("missedPrayers")) || {
  days: 620,
  prayers: {
    fajr: false,
    zuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  }
};

function updateMissedUI() {
  document.getElementById("missed-days").textContent = missedPrayers.days;

  for (let prayer in missedPrayers.prayers) {
    document.getElementById(prayer).checked = missedPrayers.prayers[prayer];
  }
}

function checkMissedCompletion() {
  if (Object.values(missedPrayers.prayers).every(v => v === true)) {
    missedPrayers.days -= 1;
    for (let p in missedPrayers.prayers) {
      missedPrayers.prayers[p] = false;
    }
    alert("✅ Один день намазов восстановлен! Осталось: " + missedPrayers.days);
  }
  localStorage.setItem("missedPrayers", JSON.stringify(missedPrayers));
  updateMissedUI();
}

// ====== Обработчики для чекбоксов ======
const prayerCheckboxes = document.querySelectorAll(".missed-prayer input");

prayerCheckboxes.forEach(box => {
  box.addEventListener("change", () => {
    let prayer = box.getAttribute("id");
    missedPrayers.prayers[prayer] = box.checked;
    checkMissedCompletion();
  });
});

// Первичное обновление интерфейса
updateMissedUI();

// ====== Навыки и таймер ======
let activeSkill = null;
let skillTimer = null;
let skillStartTime = null;

function startSkill(skill) {
  if (!skills[skill].available) {
    alert("⛔ Этот навык пока недоступен!");
    return;
  }

  if (activeSkill) {
    alert("Сначала останови текущий таймер!");
    return;
  }

  activeSkill = skill;
  skillStartTime = Date.now();

  document.getElementById("skill-timer").textContent = `⏳ Идёт прокачка: ${skill}`;
}

function stopSkill() {
  if (!activeSkill) {
    alert("Нет активного таймера!");
    return;
  }

  let elapsedMs = Date.now() - skillStartTime;
  let minutes = Math.floor(elapsedMs / 60000);

  if (minutes > 0) {
    let gainedXP = minutes * 0.5;
    skills[activeSkill].xp += gainedXP;
    stats.intelligence += gainedXP; // навыки идут в интеллект
    totalXP += gainedXP;

    alert(`✅ Навык "${activeSkill}" получил ${gainedXP} XP (${minutes} мин).`);
    checkLevelUp();
    saveProgress();
    updateUI();
  } else {
    alert("⏱️ Слишком мало времени прошло (<1 мин).");
  }

  activeSkill = null;
  skillTimer = null;
  skillStartTime = null;
  document.getElementById("skill-timer").textContent = "";
}

// ====== Кнопки таймера ======
document.getElementById("start-skill").addEventListener("click", () => {
  let chosen = document.getElementById("skill-select").value;
  startSkill(chosen);
});

document.getElementById("stop-skill").addEventListener("click", stopSkill);

// ====== Календарь ======
function renderCalendar(mode = "month") {
  let grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  let daysCount = mode === "month"
    ? new Date(year, month + 1, 0).getDate()
    : 365;

  for (let i = 1; i <= daysCount; i++) {
    let div = document.createElement("div");
    div.className = "calendar-day";

    // берём сохранённое количество выполненных задач за этот день
    let key = mode === "month"
      ? `${year}-${month + 1}-${i}`
      : `${year}-day-${i}`;

    let tasksDone = JSON.parse(localStorage.getItem("calendar"))?.[key] || 0;

    if (tasksDone <= 3) div.classList.add("red");
    else if (tasksDone <= 5) div.classList.add("yellow");
    else div.classList.add("green");

    div.title = `День ${i}: ${tasksDone} заданий`;

    grid.appendChild(div);
  }
}

// сохраняем количество выполненных задач за день
function logDayTasks() {
  let today = new Date();
  let key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  let calendarData = JSON.parse(localStorage.getItem("calendar")) || {};
  calendarData[key] = (calendarData[key] || 0) + 1;

  localStorage.setItem("calendar", JSON.stringify(calendarData));
}

// ====== Общие переменные ======
const PASSWORD = "2309";

let stats = JSON.parse(localStorage.getItem("stats")) || {
  strength: 0,
  spirit: 0,
  intellect: 0,
  endurance: 0,
  agility: 0,
  charisma: 0,
  level: 1,
  levelXP: 0
};

let missedCount = JSON.parse(localStorage.getItem("missedCount")) || 620;
let timers = {};
let calendarData = JSON.parse(localStorage.getItem("calendar")) || {};


// ====== Авторизация ======
function checkPassword() {
  const input = document.getElementById("password").value;
  if (input === PASSWORD) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("system").classList.remove("hidden");
    updateStats();
    updateMissed();
    renderCalendar("month");
  } else {
    document.getElementById("error").innerText = "Неверный пароль";
  }
}


// ====== Переключение вкладок ======
function showTab(tab) {
  document.querySelectorAll(".content > div").forEach(div => div.classList.add("hidden"));
  document.getElementById(tab).classList.remove("hidden");

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab[onclick="showTab('${tab}')"]`).classList.add("active");
}


// ====== Добавление опыта ======
function addXP(stat, amount) {
  stats[stat] += amount;
  stats.levelXP += amount;

  // увеличение уровня
  if (stats.levelXP >= 150) {
    stats.level++;
    stats.levelXP = 0;
  }

  // логируем задачу в календарь
  logDayTasks();

  saveData();
  updateStats();
}


// ====== Обновление статов ======
function updateStats() {
  const max = 100;
  for (let s of ["strength","intellect","spirit","endurance","agility","charisma"]) {
    document.getElementById(s).style.width = Math.min(stats[s], max) + "%";
  }

  document.getElementById("level").innerText = stats.level;
  document.getElementById("level-progress").style.width = (stats.levelXP / 150 * 100) + "%";
}


// ====== Сохранение ======
function saveData() {
  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("missedCount", JSON.stringify(missedCount));
  localStorage.setItem("calendar", JSON.stringify(calendarData));
}


// ====== Таймер навыков ======
function startTimer(skill) {
  if (timers[skill]) return;
  timers[skill] = setInterval(() => {
    let val = parseInt(document.getElementById(skill + "-timer").innerText);
    document.getElementById(skill + "-timer").innerText = val + 1;
  }, 60000);
}

function stopTimer(skill) {
  if (timers[skill]) {
    clearInterval(timers[skill]);
    let minutes = parseInt(document.getElementById(skill + "-timer").innerText);
    addXP("intellect", minutes * 0.5);
    timers[skill] = null;
  }
}


// ====== Календарь ======
function renderCalendar(mode = "month") {
  let grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  let daysCount = mode === "month"
    ? new Date(year, month + 1, 0).getDate()
    : 365;

  for (let i = 1; i <= daysCount; i++) {
    let div = document.createElement("div");
    div.className = "calendar-day";

    let key = mode === "month"
      ? `${year}-${month + 1}-${i}`
      : `${year}-day-${i}`;

    let tasksDone = calendarData[key] || 0;

    if (tasksDone <= 3) div.classList.add("red");
    else if (tasksDone <= 5) div.classList.add("yellow");
    else div.classList.add("green");

    div.title = `День ${i}: ${tasksDone} заданий`;
    grid.appendChild(div);
  }
}

function logDayTasks() {
  let today = new Date();
  let key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  calendarData[key] = (calendarData[key] || 0) + 1;
  saveData();
}


// ====== Пропущенные намазы ======
function updateMissed() {
  document.getElementById("missed-count").innerText = missedCount;
}

function completeMissed() {
  let allChecked = ["m-fajr","m-zuhr","m-asr","m-maghrib","m-isha"]
    .every(id => document.getElementById(id).checked);

  if (allChecked && missedCount > 0) {
    missedCount--;
    ["m-fajr","m-zuhr","m-asr","m-maghrib","m-isha"]
      .forEach(id => document.getElementById(id).checked = false);

    saveData();
    updateMissed();
  }
}
