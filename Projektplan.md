# PROJEKTPLAN: NTB Gerätturnen Trainer- & Athleten-App (PWA)

## 1. Projektziel & Plattform
- Offline-fähige Progressive Web App (PWA) für iPad (Touch-optimiert, Quer- und Hochformat) und später iPhone.
- Zielgruppe: Leistungsturnerinnen und Trainer im NTB (Niedersächsischer Turner-Bund, Gerätturnen weiblich).
- Geräte: Boden (`boden`), Schwebebalken (`balken`), Stufenbarren (`barren`), Sprung (`sprung`).

## 2. Tech-Stack & Architektur-Regeln
- Vanilla HTML5, CSS3 (weiches, modernes Card-Design mit abgerundeten Ecken `#F1F5F9` / `#FFFFFF`, Akzentfarben `#0284C7` und `#10B981`), Modernes JavaScript (ES6+). Keine Frameworks.
- Lokaler Server: `python -m http.server 8000` (WICHTIG: OpenCode darf KEINE Shell-Befehle ausführen!).
- Datenhaltung:
  - Fachdaten liegen strikt getrennt in JSON-Dateien (`data/boden.json`, `data/balken.json`, `data/barren.json`, `data/sprung.json`).
  - Benutzerdaten (eigene Trainingsfotos über iPad-Kamera/Galerie) werden lokal über **IndexedDB** gespeichert und über die eindeutige Element-/Vorübungs-ID (`id`) verknüpft.

## 3. Datenstruktur (`data/<geraet>.json`)
- **Pflicht (`g_stufen`):** Enthält `G1` bis `G5` mit `stufe`, `d_note`, `bonus_max`, `ausgangswert` (Gesamtwert = 10 + d_note), `beschreibung`, `schwierigkeitsgrad` und dem Array `elemente` (`id`, `titel`, `beschreibung`, `punkte`, `kriterien`, `voruebungen`, optional `wahl_uebung: true` für Trainings-/Aufbauelemente, optional `schluessel: true` für Schlüssel-Elemente).
- **Kür (`lk_bereich`):** Enthält Anforderungen für `LK4`, `LK3`, `LK2`, `LK1` sowie einen Katalog an Kür-Elementen (`wertigkeit`: A/B/C/D, `punkte`, `kategorie`, `erklaerung`, `voruebungen`, optional `schluessel: true` für Schlüssel-Elemente).

## 4. Aktueller Projektstand & Phasenplan
- [x] **Phase 1 (Abgeschlossen):** PWA-Grundgerüst (`index.html`, `style.css`, `app.js`, `manifest.json`), IndexedDB-Foto-Upload & -Löschen, weiches iPad-Design.
- [x] **Phase 2a (Abgeschlossen):** Alle 4 Geräte (`boden`, `balken`, `barren`, `sprung`) mit kompletten G-Stufen (`G1`–`G5`) inklusive Vorübungen, Stufen-Filter und `schluessel: true` Badge-Implementierung. Jede G-Stufe enthält 2–3 Wahl-/Aufbauelemente (`wahl_uebung: true`) am Ende.
- [x] **Phase 2b (Abgeschlossen):** Leistungsklassen (`LK1`–`LK4`) für alle 4 Geräte mit Kompositionsanforderungen/Orientierungskarten; Modus-Umschalter (`Pflicht (G-Stufen)` vs. `Kür (LK1–LK4)`) implementiert. Wichtige Kür-Elemente mit `schluessel: true` markiert; 2–3 neue Kür-Elemente pro LK-Stufe ergänzt.
- [x] **Phase 3 (Abgeschlossen):** Dynamische Vorstufen-Anzeige (einklappbare Sektionen mit Elementen aus niedrigeren Stufen im Pflicht- und Kür-Modus), `wahl_uebung`-Badge (🏋️ Trainings- & Aufbauelement) und `schluessel`-Badge (⭐ Schlüsselelement) in Pflicht & Kür, `exportStandaloneApp` mit gleicher Logik.
- [x] **Phase 3b (Abgeschlossen):** Trainings-Fortschritt (Checkliste "Beherrsche ich") und Backup-Export/Import der IndexedDB-Fotos.
- [ ] **Phase 4 (Nächster Schritt):** KI-Videoanalyse über Google Gemini API (Flash) für Haltungskorrektur und Kampfrichter-Auswertung.
