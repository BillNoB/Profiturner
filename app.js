const DB_NAME = "NTBTurnenDB";
const STORE_NAME = "fotos";
const PROGRESS_KEY = "ntb_progress";

let db = null;
let currentDevice = "boden";
let currentMode = "pflicht";
let currentFilter = "Alle";
let currentData = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

function savePhoto(id, dataUrl) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

function getPhoto(id) {
  return new Promise((resolve) => {
    if (!db) return resolve(null);
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

function deletePhoto(id) {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
  });
}

async function loadDeviceData(geraet) {
  const grid = document.getElementById("cards-grid");
  grid.innerHTML = "<p>Lade Übungen...</p>";
  try {
    // Check if we have embedded data available
    if (window.EMBEDDED_DATA && window.EMBEDDED_DATA[geraet]) {
      currentData = window.EMBEDDED_DATA[geraet];
      renderFilters();
      await renderContent();
      return;
    }
    
    // Try to load from server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    
    const res = await fetch(`./data/${geraet}.json?t=${Date.now()}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentData = await res.json();
    
    // Update cache
    localStorage.setItem('ntb_cache_' + geraet, JSON.stringify(currentData));
    
    renderFilters();
    await renderContent();
  } catch (err) {
    // Check if it's an abort error (timeout)
    if (err.name === 'AbortError') {
      // For timeout, try to load from cache
      const cachedData = localStorage.getItem('ntb_cache_' + geraet);
      if (cachedData) {
        currentData = JSON.parse(cachedData);
        renderFilters();
        await renderContent();
      } else {
        grid.innerHTML = `<div class="info-banner"><h2>Keine Verbindung</h2><p>Server nicht erreichbar. Überprüfe deine Internetverbindung oder versuche es später erneut.</p></div>`;
      }
    } else {
      // Try to load from cache if available
      const cachedData = localStorage.getItem('ntb_cache_' + geraet);
      if (cachedData) {
        currentData = JSON.parse(cachedData);
        renderFilters();
        await renderContent();
      } else {
        grid.innerHTML = `<div class="info-banner"><h2>Fehler beim Laden</h2><p>Konnte data/${geraet}.json nicht laden: ${err.message}</p></div>`;
      }
    }
  }
}

function renderFilters() {
  const filterContainer = document.getElementById("level-filters");
  const options = currentMode === "pflicht"
    ? ["Alle", "G1", "G2", "G3", "G4"]
    : ["Alle", "LK4", "LK3", "LK2", "LK1"];

  if (!options.includes(currentFilter)) {
    currentFilter = "Alle";
  }

  filterContainer.innerHTML = options
    .map(
      (opt) =>
        `<button class="filter-btn ${opt === currentFilter ? "active" : ""}" data-filter="${opt}">${opt}</button>`
    )
    .join("");

  filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      currentFilter = btn.dataset.filter;
      renderFilters();
      await renderContent();
    });
  });
}

async function createPhotoWidget(itemId, labelText) {
  const existingPhoto = await getPhoto(itemId);
  const box = document.createElement("div");
  box.className = "photo-box";

  if (existingPhoto) {
    const img = document.createElement("img");
    img.src = existingPhoto;
    img.alt = labelText;
    box.appendChild(img);
  }

  const actions = document.createElement("div");
  actions.className = "photo-actions";

  const label = document.createElement("label");
  label.className = "btn-upload";
  label.textContent = existingPhoto ? "📷 Foto ersetzen" : `📷 ${labelText}`;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await savePhoto(itemId, ev.target.result);
      await renderContent();
    };
    reader.readAsDataURL(file);
  });

  label.appendChild(input);
  actions.appendChild(label);

  if (existingPhoto) {
    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-photo";
    delBtn.textContent = "🗑️ Löschen";
    delBtn.addEventListener("click", async () => {
      await deletePhoto(itemId);
      await renderContent();
    });
    actions.appendChild(delBtn);
  }

  box.appendChild(actions);
  return box;
}

async function renderContent() {
  const grid = document.getElementById("cards-grid");
  const banner = document.getElementById("info-banner");
  grid.innerHTML = "";
  banner.classList.add("hidden");
  banner.innerHTML = "";

  if (!currentData) return;

  if (currentMode === "pflicht") {
    const stufen = (currentData.g_stufen || []).filter(
      (s) => currentFilter === "Alle" || s.stufe === currentFilter
    );

    if (currentFilter !== "Alle" && stufen.length === 1) {
      const s = stufen[0];
      banner.classList.remove("hidden");
      banner.innerHTML = `<h2>${s.stufe} – Ausgangswert: ${s.ausgangswert.toFixed(1)} Pkt.</h2><p>${s.beschreibung}</p>`;
    }

    for (const stufeObj of stufen) {
      for (const el of stufeObj.elemente || []) {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="card-header">
            <h3 class="card-title">${el.titel}</h3>
            <div class="badge-group">
              <span class="badge badge-stage">${stufeObj.stufe}</span>
              <span class="badge badge-points">${el.punkte.toFixed(1)} Pkt.</span>
            </div>
          </div>
          <p class="card-desc">${el.beschreibung}</p>
          <div class="tags-list">
            ${(el.kriterien || []).map((k) => `<span class="tag">✓ ${k}</span>`).join("")}
          </div>
        `;

        card.appendChild(await createPhotoWidget(el.id, "Trainingsfoto hinzufügen"));

        for (const vu of el.voruebungen || []) {
          const prep = document.createElement("div");
          prep.className = "prep-box";
          prep.innerHTML = `
            <span class="prep-label">Vorübung zum Lernen</span>
            <div class="prep-title">${vu.name}</div>
            <p class="card-desc">${vu.erklaerung}</p>
          `;
          prep.appendChild(await createPhotoWidget(vu.id, "Foto zur Vorübung"));
          card.appendChild(prep);
        }

        // Add progress button
        const progressButton = document.createElement("button");
        progressButton.className = "progress-button";
        progressButton.dataset.id = el.id;
        updateProgressButton(progressButton, el.id);
        card.appendChild(progressButton);

        grid.appendChild(card);
      }
    }
  } else {
    const lk = currentData.lk_bereich;
    if (!lk) return;

    const matchingReqs = (lk.anforderungen || []).filter(
      (r) => currentFilter === "Alle" || r.stufe === currentFilter
    );

    if (matchingReqs.length > 0) {
      banner.classList.remove("hidden");
      banner.innerHTML = matchingReqs
        .map(
          (r) => `
          <div style="margin-bottom: 14px;">
            <h2>Anforderungen ${r.stufe} (${r.max_elemente})</h2>
            <p><strong>Schwierigkeit:</strong> ${r.schwierigkeit_info}</p>
            <ul>${(r.pflicht_kriterien || []).map((k) => `<li>${k}</li>`).join("")}</ul>
          </div>
        `
        )
        .join("");
    }

    const elements = (lk.elemente || []).filter(
      (el) => currentFilter === "Alle" || el.ab_stufe === currentFilter
    );

    for (const el of elements) {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">${el.titel}</h3>
          <div class="badge-group">
            <span class="badge badge-stage">${el.ab_stufe} | ${el.wertigkeit}</span>
            <span class="badge badge-points">+${el.punkte.toFixed(2)} Pkt.</span>
          </div>
        </div>
        <div class="tags-list"><span class="tag">${el.kategorie}</span></div>
        <p class="card-desc">${el.erklaerung}</p>
      `;

      card.appendChild(await createPhotoWidget(el.id, "Trainingsfoto hinzufügen"));

      for (const vu of el.voruebungen || []) {
        const prep = document.createElement("div");
        prep.className = "prep-box";
        prep.innerHTML = `
          <span class="prep-label">Vorübung zum Lernen</span>
          <div class="prep-title">${vu.name}</div>
          <p class="card-desc">${vu.erklaerung}</p>
        `;
        prep.appendChild(await createPhotoWidget(vu.id, "Foto zur Vorübung"));
        card.appendChild(prep);
      }

      // Add progress button
      const progressButton = document.createElement("button");
      progressButton.className = "progress-button";
      progressButton.dataset.id = el.id;
      updateProgressButton(progressButton, el.id);
      card.appendChild(progressButton);

      grid.appendChild(card);
    }
  }

  // Update progress info banner
  updateProgressInfo();
}

// Function to get current progress state
function getProgressState(id) {
  const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  return progressData[id] || "offen";
}

// Function to set progress state
function setProgressState(id, state) {
  const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  progressData[id] = state;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
}

// Preload all device data into localStorage on app start
async function preloadDeviceData() {
  const devices = ["boden", "balken", "barren", "sprung"];
  
  for (const device of devices) {
    try {
      // Load from server and cache
      const response = await fetch(`./data/${device}.json?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('ntb_cache_' + device, JSON.stringify(data));
      } else {
        console.warn(`Failed to load data for ${device}`);
      }
    } catch (error) {
      console.warn(`Failed to load data for ${device}:`, error);
      // Try to load from cache if available
      const cachedData = localStorage.getItem('ntb_cache_' + device);
      if (cachedData) {
        console.log(`Loaded ${device} from cache`);
      }
    }
  }
}

