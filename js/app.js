/**
 * Rheingrün Festival 2026 - Main Application Logic
 * PWA, Responsive Timetable, Real-time Now-Line, Time Simulator & Favorites
 */

import { FESTIVAL_CONFIG, SCHEDULE_DATA } from "./schedule-data.js";

class RheingruenApp {
  constructor() {
    this.config = FESTIVAL_CONFIG;
    this.data = SCHEDULE_DATA;

    // Application State
    this.currentDay = this.detectInitialDay();
    this.stageFilter = "all"; // "all" | "mainstage" | "f2f" | "hidden"
    this.viewMode = "grid";   // "grid" | "list"
    this.searchQuery = "";
    this.onlyFavorites = false;
    
    // Favorites (persisted in localStorage)
    this.favorites = this.loadFavorites();

    // Time & Simulation State
    const deviceMinutes = this.calculateCurrentMinutes();
    const isWithinFestivalHours = deviceMinutes >= (this.config.startHour * 60) && deviceMinutes <= (this.config.endHour * 60);
    this.simulationActive = !isWithinFestivalHours; // Auto-activate demo if opened at night/morning
    this.simulatedMinutes = 930; // 15:30
    this.nowMinutes = this.simulationActive ? this.simulatedMinutes : deviceMinutes;

    // Cache DOM Elements
    this.initDOMElements();

    // Setup Event Listeners
    this.initEventListeners();

    // Initialize UI
    this.initTimelineGrid();
    this.render();
    this.updateLiveIndicator();

    // Live Clock Interval (every 10 seconds)
    setInterval(() => {
      this.nowMinutes = this.calculateCurrentMinutes();
      this.updateLiveIndicator();
    }, 10000);

    // Check first-visit disclaimer
    this.checkDisclaimer();

    // Register Service Worker for PWA
    this.initServiceWorker();
    this.initPWAInstallPrompt();
  }

  // --------------------------------------------------------------------------
  // Initialization & Helpers
  // --------------------------------------------------------------------------
  detectInitialDay() {
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get("day");
    if (dayParam === "saturday" || dayParam === "sunday") {
      return dayParam;
    }

    // Auto-detect based on current real date
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    if (isoDate === this.config.dates.sunday) {
      return "sunday";
    }
    return "saturday";
  }

  initDOMElements() {
    // Header & Controls
    this.btnJumpNow = document.getElementById("btn-jump-now");
    this.headerNowBadge = document.getElementById("header-now-badge");
    this.btnFavFilter = document.getElementById("btn-fav-filter");
    this.favCountBadge = document.getElementById("fav-count-badge");
    this.btnPwaInstall = document.getElementById("btn-pwa-install");

    // Info Modal Sheet
    this.infoModal = document.getElementById("info-modal");
    this.infoModalBackdrop = document.getElementById("info-modal-backdrop");
    this.infoModalCloseBtn = document.getElementById("info-modal-close-btn");

    // First-Visit Disclaimer
    this.disclaimerModal = document.getElementById("disclaimer-modal");
    this.btnDismissDisclaimer = document.getElementById("btn-dismiss-disclaimer");

    // Day & View Navigation
    this.tabSaturday = document.getElementById("tab-saturday");
    this.tabSunday = document.getElementById("tab-sunday");
    this.btnViewGrid = document.getElementById("view-grid-btn");
    this.btnViewList = document.getElementById("view-list-btn");

    // Search
    this.artistSearch = document.getElementById("artist-search");
    this.searchClear = document.getElementById("search-clear");
    this.filterStatusHint = document.getElementById("filter-status-hint");
    this.filterHintText = document.getElementById("filter-hint-text");
    this.btnResetFilters = document.getElementById("btn-reset-filters");

    // Viewports
    this.timetableViewport = document.getElementById("timetable-viewport");
    this.gridViewContainer = document.getElementById("grid-view-container");
    this.listViewContainer = document.getElementById("list-view-container");
    this.emptyState = document.getElementById("empty-state");
    this.emptyResetBtn = document.getElementById("empty-reset-btn");

    // Grid Track Elements
    this.stageHeadersTrack = document.getElementById("stage-headers-track");
    this.stageHeadersList = document.getElementById("stage-headers-list");
    this.timetableBody = document.getElementById("timetable-body");
    this.timeAxisColumn = document.getElementById("time-axis-column");
    this.stagesColumnsContainer = document.getElementById("stages-columns-container");
    this.stagesScrollContent = document.getElementById("stages-scroll-content");
    this.gridBackgroundLines = document.getElementById("grid-background-lines");
    this.stagesGridColumns = document.getElementById("stages-grid-columns");
    this.nowIndicatorLine = document.getElementById("now-indicator-line");
    this.nowLineText = document.getElementById("now-line-text");

    // List Container
    this.listCardsWrapper = document.getElementById("list-cards-wrapper");

    // Modal Sheet
    this.actModal = document.getElementById("act-modal");
    this.modalBackdrop = document.getElementById("modal-backdrop");
    this.modalCloseBtn = document.getElementById("modal-close-btn");
    this.modalStageBadge = document.getElementById("modal-stage-badge");
    this.modalArtist = document.getElementById("modal-artist");
    this.modalTime = document.getElementById("modal-time");
    this.modalDuration = document.getElementById("modal-duration");
    this.modalLivePill = document.getElementById("modal-live-pill");
    this.modalStatusIcon = document.getElementById("modal-status-icon");
    this.modalStatusText = document.getElementById("modal-status-text");
    this.modalClashWarning = document.getElementById("modal-clash-warning");
    this.modalClashText = document.getElementById("modal-clash-text");
    this.modalFavBtn = document.getElementById("modal-fav-btn");
    this.modalFavText = document.getElementById("modal-fav-text");

    // iOS Toast
    this.iosInstallToast = document.getElementById("ios-install-toast");
    this.iosToastClose = document.getElementById("ios-toast-close");
  }

