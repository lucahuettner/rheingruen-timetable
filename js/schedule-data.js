/**
 * Event Timetable Configuration & Schedule Data
 * ============================================================================
 * Passen Sie für ein neues Event einfach EVENT_CONFIG und SCHEDULE_DATA an.
 * Alle Farben, Tabs, Bühnen, Zeiten, Disclaimer-Links und Rechtstexte werden
 * automatisch aus dieser Datei generiert.
 */

export const EVENT_CONFIG = {
  // Eindeutige Event-ID (wird als Präfix für localStorage/sessionStorage verwendet)
  id: "rheingruen-2026",

  // 1. Branding & Meta-Tags
  branding: {
    title: "RHEINGRÜN",
    subtitle: "OPEN AIR · 19.–20. SEP",
    typeLabel: "OPEN AIR",
    shortName: "Rheingrün",
    pageTitle: "Timetable – Rheingrün Festival 2026",
    description: "Festival-Zeitplan mit Live-Uhrzeit, Stages und Favoriten. Funktioniert komplett offline."
  },

  // 2. Farbschema & Zeitraster
  theme: {
    accentColor: "#00FF87",        // Haupt-Akzentfarbe (Live-Indikator, aktive Tabs, Fokus)
    secondaryColor: "#60EFFF",     // Sekundäre Akzentfarbe
    favoriteColor: "#FF4B6E",      // Farbe für Favoriten-Herzen
    bgDark: "#0b120f",             // App-Hintergrund
    bgSurface: "#101a15",          // Header & Listen-Karten
    bgSurfaceElevated: "#15221c",  // Hervorgehobene Elemente / Modals
    bgSurfaceCard: "#121c17",      // Grid-Karten Hintergrund
    pxPerMinute: 2                 // Vertikale Skalierung (2px/Min = 120px pro Stunde)
  },

  // 3. Standard-Stages (werden genutzt, sofern ein Tag keine eigenen `stages` definiert)
  stages: [
    { id: "mainstage", name: "Mainstage", color: "#00FF87" },
    { id: "f2f", name: "F2F Stage", color: "#60EFFF" },
    { id: "hidden", name: "Hidden Stage", color: "#C084FC" }
  ],

  // Standardmäßig ausgewählter Tab außerhalb des Event-Zeitraums
  defaultDayId: "saturday",

  // 4. Event-Tage / Abschnitte (Reihenfolge bestimmt die Reihenfolge in der Navigation)
  // Hinweis: Ist `endHour <= startHour` (z. B. 22 bis 6 Uhr), wird automatisch ein Nacht-Überlauf erkannt.
  days: [
    {
      id: "friday_pre",
      badge: "FR",
      title: "Pre-Party",
      subtitle: "Gotec",
      isoDate: "2026-09-18",
      startHour: 22,
      endHour: 6,
      stages: [
        { id: "gotec_main", name: "Gotec Main", color: "#00FF87" }
      ]
    },
    {
      id: "saturday",
      badge: "SA",
      title: "Festival",
      subtitle: "19. SEP",
      isoDate: "2026-09-19",
      startHour: 11,
      endHour: 23
    },
    {
      id: "saturday_after",
      badge: "SA",
      title: "Aftershow",
      subtitle: "Gotec & Elfino",
      isoDate: "2026-09-19",
      startHour: 22,
      endHour: 9,
      stages: [
        { id: "gotec_main", name: "Gotec Mainfloor", color: "#00FF87" },
        { id: "gotec_boiler", name: "Gotec Boiler F2F", color: "#60EFFF" },
        { id: "gotec_cube", name: "Gotec Cube", color: "#C084FC" },
        { id: "elfino", name: "Elfino", color: "#FF7170" }
      ]
    },
    {
      id: "sunday",
      badge: "SO",
      title: "Festival",
      subtitle: "20. SEP",
      isoDate: "2026-09-20",
      startHour: 11,
      endHour: 23
    }
  ],

  // 5. Optionaler Erstbesucher-Disclaimer (für offizielle Timetables einfach `enabled: false` setzen)
  disclaimer: {
    enabled: true,
    badge: "INOFFIZIELLER FAN-TIMETABLE",
    title: "Wichtiger Hinweis",
    introHtml: "Diese Web-App ist ein <strong>privates, inoffizielles Projekt</strong> für Freunde und Besucher, um den Zeitplan auf dem Festivalgelände schnell und 100 % offline nutzen zu können.",
    subHtml: "Dies ist <em>keine</em> offizielle Seite des Festival-Veranstalters. Für alle verbindlichen Infos, offizielle Updates, Timetable-Änderungen und Lagepläne besuche bitte die offiziellen Kanäle:",
    confirmLabel: "Verstanden & weiter zum Zeitplan",
    links: [
      {
        label: "Offizielle Festival-Website",
        url: "https://rheingruen-openair.de/",
        icon: "globe"
      },
      {
        label: "Instagram (@rheingruen_festival)",
        url: "https://www.instagram.com/rheingruen_festival/",
        icon: "instagram",
        variant: "instagram"
      }
    ]
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
 * Zeitplan-Daten (gruppiert nach `day.id` -> `stage.id`)
 * Jeder Slot benötigt lediglich `{ artist, start, end }`.
 * IDs, Bühnennamen und Tageszuordnungen werden automatisch generiert.
 */
export const SCHEDULE_DATA = {
  // ==========================================================================
  // FESTIVAL: SAMSTAG
  // ==========================================================================
  saturday: {
    mainstage: [
      { artist: "SAIKA", start: "11:00", end: "13:00" },
      { artist: "LOLA CERISE B2B GUSTAV ØRGANO", start: "13:00", end: "14:30" },
      { artist: "DASSTUDACH", start: "14:30", end: "16:00" },
      { artist: "KANDER", start: "16:00", end: "18:00" },
      { artist: "USH B2B SLVL", start: "18:00", end: "19:30" },
      { artist: "VIEZE ASBAK", start: "19:30", end: "21:00" },
      { artist: "NATTE VISSTICK B2B JOWI", start: "21:00", end: "22:30" }
    ],
    f2f: [
      { artist: "DJ BLUSH F2F LENSCH", start: "13:00", end: "14:30" },
      { artist: "ROT.TON F2F DJ SEXSTASY", start: "14:30", end: "16:00" },
      { artist: "DJ HYPERDRIVE F2F LAURE CROFT", start: "16:00", end: "17:30" },
      { artist: "ELLI ACULA F2F MAC DECLOS", start: "17:30", end: "19:30" },
      { artist: "ALARICO F2F SHDW", start: "19:30", end: "21:00" },
      { artist: "FUTURE.666 F2F FENIM0RE", start: "21:00", end: "22:30" }
    ],
    hidden: [
      { artist: "ANTIGEN B2B LILLI&4LOVE", start: "14:00", end: "15:30" },
      { artist: "THE MUFFIN MAN B2B ALYCIA BEZGO", start: "15:30", end: "17:00" },
      { artist: "TRANCEMASTER KRAUSE B2B BIXBITA", start: "17:00", end: "18:30" },
      { artist: "DAVYBOI B2B PETERBLUE", start: "18:30", end: "20:00" },
      { artist: "MIKA HEGGEMANN B2B CLEOPARD2000", start: "20:00", end: "22:00" }
    ]
  },

  // ==========================================================================
  // FESTIVAL: SONNTAG
  // ==========================================================================
  sunday: {
    mainstage: [
      { artist: "PØNTI", start: "11:00", end: "12:30" },
      { artist: "KOTORRI", start: "12:30", end: "14:00" },
      { artist: "SCHROTTHAGEN", start: "14:00", end: "15:30" },
      { artist: "NICOLAS JULIAN", start: "15:30", end: "17:00" },
      { artist: "NIKOLINA", start: "17:00", end: "18:30" },
      { artist: "VENDEX", start: "18:30", end: "20:00" },
      { artist: "JAZZY", start: "20:00", end: "21:30" },
      { artist: "SURPRISE CLOSING 👀", start: "21:30", end: "22:00" }
    ],
    f2f: [
      { artist: "DVAID F2F RELAJADITA", start: "12:30", end: "14:00" },
      { artist: "WILDERÍCH F2F ZWILLING", start: "14:00", end: "15:30" },
      { artist: "L.ZWO F2F ANTONYM", start: "15:30", end: "17:00" },
      { artist: "NOISE MAFIA F2F FENRICK", start: "17:00", end: "18:30" },
      { artist: "CLOUDY F2F SERAFINA", start: "18:30", end: "20:00" },
      { artist: "ADRIÁN MILLS F2F PRADA2000", start: "20:00", end: "22:00" }
    ],
    hidden: [
      { artist: "TAMARA WIRTH", start: "14:30", end: "16:00" },
      { artist: "DJ SWISHERMAN", start: "16:00", end: "17:30" },
      { artist: "FREDERIC. B2B STEF DE HAAN", start: "17:30", end: "19:00" },
      { artist: "AEREA (LIVE)", start: "19:00", end: "20:00" },
      { artist: "DAX J", start: "20:00", end: "22:00" }
    ]
  },

  // ==========================================================================
  // CLUB: FRIDAY PRE-PARTY
  // ==========================================================================
  friday_pre: {
    gotec_main: [
      { artist: "4000 HZ", start: "22:00", end: "00:00" },
      { artist: "MXGN", start: "00:00", end: "02:00" },
      { artist: "MIKA HEGGEMANN", start: "02:00", end: "04:00" },
      { artist: "SIKOTI B2B AISHA", start: "04:00", end: "06:00" }
    ]
  },

  // ==========================================================================
  // CLUB: SATURDAY AFTERSHOW
  // ==========================================================================
  saturday_after: {
    gotec_main: [
      { artist: "SHANIXX", start: "22:00", end: "00:00" },
      { artist: "KANDER", start: "00:00", end: "02:00" },
      { artist: "DASSTUDACH B2B ALT8", start: "02:00", end: "04:00" },
      { artist: "JOWI", start: "04:00", end: "05:30" },
      { artist: "VIEZE ASBAK B2B NATTE VISSTICK", start: "05:30", end: "07:00" },
      { artist: "B2B2B", start: "07:00", end: "09:00" }
    ],
    gotec_boiler: [
      { artist: "SAIKA F2F PØNTI", start: "00:00", end: "02:00" },
      { artist: "ALEX FARELL F2F LOLA CERISE", start: "02:00", end: "04:00" },
      { artist: "BEN TECHY F2F NEON GRAVEYARD", start: "04:00", end: "06:00" }
    ],
    gotec_cube: [
      { artist: "BOUND", start: "00:00", end: "02:00" },
      { artist: "ANTONYM", start: "02:00", end: "03:30" },
      { artist: "DATSKO", start: "03:30", end: "05:00" }
    ],
    elfino: [
      { artist: "CHERRY", start: "23:00", end: "00:30" },
      { artist: "KOTORRI", start: "00:30", end: "02:00" },
      { artist: "SAMUEL MORIERO", start: "02:00", end: "03:30" },
      { artist: "SANTINO ZERVOS B2B TEOMAN", start: "03:30", end: "05:00" }
    ]
  }
};