// Function to update progress button display
function updateProgressButton(button, id) {
  const state = getProgressState(id);
  let text, colorClass;
  
  switch(state) {
    case "offen":
      text = "⚪ Noch offen";
      colorClass = "progress-offen";
      break;
    case "training":
      text = "🟡 Im Training";
      colorClass = "progress-training";
      break;
    case "beherrscht":
      text = "🟢 Sicher beherrscht";
      colorClass = "progress-beherrscht";
      break;
    default:
      text = "⚪ Noch offen";
      colorClass = "progress-offen";
  }
  
  button.textContent = text;
  button.className = `progress-button ${colorClass}`;
}

// Function to cycle progress state
function cycleProgressState(id) {
  const currentState = getProgressState(id);
  let newState;
  
  switch(currentState) {
    case "offen":
      newState = "training";
      break;
    case "training":
      newState = "beherrscht";
      break;
    case "beherrscht":
      newState = "offen";
      break;
    default:
      newState = "training";
  }
  
  setProgressState(id, newState);
  updateProgressButton(document.querySelector(`[data-id="${id}"]`), id);
  updateProgressInfo();
}

// Function to update progress info banner
function updateProgressInfo() {
  const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  const totalElements = Object.keys(progressData).length;
  const masteredElements = Object.values(progressData).filter(state => state === "beherrscht").length;
  
  if (totalElements > 0) {
    const infoBanner = document.getElementById("info-banner");
    infoBanner.innerHTML = `
      <h2>Fortschritt: ${masteredElements} von ${totalElements} Elementen beherrscht</h2>
      <p>(${masteredElements}/${totalElements} - ${(masteredElements/totalElements*100).toFixed(0)}%)</p>
    `;
    infoBanner.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  
  // Preload all device data
  await preloadDeviceData();

  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".device-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentDevice = btn.dataset.geraet;
      await loadDeviceData(currentDevice);
    });
  });

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      currentFilter = "Alle";
      renderFilters();
      await renderContent();
    });
  });

  // Add event listener for progress buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("progress-button")) {
      const id = e.target.dataset.id;
      cycleProgressState(id);
    }
  });

  // Add event listeners for backup buttons
  document.getElementById("backup-save").addEventListener("click", saveBackup);
  document.getElementById("backup-load").addEventListener("click", loadBackup);

  // Add event listener for offline export button
  document.getElementById("btn-export-offline").addEventListener("click", exportStandaloneApp);

  await loadDeviceData(currentDevice);
  
  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
});