  // --------------------------------------------------------------------------
  // Time Computation Utilities
  // --------------------------------------------------------------------------
  timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  getDurationMinutes(start, end) {
    return this.timeToMinutes(end) - this.timeToMinutes(start);
  }

  calculateCurrentMinutes() {
    if (this.simulationActive) {
      return this.simulatedMinutes;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  getTimelineY(minutes) {
    const offset = minutes - this.config.startHour * 60;
    return offset * this.config.pxPerMinute;
  }

  // --------------------------------------------------------------------------
  // Grid Initialization (Static Elements)
  // --------------------------------------------------------------------------
  initTimelineGrid() {
    const startMins = this.config.startHour * 60; // 660 (11:00)
    const endMins = this.config.endHour * 60;     // 1380 (23:00)
    const totalMinutes = endMins - startMins;
    const totalHeight = totalMinutes * this.config.pxPerMinute;

    // Set height on timetable containers
    this.timeAxisColumn.style.height = `${totalHeight}px`;
    this.stagesColumnsContainer.style.height = `${totalHeight}px`;
    if (this.stagesScrollContent) {
      this.stagesScrollContent.style.height = `${totalHeight}px`;
    }

    // Render Time Axis Ticks & Horizontal Grid Lines (every 30 mins)
    this.timeAxisColumn.innerHTML = "";
    this.gridBackgroundLines.innerHTML = "";

    for (let m = startMins; m <= endMins; m += 30) {
      const topPx = (m - startMins) * this.config.pxPerMinute;
      const isHour = m % 60 === 0;
      const timeStr = this.minutesToTime(m);

      // Axis Tick
      const tick = document.createElement("div");
      tick.className = `time-axis-tick ${isHour ? "hour" : "half"}`;
      tick.style.top = `${topPx}px`;
      tick.textContent = timeStr;
      this.timeAxisColumn.appendChild(tick);

      // Background Line
      const line = document.createElement("div");
      line.className = `grid-line ${isHour ? "hour" : "half"}`;
      line.style.top = `${topPx}px`;
      this.gridBackgroundLines.appendChild(line);
    }
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------
  initEventListeners() {
    // Synchronize Horizontal Scroll between Stage Headers and Stages Body
    let isSyncingBody = false;
    let isSyncingHeaders = false;
    this.stagesColumnsContainer.addEventListener("scroll", () => {
      if (!isSyncingHeaders) {
        isSyncingBody = true;
        this.stageHeadersList.scrollLeft = this.stagesColumnsContainer.scrollLeft;
      }
      isSyncingHeaders = false;
    }, { passive: true });

    this.stageHeadersList.addEventListener("scroll", () => {
      if (!isSyncingBody) {
        isSyncingHeaders = true;
        this.stagesColumnsContainer.scrollLeft = this.stageHeadersList.scrollLeft;
      }
      isSyncingBody = false;
    }, { passive: true });

    // Day Tabs
    this.tabSaturday.addEventListener("click", () => this.setDay("saturday"));
    this.tabSunday.addEventListener("click", () => this.setDay("sunday"));

    // View Switcher (Grid vs List)
    this.btnViewGrid.addEventListener("click", () => this.setViewMode("grid"));
    this.btnViewList.addEventListener("click", () => this.setViewMode("list"));

    // Favorites Filter
    this.btnFavFilter.addEventListener("click", () => {
      this.onlyFavorites = !this.onlyFavorites;
      this.btnFavFilter.classList.toggle("active", this.onlyFavorites);
      this.render();
    });

    // Jump to Now
    this.btnJumpNow.addEventListener("click", (e) => {
      e.currentTarget.blur();
      this.jumpToNow();
    });

    // Search Input
    this.artistSearch.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.searchClear.classList.toggle("hidden", this.searchQuery.length === 0);
      this.render();
    });

    this.searchClear.addEventListener("click", () => {
      this.artistSearch.value = "";
      this.searchQuery = "";
      this.searchClear.classList.add("hidden");
      this.render();
    });

    this.btnResetFilters.addEventListener("click", () => this.resetFilters());
    this.emptyResetBtn.addEventListener("click", () => this.resetFilters());

    // Modal Sheet Handlers
    this.modalCloseBtn.addEventListener("click", () => this.closeModal());
    this.modalBackdrop.addEventListener("click", () => this.closeModal());

    // Festival Info Sheet Handlers
    if (this.btnInfoSheet) {
      this.btnInfoSheet.addEventListener("click", () => this.openInfoModal());
    }
    if (this.infoModalCloseBtn) {
      this.infoModalCloseBtn.addEventListener("click", () => this.closeInfoModal());
    }
    if (this.infoModalBackdrop) {
      this.infoModalBackdrop.addEventListener("click", () => this.closeInfoModal());
    }

    // First-Visit Disclaimer Button
    if (this.btnDismissDisclaimer) {
      this.btnDismissDisclaimer.addEventListener("click", () => this.dismissDisclaimer());
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
        this.closeInfoModal();
      }
    });

