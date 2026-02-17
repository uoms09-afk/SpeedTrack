const storageKey = "speedtrack-desktop-v3";

const defaults = {
  focusMode: true,
  switches: 177,
  productivity: 43,
  deepBlocks: 7,
  openAtLogin: false,
  keyTracking: true,
  clickTracking: true,
  breakMins: 60,
  apps: [
    { name: "VS Code", category: "Productive", time: "3h 6m", visits: 42 },
    { name: "Brave Browser", category: "Neutral", time: "2h 5m", visits: 92 },
    { name: "Adobe Premiere", category: "Productive", time: "1h 1m", visits: 18 },
    { name: "YouTube", category: "Distracting", time: "57m", visits: 31 },
    { name: "Zoom", category: "Meetings", time: "49m", visits: 6 },
  ],
  categories: [
    { name: "Productive", minutes: 254 },
    { name: "Neutral", minutes: 138 },
    { name: "Distracting", minutes: 49 },
    { name: "Meetings", minutes: 62 },
  ],
  goals: [
    { id: crypto.randomUUID(), title: "Deep work", type: "sessions", target: 8, progress: 5 },
    { id: crypto.randomUUID(), title: "Focus minutes", type: "focus", target: 180, progress: 95 },
  ],
  timeline: [
    { id: crypto.randomUUID(), app: "Brave Browser", detail: "chatgpt.com · 4 keys · 1 click", at: "12:18 PM", dur: "3s" },
    { id: crypto.randomUUID(), app: "SnippingTool", detail: "Capture activity", at: "12:18 PM", dur: "2s" },
    { id: crypto.randomUUID(), app: "VS Code", detail: "speedtrack/app.js · 36 keys", at: "12:14 PM", dur: "5m" },
  ],
  exportHistory: [],
};

const state = loadState();
const menuButtons = [...document.querySelectorAll(".menu-btn")];

wireNav();
wireSettings();
wireGoals();
wireExport();
wireScreenTime();
renderAll();

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return structuredClone(defaults);
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaults);
  }
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function wireNav() {
  menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      menuButtons.forEach((x) => x.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      document.getElementById(`${btn.dataset.tab}Panel`).classList.add("active");
    });
  });

  document.getElementById("focusToggle").addEventListener("click", () => {
    state.focusMode = !state.focusMode;
    save();
    renderAll();
  });
}

