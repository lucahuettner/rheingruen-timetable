/**
 * Configurable Event Timetable PWA - Main Application Logic
 * Responsive Multi-Stage Grid, Real-Time Now-Line, Offline Support & Favorites
 */

import { EVENT_CONFIG, SCHEDULE_DATA } from "./schedule-data.js";

class TimetableApp {
  constructor() {
    this.config = EVENT_CONFIG;
    this.data = SCHEDULE_DATA;

    this.pxPerMinute = this.config.theme?.pxPerMinute || 2;
    this.favColor = this.config.theme?.favoriteColor || "#FF4B6E";

    const eventId = this.config.id || "event-timetable";
    this.storageKeys = {
      favorites: `${eventId}_favorites`,
      disclaimer: `${eventId}_disclaimer_dismissed`,
      iosPrompt: `${eventId}_ios_prompt_dismissed`,
      iab: `${eventId}_iab_dismissed`
    };

    // Normalize days & schedule acts (auto-generate IDs, stage names & overnight flags)
    this.actsById = new Map();
    this.normalizeConfigAndData();

    // Application State
    this.currentDay = this.detectInitialDay();
    this.viewMode = "grid"; // "grid" | "list"
    this.searchQuery = "";
    this.onlyFavorites = false;

    // Favorites (persisted in localStorage)
    this.favorites = this.loadFavorites();

    // Time & Clock State (Always reflect real current device time of day)
    this.nowMinutes = this.calculateCurrentMinutes();

    // Cache DOM Elements
    this.initDOMElements();

    // Apply Theme, Branding, Disclaimer, Privacy & Footer from EVENT_CONFIG
    this.applyThemeAndBranding();

    // Render Navigation Pills dynamically from EVENT_CONFIG.days
    this.renderEventPills();

    // Setup Event Listeners
    this.initEventListeners();

    // Initialize Active Tab & Navigation UI
    this.updatePillsUI(this.currentDay);

    // Initialize UI
    this.initTimelineGrid();
    this.render();
    this.updateLiveIndicator();

    // Auto-scroll to current live time on initial load
    setTimeout(() => {
      this.jumpToNow(true, true);
    }, 150);

    // Live Clock Interval (every 10 seconds)
    setInterval(() => {
      this.nowMinutes = this.calculateCurrentMinutes();
      this.updateLiveIndicator();
      this.updateLiveCards();
    }, 10000);

    // Check first-visit disclaimer (if enabled in config)
    this.checkDisclaimer();

    // Check In-App Browser Notice
    this.initInAppBrowserNotice();

    // Register Service Worker for PWA
    this.initServiceWorker();
    this.initPWAInstallPrompt();
  }

  // --------------------------------------------------------------------------
  // Config Normalization & Dynamic Branding
  // --------------------------------------------------------------------------
  normalizeConfigAndData() {
    const defaultStages = this.config.stages || [];

    (this.config.days || []).forEach((day) => {
      if (typeof day.isOvernight !== "boolean") {
        day.isOvernight = day.endHour <= day.startHour;
      }
      if (!day.stages || day.stages.length === 0) {
        day.stages = defaultStages;
      }
      if (!day.label) {
        day.label = [day.badge, day.title, day.subtitle].filter(Boolean).join(" · ");
      }
    });

    Object.entries(this.data || {}).forEach(([dayId, stages]) => {
      const dayConf = (this.config.days || []).find((d) => d.id === dayId);
      const dayStages = dayConf?.stages || defaultStages;

      Object.entries(stages || {}).forEach(([stageId, acts]) => {
        const stageObj =
          dayStages.find((s) => s.id === stageId) ||
          defaultStages.find((s) => s.id === stageId) ||
          { id: stageId, name: stageId, color: this.config.theme?.accentColor || "#00FF87" };

        (acts || []).forEach((act) => {
          act.day = dayId;
          act.stage = stageId;
          act.stageName = act.stageName || stageObj.name;
          if (!act.id) {
            const slug = act.artist
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            const startClean = act.start.replace(":", "");
            act.id = `${dayId}-${stageId}-${startClean}-${slug}`;
          }
          this.actsById.set(act.id, act);
        });
      });
    });
  }

