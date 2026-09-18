/**
 * Rheingrün Festival Timetable Data
 * 18. - 20. September 2026
 * Categories:
 * - Festival: Saturday & Sunday across Mainstage, F2F Stage, Hidden Stage.
 * - Club: Friday Pre-Party @ Gotec, Saturday Aftershow @ Gotec & Elfino.
 */

export const FESTIVAL_CONFIG = {
  name: "Rheingrün Festival",
  edition: "2026",
  dates: {
    friday_pre: "2026-09-18",
    saturday: "2026-09-19",
    saturday_after: "2026-09-19",
    sunday: "2026-09-20"
  },
  pxPerMinute: 2, // 2px per minute -> 1 hour = 120px, 90 min = 180px
  days: [
    // --- FESTIVAL (OPEN AIR) ---
    {
      id: "saturday",
      category: "festival",
      label: "Samstag",
      shortLabel: "SA",
      dateFormatted: "19. SEP 2026",
      isoDate: "2026-09-19",
      startHour: 11,
      endHour: 23,
      isOvernight: false,
      stages: [
        { id: "mainstage", name: "Mainstage", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
        { id: "f2f", name: "F2F Stage", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
        { id: "hidden", name: "Hidden Stage", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" }
      ]
    },
    {
      id: "sunday",
      category: "festival",
      label: "Sonntag",
      shortLabel: "SO",
      dateFormatted: "20. SEP 2026",
      isoDate: "2026-09-20",
      startHour: 11,
      endHour: 23,
      isOvernight: false,
      stages: [
        { id: "mainstage", name: "Mainstage", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
        { id: "f2f", name: "F2F Stage", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
        { id: "hidden", name: "Hidden Stage", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" }
      ]
    },
    // --- CLUB (PRE & AFTERSHOW) ---
    {
      id: "friday_pre",
      category: "club",
      label: "Pre-Party",
      shortLabel: "FR",
      subLabel: "Gotec Club",
      dateFormatted: "18. SEP 2026",
      isoDate: "2026-09-18",
      startHour: 22,
      endHour: 6, // 22:00 bis 06:00
      isOvernight: true,
      stages: [
        { id: "gotec_main", name: "Gotec Main", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" }
      ]
    },
    {
      id: "saturday_after",
      category: "club",
      label: "Aftershow",
      shortLabel: "SA",
      subLabel: "Gotec & Elfino",
      dateFormatted: "19. SEP 2026",
      isoDate: "2026-09-19",
      startHour: 22,
      endHour: 9, // 22:00 bis 09:00
      isOvernight: true,
      stages: [
        { id: "gotec_main", name: "Gotec Mainfloor", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
        { id: "gotec_boiler", name: "Gotec Boiler F2F", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
        { id: "gotec_cube", name: "Gotec Cube", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" },
        { id: "elfino", name: "Elfino", color: "#FF7170", badgeBg: "rgba(255, 113, 112, 0.15)", border: "#FF7170" }
      ]
    }
  ],
  // Fallback stages
  stages: [
    { id: "mainstage", name: "Mainstage", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
    { id: "f2f", name: "F2F Stage", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
    { id: "hidden", name: "Hidden Stage", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" },
    { id: "gotec_main", name: "Gotec Mainfloor", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
    { id: "gotec_boiler", name: "Gotec Boiler F2F", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
    { id: "gotec_cube", name: "Gotec Cube", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" },
    { id: "elfino", name: "Elfino", color: "#FF7170", badgeBg: "rgba(255, 113, 112, 0.15)", border: "#FF7170" }
  ]
};

export const SCHEDULE_DATA = {
  // ==========================================================================
  // FESTIVAL: SAMSTAG (19. SEP 2026)
  // ==========================================================================
  saturday: {
    mainstage: [
      { id: "sat-saika", artist: "SAIKA", start: "11:00", end: "13:00", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-lola-cerise-gustav-organo", artist: "LOLA CERISE B2B GUSTAV ØRGANO", start: "13:00", end: "14:30", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-dasstudach", artist: "DASSTUDACH", start: "14:30", end: "16:00", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-kander", artist: "KANDER", start: "16:00", end: "18:00", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-ush-slvl", artist: "USH B2B SLVL", start: "18:00", end: "19:30", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-vieze-asbak", artist: "VIEZE ASBAK", start: "19:30", end: "21:00", stage: "mainstage", stageName: "Mainstage", day: "saturday" },
      { id: "sat-natte-visstick-jowi", artist: "NATTE VISSTICK B2B JOWI", start: "21:00", end: "22:30", stage: "mainstage", stageName: "Mainstage", day: "saturday" }
    ],
    f2f: [
      { id: "sat-dj-blush-lensch", artist: "DJ BLUSH F2F LENSCH", start: "13:00", end: "14:30", stage: "f2f", stageName: "F2F Stage", day: "saturday" },
      { id: "sat-rot-ton-dj-sexstasy", artist: "ROT.TON F2F DJ SEXSTASY", start: "14:30", end: "16:00", stage: "f2f", stageName: "F2F Stage", day: "saturday" },
      { id: "sat-dj-hyperdrive-laure-croft", artist: "DJ HYPERDRIVE F2F LAURE CROFT", start: "16:00", end: "17:30", stage: "f2f", stageName: "F2F Stage", day: "saturday" },
      { id: "sat-elli-acula-mac-declos", artist: "ELLI ACULA F2F MAC DECLOS", start: "17:30", end: "19:30", stage: "f2f", stageName: "F2F Stage", day: "saturday" },
      { id: "sat-alarico-shdw", artist: "ALARICO F2F SHDW", start: "19:30", end: "21:00", stage: "f2f", stageName: "F2F Stage", day: "saturday" },
      { id: "sat-future-666-fenim0re", artist: "FUTURE.666 F2F FENIM0RE", start: "21:00", end: "22:30", stage: "f2f", stageName: "F2F Stage", day: "saturday" }
    ],
    hidden: [
      { id: "sat-antigen-lilli-4love", artist: "ANTIGEN B2B LILLI&4LOVE", start: "14:00", end: "15:30", stage: "hidden", stageName: "Hidden Stage", day: "saturday" },
      { id: "sat-the-muffin-man-alycia-bezgo", artist: "THE MUFFIN MAN B2B ALYCIA BEZGO", start: "15:30", end: "17:00", stage: "hidden", stageName: "Hidden Stage", day: "saturday" },
      { id: "sat-trancemaster-krause-bixbita", artist: "TRANCEMASTER KRAUSE B2B BIXBITA", start: "17:00", end: "18:30", stage: "hidden", stageName: "Hidden Stage", day: "saturday" },
      { id: "sat-davyboi-peterblue", artist: "DAVYBOI B2B PETERBLUE", start: "18:30", end: "20:00", stage: "hidden", stageName: "Hidden Stage", day: "saturday" },
      { id: "sat-mika-heggemann-cleopard2000", artist: "MIKA HEGGEMANN B2B CLEOPARD2000", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage", day: "saturday" }
    ]
  },

  // ==========================================================================
  // FESTIVAL: SONNTAG (20. SEP 2026)
  // ==========================================================================
  sunday: {
    mainstage: [
      { id: "sun-ponti", artist: "PØNTI", start: "11:00", end: "12:30", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-kotorri", artist: "KOTORRI", start: "12:30", end: "14:00", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-schrotthagen", artist: "SCHROTTHAGEN", start: "14:00", end: "15:30", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-nicolas-julian", artist: "NICOLAS JULIAN", start: "15:30", end: "17:00", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-nikolina", artist: "NIKOLINA", start: "17:00", end: "18:30", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-vendex", artist: "VENDEX", start: "18:30", end: "20:00", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-jazzy", artist: "JAZZY", start: "20:00", end: "21:30", stage: "mainstage", stageName: "Mainstage", day: "sunday" },
      { id: "sun-surprise-closing", artist: "SURPRISE CLOSING 👀", start: "21:30", end: "22:00", stage: "mainstage", stageName: "Mainstage", day: "sunday", isSpecial: true }
    ],
    f2f: [
      { id: "sun-dvaid-relajadita", artist: "DVAID F2F RELAJADITA", start: "12:30", end: "14:00", stage: "f2f", stageName: "F2F Stage", day: "sunday" },
      { id: "sun-wilderich-zwilling", artist: "WILDERÍCH F2F ZWILLING", start: "14:00", end: "15:30", stage: "f2f", stageName: "F2F Stage", day: "sunday" },
      { id: "sun-l-zwo-antonym", artist: "L.ZWO F2F ANTONYM", start: "15:30", end: "17:00", stage: "f2f", stageName: "F2F Stage", day: "sunday" },
      { id: "sun-noise-mafia-fenrick", artist: "NOISE MAFIA F2F FENRICK", start: "17:00", end: "18:30", stage: "f2f", stageName: "F2F Stage", day: "sunday" },
      { id: "sun-cloudy-serafina", artist: "CLOUDY F2F SERAFINA", start: "18:30", end: "20:00", stage: "f2f", stageName: "F2F Stage", day: "sunday" },
      { id: "sun-adrian-mills-prada2000", artist: "ADRIÁN MILLS F2F PRADA2000", start: "20:00", end: "22:00", stage: "f2f", stageName: "F2F Stage", day: "sunday" }
    ],
    hidden: [
      { id: "sun-tamara-wirth", artist: "TAMARA WIRTH", start: "14:30", end: "16:00", stage: "hidden", stageName: "Hidden Stage", day: "sunday" },
      { id: "sun-dj-swisherman", artist: "DJ SWISHERMAN", start: "16:00", end: "17:30", stage: "hidden", stageName: "Hidden Stage", day: "sunday" },
      { id: "sun-frederic-stef-de-haan", artist: "FREDERIC. B2B STEF DE HAAN", start: "17:30", end: "19:00", stage: "hidden", stageName: "Hidden Stage", day: "sunday" },
      { id: "sun-aerea", artist: "AEREA (LIVE)", start: "19:00", end: "20:00", stage: "hidden", stageName: "Hidden Stage", day: "sunday", isLive: true },
      { id: "sun-dax-j", artist: "DAX J", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage", day: "sunday" }
    ]
  },

  // ==========================================================================
  // CLUB: FRIDAY PRE-PARTY @ GOTEC (18. SEP 2026)
  // ==========================================================================
  friday_pre: {
    gotec_main: [
      { id: "fri-gotec-4000hz", artist: "4000 HZ", start: "22:00", end: "00:00", stage: "gotec_main", stageName: "Gotec Main", day: "friday_pre" },
      { id: "fri-gotec-mxgn", artist: "MXGN", start: "00:00", end: "02:00", stage: "gotec_main", stageName: "Gotec Main", day: "friday_pre" },
      { id: "fri-gotec-mika-heggemann", artist: "MIKA HEGGEMANN", start: "02:00", end: "04:00", stage: "gotec_main", stageName: "Gotec Main", day: "friday_pre" },
      { id: "fri-gotec-sikoti-aisha", artist: "SIKOTI B2B AISHA", start: "04:00", end: "06:00", stage: "gotec_main", stageName: "Gotec Main", day: "friday_pre" }
    ]
  },

  // ==========================================================================
  // CLUB: SATURDAY AFTERSHOW @ GOTEC & ELFINO (19. SEP 2026)
  // ==========================================================================
  saturday_after: {
    gotec_main: [
      { id: "sat-after-gotec-shanixx", artist: "SHANIXX", start: "22:00", end: "00:00", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" },
      { id: "sat-after-gotec-kander", artist: "KANDER", start: "00:00", end: "02:00", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" },
      { id: "sat-after-gotec-dasstudach-alt8", artist: "DASSTUDACH B2B ALT8", start: "02:00", end: "04:00", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" },
      { id: "sat-after-gotec-jowi", artist: "JOWI", start: "04:00", end: "05:30", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" },
      { id: "sat-after-gotec-vieze-asbak-natte-visstick", artist: "VIEZE ASBAK B2B NATTE VISSTICK", start: "05:30", end: "07:00", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" },
      { id: "sat-after-gotec-b2b2b", artist: "B2B2B", start: "07:00", end: "09:00", stage: "gotec_main", stageName: "Gotec Mainfloor", day: "saturday_after" }
    ],
    gotec_boiler: [
      { id: "sat-after-boiler-saika-ponti", artist: "SAIKA F2F PØNTI", start: "00:00", end: "02:00", stage: "gotec_boiler", stageName: "Gotec Boiler F2F", day: "saturday_after" },
      { id: "sat-after-boiler-alex-farell-lola-cerise", artist: "ALEX FARELL F2F LOLA CERISE", start: "02:00", end: "04:00", stage: "gotec_boiler", stageName: "Gotec Boiler F2F", day: "saturday_after" },
      { id: "sat-after-boiler-ben-techy-neon-graveyard", artist: "BEN TECHY F2F NEON GRAVEYARD", start: "04:00", end: "06:00", stage: "gotec_boiler", stageName: "Gotec Boiler F2F", day: "saturday_after" }
    ],
    gotec_cube: [
      { id: "sat-after-cube-bound", artist: "BOUND", start: "00:00", end: "02:00", stage: "gotec_cube", stageName: "Gotec Cube", day: "saturday_after" },
      { id: "sat-after-cube-antonym", artist: "ANTONYM", start: "02:00", end: "03:30", stage: "gotec_cube", stageName: "Gotec Cube", day: "saturday_after" },
      { id: "sat-after-cube-datsko", artist: "DATSKO", start: "03:30", end: "05:00", stage: "gotec_cube", stageName: "Gotec Cube", day: "saturday_after" }
    ],
    elfino: [
      { id: "sat-after-elfino-cherry", artist: "CHERRY", start: "23:00", end: "00:30", stage: "elfino", stageName: "Elfino", day: "saturday_after" },
      { id: "sat-after-elfino-kotorri", artist: "KOTORRI", start: "00:30", end: "02:00", stage: "elfino", stageName: "Elfino", day: "saturday_after" },
      { id: "sat-after-elfino-samuel-moriero", artist: "SAMUEL MORIERO", start: "02:00", end: "03:30", stage: "elfino", stageName: "Elfino", day: "saturday_after" },
      { id: "sat-after-elfino-santino-zervos-teoman", artist: "SANTINO ZERVOS B2B TEOMAN", start: "03:30", end: "05:00", stage: "elfino", stageName: "Elfino", day: "saturday_after" }
    ]
  }
};