// Backup functions
async function saveBackup() {
  try {
    // Get all photos from IndexedDB
    const photos = {};
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    
    const photoKeys = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    for (const key of photoKeys) {
      const photoData = await getPhoto(key);
      if (photoData) {
        photos[key] = photoData;
      }
    }
    
    // Get progress data from localStorage
    const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    
    // Create backup object
    const backupData = {
      fotos: photos,
      ntb_progress: progressData
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ntb-turnen-backup.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    alert("Backup erfolgreich gespeichert!");
  } catch (error) {
    console.error('Fehler beim Speichern des Backups:', error);
    alert('Fehler beim Speichern des Backups: ' + error.message);
  }
}

async function loadBackup() {
  try {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target.result);
          
          // Restore photos to IndexedDB
          if (backupData.fotos) {
            for (const [key, dataUrl] of Object.entries(backupData.fotos)) {
              await savePhoto(key, dataUrl);
            }
          }
          
          // Restore progress data to localStorage
          if (backupData.ntb_progress) {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(backupData.ntb_progress));
          }
          
          alert("Backup erfolgreich geladen! Die Ansicht wird neu geladen.");
          await renderContent();
        } catch (error) {
          console.error('Fehler beim Laden des Backups:', error);
          alert('Fehler beim Laden des Backups: ' + error.message);
        }
      };
      
      reader.onerror = () => {
        alert('Fehler beim Lesen der Datei');
      };
      
      reader.readAsText(file);
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  } catch (error) {
    console.error('Fehler beim Laden des Backups:', error);
    alert('Fehler beim Laden des Backups: ' + error.message);
  }
}