  applyThemeAndBranding() {
    const t = this.config.theme || {};
    const root = document.documentElement;

    if (t.accentColor) root.style.setProperty("--neon-green", t.accentColor);
    if (t.accentContrast) root.style.setProperty("--accent-contrast", t.accentContrast);
    if (t.secondaryColor) root.style.setProperty("--neon-cyan", t.secondaryColor);
    if (t.favoriteColor) root.style.setProperty("--fav-color", t.favoriteColor);
    if (t.bgBlack) root.style.setProperty("--bg-black", t.bgBlack);
    if (t.bgDark) {
      root.style.setProperty("--bg-dark", t.bgDark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.bgDark);
    }
    if (t.bgSurface) root.style.setProperty("--bg-surface", t.bgSurface);
    if (t.bgSurfaceElevated) root.style.setProperty("--bg-surface-elevated", t.bgSurfaceElevated);
    if (t.bgSurfaceCard) root.style.setProperty("--bg-surface-card", t.bgSurfaceCard);

    // Branding & Meta
    const b = this.config.branding || {};
    if (b.pageTitle) {
      document.title = b.pageTitle;
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", b.pageTitle);
    }
    if (b.description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", b.description);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", b.description);
    }
    if (b.shortName) {
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute("content", b.shortName);
    }

    const brandTitleEl = document.getElementById("brand-title");
    const brandSubEl = document.getElementById("brand-subtitle");
    if (brandTitleEl && b.title) {
      if (b.typeLabel) {
        brandTitleEl.innerHTML = `<span class="brand-name">${b.title}</span><span class="brand-pill-tag">${b.typeLabel}</span>`;
      } else {
        brandTitleEl.textContent = b.title;
      }
    }
    if (brandSubEl && b.subtitle) brandSubEl.textContent = b.subtitle;

    // Disclaimer Modal Content
    const d = this.config.disclaimer || {};
    const l = this.config.legal || {};
    const p = l.privacy || {};

    if (d.enabled) {
      const logoMain = document.getElementById("disclaimer-logo-main");
      const logoSub = document.getElementById("disclaimer-logo-sub");
      const badge = document.getElementById("disclaimer-badge");
      const title = document.getElementById("disclaimer-title");
      const intro = document.getElementById("disclaimer-intro");
      const sub = document.getElementById("disclaimer-sub");
      const confirmText = document.getElementById("disclaimer-confirm-text");
      const linksGroup = document.getElementById("disclaimer-links-group");
      const miniLinks = document.getElementById("disclaimer-mini-links");

      if (logoMain) logoMain.textContent = b.title || "TIMETABLE";
      if (logoSub) logoSub.textContent = b.typeLabel || b.subtitle || "";
      if (badge) {
        badge.textContent = d.badge || "";
        badge.classList.toggle("hidden", !d.badge);
      }
      if (title && d.title) title.textContent = d.title;
      if (intro) intro.innerHTML = d.introHtml || "";
      if (sub) sub.innerHTML = d.subHtml || "";
      if (confirmText && d.confirmLabel) confirmText.textContent = d.confirmLabel;

      if (linksGroup) {
        linksGroup.innerHTML = (d.links || [])
          .map((link) => {
            const isInsta = link.variant === "instagram" || link.icon === "instagram";
            const iconSvg = this.getLinkIconSvg(link.icon);
            return `
              <a href="${link.url}" target="_blank" rel="noopener" class="disclaimer-btn-link ${isInsta ? "btn-instagram" : ""}">
                ${iconSvg}
                <span>${link.label}</span>
                <span class="btn-arrow">↗</span>
              </a>
            `;
          })
          .join("");
      }

      if (miniLinks) {
        const miniItems = [];
        if (l.creditsLabel && l.creditsUrl) {
          miniItems.push(`<a href="${l.creditsUrl}" target="_blank" rel="noopener" class="btn-mini-textlink">${l.creditsLabel}</a>`);
        }
        if (p.enabled) {
          miniItems.push(`<button type="button" id="btn-open-privacy" class="btn-mini-textlink">Datenschutz</button>`);
        }
        miniLinks.innerHTML = miniItems.join('<span class="mini-links-sep">·</span>');
      }
    }