function renderAll() {
  document.getElementById("productivityScore").textContent = state.productivity;
  document.getElementById("switchesCount").textContent = state.switches;
  document.getElementById("deepBlocks").textContent = state.deepBlocks;
  document.getElementById("focusToggle").textContent = state.focusMode ? "Focus" : "Unfocus";

  const hourlyBars = document.getElementById("hourlyBars");
  hourlyBars.innerHTML = "";
  [40, 58, 61, 20, 0, 0, 0, 0, 0, 0, 29, 45, 56, 51, 48, 53, 38, 60].forEach((height) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${height * 1.5}px`;
    hourlyBars.appendChild(bar);
  });

  document.getElementById("topUsage").innerHTML = [...state.apps]
    .sort((a, b) => durationMin(b.time) - durationMin(a.time))
    .map((x) => `<li><span>${x.name}</span><strong>${x.time}</strong></li>`)
    .join("");

  document.getElementById("appRows").innerHTML = state.apps
    .map((x) => `<div class="app-row"><div><strong>${x.name}</strong><small> ${x.category}</small></div><strong>${x.time}</strong></div>`)
    .join("");

  renderScreenTime();
  renderGoals();
  renderTimeline();
  hydrateSettings();
  renderExportHistory();
  save();
}

function wireScreenTime() {
  document.getElementById("timeRange").addEventListener("change", renderScreenTime);
  document.getElementById("categoryFilter").addEventListener("change", renderScreenTime);
}

function renderScreenTime() {
  const rangeFactor = { today: 1, week: 5, month: 18 }[document.getElementById("timeRange").value] || 1;
  const selected = document.getElementById("categoryFilter").value;

  const categories = state.categories.map((c) => ({ ...c, scaled: c.minutes * rangeFactor }));
  document.getElementById("categoryStats").innerHTML = categories
    .map((c) => `<div class="cat"><h4>${c.name}</h4><div>${c.scaled} mins</div></div>`)
    .join("");

  const rows = state.apps
    .filter((a) => (selected === "all" ? true : a.category === selected))
    .map((a) => ({ ...a, minutes: durationMin(a.time) * rangeFactor }));

  document.getElementById("screenTimeRows").innerHTML = rows
    .map(
      (r) => `<div class="screen-row"><div><strong>${r.name}</strong><div class="subline">${r.category} · ${r.visits} visits</div></div><div>${formatMinutes(r.minutes)}</div></div>`
    )
    .join("");
}

function renderGoals() {
  document.getElementById("goalRows").innerHTML = state.goals
    .map((g) => {
      const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
      const status = pct >= 100 ? "Completed" : pct >= 65 ? "On track" : "Behind";
      return `<div class="goal-row"><div><strong>${g.title}</strong><div class="subline">${g.type} · ${g.progress}/${g.target} (${pct}%) · ${status}</div></div><div><button class="pill" data-goal-inc="${g.id}">+1</button> <button class="pill" data-goal-dec="${g.id}">-1</button> <button class="pill danger" data-goal-del="${g.id}">Delete</button></div></div>`;
    })
    .join("");
}

function renderTimeline() {
  document.getElementById("timelineRows").innerHTML = state.timeline
    .map((t) => `<div class="time-row"><div><strong>${t.app}</strong><div class="subline">${t.detail}</div></div><div>${t.at} · ${t.dur}</div></div>`)
    .join("");
}

function wireGoals() {
  document.getElementById("goalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.goals.unshift({
      id: crypto.randomUUID(),
      title: String(fd.get("title")),
      type: String(fd.get("type")),
      target: Number(fd.get("target")),
      progress: 0,
    });
    e.target.reset();
    renderAll();
  });

  document.body.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-goal-inc]");
    const dec = e.target.closest("[data-goal-dec]");
    const del = e.target.closest("[data-goal-del]");

    if (inc) {
      const g = state.goals.find((x) => x.id === inc.dataset.goalInc);
      if (g) g.progress += 1;
      renderAll();
    }
    if (dec) {
      const g = state.goals.find((x) => x.id === dec.dataset.goalDec);
      if (g) g.progress = Math.max(0, g.progress - 1);
      renderAll();
    }
    if (del) {
      state.goals = state.goals.filter((x) => x.id !== del.dataset.goalDel);
      renderAll();
    }
  });
}

function wireSettings() {
  document.getElementById("clearData").addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    Object.assign(state, structuredClone(defaults));
    renderAll();
  });

  ["openAtLogin", "keyTracking", "clickTracking", "breakMins"].forEach((key) => {
    document.getElementById(key).addEventListener("change", (e) => {
      state[key] = e.target.type === "checkbox" ? e.target.checked : Number(e.target.value);
      save();
    });
  });
}

function hydrateSettings() {
  document.getElementById("openAtLogin").checked = state.openAtLogin;
  document.getElementById("keyTracking").checked = state.keyTracking;
  document.getElementById("clickTracking").checked = state.clickTracking;
  document.getElementById("breakMins").value = state.breakMins;
}

function wireExport() {
  document.getElementById("exportJson").addEventListener("click", () => exportData("json"));
  document.getElementById("exportCsv").addEventListener("click", () => exportData("csv"));
}

function exportData(format) {
  const dataset = document.getElementById("exportDataset").value;
  const payload = pickDataset(dataset);

  if (format === "json") {
    downloadFile(`speedtrack-${dataset}.json`, JSON.stringify(payload, null, 2), "application/json");
  } else {
    const csv = toCsv(dataset, payload);
    downloadFile(`speedtrack-${dataset}.csv`, csv, "text/csv");
  }

  const row = `${new Date().toLocaleString()} · ${dataset.toUpperCase()} · ${format.toUpperCase()}`;
  state.exportHistory.unshift(row);
  state.exportHistory = state.exportHistory.slice(0, 8);
  document.getElementById("exportMeta").textContent = `Last export: ${row}`;
  renderExportHistory();
  save();
}

function pickDataset(dataset) {
  if (dataset === "apps") return state.apps;
  if (dataset === "timeline") return state.timeline;
  if (dataset === "goals") return state.goals;
  return state;
}

function toCsv(dataset, payload) {
  if (dataset === "apps") {
    return ["app,category,time,visits", ...payload.map((a) => `${a.name},${a.category},${a.time},${a.visits}`)].join("\n");
  }
  if (dataset === "timeline") {
    return ["app,detail,time,duration", ...payload.map((t) => `${t.app},${t.detail},${t.at},${t.dur}`)].join("\n");
  }
  if (dataset === "goals") {
    return ["title,type,target,progress", ...payload.map((g) => `${g.title},${g.type},${g.target},${g.progress}`)].join("\n");
  }
  return ["key,value", ...Object.entries(payload).map(([k, v]) => `${k},"${JSON.stringify(v).replaceAll('"', '""')}"`)].join("\n");
}

function renderExportHistory() {
  document.getElementById("exportHistory").innerHTML = state.exportHistory
    .map((item) => `<div class="history-row"><span>${item}</span></div>`)
    .join("");
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function durationMin(txt) {
  const h = Number((txt.match(/(\d+)h/) || [0, 0])[1]);
  const m = Number((txt.match(/(\d+)m/) || [0, 0])[1]);
  return h * 60 + m;
}

function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
