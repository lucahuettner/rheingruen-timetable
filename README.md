# Event & Festival Timetable PWA ⚡

Eine mobile-optimierte, schlanke und 100 % offline-fähige Progressive Web App (PWA) für Festival- und Club-Timetables – ohne Frameworks, ohne Build-Step und komplett über eine einzige Konfigurationsdatei anpassbar.

---

## ✨ Features

- 🛠️ **Single-File Konfiguration**: Name, Farben, Bühnen, Tage (inkl. Nacht-Überlauf), Disclaimer und Line-up werden zentral in `js/schedule-data.js` gepflegt.
- 🕒 **Vertikaler Zeitplan**: Maßstabsgetreue Set-Längen mit automatischer Erkennung von Nacht-Events über Mitternacht hinweg.
- 🎛️ **Multi-Stage Grid & Liste**: Beliebig viele Bühnen pro Tag mit automatischer Farb-Codierung – optimiert für horizontales Wischen auf Smartphones und Drag-to-Scroll am Desktop.
- ⚡ **Live „Jetzt“-Linie**: Dynamische Zeitanzeige und automatische Tag-/Event-Erkennung anhand des aktuellen Datums.
- 📱 **100 % Offline-PWA**: Ein Service Worker speichert den gesamten Zeitplan beim ersten Laden lokal im Browser-Cache.
- ❤️ **Favoriten & Clash-Detection**: Lieblings-Acts markieren (mit Event-spezifischem `localStorage`-Schlüssel) und bei zeitlichen Überschneidungen sofort gewarnt werden.
- 🚀 **Zero Dependencies**: Reines HTML, CSS und modernes Vanilla-JS.

---

## 🎨 Anpassung für ein neues Event (in 5 Minuten)

Um den Timetable für ein neues Festival oder Club-Event zu nutzen, musst du im Regelfall **nur eine einzige Datei** bearbeiten: [`js/schedule-data.js`](js/schedule-data.js).

### 1. `EVENT_CONFIG` anpassen
In `js/schedule-data.js` steuert `EVENT_CONFIG` das gesamte Aussehen und Verhalten:

- **`id`**: Eindeutiger String (z. B. `"summer-rave-2027"`), der automatisch als Präfix für `localStorage` genutzt wird, damit Favoriten verschiedener Events nicht kollidieren.
- **`branding`**: Titel und Untertitel im Header (`title`, `subtitle`), Kurzname sowie Browser-Tab-Titel (`pageTitle`) und Meta-Beschreibung.
- **`theme`**: Primäre Akzentfarbe (`accentColor`), Sekundärfarbe (`secondaryColor`), Herz-Farbe (`favoriteColor`), Hintergrundfarben (`bgDark`, `bgSurface`, etc.) und vertikale Skalierung (`pxPerMinute`).
- **`stages`**: Standard-Bühnen mit `{ id, name, color }`. Die Stage-Farbe wird automatisch auf Spaltenköpfe, Kartenränder und Badges angewendet – es muss kein CSS angepasst werden.
- **`days`**: Beliebig viele Tage oder Teil-Events (Pre-Party, Festival-Tage, Aftershow).
  - Jeder Tag hat `{ id, badge, title, subtitle, isoDate, startHour, endHour }`.
  - Optional kann ein Tag ein eigenes `stages`-Array definieren (z. B. für Club-Aftershows auf anderen Floors).
  - **Nacht-Überlauf**: Ist `endHour <= startHour` (z. B. `startHour: 22, endHour: 6`), erkennt die App automatisch ein Event über Mitternacht.
  - Wenn nur **1 Tag** konfiguriert ist, wird die Tag-Auswahlleiste automatisch ausgeblendet.
- **`disclaimer`**: Optionales Info-Popup beim ersten Besuch (`enabled: true/false`) mit frei konfigurierbaren Texten und Button-Links (`globe` oder `instagram`).
- **`legal`**: Optionale Credits im Footer sowie Kontaktdaten für das integrierte Datenschutz-Modal (`legal.privacy.enabled`).

### 2. `SCHEDULE_DATA` eintragen
Pro Tag (`day.id`) und Bühne (`stage.id`) werden die Slots als schlankes Array angegeben:

```js
export const SCHEDULE_DATA = {
  saturday: {
    mainstage: [
      { artist: "ARTIST A", start: "12:00", end: "14:00" },
      { artist: "ARTIST B B2B ARTIST C", start: "14:00", end: "16:00" }
    ]
  }
};
```
*(IDs, Bühnennamen und Tageszuordnungen werden beim Start automatisch generiert).*

### 3. Optional: App-Icons & Service Worker
- Falls die App als Home-Screen-Web-App installiert wird, kannst du noch `name`, `short_name` und `theme_color` in [`manifest.webmanifest`](manifest.webmanifest) sowie die Icons im Ordner `icons/` austauschen.
- Erhöhe bei einem Update die Versionsnummer `CACHE_NAME` in [`sw.js`](sw.js), damit wiederkehrende Besucher automatisch den Hinweis *„Neue Version verfügbar“* erhalten.

---

## 💻 Lokale Entwicklung

Keine Installation von npm-Paketen oder Build-Schritten erforderlich. Einfach einen lokalen Webserver im Projektordner starten:

```bash
python3 -m http.server 8080
```

Anschließend im Browser öffnen:
- Auf dem PC/Mac: `http://localhost:8080`
- Auf dem Smartphone im selben WLAN: `http://<Deine-Lokale-IP>:8080`

---

## 🌐 Hosting via GitHub Pages

1. Code in ein GitHub-Repository pushen.
2. Im Repository auf **Settings → Pages** gehen.
3. Unter **Branch** den Branch `main` auswählen und auf **Save** klicken.
