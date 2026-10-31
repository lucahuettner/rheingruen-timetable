/**
 * Event Timetable Configuration & Schedule Data
 * ============================================================================
 * Konfiguriert für: GOTEC CLUB KARLSRUHE – 31. OKTOBER 2026
 * "TODAY – NO HALLOWEEN. JUST FINEST TECHNO. 🖤"
 */

export const EVENT_CONFIG = {
  // Eindeutige Event-ID (wird als Präfix für localStorage/sessionStorage verwendet)
  id: "gotec-techno-2026-10-31",

  // 1. Branding & Meta-Tags
  branding: {
    title: "GOTEC",
    typeLabel: "CLUB",
    subtitle: "31. OKT · GOTEC KARLSRUHE",
    shortName: "Gotec Timetable",
    pageTitle: "Timetable – Gotec Club · 31. Okt 2026",
    description: "Timetable für Gotec Club Karlsruhe (Mainfloor, Boiler & Køde) – 31. Oktober 2026. 100 % offline nutzbar mit Live-Uhrzeit."
  },

  // 2. Farbschema & Zeitraster (Electric Cyan, Rose & Amber Techno Theme)
  theme: {
    accentColor: "#38BDF8",        // Electric Cyan Accent
    accentContrast: "#000000",     // Kontrast-Textfarbe auf Haupt-Akzentfarbe
    secondaryColor: "#E2E8F0",     // Chrome / Silver
    favoriteColor: "#F43F5E",      // Farbe für Favoriten-Herzen
    bgBlack: "#060608",            // App-Außenhintergrund (Deep Obsidian)
    bgDark: "#0A0B0E",             // Haupt-Hintergrund (Industrial Carbon)
    bgSurface: "#111318",          // Header & Listen-Karten
    bgSurfaceElevated: "#181B22",  // Hervorgehobene Elemente / Modals
    bgSurfaceCard: "#13161C",      // Grid-Karten Hintergrund
    pxPerMinute: 2                 // Vertikale Skalierung (2px/Min = 120px pro Stunde)
  },

  // 3. Bühnen / Floors (Reihenfolge von links nach rechts im Grid)
  stages: [
    { id: "mainfloor", name: "Mainfloor", color: "#38BDF8" },
    { id: "boiler", name: "Boiler", color: "#F59E0B" },
    { id: "kode", name: "Køde", color: "#EC4899" }
  ],

  // Standardmäßig ausgewählter Tag
  defaultDayId: "saturday",

  // 4. Event-Tage (Da nur 1 durchgehendes Nacht-Event von 21:00 bis 05:00 Uhr existiert,
  // blendet die App die Tages-Tab-Leiste automatisch aus)
  days: [
    {
      id: "saturday",
      badge: "SA",
      title: "Gotec Club",
      subtitle: "31. OKT",
      isoDate: "2026-10-31",
      startHour: 21,
      endHour: 5
    }
  ],

  // 5. Optionaler Erstbesucher-Disclaimer (deaktiviert)
  disclaimer: {
    enabled: false
  },

  // 6. Footer-Credits & Datenschutzerklärung
  legal: {
    creditsLabel: "Gebaut von @da_lucaaa ↗",
    creditsUrl: "https://www.instagram.com/da_lucaaa",
    privacy: {
      enabled: true,
      contactName: "Luca Hüttner",
      contactEmail: "timetable@huettner.dev",
      hostingProvider: "GitHub Pages (GitHub Inc., San Francisco, USA – Microsoft-Gruppe)",
      supervisoryAuthorityName: "LfDI Baden-Württemberg",
      supervisoryAuthorityUrl: "https://www.baden-wuerttemberg.datenschutz.de/",
      supervisoryAuthorityLabel: "lfdi.baden-wuerttemberg.de",
      updatedAt: "Oktober 2026"
    }
  }
};

/**
 * Zeitplan-Daten für GOTEC CLUB (21:00 – 05:00 Uhr)
 */
export const SCHEDULE_DATA = {
  saturday: {
    // ========================================================================
    // MAINFLOOR (21:00 – 05:00)
    // ========================================================================
    mainfloor: [
      { artist: "VSN22", start: "21:00", end: "23:00" },
      { artist: "OBSCURE SHAPE", start: "23:00", end: "00:30" },
      { artist: "CALLUSH", start: "00:30", end: "02:00" },
      { artist: "CHARLIE SPARKS", start: "02:00", end: "03:30" },
      { artist: "NEEK", start: "03:30", end: "05:00" }
    ],

    // ========================================================================
    // BOILER (22:00 – 05:00)
    // ========================================================================
    boiler: [
      { artist: "BTFL", start: "22:00", end: "00:00" },
      { artist: "DICE", start: "00:00", end: "01:30" },
      { artist: "ANTONYM", start: "01:30", end: "03:00" },
      { artist: "NYRA", start: "03:00", end: "05:00" }
    ],

    // ========================================================================
    // KØDE (00:00 – 05:00)
    // ========================================================================
    kode: [
      { artist: "PØNTI", start: "00:00", end: "01:30" },
      { artist: "ALBA FRANCH", start: "01:30", end: "03:00" },
      { artist: "SAIKA", start: "03:00", end: "05:00" }
    ]
  }
};
