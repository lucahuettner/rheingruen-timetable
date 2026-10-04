/**
 * Event Timetable Configuration & Schedule Data
 * ============================================================================
 * Konfiguriert für: HIVE INDOOR 2026 (Messe Leipzig)
 */

export const EVENT_CONFIG = {
  // Eindeutige Event-ID (wird als Präfix für localStorage/sessionStorage verwendet)
  id: "hive-indoor-2026",

  // 1. Branding & Meta-Tags
  branding: {
    title: "HIVE INDOOR",
    subtitle: "17. OKT · MESSE LEIPZIG",
    typeLabel: "INDOOR",
    shortName: "HIVE Indoor",
    pageTitle: "Timetable – HIVE Indoor 2026",
    description: "Festival-Zeitplan für das HIVE Indoor 2026 in der Messe Leipzig (Techno Colosseum, Iron Vault, Cargo Bay & Rage Box). 100 % offline nutzbar."
  },

  // 2. Farbschema & Zeitraster (HIVE Industrial Red, Steel & Obsidian Theme)
  theme: {
    accentColor: "#FF1E27",        // HIVE Signal Red (Live-Indikator, Fokus, Badges)
    accentContrast: "#FFFFFF",     // Kontrast-Textfarbe auf Haupt-Akzentfarbe
    secondaryColor: "#E2E8F0",     // Industrial Chrome / Silver
    favoriteColor: "#FF1E27",      // Farbe für Favoriten-Herzen
    bgBlack: "#060608",            // App-Außenhintergrund (Deep Obsidian)
    bgDark: "#0A0B0E",             // Haupt-Hintergrund (Industrial Carbon)
    bgSurface: "#111318",          // Header & Listen-Karten
    bgSurfaceElevated: "#181B22",  // Hervorgehobene Elemente / Modals
    bgSurfaceCard: "#13161C",      // Grid-Karten Hintergrund
    pxPerMinute: 2                 // Vertikale Skalierung (2px/Min = 120px pro Stunde)
  },

  // 3. Bühnen / Floors (Reihenfolge von links nach rechts im Grid)
  stages: [
    { id: "techno_colosseum", name: "Techno Colosseum", color: "#FF1E27" },
    { id: "iron_vault", name: "Iron Vault", color: "#38BDF8" },
    { id: "cargo_bay", name: "Cargo Bay", color: "#FF7A00" },
    { id: "rage_box", name: "Rage Box", color: "#D946EF" }
  ],

  // Standardmäßig ausgewählter Tag
  defaultDayId: "saturday",

  // 4. Event-Tage (Da nur 1 durchgehendes Nacht-Event von 15:00 bis 05:00 Uhr existiert,
  // blendet die App die Tages-Tab-Leiste automatisch aus)
  days: [
    {
      id: "saturday",
      badge: "SA",
      title: "HIVE Indoor",
      subtitle: "17. OKT",
      isoDate: "2026-10-17",
      startHour: 15,
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
 * Zeitplan-Daten für HIVE INDOOR (15:00 – 05:00 Uhr)
 */
export const SCHEDULE_DATA = {
  saturday: {
    // ========================================================================
    // TECHNO COLOSSEUM
    // ========================================================================
    techno_colosseum: [
      { artist: "ÜBERKIKZ B2B FELICIE", start: "15:00", end: "16:30" },
      { artist: "YANAMASTE", start: "16:30", end: "18:00" },
      { artist: "KLANGKUENSTLER", start: "18:00", end: "19:30" },
      { artist: "SCHROTTHAGEN", start: "19:30", end: "21:00" },
      { artist: "KOBOSIL", start: "21:00", end: "22:30" },
      { artist: "NICO MORENO", start: "22:30", end: "00:00" },
      { artist: "HOLY PRIEST", start: "00:00", end: "01:30" },
      { artist: "WINSON B2B KLOFAMA", start: "01:30", end: "03:30" },
      { artist: "NOTMYTYPE", start: "03:30", end: "05:00" }
    ],

    // ========================================================================
    // IRON VAULT
    // ========================================================================
    iron_vault: [
      { artist: "NOISE NOT WAR B2B TRÜMMER (LIVE)", start: "15:00", end: "16:30" },
      { artist: "BEN TECHY B2B LUCIID", start: "16:30", end: "18:00" },
      { artist: "OBSCURE SHAPE B2B NEON GRAVEYARD", start: "18:00", end: "19:30" },
      { artist: "NIKOLINA B2B KLOUD", start: "19:30", end: "21:00" },
      { artist: "TRIPTYKH B2B O.B.I.", start: "21:00", end: "23:00" },
      { artist: "IN VERRUF B2B ORNELLA", start: "23:00", end: "00:30" },
      { artist: "CHARLIE SPARKS B2B NICOLAS JULIAN", start: "00:30", end: "02:00" },
      { artist: "A.N.I. B2B OMAKS", start: "02:00", end: "03:30" }
    ],

    // ========================================================================
    // CARGO BAY
    // ========================================================================
    cargo_bay: [
      { artist: "SAGEZZA", start: "15:00", end: "17:00" },
      { artist: "TIEFUNDTON", start: "17:00", end: "18:30" },
      { artist: "KAACEE KOMACASPER", start: "18:30", end: "19:30" },
      { artist: "DIE GEBRÜDER BRETT", start: "19:30", end: "20:30" },
      { artist: "POLTERGST", start: "20:30", end: "21:30" },
      { artist: "KØ:LAB & ANUUK & DONCHOPPA", start: "21:30", end: "22:30" },
      { artist: "GIØ B2B ZWILLING.", start: "22:30", end: "00:00" },
      { artist: "L.ZWO B2B 2HOT2PLAY", start: "00:00", end: "01:30" },
      { artist: "DJ DRECKISCH B2B DICE", start: "01:30", end: "03:00" },
      { artist: "NOISE MAFIA B2B FENRICK", start: "03:00", end: "05:00" }
    ],

    // ========================================================================
    // RAGE BOX
    // ========================================================================
    rage_box: [
      { artist: "ALLY B2B SALTYSIS", start: "15:00", end: "16:00" },
      { artist: "IKKHI B2B TITI", start: "16:00", end: "17:00" },
      { artist: "IGDA B2B JOVYNN", start: "17:00", end: "18:30" },
      { artist: "NATTE VISSTICK B2B MAD DOG", start: "18:30", end: "20:00" },
      { artist: "SLVL B2B TOXIC MACHINERY", start: "20:00", end: "21:30" },
      { artist: "USH B2B JOWI", start: "21:30", end: "23:00" },
      { artist: "VORTEK'S B2B WILLIAM LUCK", start: "23:00", end: "01:00" },
      { artist: "ANGERFIST B2B VIEZE ASBAK", start: "01:00", end: "02:30" },
      { artist: "BØĘRY B2B SANTØS", start: "02:30", end: "04:00" }
    ]
  }
};