// Function to export the standalone app
async function exportStandaloneApp() {
  try {
    // Load all required resources in parallel
    const [styleSheet, bodenData, balkenData, barrenData, sprungData] = await Promise.all([
      fetch('./style.css').then(res => res.text()),
      fetch('./data/boden.json?t=' + Date.now()).then(res => res.json()),
      fetch('./data/balken.json?t=' + Date.now()).then(res => res.json()),
      fetch('./data/barren.json?t=' + Date.now()).then(res => res.json()),
      fetch('./data/sprung.json?t=' + Date.now()).then(res => res.json())
    ]);
    
    // Create the complete HTML string with embedded data and inline CSS
    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>NTB Geräturnen weiblich</title>
  <style>
${styleSheet}
  </style>
</head>
<body>
  <header class="app-header">
    <div class="header-inner">
      <h1>NTB Geräturnen</h1>
      <span class="subtitle">Trainings- & Element-Übersicht (weiblich)</span>
      <div class="backup-buttons">
        <button id="backup-save" class="btn-backup">💾 Backup sichern</button>
        <button id="backup-load" class="btn-backup">📂 Backup laden</button>
        <button id="btn-export-offline" class="filter-btn">📲 Offline-App</button>
      </div>
    </div>

    <nav class="device-nav" id="device-nav">
      <button class="device-btn active" data-geraet="boden">Boden</button>
      <button class="device-btn" data-geraet="balken">Schwebebalken</button>
      <button class="device-btn" data-geraet="barren">Parallel Stufenbarren</button>
      <button class="device-btn" data-geraet="sprung">Sprung</button>
    </nav>

    <div class="mode-tabs" id="mode-tabs">
      <button class="mode-btn active" data-mode="pflicht">Pflicht (G1-G4)</button>
      <button class="mode-btn" data-mode="kuer">Kür (LK1-LK4)</button>
    </div>

    <div class="level-filters" id="level-filters"></div>
  </header>

  <main class="app-main">
    <section id="info-banner" class="info-banner hidden"></section>
    <section id="cards-grid" class="cards-grid"></section>
  </main>

  <script>
    window.EMBEDDED_DATA = {
      boden: ${JSON.stringify(bodenData)},
      balken: ${JSON.stringify(balkenData)},
      barren: ${JSON.stringify(barrenData)},
      sprung: ${JSON.stringify(sprungData)}
    };
    
    // Embedded app.js content
    const DB_NAME = "NTBTurnenDB";
    const STORE_NAME = "fotos";
    const PROGRESS_KEY = "ntb_progress";
    
    let db = null;
    let currentDevice = "boden";
    let currentMode = "pflicht";
    let currentFilter = "Alle";
    let currentData = null;
    
    function initDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
          const database = e.target.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = (e) => {
          db = e.target.result;
          resolve(db);
        };
        request.onerror = (e) => reject(e.target.error);
      });
    }
    
    function savePhoto(id, dataUrl) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(dataUrl, id);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });
    }
    
    function getPhoto(id) {
      return new Promise((resolve) => {
        if (!db) return resolve(null);
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }
    
    function deletePhoto(id) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
      });
    }
    
    async function loadDeviceData(geraet) {
      const grid = document.getElementById("cards-grid");
      grid.innerHTML = "<p>Lade Übungen...</p>";
      try {
        // Check if we have embedded data available
        if (window.EMBEDDED_DATA && window.EMBEDDED_DATA[geraet]) {
          currentData = window.EMBEDDED_DATA[geraet];
          renderFilters();
          await renderContent();
          return;
        }
        
        // Try to load from server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        
        const res = await fetch(\`./data/\${geraet}.json?t=\${Date.now()}\`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        currentData = await res.json();
        
        // Update cache
        localStorage.setItem('ntb_cache_' + geraet, JSON.stringify(currentData));
        
        renderFilters();
        await renderContent();
      } catch (err) {
        // Check if it's an abort error (timeout)
        if (err.name === 'AbortError') {
          // For timeout, try to load from cache
          const cachedData = localStorage.getItem('ntb_cache_' + geraet);
          if (cachedData) {
            currentData = JSON.parse(cachedData);
            renderFilters();
            await renderContent();
          } else {
            grid.innerHTML = \`<div class="info-banner"><h2>Keine Verbindung</h2><p>Server nicht erreichbar. Überprüfe deine Internetverbindung oder versuche es später erneut.</p></div>\`;
          }
        } else {
          // Try to load from cache if available
          const cachedData = localStorage.getItem('ntb_cache_' + geraet);
          if (cachedData) {
            currentData = JSON.parse(cachedData);
            renderFilters();
            await renderContent();
          } else {
            grid.innerHTML = \`<div class="info-banner"><h2>Fehler beim Laden</h2><p>Konnte data/\${geraet}.json nicht laden: \${err.message}</p></div>\`;
          }
        }
      }
    }
    
    function renderFilters() {
      const filterContainer = document.getElementById("level-filters");
      const options = currentMode === "pflicht"
        ? ["Alle", "G1", "G2", "G3", "G4"]
        : ["Alle", "LK4", "LK3", "LK2", "LK1"];

      if (!options.includes(currentFilter)) {
        currentFilter = "Alle";
      }

      filterContainer.innerHTML = options
        .map(
          (opt) =>
            \`<button class="filter-btn \${opt === currentFilter ? "active" : ""}" data-filter="\${opt}">\${opt}</button>\`
        )
        .join("");

      filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          currentFilter = btn.dataset.filter;
          renderFilters();
          await renderContent();
        });
      });
    }
    
    async function createPhotoWidget(itemId, labelText) {
      const existingPhoto = await getPhoto(itemId);
      const box = document.createElement("div");
      box.className = "photo-box";

      if (existingPhoto) {
        const img = document.createElement("img");
        img.src = existingPhoto;
        img.alt = labelText;
        box.appendChild(img);
      }

      const actions = document.createElement("div");
      actions.className = "photo-actions";

      const label = document.createElement("label");
      label.className = "btn-upload";
      label.textContent = existingPhoto ? "📷 Foto ersetzen" : \`📷 \${labelText}\`;

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          await savePhoto(itemId, ev.target.result);
          await renderContent();
        };
        reader.readAsDataURL(file);
      });

      label.appendChild(input);
      actions.appendChild(label);

      if (existingPhoto) {
        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete-photo";
        delBtn.textContent = "🗑️ Löschen";
        delBtn.addEventListener("click", async () => {
          await deletePhoto(itemId);
          await renderContent();
        });
        actions.appendChild(delBtn);
      }

      box.appendChild(actions);
      return box;
    }
    
    async function renderContent() {
      const grid = document.getElementById("cards-grid");
      const banner = document.getElementById("info-banner");
      grid.innerHTML = "";
      banner.classList.add("hidden");
      banner.innerHTML = "";
      
      if (!currentData) return;

      if (currentMode === "pflicht") {
        const stufen = (currentData.g_stufen || []).filter(
          (s) => currentFilter === "Alle" || s.stufe === currentFilter
        );

        if (currentFilter !== "Alle" && stufen.length === 1) {
          const s = stufen[0];
          banner.classList.remove("hidden");
          banner.innerHTML = \`<h2>\${s.stufe} – Ausgangswert: \${s.ausgangswert.toFixed(1)} Pkt.</h2><p>\${s.beschreibung}</p>\`;
        }

        for (const stufeObj of stufen) {
          for (const el of stufeObj.elemente || []) {
            const card = document.createElement("article");
            card.className = "card";
            card.innerHTML = \`
              <div class="card-header">
                <h3 class="card-title">\${el.titel}</h3>
                <div class="badge-group">
                  <span class="badge badge-stage">\${stufeObj.stufe}</span>
                  <span class="badge badge-points">\${el.punkte.toFixed(1)} Pkt.</span>
                </div>
              </div>
              <p class="card-desc">\${el.beschreibung}</p>
              <div class="tags-list">
                \${(el.kriterien || []).map((k) => \`<span class="tag">✓ \${k}</span>\`).join("")}
              </div>
            \`;

            card.appendChild(await createPhotoWidget(el.id, "Trainingsfoto hinzufügen"));

            for (const vu of el.voruebungen || []) {
              const prep = document.createElement("div");
              prep.className = "prep-box";
              prep.innerHTML = \`
                <span class="prep-label">Vorübung zum Lernen</span>
                <div class="prep-title">\${vu.name}</div>
                <p class="card-desc">\${vu.erklaerung}</p>
              \`;
              prep.appendChild(await createPhotoWidget(vu.id, "Foto zur Vorübung"));
              card.appendChild(prep);
            }

            // Add progress button
            const progressButton = document.createElement("button");
            progressButton.className = "progress-button";
            progressButton.dataset.id = el.id;
            updateProgressButton(progressButton, el.id);
            card.appendChild(progressButton);

            grid.appendChild(card);
          }
        }
      } else {
        const lk = currentData.lk_bereich;
        if (!lk) return;

        const matchingReqs = (lk.anforderungen || []).filter(
          (r) => currentFilter === "Alle" || r.stufe === currentFilter
        );

        if (matchingReqs.length > 0) {
          banner.classList.remove("hidden");
          banner.innerHTML = matchingReqs
            .map(
              (r) => \`
              <div style="margin-bottom: 14px;">
                <h2>Anforderungen \${r.stufe} (\${r.max_elemente})</h2>
                <p><strong>Schwierigkeit:</strong> \${r.schwierigkeit_info}</p>
                <ul>\${(r.pflicht_kriterien || []).map((k) => \`<li>\${k}</li>\`).join("")}</ul>
              </div>
            \`
            )
            .join("");
        }

        const elements = (lk.elemente || []).filter(
          (el) => currentFilter === "Alle" || el.ab_stufe === currentFilter
        );

        for (const el of elements) {
          const card = document.createElement("article");
          card.className = "card";
          card.innerHTML = \`
            <div class="card-header">
              <h3 class="card-title">\${el.titel}</h3>
              <div class="badge-group">
                <span class="badge badge-stage">\${el.ab_stufe} | \${el.wertigkeit}</span>
                <span class="badge badge-points">+\${el.punkte.toFixed(2)} Pkt.</span>
              </div>
            </div>
            <div class="tags-list"><span class="tag">\${el.kategorie}</span></div>
            <p class="card-desc">\${el.erklaerung}</p>
          \`;

          card.appendChild(await createPhotoWidget(el.id, "Trainingsfoto hinzufügen"));

          for (const vu of el.voruebungen || []) {
            const prep = document.createElement("div");
            prep.className = "prep-box";
            prep.innerHTML = \`
              <span class="prep-label">Vorübung zum Lernen</span>
              <div class="prep-title">\${vu.name}</div>
              <p class="card-desc">\${vu.erklaerung}</p>
            \`;
            prep.appendChild(await createPhotoWidget(vu.id, "Foto zur Vorübung"));
            card.appendChild(prep);
          }

          // Add progress button
          const progressButton = document.createElement("button");
          progressButton.className = "progress-button";
          progressButton.dataset.id = el.id;
          updateProgressButton(progressButton, el.id);
          card.appendChild(progressButton);

          grid.appendChild(card);
        }
      }

      // Update progress info banner
      updateProgressInfo();
    }
    
    // Function to get current progress state
    function getProgressState(id) {
      const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return progressData[id] || "offen";
    }
    
    // Function to set progress state
    function setProgressState(id, state) {
      const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      progressData[id] = state;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    }
    
    // Preload all device data into localStorage on app start
    async function preloadDeviceData() {
      const devices = ["boden", "balken", "barren", "sprung"];
      
      for (const device of devices) {
        try {
          // Load from server and cache
          const response = await fetch(\`./data/\${device}.json?t=\${Date.now()}\`, {
            cache: 'no-cache'
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('ntb_cache_' + device, JSON.stringify(data));
          } else {
            console.warn(\`Failed to load data for \${device}\`);
          }
        } catch (error) {
          console.warn(\`Failed to load data for \${device}:\`, error);
          // Try to load from cache if available
          const cachedData = localStorage.getItem('ntb_cache_' + device);
          if (cachedData) {
            console.log(\`Loaded \${device} from cache\`);
          }
        }
      }
    }
    
    // Function to update progress button display
    function updateProgressButton(button, id) {
      const state = getProgressState(id);
      let text, colorClass;
      
      switch(state) {
        case "offen":
          text = "⚪ Noch offen";
          colorClass = "progress-offen";
          break;
        case "training":
          text = "🟡 Im Training";
          colorClass = "progress-training";
          break;
        case "beherrscht":
          text = "🟢 Sicher beherrscht";
          colorClass = "progress-beherrscht";
          break;
        default:
          text = "⚪ Noch offen";
          colorClass = "progress-offen";
      }
      
      button.textContent = text;
      button.className = \`progress-button \${colorClass}\`;
    }
    
    // Function to cycle progress state
    function cycleProgressState(id) {
      const currentState = getProgressState(id);
      let newState;
      
      switch(currentState) {
        case "offen":
          newState = "training";
          break;
        case "training":
          newState = "beherrscht";
          break;
        case "beherrscht":
          newState = "offen";
          break;
        default:
          newState = "training";
      }
      
      setProgressState(id, newState);
      updateProgressButton(document.querySelector(\`[data-id="\${id}"]\`), id);
      updateProgressInfo();
    }
    
    // Function to update progress info banner
    function updateProgressInfo() {
      const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      const totalElements = Object.keys(progressData).length;
      const masteredElements = Object.values(progressData).filter(state => state === "beherrscht").length;
      
      if (totalElements > 0) {
        const infoBanner = document.getElementById("info-banner");
        infoBanner.innerHTML = \`
          <h2>Fortschritt: \${masteredElements} von \${totalElements} Elementen beherrscht</h2>
          <p>(\${masteredElements}/\${totalElements} - \${(masteredElements/totalElements*100).toFixed(0)}%)</p>
        \`;
        infoBanner.classList.remove("hidden");
      }
    }
    
    document.addEventListener("DOMContentLoaded", async () => {
      await initDB();
      
      // Preload all device data
      await preloadDeviceData();

      document.querySelectorAll(".device-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          document.querySelectorAll(".device-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          currentDevice = btn.dataset.geraet;
          await loadDeviceData(currentDevice);
        });
      });

      document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          currentMode = btn.dataset.mode;
          currentFilter = "Alle";
          renderFilters();
          await renderContent();
        });
      });

      // Add event listener for progress buttons
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("progress-button")) {
          const id = e.target.dataset.id;
          cycleProgressState(id);
        }
      });

      // Add event listeners for backup buttons
      document.getElementById("backup-save").addEventListener("click", saveBackup);
      document.getElementById("backup-load").addEventListener("click", loadBackup);

      // Add event listener for offline export button
      document.getElementById("btn-export-offline").addEventListener("click", exportStandaloneApp);

      await loadDeviceData(currentDevice);
    });
    
    // Backup functions
    async function saveBackup() {
      try {
        // Get all photos from IndexedDB
        const photos = {};
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAllKeys();
        
        const photoKeys = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        for (const key of photoKeys) {
          const photoData = await getPhoto(key);
          if (photoData) {
            photos[key] = photoData;
          }
        }
        
        // Get progress data from localStorage
        const progressData = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
        
        // Create backup object
        const backupData = {
          fotos: photos,
          ntb_progress: progressData
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ntb-turnen-backup.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        alert("Backup erfolgreich gespeichert!");
      } catch (error) {
        console.error('Fehler beim Speichern des Backups:', error);
        alert('Fehler beim Speichern des Backups: ' + error.message);
      }
    }
    
    async function loadBackup() {
      try {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const backupData = JSON.parse(event.target.result);
              
              // Restore photos to IndexedDB
              if (backupData.fotos) {
                for (const [key, dataUrl] of Object.entries(backupData.fotos)) {
                  await savePhoto(key, dataUrl);
                }
              }
              
              // Restore progress data to localStorage
              if (backupData.ntb_progress) {
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(backupData.ntb_progress));
              }
              
              alert("Backup erfolgreich geladen! Die Ansicht wird neu geladen.");
              await renderContent();
            } catch (error) {
              console.error('Fehler beim Laden des Backups:', error);
              alert('Fehler beim Laden des Backups: ' + error.message);
            }
          };
          
          reader.onerror = () => {
            alert('Fehler beim Lesen der Datei');
          };
          
          reader.readAsText(file);
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      } catch (error) {
        console.error('Fehler beim Laden des Backups:', error);
        alert('Fehler beim Laden des Backups: ' + error.message);
      }
    }
    
  </script>
</body>
</html>`;
    
    // Check that no external references remain
    if (htmlContent.includes('<script src="app.js">') || htmlContent.includes('<link rel="stylesheet" href="style.css">')) {
      throw new Error("External references found in generated HTML");
    }
    
    // Create a Blob and download it as a file instead of using data: URL
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    alert('Offline-Modus aktiviert! Die App wird heruntergeladen und kann offline verwendet werden.');
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NTB-Turnen-Offline.html';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Error exporting standalone app:', error);
    alert('Fehler beim Exportieren der Offline-App: ' + error.message);
  }
}

// Helper function to download file
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