    window.addEventListener("resize", () => this.updateGridWidth(), { passive: true });
    window.addEventListener("orientationchange", () => this.updateGridWidth(), { passive: true });
  }

  // --------------------------------------------------------------------------
  // State Setters
  // --------------------------------------------------------------------------
  setDay(day) {
    if (this.currentDay === day) return;
    this.currentDay = day;
    this.tabSaturday.classList.toggle("active", day === "saturday");
    this.tabSunday.classList.toggle("active", day === "sunday");
    
    // Update URL parameter without reload
    const url = new URL(window.location);
    url.searchParams.set("day", day);
    window.history.replaceState({}, "", url);

    this.render();
    this.updateLiveIndicator();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.btnViewGrid.classList.toggle("active", mode === "grid");
    this.btnViewList.classList.toggle("active", mode === "list");

    if (mode === "grid") {
      this.gridViewContainer.classList.remove("hidden");
      this.listViewContainer.classList.add("hidden");
    } else {
      this.gridViewContainer.classList.add("hidden");
      this.listViewContainer.classList.remove("hidden");
    }
    this.render();
  }

  resetFilters() {
    this.onlyFavorites = false;
    this.btnFavFilter.classList.remove("active");
    this.searchQuery = "";
    this.artistSearch.value = "";
    this.searchClear.classList.add("hidden");
    this.render();
  }

  // --------------------------------------------------------------------------
  // Favorites Management
  // --------------------------------------------------------------------------
  loadFavorites() {
    try {
      const stored = localStorage.getItem("rg_favorites_2026");
      if (!stored) return new Set();
      const rawList = JSON.parse(stored);
      if (!Array.isArray(rawList)) return new Set();

      // Migration map for older slot-based IDs (sat-m-1 -> sat-saika etc.)
      const LEGACY_ID_MAP = {
        "sat-m-1": "sat-saika",
        "sat-m-2": "sat-lola-cerise-gustav-organo",
        "sat-m-3": "sat-dasstudach",
        "sat-m-4": "sat-kander",
        "sat-m-5": "sat-ush-slvl",
        "sat-m-6": "sat-vieze-asbak",
        "sat-m-7": "sat-natte-visstick-jowi",
        "sat-f-1": "sat-dj-blush-lensch",
        "sat-f-2": "sat-rot-ton-dj-sexstasy",
        "sat-f-3": "sat-dj-hyperdrive-laure-croft",
        "sat-f-4": "sat-elli-acula-mac-declos",
        "sat-f-5": "sat-alarico-shdw",
        "sat-f-6": "sat-future-666-fenim0re",
        "sat-h-1": "sat-antigen-lilli-4love",
        "sat-h-2": "sat-the-muffin-man-alycia-bezgo",
        "sat-h-3": "sat-trancemaster-krause-bixbita",
        "sat-h-4": "sat-davyboi-peterblue",
        "sat-h-5": "sat-mika-heggemann-cleopard2000",
        "sun-m-1": "sun-ponti",
        "sun-m-2": "sun-kotorri",
        "sun-m-3": "sun-schrotthagen",
        "sun-m-4": "sun-nicolas-julian",
        "sun-m-5": "sun-nikolina",
        "sun-m-6": "sun-vendex",
        "sun-m-7": "sun-jazzy",
        "sun-m-8": "sun-surprise-closing",
        "sun-f-1": "sun-dvaid-relajadita",
        "sun-f-2": "sun-wilderich-zwilling",
        "sun-f-3": "sun-l-zwo-antonym",
        "sun-f-4": "sun-noise-mafia-fenrick",
        "sun-f-5": "sun-cloudy-serafina",
        "sun-f-6": "sun-adrian-mills-prada2000",
        "sun-h-1": "sun-tamara-wirth",
        "sun-h-2": "sun-dj-swisherman",
        "sun-h-3": "sun-frederic-stef-de-haan",
        "sun-h-4": "sun-aerea",
        "sun-h-5": "sun-dax-j"
      };

      let migrated = false;
      const cleanList = rawList.map(id => {
        if (LEGACY_ID_MAP[id]) {
          migrated = true;
          return LEGACY_ID_MAP[id];
        }
        return id;
      });

      if (migrated) {
        localStorage.setItem("rg_favorites_2026", JSON.stringify(cleanList));
      }

      return new Set(cleanList);
    } catch {
      return new Set();
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem("rg_favorites_2026", JSON.stringify(Array.from(this.favorites)));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }

  toggleFavorite(actId) {
    if (this.favorites.has(actId)) {
      this.favorites.delete(actId);
    } else {
      this.favorites.add(actId);
    }
    this.saveFavorites();
    this.updateFavoritesCount();
    this.render();

    // If modal is open for this act, update button state
    if (this.currentModalAct && this.currentModalAct.id === actId) {
      this.updateModalFavBtn(actId);
    }
  }

  updateFavoritesCount() {
    const count = this.favorites.size;
    if (count > 0) {
      this.favCountBadge.textContent = count;
      this.favCountBadge.classList.remove("hidden");
    } else {
      this.favCountBadge.classList.add("hidden");
    }
  }

  // --------------------------------------------------------------------------
  // Main Render Routine
  // --------------------------------------------------------------------------
  render() {
    this.updateFavoritesCount();
    this.updateFilterHints();

    const activeStages = this.getActiveStages();
    let totalVisibleActs = 0;

    if (this.viewMode === "grid") {
      totalVisibleActs = this.renderGridView(activeStages);
    } else {
      totalVisibleActs = this.renderListView(activeStages);
    }

    // Empty state display
    if (totalVisibleActs === 0) {
      this.emptyState.classList.remove("hidden");
      if (this.viewMode === "grid") {
        this.stagesGridColumns.style.display = "none";
      } else {
        this.listCardsWrapper.style.display = "none";
      }
    } else {
      this.emptyState.classList.add("hidden");
      if (this.viewMode === "grid") {
        this.stagesGridColumns.style.display = "flex";
      } else {
        this.listCardsWrapper.style.display = "flex";
      }
    }
  }

  getActiveStages() {
    return this.config.stages;
  }

  updateFilterHints() {
    const hints = [];
    if (this.onlyFavorites) hints.push("Nur Favoriten");
    if (this.searchQuery) hints.push(`Suche: "${this.searchQuery}"`);

    if (hints.length > 0) {
      this.filterHintText.textContent = `Filter aktiv: ${hints.join(" · ")}`;
      this.filterStatusHint.classList.remove("hidden");
    } else {
      this.filterStatusHint.classList.add("hidden");
    }
  }

  // --------------------------------------------------------------------------
  // Render: Grid / Timetable View
  // --------------------------------------------------------------------------
  renderGridView(activeStages) {
    this.stageHeadersList.innerHTML = "";
    this.stagesGridColumns.innerHTML = "";

    const daySchedule = this.data[this.currentDay];
    let totalActsRendered = 0;

    activeStages.forEach((stage) => {
      const stageActs = daySchedule[stage.id] || [];
      const filteredActs = stageActs.filter((act) => this.filterAct(act));
      totalActsRendered += filteredActs.length;

      // 1. Stage Header in Sticky Track
      const headerItem = document.createElement("div");
      headerItem.className = `stage-header-item header-${stage.id}`;
      headerItem.innerHTML = `
        <span class="stage-header-name">${stage.name}</span>
        <span class="stage-header-count">${filteredActs.length} ${filteredActs.length === 1 ? "Act" : "Acts"}</span>
      `;
      this.stageHeadersList.appendChild(headerItem);

      // 2. Stage Column in Swimlane Body
      const stageCol = document.createElement("div");
      stageCol.className = `stage-column col-${stage.id}`;

      filteredActs.forEach((act) => {
        const startMin = this.timeToMinutes(act.start);
        const endMin = this.timeToMinutes(act.end);
        const durationMin = endMin - startMin;

        const topPx = this.getTimelineY(startMin);
        const heightPx = Math.max(36, durationMin * this.config.pxPerMinute - 4); // 4px visual gap

        const isLive = this.isActLive(act);
        const isFav = this.favorites.has(act.id);

        const card = document.createElement("div");
        card.className = `act-card ${isLive ? "is-live" : ""} ${isFav ? "is-favorite" : ""}`;
        card.dataset.stage = stage.id;
        card.dataset.actId = act.id;
        card.style.top = `${topPx}px`;
        card.style.height = `${heightPx}px`;

        card.innerHTML = `
          <div class="card-header">
            <div class="card-time-wrap">
              <span class="card-time">${act.start}–${act.end}</span>
              ${isLive ? `<span class="card-live-pill">LIVE</span>` : ""}
            </div>
            <button class="card-fav-btn ${isFav ? "favorited" : ""}" data-act-id="${act.id}" title="Favorit" aria-label="Favorit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="${isFav ? "#FF4B6E" : "none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="card-body">
            <div class="card-artist">${act.artist}</div>
            ${act.isSpecial ? `<span class="card-special-badge">Special Closing</span>` : ""}
            ${act.isLive ? `<span class="card-special-badge" style="color:#60EFFF;border-color:#60EFFF;">LIVE SET</span>` : ""}
          </div>

          <div class="card-footer">
            <span class="card-duration">${durationMin} Min.</span>
            <span class="card-stage-tag" style="color:${stage.color};">${stage.name}</span>
          </div>
        `;

        // Card Click -> Open Detail Sheet
        card.addEventListener("click", (e) => {
          if (e.target.closest(".card-fav-btn")) return;
          this.openModal(act);
        });

        // Fav Button Click
        const favBtn = card.querySelector(".card-fav-btn");
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleFavorite(act.id);
        });

        stageCol.appendChild(card);
      });

      this.stagesGridColumns.appendChild(stageCol);
    });

    this.updateGridWidth();
    return totalActsRendered;
  }

  // --------------------------------------------------------------------------
  // Render: List View
  // --------------------------------------------------------------------------
  renderListView(activeStages) {
    this.listCardsWrapper.innerHTML = "";

    const daySchedule = this.data[this.currentDay];
    const allActs = [];

    activeStages.forEach((stage) => {
      const acts = daySchedule[stage.id] || [];
      acts.forEach((act) => {
        if (this.filterAct(act)) {
          allActs.push({ ...act, stageConfig: stage });
        }
      });
    });

    // Sort chronologically by start time
    allActs.sort((a, b) => {
      const diff = this.timeToMinutes(a.start) - this.timeToMinutes(b.start);
      if (diff !== 0) return diff;
      return a.stageConfig.name.localeCompare(b.stageConfig.name);
    });

    allActs.forEach((act) => {
      const isLive = this.isActLive(act);
      const isFav = this.favorites.has(act.id);
      const durationMin = this.getDurationMinutes(act.start, act.end);

      const card = document.createElement("div");
      card.className = `list-item-card ${isLive ? "is-live" : ""}`;
      card.dataset.stage = act.stage;

      card.innerHTML = `
        <div class="list-time-block">
          <span class="list-time">${act.start} – ${act.end}</span>
          <span class="list-duration">${durationMin} Min.${isLive ? ' · <strong style="color:var(--neon-green)">JETZT</strong>' : ''}</span>
        </div>

        <div class="list-info-block">
          <div class="list-artist-title">${act.artist}</div>
          <span class="list-stage-label ${act.stage}">${act.stageConfig.name}</span>
          ${act.isSpecial ? ` <span class="card-special-badge">Special Closing</span>` : ""}
        </div>

        <button class="card-fav-btn ${isFav ? "favorited" : ""}" data-act-id="${act.id}" title="Favorit">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="${isFav ? "#FF4B6E" : "none"}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".card-fav-btn")) return;
        this.openModal(act);
      });

      const favBtn = card.querySelector(".card-fav-btn");
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleFavorite(act.id);
      });

      this.listCardsWrapper.appendChild(card);
    });

    return allActs.length;
  }

  // --------------------------------------------------------------------------
  // Filtering Logic
  // --------------------------------------------------------------------------
  filterAct(act) {
    if (this.onlyFavorites && !this.favorites.has(act.id)) {
      return false;
    }
    if (this.searchQuery) {
      const matchArtist = act.artist.toLowerCase().includes(this.searchQuery);
      const matchStage = act.stageName.toLowerCase().includes(this.searchQuery);
      if (!matchArtist && !matchStage) {
        return false;
      }
    }
    return true;
  }

  isActLive(act) {
    const currentMins = this.nowMinutes;
    const startMins = this.timeToMinutes(act.start);
    const endMins = this.timeToMinutes(act.end);

    // If simulation active: live on current displayed day
    if (this.simulationActive) {
      return currentMins >= startMins && currentMins < endMins;
    }

    // In preview/testing outside festival dates, allow viewing current time of day on the timetable
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    const festivalDayIso = this.config.dates[this.currentDay];
    
    // If on actual festival day, or if testing before festival
    if (isoDate === festivalDayIso || !this.isActualFestivalWeekend()) {
      return currentMins >= startMins && currentMins < endMins;
    }

    return false;
  }

  isActualFestivalWeekend() {
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];
    return isoDate === this.config.dates.saturday || isoDate === this.config.dates.sunday;
  }

  // --------------------------------------------------------------------------
  // Update Scroll Track & Indicator Width
  // --------------------------------------------------------------------------
  updateGridWidth() {
    requestAnimationFrame(() => {
      if (!this.stagesGridColumns || !this.nowIndicatorLine) return;
      const fullWidth = Math.max(
        this.stagesGridColumns.scrollWidth,
        this.stagesGridColumns.offsetWidth,
        this.stagesColumnsContainer ? this.stagesColumnsContainer.scrollWidth : 0
      );
      if (fullWidth > 0) {
        const pxStr = `${fullWidth}px`;
        if (this.stagesScrollContent) {
          this.stagesScrollContent.style.width = pxStr;
        }
        this.nowIndicatorLine.style.width = pxStr;
        if (this.gridBackgroundLines) {
          this.gridBackgroundLines.style.width = pxStr;
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Live Now Indicator Line
  // --------------------------------------------------------------------------
  updateLiveIndicator() {
    const currentMins = this.nowMinutes;
    const timeFormatted = this.minutesToTime(currentMins);

    // Update Header Badges
    this.headerNowBadge.textContent = timeFormatted;
    this.nowLineText.textContent = timeFormatted;

    const startMins = this.config.startHour * 60;
    const endMins = this.config.endHour * 60;

    // Check if line falls within 11:00 - 23:00
    const isInFestivalHours = currentMins >= startMins && currentMins <= endMins;

    // Show line when within festival hours
    const showLine = isInFestivalHours;

    if (showLine) {
      const topPx = this.getTimelineY(currentMins);
      this.nowIndicatorLine.style.display = "flex";
      this.nowIndicatorLine.style.top = `${topPx}px`;
      this.updateGridWidth();
    } else {
      this.nowIndicatorLine.style.display = "none";
    }
  }

  // --------------------------------------------------------------------------
  // "Jump to Now" Smooth Scroll
  // --------------------------------------------------------------------------
  jumpToNow() {
    // Blur button and trigger brief click feedback
    if (this.btnJumpNow) {
      this.btnJumpNow.blur();
      this.btnJumpNow.classList.add("is-pressed");
      setTimeout(() => {
        if (this.btnJumpNow) this.btnJumpNow.classList.remove("is-pressed");
      }, 300);
    }

    const currentMins = this.nowMinutes;
    const startMins = this.config.startHour * 60;
    const endMins = this.config.endHour * 60;

    // Switch to grid view if not in grid
    if (this.viewMode !== "grid") {
      this.setViewMode("grid");
    }

    // If outside hours or not on active day, scroll to festival start
    let targetMins = currentMins;
    if (targetMins < startMins || targetMins > endMins) {
      targetMins = startMins;
    }

    const topPx = this.getTimelineY(targetMins);
    const viewportHeight = this.timetableBody.clientHeight;
    const scrollToY = Math.max(0, topPx - viewportHeight / 2.5);

    this.timetableBody.scrollTo({
      top: scrollToY,
      behavior: "smooth"
    });

    // Visual pulse highlight that cleanly fades out automatically
    if (this.nowIndicatorLine) {
      this.nowIndicatorLine.classList.remove("pulse-highlight");
      void this.nowIndicatorLine.offsetWidth; // Force reflow to restart animation
      this.nowIndicatorLine.classList.add("pulse-highlight");
      setTimeout(() => {
        if (this.nowIndicatorLine) {
          this.nowIndicatorLine.classList.remove("pulse-highlight");
          this.nowIndicatorLine.style.filter = "";
        }
      }, 1200);
    }
  }

  // --------------------------------------------------------------------------
  // Act Details Modal & Clash Detection
  // --------------------------------------------------------------------------
  openModal(act) {
    this.currentModalAct = act;
    const stageConfig = this.config.stages.find((s) => s.id === act.stage) || {};

    // Header Details
    this.modalStageBadge.textContent = act.stageName;
    this.modalStageBadge.style.backgroundColor = stageConfig.badgeBg || "rgba(0,255,135,0.15)";
    this.modalStageBadge.style.color = stageConfig.color || "#00FF87";

    this.modalArtist.textContent = act.artist;
    this.modalTime.textContent = `${act.start} – ${act.end}`;
    const durationMin = this.getDurationMinutes(act.start, act.end);
    this.modalDuration.textContent = `(${durationMin} Min.)`;

    const isLive = this.isActLive(act);
    this.modalLivePill.classList.toggle("hidden", !isLive);

    // Status / Countdown
    const currentMins = this.nowMinutes;
    const startMins = this.timeToMinutes(act.start);
    const endMins = this.timeToMinutes(act.end);

    if (isLive) {
      const remaining = endMins - currentMins;
      this.modalStatusIcon.textContent = "🔊";
      this.modalStatusText.textContent = `Spielt JETZT! Noch ${remaining} Minuten (bis ${act.end} Uhr)`;
    } else if (currentMins < startMins) {
      const diff = startMins - currentMins;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      let diffStr = "";
      if (hours > 0) diffStr += `${hours} Std. `;
      diffStr += `${mins} Min.`;

      this.modalStatusIcon.textContent = "⏳";
      this.modalStatusText.textContent = `Startet in ${diffStr} (um ${act.start} Uhr)`;
    } else {
      this.modalStatusIcon.textContent = "✓";
      this.modalStatusText.textContent = `Dieses Set ist bereits beendet.`;
    }

    // Clash Detection with user's other favorites
    this.checkClashes(act);

    // Favorite Button State
    this.updateModalFavBtn(act.id);
    this.modalFavBtn.onclick = () => this.toggleFavorite(act.id);

    // Open Modal
    this.actModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  checkClashes(currentAct) {
    const curStart = this.timeToMinutes(currentAct.start);
    const curEnd = this.timeToMinutes(currentAct.end);

    const daySchedule = this.data[this.currentDay];
    const clashes = [];

    Object.values(daySchedule).forEach((stageActs) => {
      stageActs.forEach((act) => {
        if (act.id !== currentAct.id && this.favorites.has(act.id)) {
          const aStart = this.timeToMinutes(act.start);
          const aEnd = this.timeToMinutes(act.end);

          // Overlap condition: max(start1, start2) < min(end1, end2)
          if (Math.max(curStart, aStart) < Math.min(curEnd, aEnd)) {
            clashes.push(`${act.artist} (${act.stageName}, ${act.start}–${act.end})`);
          }
        }
      });
    });

    if (clashes.length > 0) {
      this.modalClashText.textContent = `Kollidiert mit deinem Favoriten: ${clashes.join(" und ")}`;
      this.modalClashWarning.classList.remove("hidden");
    } else {
      this.modalClashWarning.classList.add("hidden");
    }
  }

  updateModalFavBtn(actId) {
    const isFav = this.favorites.has(actId);
    this.modalFavBtn.classList.toggle("active", isFav);
    this.modalFavText.textContent = isFav ? "In meinen Favoriten gespeichert ✓" : "Zu meinen Favoriten hinzufügen";
  }

  closeModal() {
    this.actModal.classList.add("hidden");
    document.body.style.overflow = "";
    this.currentModalAct = null;
  }

  openInfoModal() {
    if (this.infoModal) {
      this.infoModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  closeInfoModal() {
    if (this.infoModal) {
      this.infoModal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  // --------------------------------------------------------------------------
  // First-Visit Disclaimer
  // --------------------------------------------------------------------------
  checkDisclaimer() {
    try {
      const isDismissed = localStorage.getItem("rg_disclaimer_dismissed");
      if (!isDismissed && this.disclaimerModal) {
        this.disclaimerModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    } catch (e) {
      console.warn("Could not check disclaimer", e);
    }
  }

  dismissDisclaimer() {
    try {
      localStorage.setItem("rg_disclaimer_dismissed", "true");
    } catch (e) {
      console.warn("Could not save disclaimer preference", e);
    }
    if (this.disclaimerModal) {
      this.disclaimerModal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  // --------------------------------------------------------------------------
  // PWA Service Worker & Install Prompt
  // --------------------------------------------------------------------------
  initServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => {
            console.log("[PWA] ServiceWorker registered with scope:", reg.scope);
            // Proactively check for new version on GitHub
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.warn("[PWA] ServiceWorker registration failed:", err);
          });
      });
    }
  }

  initPWAInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.btnPwaInstall.classList.remove("hidden");

      this.btnPwaInstall.addEventListener("click", async () => {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`[PWA] Install prompt outcome: ${outcome}`);
        this.deferredPrompt = null;
        this.btnPwaInstall.classList.add("hidden");
      });
    });

    // iOS Detection
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    let isDismissed = false;
    try {
      isDismissed = localStorage.getItem("rg_ios_prompt_dismissed") === "true";
    } catch (e) {}

    if (isIos && !isStandalone && !isDismissed) {
      setTimeout(() => {
        try {
          if (localStorage.getItem("rg_ios_prompt_dismissed") !== "true") {
            this.iosInstallToast?.classList.remove("hidden");
          }
        } catch (e) {}
      }, 2000);
    }

    if (this.iosToastClose) {
      this.iosToastClose.addEventListener("click", (e) => {
        e.stopPropagation();
        this.iosInstallToast?.classList.add("hidden");
        try {
          localStorage.setItem("rg_ios_prompt_dismissed", "true");
        } catch (err) {}
      });
    }
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.rheingruenApp = new RheingruenApp();
});
