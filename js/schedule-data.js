/**
 * Event Timetable Configuration & Schedule Data
 * ============================================================================
 * Konfiguriert für: ADRENALINE – FAMILY TOUR (Gotec Club Karlsruhe)
 */

export const EVENT_CONFIG = {
  // Eindeutige Event-ID (wird als Präfix für localStorage/sessionStorage verwendet)
  id: "gotec-adrenaline-2026",

  // 1. Branding & Meta-Tags
  branding: {
    title: "ADRENALINE",
    typeLabel: "GOTEC",
    subtitle: "30. OKT · GOTEC KARLSRUHE",
    shortName: "Gotec Timetable",
    pageTitle: "Timetable – Adrenaline Family Tour · Gotec",
    description: "Timetable für die Adrenaline Family Tour im Gotec Club Karlsruhe (Mainfloor, Boiler & Køde). 100 % offline nutzbar."
  },

  // 2. Farbschema & Zeitraster (Adrenaline Electric Purple, Cyan & Chrome Theme)
  theme: {
    accentColor: "#A855F7",        // Electric Purple
    accentContrast: "#FFFFFF",     // Kontrast-Textfarbe auf Haupt-Akzentfarbe
    secondaryColor: "#E2E8F0",     // Chrome / Silver
    favoriteColor: "#A855F7",      // Farbe für Favoriten-Herzen
    bgBlack: "#060608",            // App-Außenhintergrund (Deep Obsidian)
    bgDark: "#0A0B0E",             // Haupt-Hintergrund (Industrial Carbon)
    bgSurface: "#111318",          // Header & Listen-Karten
    bgSurfaceElevated: "#181B22",  // Hervorgehobene Elemente / Modals
    bgSurfaceCard: "#13161C",      // Grid-Karten Hintergrund
    pxPerMinute: 2                 // Vertikale Skalierung (2px/Min = 120px pro Stunde)
  },

  // 3. Bühnen / Floors (Reihenfolge von links nach rechts im Grid)
  stages: [
    { id: "mainfloor", name: "Mainfloor", color: "#A855F7" },
    { id: "boiler", name: "Boiler", color: "#38BDF8" },
    { id: "kode", name: "Køde", color: "#F43F5E" }
  ],

  // Standardmäßig ausgewählter Tag
  defaultDayId: "friday",

  // 4. Event-Tage (Da nur 1 durchgehendes Nacht-Event von 22:00 bis 08:00 Uhr existiert,
  // blendet die App die Tages-Tab-Leiste automatisch aus)
  days: [
    {
      id: "friday",
      badge: "FR",
      title: "Adrenaline",
      subtitle: "30. OKT",
      isoDate: "2026-10-30",
      startHour: 22,
      endHour: 8
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
 * Zeitplan-Daten für ADRENALINE FAMILY TOUR @ GOTEC (22:00 – 08:00 Uhr)
 */
export const SCHEDULE_DATA = {
  friday: {
    // ========================================================================
    // MAINFLOOR (22:00 – 08:00)
    // ========================================================================
    mainfloor: [
      { artist: "FLACCO", start: "22:00", end: "01:30" },
      { artist: "KUKO", start: "01:30", end: "03:00" },
      { artist: "CLOUDY", start: "03:00", end: "04:30" },
      { artist: "SUSKA", start: "04:30", end: "06:00" },
      { artist: "LENE MA RUE", start: "06:00", end: "08:00" }
    ],

    // ========================================================================
    // BOILER (00:00 – 07:00)
    // ========================================================================
    boiler: [
      { artist: "VAGABUND", start: "00:00", end: "01:30" },
      { artist: "ADRIÁN MILLS", start: "01:30", end: "04:30" },
      { artist: "DANILO FILIPE", start: "04:30", end: "07:00" }
    ],

    // ========================================================================
    // KØDE (23:00 – 05:00)
    // ========================================================================
    kode: [
      { artist: "LUZINKA", start: "23:00", end: "01:00" },
      { artist: "GUTKIND", start: "01:00", end: "03:00" },
      { artist: "PANA", start: "03:00", end: "05:00" }
    ]
  }
};