    // Privacy Policy Modal Content
    if (p.enabled) {
      const contactName = document.getElementById("privacy-contact-name");
      const contactEmail = document.getElementById("privacy-contact-email");
      const hostingProvider = document.getElementById("privacy-hosting-provider");
      const authorityName = document.getElementById("privacy-authority-name");
      const authorityLink = document.getElementById("privacy-authority-link");
      const stand = document.getElementById("privacy-stand");

      if (contactName) contactName.textContent = p.contactName || "";
      if (contactEmail) {
        contactEmail.textContent = p.contactEmail || "";
        contactEmail.href = p.contactEmail ? `mailto:${p.contactEmail}` : "#";
      }
      if (hostingProvider) hostingProvider.textContent = p.hostingProvider || "";
      if (authorityName) authorityName.textContent = p.supervisoryAuthorityName || "";
      if (authorityLink) {
        authorityLink.href = p.supervisoryAuthorityUrl || "#";
        authorityLink.textContent = p.supervisoryAuthorityLabel || p.supervisoryAuthorityUrl || "";
      }
      if (stand) {
        stand.textContent = p.updatedAt ? `Stand: ${p.updatedAt}` : "";
      }
    }

    // Page Footers
    const footerItems = [];
    if (l.creditsLabel && l.creditsUrl) {
      footerItems.push(`<a href="${l.creditsUrl}" target="_blank" rel="noopener" class="btn-mini-textlink">${l.creditsLabel}</a>`);
    }
    if (d.enabled) {
      footerItems.push(`<button type="button" class="btn-mini-textlink btn-footer-disclaimer">Offizielle Links & Info</button>`);
    }
    if (p.enabled) {
      footerItems.push(`<button type="button" class="btn-mini-textlink btn-footer-privacy">Datenschutz</button>`);
    }

