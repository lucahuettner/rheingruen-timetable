# Rheingrün Festival 2026 – Timetable PWA 🌿⚡

Eine mobile-optimierte, schlanke und 100 % offline-fähige Progressive Web App (PWA) für den Zeitplan des **Rheingrün Open Air 2026** (19.–20. September 2026, Peter-Gross-Bau Areal, Karlsruhe-Rheinstetten).

---

## ✨ Features

- 🕒 **Vertikaler Zeitplan**: Übersichtlicher Ablauf von oben nach unten (11:00 bis 23:00 Uhr) mit maßstabsgetreuen Set-Längen.
- 🎛️ **Multi-Stage Grid**: Mainstage, F2F Stage und Hidden Stage nebeneinander – optimiert für horizontales Wischen auf Smartphones.
- ⚡ **Live „Jetzt“-Linie**: Eine dynamische Neon-Linie zeigt stets die aktuelle Uhrzeit an und verläuft nahtlos über alle Bühnen.
- 📱 **100 % Offline-PWA**: Ein Service Worker speichert den gesamten Zeitplan ab dem ersten Laden im Browser-Cache. Funktioniert auf dem Festivalgelände komplett ohne Empfang.
- ❤️ **Favoriten & Überschneidungs-Check**: Lieblings-Acts markieren und bei parallelen Sets sofort gewarnt werden.
- 🔍 **Suche & Ansichten**: Schnelle Künstlersuche und Umschaltung zwischen interaktiver Tabelle und kompakter chronologischer Liste.
- 🚀 **Zero Dependencies**: Reines HTML, CSS und modernes JavaScript – keine Frameworks, keine Tracker, keine externen Bibliotheken.

---

## 📲 Auf dem Smartphone installieren

1. Website im mobilen Browser aufrufen.
2. **iOS (Safari)**: Tippe unten auf das Teilen-Symbol (`↑`) und wähle **„Zum Home-Bildschirm“**.
3. **Android (Chrome)**: Tippe oben rechts auf die drei Punkte (`⋮`) und wähle **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“**.
4. Die App kann nun wie eine native App ohne störende Browserleisten und komplett offline genutzt werden.

---

## 💻 Lokale Entwicklung

Keine Installation von npm-Paketen oder Build-Schritten erforderlich. Einfach einen lokalen Webserver im Projektordner starten:

```bash
python3 -m http.server 8080
```

Anschließend im Browser öffnen:
- Auf dem PC/Mac: [http://localhost:8080](http://localhost:8080)
- Auf dem Smartphone im selben WLAN: `http://<Deine-Lokale-IP>:8080`

---

## 🌐 Hosting via GitHub Pages

1. Code in ein öffentliches GitHub-Repository pushen.
2. Im Repository auf **Settings $\rightarrow$ Pages** gehen.
3. Unter **Branch** den Branch `main` auswählen und auf **Save** klicken.
4. Die App ist nach ca. 1–2 Minuten unter `https://<username>.github.io/<repo-name>/` erreichbar.

---

*Viel Spaß auf dem Rheingrün Open Air 2026! 🎶*
