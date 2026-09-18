/**
 * Rheingrün Festival 2026 - Main Application Logic
 * PWA, Responsive Timetable, Real-time Now-Line, Time Simulator & Favorites
 */

import { FESTIVAL_CONFIG, SCHEDULE_DATA } from "./schedule-data.js";

class RheingruenApp {
  constructor() {
    this.config = FESTIVAL_CONFIG;
    this.data = SCHEDULE_DATA;

    // Fast O(1) Act Lookup Map
    this.actsById = new Map();
    Object.entries(this.data).forEach(([dayId, stages]) => {
      Object.values(stages).forEach((acts) => {
        acts.forEach((act) => {
          if (!act.day) act.day = dayId;
          this.actsById.set(act.id, act);
        });
      });
    });

    // Application State
    this.currentDay = this.detectInitialDay();
    this.viewMode = "grid";   // "grid" | "list"
    this.searchQuery = "";
    this.onlyFavorites = false;
    
    // Favorites (persisted in localStorage)
    this.favorites = this.loadFavorites();

    // Time & Clock State (Always reflect real current device time of day)
    this.nowMinutes = this.calculateCurrentMinutes();

    // Cache DOM Elements
    this.initDOMElements();

    // Setup Event Listeners
    this.initEventListeners();

    // Initialize Active Tab & Navigation UI
    this.updatePillsUI(this.currentDay);

    // Initialize UI
    this.initTimelineGrid();
    this.render();
    this.updateLiveIndicator();

    // Auto-scroll to current live/simulated time on initial load
    setTimeout(() => {
      this.jumpToNow(true, true);
    }, 150);

    // Live Clock Interval (every 10 seconds)
    setInterval(() => {
      this.nowMinutes = this.calculateCurrentMinutes();
      this.updateLiveIndicator();
      this.updateLiveCards();
    }, 10000);

    // Check first-visit disclaimer
    this.checkDisclaimer();

    // Check In-App Browser Notice
    this.initInAppBrowserNotice();

    // Register Service Worker for PWA
    this.initServiceWorker();
    this.initPWAInstallPrompt();
  }

  // --------------------------------------------------------------------------
  // Initialization & Helpers
  // --------------------------------------------------------------------------
  getCurrentDayConfig() {
    return this.config.days.find((d) => d.id === this.currentDay) || this.config.days[0];
  }

  getCurrentStages() {
    return this.getCurrentDayConfig().stages || this.config.stages;
  }