    const footerHtml = footerItems.join('<span class="mini-links-sep">·</span>');
    document.querySelectorAll(".timetable-footer-inner").forEach((container) => {
      container.innerHTML = footerHtml;
      const parentFooter = container.closest(".timetable-main-footer");
      if (parentFooter) {
        parentFooter.classList.toggle("hidden", footerItems.length === 0);
      }
    });
  }

  getLinkIconSvg(iconName) {
    if (iconName === "instagram") {
      return `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      `;
    }
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    `;
  }

  renderEventPills() {
    if (!this.eventPillsNav) return;
    this.eventPillsNav.innerHTML = "";
    this.eventPillTabs = [];

    const days = this.config.days || [];
    if (days.length <= 1) {
      this.eventPillsNav.classList.add("hidden");
      return;
    }

    this.eventPillsNav.classList.remove("hidden");

    days.forEach((day) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "event-pill";
      btn.dataset.day = day.id;
      btn.innerHTML = `
        ${day.badge ? `<span class="pill-day-badge">${day.badge}</span>` : ""}
        <div class="pill-text-col">
          <span class="pill-main-title">${day.title}</span>
          ${day.subtitle ? `<span class="pill-sub-venue">${day.subtitle}</span>` : ""}
        </div>
      `;
      btn.addEventListener("click", () => this.setDay(day.id));
      this.eventPillsNav.appendChild(btn);
      this.eventPillTabs.push(btn);
    });
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

  getDayWindowDates(day) {
    if (!day.isoDate) return null;
    const [y, m, d] = day.isoDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    const start = new Date(y, m - 1, d, day.startHour, 0, 0, 0);
    const endDayOffset = day.isOvernight ? 1 : 0;
    const end = new Date(y, m - 1, d + endDayOffset, day.endHour, 0, 0, 0);
    return { start, end };
  }

  detectInitialDay() {
    const days = this.config.days || [];
    if (days.length === 0) return "";

    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get("day");
    if (dayParam && days.some((d) => d.id === dayParam)) {
      return dayParam;
    }

    const now = new Date();
    const localIsoDate = this.getLocalDateIso(now);

    // 1. Check if current time falls directly inside any day's active time window
    // If multiple overlap (e.g. Festival ends 23:00, Aftershow starts 22:00), pick the one that started most recently
    let activeMatch = null;
    let activeLatestStart = -Infinity;

    for (const day of days) {
      const win = this.getDayWindowDates(day);
      if (win && now >= win.start && now < win.end) {
        if (win.start.getTime() >= activeLatestStart) {
          activeLatestStart = win.start.getTime();
          activeMatch = day.id;
        }
      }
    }
    if (activeMatch) return activeMatch;

    // 2. If not currently in an active window, check if there is an upcoming event today
    let upcomingMatch = null;
    let upcomingEarliestStart = Infinity;

    for (const day of days) {
      if (day.isoDate === localIsoDate) {
        const win = this.getDayWindowDates(day);
        if (win && now < win.end && win.start.getTime() < upcomingEarliestStart) {
          upcomingEarliestStart = win.start.getTime();
          upcomingMatch = day.id;
        }
      }
    }
    if (upcomingMatch) return upcomingMatch;

    // 3. Fallback if today matches any day's isoDate (e.g. late night after event ended)
    const sameDateDay = days.find((d) => d.isoDate === localIsoDate);
    if (sameDateDay) return sameDateDay.id;

    // 4. Default outside event dates
    return this.config.defaultDayId || days[0].id;
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

    // Day & Event Navigation
    this.eventPillsNav = document.getElementById("event-pills-nav");
    this.eventPillTabs = [];
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

  formatArtistHtml(artist) {
    if (!artist) return "";
    const escaped = String(artist)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let formatted = escaped.replace(/\b(B2B|F2F|b2b|f2f)\b/g, '<span class="act-separator">$1</span>');
    formatted = formatted.replace(/\s+&amp;\s+/g, ' <span class="act-separator">&amp;</span> ');
    formatted = formatted.replace(/(\((?:LIVE|Live)\))/g, '<span class="act-live-tag">$1</span>');
    return formatted;
  }

  getEffectiveCurrentMinutes(isOvernight = false) {
    let mins = this.nowMinutes;
    if (isOvernight) {
      const dayConf = this.getCurrentDayConfig();
      const endHour = dayConf?.endHour ?? 12;
      const cutoffHour = Math.min(12, endHour + 2);
      const hours = Math.floor(mins / 60);
      const remainder = mins % 60;
      if (hours < cutoffHour) {
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
    return offset * this.pxPerMinute;
  }

  // --------------------------------------------------------------------------
  // Grid Initialization (Static Elements)
  // --------------------------------------------------------------------------
  initTimelineGrid() {
    const dayConf = this.getCurrentDayConfig();
    const isOvernight = Boolean(dayConf.isOvernight);
    const startMins = dayConf.startHour * 60;
    const endMins = (isOvernight && dayConf.endHour <= dayConf.startHour)
      ? (dayConf.endHour + 24) * 60
      : dayConf.endHour * 60;
    const totalMinutes = endMins - startMins;
    const totalHeight = totalMinutes * this.pxPerMinute;

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
      const topPx = (m - startMins) * this.pxPerMinute;
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
    const btnOpenPrivacy = document.getElementById("btn-open-privacy");
    if (btnOpenPrivacy) {
      btnOpenPrivacy.addEventListener("click", () => this.openPrivacyModal());
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
      const stored = localStorage.getItem(this.storageKeys.favorites);
      if (!stored) return new Set();
      const rawList = JSON.parse(stored);
      return Array.isArray(rawList) ? new Set(rawList) : new Set();
    } catch {
      return new Set();
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(this.storageKeys.favorites, JSON.stringify(Array.from(this.favorites)));
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

    // If favorites-only filter is active, acts must be re-rendered to filter in/out
    if (this.onlyFavorites) {
      this.render(true);
    } else {
      // In-place UI update without full DOM recreation or scroll jump
      this.updateActFavoriteUI(actId);
    }

    // If modal is open, update button state and clash warnings
    if (this.currentModalAct) {
      if (this.currentModalAct.id === actId) {
        this.updateModalFavBtn(actId);
      }
      this.checkClashes(this.currentModalAct);
    }
  }

  updateActFavoriteUI(actId) {
    const isFav = this.favorites.has(actId);

    // 1. Update Grid View Cards
    const gridCards = document.querySelectorAll(`.act-card[data-act-id="${CSS.escape(actId)}"]`);
    gridCards.forEach((card) => {
      card.classList.toggle("is-favorite", isFav);
      const favBtn = card.querySelector(".card-fav-btn");
      if (favBtn) {
        favBtn.classList.toggle("favorited", isFav);
        const svg = favBtn.querySelector("svg");
        if (svg) {
          svg.setAttribute("fill", isFav ? this.favColor : "none");
        }
      }
    });

    // 2. Update List View Cards
    const listCards = document.querySelectorAll(`.list-item-card[data-act-id="${CSS.escape(actId)}"]`);
    listCards.forEach((card) => {
      const favBtn = card.querySelector(".card-fav-btn");
      if (favBtn) {
        favBtn.classList.toggle("favorited", isFav);
        const svg = favBtn.querySelector("svg");
        if (svg) {
          svg.setAttribute("fill", isFav ? this.favColor : "none");
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Main Render Routine
  // --------------------------------------------------------------------------
  render(preserveScroll = false) {
    this.updateFilterHints();

    const activeStages = this.getActiveStages();
    let totalVisibleActs = 0;

    if (this.viewMode === "grid") {
      totalVisibleActs = this.renderGridView(activeStages, preserveScroll);
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
  renderGridView(activeStages, preserveScroll = false) {
    const prevScrollLeft = (preserveScroll && this.stagesColumnsContainer) ? this.stagesColumnsContainer.scrollLeft : 0;
    const prevScrollTop = (preserveScroll && this.timetableBody) ? this.timetableBody.scrollTop : 0;

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
      headerItem.className = "stage-header-item";
      if (stage.color) {
        headerItem.style.setProperty("--stage-color", stage.color);
      }
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
        const heightPx = Math.max(36, durationMin * this.pxPerMinute - 4); // 4px visual gap

        const isLive = this.isActLive(act);
        const isFav = this.favorites.has(act.id);

        const card = document.createElement("div");
        card.className = `act-card ${isLive ? "is-live" : ""} ${isFav ? "is-favorite" : ""}`;
        card.dataset.stage = stage.id;
        card.dataset.actId = act.id;
        if (stage.color) {
          card.style.setProperty("--stage-color", stage.color);
        }
        card.style.top = `${topPx}px`;
        card.style.height = `${heightPx}px`;

        card.innerHTML = `
          <div class="card-header">
            <div class="card-time-wrap">
              <span class="card-time">${act.start}–${act.end}</span>
              ${isLive ? `<span class="card-live-pill">LIVE</span>` : ""}
            </div>
            <button class="card-fav-btn ${isFav ? "favorited" : ""}" data-act-id="${act.id}" title="Favorit" aria-label="Favorit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="${isFav ? this.favColor : "none"}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div class="card-body">
            <div class="card-artist">${this.formatArtistHtml(act.artist)}</div>
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

    this.updateGridWidth(prevScrollLeft > 0 ? prevScrollLeft : null);

    if (prevScrollTop > 0 && this.timetableBody) {
      this.timetableBody.scrollTop = prevScrollTop;
    }

    return totalActsRendered;
  }

  // --------------------------------------------------------------------------
  // Render: List View
  // --------------------------------------------------------------------------
  renderListView(activeStages) {
    this.listCardsWrapper.innerHTML = "";

    const allActs = [];
    const dayConf = this.getCurrentDayConfig();

    // If searching, search across ALL events and days
    if (this.searchQuery) {
      for (const [dayId, stages] of Object.entries(this.data)) {
        const dConf = this.config.days.find((d) => d.id === dayId) || {};
        const dStages = dConf.stages || this.config.stages;
        for (const [stageId, acts] of Object.entries(stages)) {
          const stageConfig = dStages.find((s) => s.id === stageId) || { name: stageId, color: this.config.theme?.accentColor || "#00FF87" };
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
      const dayPrefix = this.searchQuery && act.dayConfig?.label ? `${act.dayConfig.label} · ` : "";

      const card = document.createElement("div");
      card.className = `list-item-card ${isLive ? "is-live" : ""}`;
      card.dataset.stage = act.stage;
      card.dataset.actId = act.id;
      if (act.stageConfig?.color) {
        card.style.setProperty("--stage-color", act.stageConfig.color);
      }

      card.innerHTML = `
        <div class="list-time-block">
          <span class="list-time">${act.start} – ${act.end}</span>
          <span class="list-duration">${durationMin} Min.${isLive ? ' · <strong style="color:var(--neon-green)">JETZT</strong>' : ''}</span>
        </div>

        <div class="list-info-block">
          <div class="list-artist-title">${this.formatArtistHtml(act.artist)}</div>
          <span class="list-stage-label" style="color: ${act.stageConfig.color};">${dayPrefix}${act.stageConfig.name}</span>
        </div>

        <button class="card-fav-btn ${isFav ? "favorited" : ""}" data-act-id="${act.id}" title="Favorit">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="${isFav ? this.favColor : "none"}" stroke="currentColor" stroke-width="2">
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
  updateGridWidth(restoreScrollLeft = null) {
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

      if (restoreScrollLeft !== null && restoreScrollLeft > 0) {
        if (this.stagesColumnsContainer) this.stagesColumnsContainer.scrollLeft = restoreScrollLeft;
        if (this.stageHeadersList) this.stageHeadersList.scrollLeft = restoreScrollLeft;
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
    const endMins = (isOvernight && dayConf.endHour <= dayConf.startHour)
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
    // If explicitly invoked by user click and current day is not the active festival day, switch to it
    if (!silent) {
      const activeDay = this.detectInitialDay();
      if (this.currentDay !== activeDay) {
        this.setDay(activeDay);
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
    const endMins = (isOvernight && dayConf.endHour <= dayConf.startHour)
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
    const stageColor = stageConfig.color || this.config.theme?.accentColor || "#00FF87";

    // Header Details
    this.modalStageBadge.textContent = act.stageName;
    this.modalStageBadge.style.backgroundColor = stageConfig.badgeBg || `color-mix(in srgb, ${stageColor} 15%, transparent)`;
    this.modalStageBadge.style.color = stageColor;

    this.modalArtist.innerHTML = this.formatArtistHtml(act.artist);
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
    if (!this.config.disclaimer?.enabled) return;
    try {
      const isDismissed = localStorage.getItem(this.storageKeys.disclaimer);
      if (!isDismissed && this.disclaimerModal) {
        this.disclaimerModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
      }
    } catch (e) {
      console.warn("Could not check disclaimer", e);
    }
  }

  openDisclaimerModal() {
    if (this.disclaimerModal && this.config.disclaimer?.enabled) {
      this.disclaimerModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  dismissDisclaimer() {
    try {
      localStorage.setItem(this.storageKeys.disclaimer, "true");
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
    if (this.privacyModal && this.config.legal?.privacy?.enabled) {
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
        if (sessionStorage.getItem(this.storageKeys.iab) === "true") {
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
          sessionStorage.setItem(this.storageKeys.iab, "true");
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

          // Proactively check for new version
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
      isDismissed = localStorage.getItem(this.storageKeys.iosPrompt) === "true";
    } catch (e) {}

    if (isIos && !isStandalone && !isDismissed) {
      setTimeout(() => {
        try {
          if (localStorage.getItem(this.storageKeys.iosPrompt) !== "true") {
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
          localStorage.setItem(this.storageKeys.iosPrompt, "true");
        } catch (err) {}
      });
    }
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.timetableApp = new TimetableApp();
});
