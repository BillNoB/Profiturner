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
- **Pflicht (`g_stufen`):** Enthält `G1` bis `G4` mit `stufe`, `ausgangswert`, `beschreibung`, `schwierigkeitsgrad` und dem Array `elemente` (`id`, `titel`, `beschreibung`, `punkte`, `kriterien`, `voruebungen`).
- **Kür (`lk_bereich` - in Arbeit):** Enthält Anforderungen für `LK4`, `LK3`, `LK2`, `LK1` sowie einen Katalog an Kür-Elementen (`wertigkeit`: A/B/C/D, `punkte`, `kategorie`, `erklaerung`, `voruebungen`).

## 4. Aktueller Projektstand & Phasenplan
- [x] **Phase 1 (Abgeschlossen):** PWA-Grundgerüst (`index.html`, `style.css`, `app.js`, `manifest.json`), IndexedDB-Foto-Upload & -Löschen, weiches iPad-Design.
- [x] **Phase 2a (Abgeschlossen):** Alle 4 Geräte (`boden`, `balken`, `barren`, `sprung`) mit kompletten G-Stufen (`G1`–`G4`) inklusive Vorübungen und Stufen-Filter implemented.
- [ ] **Phase 2b (Nächster Schritt):** Leistungsklassen (`LK1`–`LK4`) für alle 4 Geräte in die JSON-Dateien integrieren und einen Modus-Umschalter (`Pflicht (G-Stufen)` vs. `Kür (LK1–LK4)`) in der App einbauen.
- [ ] **Phase 3 (Geplant):** Trainings-Fortschritt (Checkliste "Beherrsche ich") und Backup-Export/Import der IndexedDB-Fotos.
- [ ] **Phase 4 (Zukunft):** KI-Videoanalyse über lokalen LM Studio Server (`Qwen 3.5 9B` Vision-Modell) für Haltungskorrektur und Kampfrichter-Auswertung.