  getLocalDateIso(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  detectInitialDay() {
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get("day");
    const validDays = ["saturday", "sunday", "friday_pre", "saturday_after"];
    if (validDays.includes(dayParam)) {
      return dayParam;
    }

    // Auto-detect based on current real local date and time
    const now = new Date();
    const localIsoDate = this.getLocalDateIso(now);
    const hour = now.getHours();

    // 1. Friday (2026-09-18): Pre-Party @ Gotec (starts 22:00)
    if (localIsoDate === this.config.dates.friday_pre) {
      return "friday_pre";
    }

    // 2. Saturday (2026-09-19):
    if (localIsoDate === this.config.dates.saturday) {
      // 00:00 - 06:00: Friday Pre-Party is still in full swing at Gotec!
      if (hour < 6) {
        return "friday_pre";
      }
      // 06:00 - 22:00: Main Saturday Open-Air Festival
      if (hour < 22) {
        return "saturday";
      }
      // 22:00 onwards: Saturday Official Aftershow @ Gotec & Elfino
      return "saturday_after";
    }

    // 3. Sunday (2026-09-20):
    if (localIsoDate === this.config.dates.sunday) {
      // 00:00 - 09:00: Saturday Aftershow is still ongoing at Gotec
      if (hour < 9) {
        return "saturday_after";
      }
      // 09:00 onwards: Sunday Festival
      return "sunday";
    }

    // Default outside festival weekend: Saturday (main open-air festival day)
    return "saturday";
  }

  initDOMElements() {
    // Header & Controls
    this.btnJumpNow = document.getElementById("btn-jump-now");
    this.headerNowBadge = document.getElementById("header-now-badge");
    this.btnFavFilter = document.getElementById("btn-fav-filter");
    this.btnPwaInstall = document.getElementById("btn-pwa-install");

    // First-Visit Disclaimer
    this.disclaimerModal = document.getElementById("disclaimer-modal");
    this.disclaimerBackdrop = document.querySelector("#disclaimer-modal .disclaimer-backdrop");
    this.disclaimerCloseBtn = document.getElementById("disclaimer-close-btn");
    this.btnDismissDisclaimer = document.getElementById("btn-dismiss-disclaimer");

    // Day & Event Navigation (Single Unified Bar)
    this.eventPillsNav = document.getElementById("event-pills-nav");
    this.tabFridayPre = document.getElementById("tab-friday-pre");
    this.tabSaturday = document.getElementById("tab-saturday");
    this.tabSaturdayAfter = document.getElementById("tab-saturday-after");
    this.tabSunday = document.getElementById("tab-sunday");
    this.eventPillTabs = [this.tabFridayPre, this.tabSaturday, this.tabSaturdayAfter, this.tabSunday].filter(Boolean);
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
    this.btnScrollStagesLeft = document.getElementById("btn-scroll-stages-left");
    this.btnScrollStagesRight = document.getElementById("btn-scroll-stages-right");
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

    // PWA Update Toast
    this.pwaUpdateToast = document.getElementById("pwa-update-toast");
    this.btnPwaReload = document.getElementById("btn-pwa-reload");
    this.btnUpdateClose = document.getElementById("btn-update-close");
    this.waitingWorker = null;

    // Privacy Modal
    this.privacyModal = document.getElementById("privacy-modal");
    this.privacyModalBackdrop = document.getElementById("privacy-modal-backdrop");
    this.privacyModalCloseBtn = document.getElementById("privacy-modal-close-btn");
    this.btnClosePrivacy = document.getElementById("btn-close-privacy");
    this.btnOpenPrivacy = document.getElementById("btn-open-privacy");
  }

  // --------------------------------------------------------------------------
  // Time Computation Utilities
  // --------------------------------------------------------------------------
  timeToMinutes(timeStr, isOvernight = false) {
    const [h, m] = timeStr.split(":").map(Number);
    let effectiveH = h;
    if (isOvernight && h < 12) {
      effectiveH += 24;
    }
    return effectiveH * 60 + m;
  }

  minutesToTime(totalMinutes) {
    const normMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hours = Math.floor(normMinutes / 60);
    const minutes = Math.floor(normMinutes % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  getDurationMinutes(start, end, isOvernight = false) {
    return this.timeToMinutes(end, isOvernight) - this.timeToMinutes(start, isOvernight);
  }

  getEffectiveCurrentMinutes(isOvernight = false) {
    let mins = this.nowMinutes;
    if (isOvernight) {
      const hours = Math.floor(mins / 60);
      const remainder = mins % 60;
      if (hours < 12) {
        mins = (hours + 24) * 60 + remainder;
      }
    }
    return mins;
  }

  calculateCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  getTimelineY(minutes) {
    const dayConf = this.getCurrentDayConfig();
    const startMins = dayConf.startHour * 60;
    const offset = minutes - startMins;
    return offset * this.config.pxPerMinute;
  }

  // --------------------------------------------------------------------------
  // Grid Initialization (Static Elements)
  // --------------------------------------------------------------------------
  initTimelineGrid() {
    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);
    const startMins = dayConf.startHour * 60;
    const endMins = (isOvernight && dayConf.endHour < dayConf.startHour)
      ? (dayConf.endHour + 24) * 60
      : dayConf.endHour * 60;
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

    // Day & Event Pills Navigation
    if (this.tabFridayPre) this.tabFridayPre.addEventListener("click", () => this.setDay("friday_pre"));
    if (this.tabSaturday) this.tabSaturday.addEventListener("click", () => this.setDay("saturday"));
    if (this.tabSaturdayAfter) this.tabSaturdayAfter.addEventListener("click", () => this.setDay("saturday_after"));
    if (this.tabSunday) this.tabSunday.addEventListener("click", () => this.setDay("sunday"));

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

    // Disclaimer Modal Handlers
    if (this.btnDismissDisclaimer) {
      this.btnDismissDisclaimer.addEventListener("click", () => this.dismissDisclaimer());
    }
    if (this.disclaimerCloseBtn) {
      this.disclaimerCloseBtn.addEventListener("click", () => this.dismissDisclaimer());
    }
    if (this.disclaimerBackdrop) {
      this.disclaimerBackdrop.addEventListener("click", () => this.dismissDisclaimer());
    }
    document.querySelectorAll(".btn-footer-disclaimer").forEach((btn) => {
      btn.addEventListener("click", () => this.openDisclaimerModal());
    });

    // Privacy Policy Modal Handlers
    if (this.btnOpenPrivacy) {
      this.btnOpenPrivacy.addEventListener("click", () => this.openPrivacyModal());
    }
    document.querySelectorAll(".btn-footer-privacy").forEach((btn) => {
      btn.addEventListener("click", () => this.openPrivacyModal());
    });
    if (this.privacyModalCloseBtn) {
      this.privacyModalCloseBtn.addEventListener("click", () => this.closePrivacyModal());
    }
    if (this.btnClosePrivacy) {
      this.btnClosePrivacy.addEventListener("click", () => this.closePrivacyModal());
    }
    if (this.privacyModalBackdrop) {
      this.privacyModalBackdrop.addEventListener("click", () => this.closePrivacyModal());
    }

    // Desktop Stage Scroll Buttons
    if (this.btnScrollStagesLeft) {
      this.btnScrollStagesLeft.addEventListener("click", () => {
        this.stagesColumnsContainer.scrollBy({ left: -320, behavior: "smooth" });
      });
    }
    if (this.btnScrollStagesRight) {
      this.btnScrollStagesRight.addEventListener("click", () => {
        this.stagesColumnsContainer.scrollBy({ left: 320, behavior: "smooth" });
      });
    }

    // Initialize Desktop Drag-To-Scroll & Horizontal Wheel Support
    this.initDesktopScrollHelpers();

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.privacyModal && !this.privacyModal.classList.contains("hidden")) {
          this.closePrivacyModal();
          return;
        }
        if (this.disclaimerModal && !this.disclaimerModal.classList.contains("hidden")) {
          this.dismissDisclaimer();
          return;
        }
        this.closeModal();
      }
    });

    window.addEventListener("resize", () => {
      this.updateGridWidth();
      this.updateScrollArrows();
    }, { passive: true });
    window.addEventListener("orientationchange", () => {
      this.updateGridWidth();
      this.updateScrollArrows();
    }, { passive: true });

    // Resume / Wake from mobile background: immediately sync clock, line & cards
    const handleResume = () => {
      this.nowMinutes = this.calculateCurrentMinutes();
      this.updateLiveIndicator();
      this.updateLiveCards();
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleResume();
      }
    });
    window.addEventListener("pageshow", handleResume);
    window.addEventListener("focus", handleResume);
  }

  initDesktopScrollHelpers() {
    const container = this.stagesColumnsContainer;
    const headers = this.stageHeadersList;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    const onMouseDown = (e) => {
      // Don't drag if clicking buttons, favorite icons, or interactive controls
      if (e.target.closest("button, .card-fav-btn, a, input")) return;
      isDown = true;
      hasMoved = false;
      startX = e.pageX;
      scrollLeft = container.scrollLeft;
      document.body.classList.add("is-dragging-timetable");
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      const x = e.pageX;
      const walk = (x - startX) * 1.3;
      if (Math.abs(walk) > 4) {
        hasMoved = true;
      }
      container.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      document.body.classList.remove("is-dragging-timetable");
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    if (headers) {
      headers.addEventListener("mousedown", onMouseDown);

      // Mouse Wheel on sticky stage headers -> scrolls horizontally
      headers.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          container.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Prevent act modal opening if mouse was dragging
    container.addEventListener("click", (e) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
        hasMoved = false;
      }
    }, true);

    // Update Left/Right Arrow button visibility on scroll
    container.addEventListener("scroll", () => this.updateScrollArrows(), { passive: true });
  }

  updateScrollArrows() {
    if (!this.btnScrollStagesLeft || !this.btnScrollStagesRight || !this.stagesColumnsContainer) return;
    const container = this.stagesColumnsContainer;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const canScroll = maxScroll > 10;

    if (!canScroll) {
      this.btnScrollStagesLeft.classList.add("hidden");
      this.btnScrollStagesRight.classList.add("hidden");
      return;
    }

    this.btnScrollStagesLeft.classList.toggle("hidden", container.scrollLeft <= 10);
    this.btnScrollStagesRight.classList.toggle("hidden", container.scrollLeft >= maxScroll - 10);
  }

  // --------------------------------------------------------------------------
  // State Setters
  // --------------------------------------------------------------------------
  updatePillsUI(day = this.currentDay) {
    if (!this.eventPillTabs) return;
    this.eventPillTabs.forEach((pill) => {
      const isActive = pill.dataset.day === day;
      pill.classList.toggle("active", isActive);
      if (isActive) {
        // Smoothly bring active pill into view on mobile horizontal scroll
        pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    });
  }

  setDay(day) {
    if (this.currentDay === day) return;
    this.currentDay = day;

    this.updatePillsUI(day);

    // Reset horizontal scroll on day switch
    if (this.stagesColumnsContainer) this.stagesColumnsContainer.scrollLeft = 0;
    if (this.stageHeadersList) this.stageHeadersList.scrollLeft = 0;

    // Reset inline widths so layout recalculates naturally
    if (this.stagesScrollContent) this.stagesScrollContent.style.width = "";
    if (this.nowIndicatorLine) this.nowIndicatorLine.style.width = "";
    if (this.gridBackgroundLines) this.gridBackgroundLines.style.width = "";

    // Rebuild timeline grid for the newly selected day/hours
    this.initTimelineGrid();

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
    this.render();

    // If modal is open for this act, update button state
    if (this.currentModalAct && this.currentModalAct.id === actId) {
      this.updateModalFavBtn(actId);
    }
  }

  // --------------------------------------------------------------------------
  // Main Render Routine
  // --------------------------------------------------------------------------
  render() {
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
    return this.getCurrentStages();
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

    const isSingleStage = activeStages.length === 1;
    if (this.timetableViewport) {
      this.timetableViewport.classList.toggle("is-single-stage", isSingleStage);
    }

    // Reset inline widths before rendering new stage columns
    if (this.stagesScrollContent) this.stagesScrollContent.style.width = "";
    if (this.nowIndicatorLine) this.nowIndicatorLine.style.width = "";
    if (this.gridBackgroundLines) this.gridBackgroundLines.style.width = "";

    // Reset horizontal scroll
    if (this.stagesColumnsContainer) this.stagesColumnsContainer.scrollLeft = 0;
    if (this.stageHeadersList) this.stageHeadersList.scrollLeft = 0;

    const daySchedule = this.data[this.currentDay] || {};
    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);
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
      `;
      this.stageHeadersList.appendChild(headerItem);

      // 2. Stage Column in Swimlane Body
      const stageCol = document.createElement("div");
      stageCol.className = `stage-column col-${stage.id}`;

      filteredActs.forEach((act) => {
        const startMin = this.timeToMinutes(act.start, isOvernight);
        const endMin = this.timeToMinutes(act.end, isOvernight);
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

    const allActs = [];
    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);

    // If searching, search across ALL events and days
    if (this.searchQuery) {
      for (const [dayId, stages] of Object.entries(this.data)) {
        const dConf = this.config.days.find((d) => d.id === dayId) || {};
        const dStages = dConf.stages || this.config.stages;
        for (const [stageId, acts] of Object.entries(stages)) {
          const stageConfig = dStages.find((s) => s.id === stageId) || { name: stageId, color: "#00FF87" };
          acts.forEach((act) => {
            if (this.filterAct(act)) {
              allActs.push({
                ...act,
                dayConfig: dConf,
                stageConfig
              });
            }
          });
        }
      }
    } else {
      const daySchedule = this.data[this.currentDay] || {};
      activeStages.forEach((stage) => {
        const acts = daySchedule[stage.id] || [];
        acts.forEach((act) => {
          if (this.filterAct(act)) {
            allActs.push({
              ...act,
              dayConfig: dayConf,
              stageConfig: stage
            });
          }
        });
      });
    }

    // Sort chronologically by start time
    allActs.sort((a, b) => {
      const aOvernight = Boolean(a.dayConfig?.isOvernight);
      const bOvernight = Boolean(b.dayConfig?.isOvernight);
      const aTime = this.timeToMinutes(a.start, aOvernight);
      const bTime = this.timeToMinutes(b.start, bOvernight);
      const diff = aTime - bTime;
      if (diff !== 0) return diff;
      return a.stageConfig.name.localeCompare(b.stageConfig.name);
    });

    allActs.forEach((act) => {
      const actOvernight = Boolean(act.dayConfig?.isOvernight);
      const isLive = this.isActLive(act);
      const isFav = this.favorites.has(act.id);
      const durationMin = this.getDurationMinutes(act.start, act.end, actOvernight);
      const dayPrefix = this.searchQuery && act.dayConfig ? `${act.dayConfig.label} · ` : "";

      const card = document.createElement("div");
      card.className = `list-item-card ${isLive ? "is-live" : ""}`;
      card.dataset.stage = act.stage;
      card.dataset.actId = act.id;

      card.innerHTML = `
        <div class="list-time-block">
          <span class="list-time">${act.start} – ${act.end}</span>
          <span class="list-duration">${durationMin} Min.${isLive ? ' · <strong style="color:var(--neon-green)">JETZT</strong>' : ''}</span>
        </div>

        <div class="list-info-block">
          <div class="list-artist-title">${act.artist}</div>
          <span class="list-stage-label stage-${act.stage}" style="color: ${act.stageConfig.color};">${dayPrefix}${act.stageConfig.name}</span>
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
    const actDay = act.day || this.currentDay;
    const dayConf = this.config.days.find((d) => d.id === actDay) || this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);

    const currentMins = this.getEffectiveCurrentMinutes(isOvernight);
    const startMins = this.timeToMinutes(act.start, isOvernight);
    const endMins = this.timeToMinutes(act.end, isOvernight);

    return currentMins >= startMins && currentMins < endMins;
  }

  // --------------------------------------------------------------------------
  // Update Scroll Track & Indicator Width
  // --------------------------------------------------------------------------
  updateGridWidth() {
    requestAnimationFrame(() => {
      if (!this.stagesGridColumns || !this.nowIndicatorLine) return;

      // Clear inline widths first so elements take their natural layout size
      if (this.stagesScrollContent) {
        this.stagesScrollContent.style.width = "";
      }
      if (this.nowIndicatorLine) {
        this.nowIndicatorLine.style.width = "";
      }
      if (this.gridBackgroundLines) {
        this.gridBackgroundLines.style.width = "";
      }

      const isSingleStage = this.stagesGridColumns.children.length === 1;
      let fullWidth = 0;

      if (isSingleStage) {
        const col = this.stagesGridColumns.children[0];
        fullWidth = col ? col.offsetWidth : 0;
      } else {
        fullWidth = Math.max(
          this.stagesGridColumns.scrollWidth,
          this.stagesGridColumns.offsetWidth
        );
      }

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
      this.updateScrollArrows();
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

    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);
    const startMins = dayConf.startHour * 60;
    const endMins = (isOvernight && dayConf.endHour < dayConf.startHour)
      ? (dayConf.endHour + 24) * 60
      : dayConf.endHour * 60;

    const effectiveCurrentMins = this.getEffectiveCurrentMinutes(isOvernight);

    // Check if line falls within day hours
    const isInHours = effectiveCurrentMins >= startMins && effectiveCurrentMins <= endMins;

    if (isInHours) {
      const topPx = this.getTimelineY(effectiveCurrentMins);
      this.nowIndicatorLine.style.display = "flex";
      this.nowIndicatorLine.style.top = `${topPx}px`;
      this.updateGridWidth();
    } else {
      this.nowIndicatorLine.style.display = "none";
    }

    this.updateLiveCards();
  }

  // --------------------------------------------------------------------------
  // Dynamic Live State Updates on Act Cards (Real-Time & Resume Sync)
  // --------------------------------------------------------------------------
  updateLiveCards() {
    // 1. Update Grid View Cards
    const gridCards = document.querySelectorAll(".act-card[data-act-id]");
    gridCards.forEach((card) => {
      const actId = card.dataset.actId;
      const act = this.actsById.get(actId);
      if (!act) return;

      const isLive = this.isActLive(act);
      const wasLive = card.classList.contains("is-live");

      if (isLive !== wasLive) {
        card.classList.toggle("is-live", isLive);
        const timeWrap = card.querySelector(".card-time-wrap");
        if (timeWrap) {
          const existingPill = timeWrap.querySelector(".card-live-pill");
          if (isLive && !existingPill) {
            const pill = document.createElement("span");
            pill.className = "card-live-pill";
            pill.textContent = "LIVE";
            timeWrap.appendChild(pill);
          } else if (!isLive && existingPill) {
            existingPill.remove();
          }
        }
      }
    });

    // 2. Update List View Cards
    const listCards = document.querySelectorAll(".list-item-card[data-act-id]");
    listCards.forEach((card) => {
      const actId = card.dataset.actId;
      const act = this.actsById.get(actId);
      if (!act) return;

      const isLive = this.isActLive(act);
      const wasLive = card.classList.contains("is-live");

      if (isLive !== wasLive) {
        card.classList.toggle("is-live", isLive);
        const durSpan = card.querySelector(".list-duration");
        if (durSpan) {
          const actOvernight = Boolean(act.dayConfig?.isOvernight);
          const durationMin = this.getDurationMinutes(act.start, act.end, actOvernight);
          durSpan.innerHTML = `${durationMin} Min.${isLive ? ' · <strong style="color:var(--neon-green)">JETZT</strong>' : ''}`;
        }
      }
    });

    // 3. Update Modal if open
    if (this.currentModalAct && this.actModal && !this.actModal.classList.contains("hidden")) {
      this.updateModalStatus(this.currentModalAct);
    }
  }

  // --------------------------------------------------------------------------
  // "Jump to Now" Smooth Scroll
  // --------------------------------------------------------------------------
  jumpToNow(silent = false, instant = false) {
    // If explicitly invoked by user click and current day is not the active festival day, switch to it!
    if (!silent) {
      const activeDay = this.detectInitialDay();
      if (this.currentDay !== activeDay) {
        this.setDay(activeDay);
        // After switching day, jumpToNow is invoked
        return;
      }
    }

    // Blur button and trigger brief click feedback
    if (!silent && this.btnJumpNow) {
      this.btnJumpNow.blur();
      this.btnJumpNow.classList.add("is-pressed");
      setTimeout(() => {
        if (this.btnJumpNow) this.btnJumpNow.classList.remove("is-pressed");
      }, 300);
    }

    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);
    const startMins = dayConf.startHour * 60;
    const endMins = (isOvernight && dayConf.endHour < dayConf.startHour)
      ? (dayConf.endHour + 24) * 60
      : dayConf.endHour * 60;

    const effectiveCurrentMins = this.getEffectiveCurrentMinutes(isOvernight);

    // Switch to grid view if not in grid
    if (this.viewMode !== "grid") {
      this.setViewMode("grid");
    }

    // If outside hours, scroll to start
    let targetMins = effectiveCurrentMins;
    if (targetMins < startMins || targetMins > endMins) {
      targetMins = startMins;
    }

    const topPx = this.getTimelineY(targetMins);
    const viewportHeight = this.timetableBody ? this.timetableBody.clientHeight : 600;
    const scrollToY = Math.max(0, topPx - viewportHeight / 2.5);

    if (this.timetableBody) {
      this.timetableBody.scrollTo({
        top: scrollToY,
        behavior: instant ? "auto" : "smooth"
      });
    }

    // Visual pulse highlight that cleanly fades out automatically
    if (!silent && this.nowIndicatorLine) {
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

    const actDay = act.day || this.currentDay;
    const dayConf = this.config.days.find((d) => d.id === actDay) || this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);

    const stages = dayConf.stages || this.config.stages;
    const stageConfig = stages.find((s) => s.id === act.stage) || this.config.stages.find((s) => s.id === act.stage) || {};

    // Header Details
    this.modalStageBadge.textContent = act.stageName;
    this.modalStageBadge.style.backgroundColor = stageConfig.badgeBg || "rgba(0,255,135,0.15)";
    this.modalStageBadge.style.color = stageConfig.color || "#00FF87";

    this.modalArtist.textContent = act.artist;
    this.modalTime.textContent = `${act.start} – ${act.end}`;
    const durationMin = this.getDurationMinutes(act.start, act.end, isOvernight);
    this.modalDuration.textContent = `(${durationMin} Min.)`;

    this.updateModalStatus(act);

    // Clash Detection with user's other favorites
    this.checkClashes(act);

    // Favorite Button State
    this.updateModalFavBtn(act.id);
    this.modalFavBtn.onclick = () => this.toggleFavorite(act.id);

    // Open Modal
    this.actModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  updateModalStatus(act) {
    if (!act) return;
    const actDay = act.day || this.currentDay;
    const dayConf = this.config.days.find((d) => d.id === actDay) || this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);

    const isLive = this.isActLive(act);
    this.modalLivePill.classList.toggle("hidden", !isLive);

    // Status / Countdown
    const effectiveCurrentMins = this.getEffectiveCurrentMinutes(isOvernight);
    const startMins = this.timeToMinutes(act.start, isOvernight);
    const endMins = this.timeToMinutes(act.end, isOvernight);

    if (isLive) {
      const remaining = endMins - effectiveCurrentMins;
      this.modalStatusIcon.textContent = "🔊";
      this.modalStatusText.textContent = `Spielt JETZT! Noch ${remaining} Minuten (bis ${act.end} Uhr)`;
    } else if (effectiveCurrentMins < startMins) {
      const diff = startMins - effectiveCurrentMins;
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
  }

  checkClashes(currentAct) {
    const actDay = currentAct.day || this.currentDay;
    const dayConf = this.config.days.find((d) => d.id === actDay) || this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);

    const curStart = this.timeToMinutes(currentAct.start, isOvernight);
    const curEnd = this.timeToMinutes(currentAct.end, isOvernight);

    const daySchedule = this.data[actDay] || {};
    const clashes = [];

    Object.values(daySchedule).forEach((stageActs) => {
      stageActs.forEach((act) => {
        if (act.id !== currentAct.id && this.favorites.has(act.id)) {
          const aStart = this.timeToMinutes(act.start, isOvernight);
          const aEnd = this.timeToMinutes(act.end, isOvernight);

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

  openDisclaimerModal() {
    if (this.disclaimerModal) {
      this.disclaimerModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
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
      const isPrivacyOpen = this.privacyModal && !this.privacyModal.classList.contains("hidden");
      const isActOpen = this.actModal && !this.actModal.classList.contains("hidden");
      if (!isPrivacyOpen && !isActOpen) {
        document.body.style.overflow = "";
      }
    }
  }

  // --------------------------------------------------------------------------
  // Privacy Policy Modal
  // --------------------------------------------------------------------------
  openPrivacyModal() {
    if (this.privacyModal) {
      this.privacyModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  closePrivacyModal() {
    if (this.privacyModal) {
      this.privacyModal.classList.add("hidden");
      const isDisclaimerOpen = this.disclaimerModal && !this.disclaimerModal.classList.contains("hidden");
      const isActOpen = this.actModal && !this.actModal.classList.contains("hidden");
      if (!isDisclaimerOpen && !isActOpen) {
        document.body.style.overflow = "";
      }
    }
  }

  // --------------------------------------------------------------------------
  // In-App Browser Notice (Instagram, TikTok, WhatsApp, Facebook, etc.)
  // --------------------------------------------------------------------------
  initInAppBrowserNotice() {
    const banner = document.getElementById("iab-banner");
    if (!banner) return;

    const urlParams = new URLSearchParams(window.location.search);
    const iabParam = urlParams.get("iab");

    if (iabParam === "0" || iabParam === "false") {
      return;
    }

    if (!iabParam) {
      try {
        if (sessionStorage.getItem("rg_iab_dismissed") === "true") {
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    const detection = this.detectInAppBrowser(iabParam);
    if (!detection || !detection.isInApp) {
      return;
    }

    const badge = document.getElementById("iab-badge");
    const dots = document.getElementById("iab-dots-indicator");
    const title = document.getElementById("iab-title");
    const instructions = document.getElementById("iab-instructions");
    const btnIntent = document.getElementById("btn-iab-intent");
    const btnCopy = document.getElementById("btn-iab-copy");
    const btnCopyText = document.getElementById("btn-iab-copy-text");
    const btnDismiss = document.getElementById("btn-iab-dismiss");

    if (badge) {
      badge.textContent = detection.app ? `${detection.app.toUpperCase()} BROWSER` : "IN-APP BROWSER";
    }

    if (detection.platform === "ios") {
      if (dots) dots.textContent = "•••";
      if (title) title.textContent = "Tipp: Im Safari-Browser öffnen";
      if (instructions) {
        instructions.innerHTML = `1. Tippe oben rechts auf <strong>•••</strong> (oder unten auf <strong>[↑] Teilen</strong>)<br>2. Wähle <strong>»In Safari öffnen«</strong>`;
      }
      if (btnIntent) btnIntent.classList.add("hidden");
    } else if (detection.platform === "android") {
      if (dots) dots.textContent = "⋮";
      if (title) title.textContent = "Tipp: Im Chrome-Browser öffnen";
      if (instructions) {
        instructions.innerHTML = `1. Tippe oben rechts auf <strong>⋮</strong> (Drei Punkte)<br>2. Wähle <strong>»Im Browser öffnen«</strong> (oder »In Chrome öffnen«)`;
      }
      if (btnIntent) {
        btnIntent.classList.remove("hidden");
        const cleanHost = window.location.host;
        const cleanPath = window.location.pathname;
        const cleanSearch = window.location.search;
        btnIntent.href = `intent://${cleanHost}${cleanPath}${cleanSearch}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    } else {
      if (dots) dots.textContent = "••• / ⋮";
      if (title) title.textContent = "Im Standard-Browser öffnen";
      if (instructions) {
        instructions.innerHTML = `Tippe auf das Menü (<strong>•••</strong> oder <strong>⋮</strong>) und wähle <strong>»Im Browser öffnen«</strong>.`;
      }
      if (btnIntent) btnIntent.classList.add("hidden");
    }

    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => {
        banner.classList.add("hidden");
        try {
          sessionStorage.setItem("rg_iab_dismissed", "true");
        } catch (e) {
          // ignore
        }
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener("click", async () => {
        const cleanUrl = window.location.origin + window.location.pathname;
        try {
          await navigator.clipboard.writeText(cleanUrl);
          if (btnCopyText) btnCopyText.textContent = "Link kopiert! ✓";
          btnCopy.classList.add("copied");
          setTimeout(() => {
            if (btnCopyText) btnCopyText.textContent = "Link kopieren";
            btnCopy.classList.remove("copied");
          }, 3000);
        } catch (err) {
          const input = document.createElement("input");
          input.value = cleanUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand("copy");
          document.body.removeChild(input);
          if (btnCopyText) btnCopyText.textContent = "Link kopiert! ✓";
          btnCopy.classList.add("copied");
          setTimeout(() => {
            if (btnCopyText) btnCopyText.textContent = "Link kopieren";
            btnCopy.classList.remove("copied");
          }, 3000);
        }
      });
    }

    banner.classList.remove("hidden");
  }

  detectInAppBrowser(overrideParam = null) {
    if (overrideParam === "ios") {
      return { isInApp: true, platform: "ios", app: "Instagram" };
    }
    if (overrideParam === "android") {
      return { isInApp: true, platform: "android", app: "Instagram" };
    }
    if (overrideParam === "other") {
      return { isInApp: true, platform: "other", app: "In-App" };
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                         window.navigator.standalone === true;
    if (isStandalone) return null;

    const ua = navigator.userAgent || navigator.vendor || window.opera || "";

    const isIOS = /iPhone|iPad|iPod/i.test(ua) || 
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    const isInstagram = /Instagram/i.test(ua);
    const isFacebook = /FBAN|FBAV|FB_IAB/i.test(ua);
    const isTikTok = /musical_ly|ByteLocale|ByteDance|TikTok/i.test(ua);
    const isTwitter = /Twitter/i.test(ua);
    const isLinkedIn = /LinkedInApp/i.test(ua);
    const isSnapchat = /Snapchat/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isTelegram = /Telegram/i.test(ua);
    const isLine = /Line\//i.test(ua);
    const isPinterest = /Pinterest/i.test(ua);

    const isAndroidWebView = isAndroid && (/; wv\b/i.test(ua) || /Version\/[\d.]+.*Chrome/i.test(ua));
    const isAlternativeIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    const isStandardIOSSafari = /Version\/[\d.]+.*Safari/i.test(ua) && 
      !isInstagram && !isFacebook && !isTikTok && !isTwitter && 
      !isLinkedIn && !isSnapchat && !isWhatsApp && !isTelegram && !isLine && !isPinterest;
    const isIOSWebView = isIOS && !isAlternativeIOSBrowser && !isStandardIOSSafari;

    const isInApp = isInstagram || isFacebook || isTikTok || isTwitter || 
                    isLinkedIn || isSnapchat || isWhatsApp || isTelegram || 
                    isLine || isPinterest || isAndroidWebView || isIOSWebView;

    if (!isInApp) return null;

    const appName = isInstagram ? "Instagram" :
                    isFacebook ? "Facebook" :
                    isTikTok ? "TikTok" :
                    isTwitter ? "X" :
                    isWhatsApp ? "WhatsApp" :
                    isTelegram ? "Telegram" :
                    isSnapchat ? "Snapchat" : "In-App";

    return {
      isInApp: true,
      platform: isIOS ? "ios" : (isAndroid ? "android" : "other"),
      app: appName
    };
  }

  // --------------------------------------------------------------------------
  // PWA Service Worker & Install Prompt
  // --------------------------------------------------------------------------
  initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered with scope:", reg.scope);

          // 1. If a worker is already waiting from a previous visit/background fetch
          if (reg.waiting) {
            this.showUpdateToast(reg.waiting);
          }

          // 2. Listen for newly discovered service worker updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              // Only notify if newWorker is installed and there is an existing controller (meaning it's an update)
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                this.showUpdateToast(newWorker);
              }
            });
          });

          // Proactively check for new version on GitHub
          reg.update().catch(() => {});

          // Check on app visibility resume / tab focus
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              reg.update().catch(() => {});
            }
          });

          window.addEventListener("focus", () => {
            reg.update().catch(() => {});
          });

          // Periodic update check every 15 minutes
          setInterval(() => {
            reg.update().catch(() => {});
          }, 15 * 60 * 1000);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed:", err);
        });
    });
  }

  showUpdateToast(worker) {
    this.waitingWorker = worker;
    if (!this.pwaUpdateToast) return;

    // Hide iOS install prompt if currently shown to prevent clutter
    this.iosInstallToast?.classList.add("hidden");

    this.pwaUpdateToast.classList.remove("hidden");

    let refreshing = false;
    const triggerReload = () => {
      if (refreshing) return;
      refreshing = true;

      // Reload page once new service worker activates and takes control
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      if (this.waitingWorker) {
        this.waitingWorker.postMessage({ action: "skipWaiting" });
      } else {
        window.location.reload();
      }

      // Safety fallback in case controllerchange does not fire within 3000ms
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    if (this.btnPwaReload) {
      this.btnPwaReload.onclick = (e) => {
        e.stopPropagation();
        triggerReload();
      };
    }

    // Tapping anywhere on the toast card also triggers reload
    this.pwaUpdateToast.onclick = () => {
      triggerReload();
    };

    if (this.btnUpdateClose) {
      this.btnUpdateClose.onclick = (e) => {
        e.stopPropagation();
        this.pwaUpdateToast.classList.add("hidden");
      };
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
