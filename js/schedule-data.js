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
      { id: "sat-m-1", artist: "SAIKA", start: "11:00", end: "13:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-2", artist: "LOLA CERISE B2B GUSTAV ØRGANO", start: "13:00", end: "14:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-3", artist: "DASSTUDACH", start: "14:30", end: "16:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-4", artist: "KANDER", start: "16:00", end: "18:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-5", artist: "USH B2B SLVL", start: "18:00", end: "19:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-6", artist: "VIEZE ASBAK", start: "19:30", end: "21:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sat-m-7", artist: "NATTE VISSTICK B2B JOWI", start: "21:00", end: "22:30", stage: "mainstage", stageName: "Mainstage" }
    ],
    f2f: [
      { id: "sat-f-1", artist: "DJ BLUSH F2F LENSCH", start: "13:00", end: "14:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-f-2", artist: "ROT.TON F2F DJ SEXSTASY", start: "14:30", end: "16:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-f-3", artist: "DJ HYPERDRIVE F2F LAURE CROFT", start: "16:00", end: "17:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-f-4", artist: "ELLI ACULA F2F MAC DECLOS", start: "17:30", end: "19:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-f-5", artist: "ALARICO F2F SHDW", start: "19:30", end: "21:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sat-f-6", artist: "FUTURE.666 F2F FENIM0RE", start: "21:00", end: "22:30", stage: "f2f", stageName: "F2F Stage" }
    ],
    hidden: [
      { id: "sat-h-1", artist: "ANTIGEN B2B LILLI&4LOVE", start: "14:00", end: "15:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-h-2", artist: "THE MUFFIN MAN B2B ALYCIA BEZGO", start: "15:30", end: "17:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-h-3", artist: "TRANCEMASTER KRAUSE B2B BIXBITA", start: "17:00", end: "18:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-h-4", artist: "DAVYBOI B2B PETERBLUE", start: "18:30", end: "20:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sat-h-5", artist: "MIKA HEGGEMANN B2B CLEOPARD2000", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage" }
    ]
  },
  sunday: {
    mainstage: [
      { id: "sun-m-1", artist: "PØNTI", start: "11:00", end: "12:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-2", artist: "KOTORRI", start: "12:30", end: "14:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-3", artist: "SCHROTTHAGEN", start: "14:00", end: "15:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-4", artist: "NICOLAS JULIAN", start: "15:30", end: "17:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-5", artist: "NIKOLINA", start: "17:00", end: "18:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-6", artist: "VENDEX", start: "18:30", end: "20:00", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-7", artist: "JAZZY", start: "20:00", end: "21:30", stage: "mainstage", stageName: "Mainstage" },
      { id: "sun-m-8", artist: "SURPRISE CLOSING 👀", start: "21:30", end: "22:00", stage: "mainstage", stageName: "Mainstage", isSpecial: true }
    ],
    f2f: [
      { id: "sun-f-1", artist: "DVAID F2F RELAJADITA", start: "12:30", end: "14:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-f-2", artist: "WILDERÍCH F2F ZWILLING", start: "14:00", end: "15:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-f-3", artist: "L.ZWO F2F ANTONYM", start: "15:30", end: "17:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-f-4", artist: "NOISE MAFIA F2F FENRICK", start: "17:00", end: "18:30", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-f-5", artist: "CLOUDY F2F SERAFINA", start: "18:30", end: "20:00", stage: "f2f", stageName: "F2F Stage" },
      { id: "sun-f-6", artist: "ADRIÁN MILLS F2F PRADA2000", start: "20:00", end: "22:00", stage: "f2f", stageName: "F2F Stage" }
    ],
    hidden: [
      { id: "sun-h-1", artist: "TAMARA WIRTH", start: "14:30", end: "16:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-h-2", artist: "DJ SWISHERMAN", start: "16:00", end: "17:30", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-h-3", artist: "FREDERIC. B2B STEF DE HAAN", start: "17:30", end: "19:00", stage: "hidden", stageName: "Hidden Stage" },
      { id: "sun-h-4", artist: "AEREA (LIVE)", start: "19:00", end: "20:00", stage: "hidden", stageName: "Hidden Stage", isLive: true },
      { id: "sun-h-5", artist: "DAX J", start: "20:00", end: "22:00", stage: "hidden", stageName: "Hidden Stage" }
    ]
  }
};
