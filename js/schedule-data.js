/**
 * Rheingrün Festival Timetable Data
 * 19. - 20. September 2026
 * Saturday & Sunday schedules across Mainstage, F2F Stage, and Hidden Stage.
 */

export const FESTIVAL_CONFIG = {
  name: "Rheingrün Festival",
  edition: "2026",
  dates: {
    saturday: "2026-09-19",
    sunday: "2026-09-20"
  },
  startHour: 11, // 11:00
  endHour: 23,   // 23:00 (Mainstage/F2F end at 22:30)
  pxPerMinute: 2, // 2px per minute -> 1 hour = 120px, 90 min = 180px
  days: [
    { id: "saturday", label: "Samstag", shortLabel: "SA", dateFormatted: "19. SEP 2026", isoDate: "2026-09-19" },
    { id: "sunday", label: "Sonntag", shortLabel: "SO", dateFormatted: "20. SEP 2026", isoDate: "2026-09-20" }
  ],
  stages: [
    { id: "mainstage", name: "Mainstage", color: "#00FF87", badgeBg: "rgba(0, 255, 135, 0.15)", border: "#00FF87" },
    { id: "f2f", name: "F2F Stage", color: "#60EFFF", badgeBg: "rgba(96, 239, 255, 0.15)", border: "#60EFFF" },
    { id: "hidden", name: "Hidden Stage", color: "#C084FC", badgeBg: "rgba(192, 132, 252, 0.15)", border: "#C084FC" }
  ]
};

export const SCHEDULE_DATA = {
  saturday: {
    mainstage: [
      { id: "sat-saika", artist: "SAIKA", start: "11:00", end: "13:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-lola-cerise-gustav-organo", artist: "LOLA CERISE B2B GUSTAV ØRGANO", start: "13:00", end: "14:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-dasstudach", artist: "DASSTUDACH", start: "14:30", end: "16:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-kander", artist: "KANDER", start: "16:00", end: "18:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-ush-slvl", artist: "USH B2B SLVL", start: "18:00", end: "19:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-vieze-asbak", artist: "VIEZE ASBAK", start: "19:30", end: "21:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-natte-visstick-jowi", artist: "NATTE VISSTICK B2B JOWI", start: "21:00", end: "22:30", stage: "mainstage", stageName: "Mainstage" }
    ],
    f2f: [
      { id: "sat-dj-blush-lensch", artist: "DJ BLUSH F2F LENSCH", start: "13:00", end: "14:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-rot-ton-dj-sexstasy", artist: "ROT.TON F2F DJ SEXSTASY", start: "14:30", end: "16:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-dj-hyperdrive-laure-croft", artist: "DJ HYPERDRIVE F2F LAURE CROFT", start: "16:00", end: "17:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-elli-acula-mac-declos", artist: "ELLI ACULA F2F MAC DECLOS", start: "17:30", end: "19:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-alarico-shdw", artist: "ALARICO F2F SHDW", start: "19:30", end: "21:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-future-666-fenim0re", artist: "FUTURE.666 F2F FENIM0RE", start: "21:00", end: "22:30", stage: "f2f", stageName: "F2F Stage" }
    ],
    hidden: [
      { id: "sat-antigen-lilli-4love", artist: "ANTIGEN B2B LILLI&4LOVE", start: "14:00", end: "15:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-the-muffin-man-alycia-bezgo", artist: "THE MUFFIN MAN B2B ALYCIA BEZGO", start: "15:30", end: "17:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-trancemaster-krause-bixbita", artist: "TRANCEMASTER KRAUSE B2B BIXBITA", start: "17:00", end: "18:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-davyboi-peterblue", artist: "DAVYBOI B2B PETERBLUE", start: "18:30", end: "20:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-mika-heggemann-cleopard2000", artist: "MIKA HEGGEMANN B2B CLEOPARD2000", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage" }
    ]
  },
  sunday: {
    mainstage: [
      { id: "sun-ponti", artist: "PØNTI", start: "11:00", end: "12:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-kotorri", artist: "KOTORRI", start: "12:30", end: "14:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-schrotthagen", artist: "SCHROTTHAGEN", start: "14:00", end: "15:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-nicolas-julian", artist: "NICOLAS JULIAN", start: "15:30", end: "17:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-nikolina", artist: "NIKOLINA", start: "17:00", end: "18:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-vendex", artist: "VENDEX", start: "18:30", end: "20:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-jazzy", artist: "JAZZY", start: "20:00", end: "21:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-surprise-closing", artist: "SURPRISE CLOSING 👀", start: "21:30", end: "22:00", stage: "mainstage", stageName: "Mainstage", isSpecial: true }
    ],
    f2f: [
      { id: "sun-dvaid-relajadita", artist: "DVAID F2F RELAJADITA", start: "12:30", end: "14:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-wilderich-zwilling", artist: "WILDERÍCH F2F ZWILLING", start: "14:00", end: "15:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-l-zwo-antonym", artist: "L.ZWO F2F ANTONYM", start: "15:30", end: "17:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-noise-mafia-fenrick", artist: "NOISE MAFIA F2F FENRICK", start: "17:00", end: "18:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-cloudy-serafina", artist: "CLOUDY F2F SERAFINA", start: "18:30", end: "20:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-adrian-mills-prada2000", artist: "ADRIÁN MILLS F2F PRADA2000", start: "20:00", end: "22:00", stage: "f2f", stageName: "F2F Stage" }
    ],
    hidden: [
      { id: "sun-tamara-wirth", artist: "TAMARA WIRTH", start: "14:30", end: "16:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-dj-swisherman", artist: "DJ SWISHERMAN", start: "16:00", end: "17:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-frederic-stef-de-haan", artist: "FREDERIC. B2B STEF DE HAAN", start: "17:30", end: "19:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-aerea", artist: "AEREA (LIVE)", start: "19:00", end: "20:00", stage: "hidden", stageName: "Hidden Stage", isLive: true },
      { id: "sun-dax-j", artist: "DAX J", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage" }
    ]
  }
};
