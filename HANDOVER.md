# Übergabe – NTB Turnerapp G5 (Stand 26.11.2026)

## So weiterarbeiten
Neue Sitzung: zuerst diese Datei lesen, dann `G5_PFICHT_2026_OFFIZIELL.md` (offizielle G5-Quelldaten) und `TODO.md` (Checklisten). Danach die Schritte unter „Nächste Schritte" streng nacheinander ausführen.

## Projekt
- PWA „NTB Gerätturnen weiblich": statische App, Daten in `data/*.json` (boden/balken/barren/sprung), UI in `app.js` + `index.html`, Offline-Cache in `sw.js`.
- Kein Git-Repo. `C:\KI_Projekte\TurnerappBackup` = Stand VOR Phase A/B — nur zur groben Diff-Kontrolle. Wichtig: enthält keine G5, und die Phase-A-Änderungen an G1–G4 (mehr Kriterien, Vorübung `_b`) sind dort als „Abweichung" sichtbar, wurden aber bewusst gemacht und gecheckt!
- Lokaler Server für den Browser-Check: `python -m http.server 8000` im Projektordner → http://localhost:8000. Den Check macht der Nutzer, nicht der Agent.

## Status (read-only verifiziert am 26.11.)
- **Phase A** (Gap-Fix G1–G4): fertig + gecheckt.
- **Phase B** (G5-Daten): sprung/barren/balken fertig + gecheckt. **Boden: Block vorhanden, aber noch nicht geprüft** — auf Disk gibt es 12 Elemente `g5_boden_1..g5_boden_12` (Plan waren 10), Bonus-Präfix vorhanden, ausgangswert 7.0. G5 beginnt in boden/balken/barren jeweils bei L190, in sprung bei L114.
- **Phase C** (UI/Cache): auf Disk fertig + verifiziert — app.js Filterlisten L113–114 und L759–760 enthalten „G5", Label L626 = „Pflicht (G1-G5)"; index.html sauber (keine U+FFFD, Titel/H1/Label ok); sw.js L1 CACHE_NAME = `ntb-turnen-offline-v3`.
- **Phase D**: offen (general-Check + Browser-Check durch Nutzer).

## Offene Frage (Blocker für boden-Abschluss)
Boden-G5 Punkte-Summe: Die offizielle Pflichtkette E1–E8 ergibt mit den überlieferten Werten **8.5 P statt Ausgangswert 7.0** (Details in `G5_PFICHT_2026_OFFIZIELL.md`, Abschnitt „Offene Frage"). → Mit dem Nutzer klären, welche Teilpunkte zählen; erst dann boden-G5-Block final abgleichen/anpassen.

## Nächste Schritte (streng nacheinander, 1 Worker = genau 1 Aktion)
1. **Check boden G5** (general, read-only): `data/boden.json` G5-Block (L190 ff., 12 Elemente) gegen `G5_PFICHT_2026_OFFIZIELL.md` §4 abgleichen — Titel/Punkte/Kriterien/Bonus-Präfix/Vorübungen (zweite Vorübung eines Elements = Suffix `_b`), IDs eindeutig, JSON intakt. Abweichungen mit Zeilennummern melden, NICHT selbst ändern. Ggf. sind Flick-Flacks oder Kombinationsteile als eigene Elemente angelegt — das ist erst mal eine Meldung, kein Fehler per se.
2. **Boden-Punktesumme mit dem Nutzer klären** → falls nötig genau 1 Worker-Auftrag: boden-G5-Block korrigieren (nur den G5-Block anfassen, keine bestehenden IDs ändern).
3. TODO.md: die beiden boden-Zeilen nach bestandenen Check abhaken.
4. **Phase D general-Check** (general, read-only): alle 4 JSONs + app.js — Struktur/Klammern/Anführungszeichen, G5 ist in jeder Datei die letzte Stufe, IDs pro Datei eindeutig, Bonus-Präfix vorhanden.
5. **Browser-Check durch den Nutzer**: localhost:8000 — G5-Filter-Button, Rendering Kriterien/Vorübungen, Foto-Widgets, Console sauber.

## Konventionen & Entscheidungen (wichtig!)
- Keine alten Element-IDs ändern — IndexedDB-Fotos sind an die ID gekoppelt. Neue G5-IDs folgen dem Muster der jeweiligen Datei (`g5_<geraet>_n`; Vorübungen `vu_g…`, zweite Vorübung desselben Elements mit Suffix `_b`).
- Bonus = eigenes Element, Titel beginnt mit „Bonus –".
- Alle Checks read-only (kein Shell/Node); 1 Worker-Auftrag = genau eine konkrete Aktion; Subagenten streng nacheinander (lokales LLM-Backend, nur ein Slot).
- Entscheidung vom Nutzer bestätigt: Barren Kippaufschwung G5 = **2.5 P** → Pflicht-Summe exakt 7.0.

## Dateianker (verifiziert)
- `data/boden.json` — G5 L190, 12 Elemente g5_boden_1..12, Bonus-Titel bei L387/L406, Dateiende L636
- `data/balken.json` — G5 L190, 10 Elemente g5_balken_1..10, Bonus bei L254/L368, Ende L583
- `data/barren.json` — G5 L190, 7 Elemente g5_barren_1..7, Bonus bei L254/L311, Ende L510
- `data/sprung.json` — G5 L114, 2 Elemente g5_sprung_1/2 (Bonus = g5_sprung_2), Ende L298
- `app.js` — Pflicht-Filterlisten L113–114 + Export-Kopie L759–760 (beide mit „G5"), Label L626 „Pflicht (G1-G5)"
- `index.html` — Titel L6, H1 L15, Label L32 (alles sauber)
- `sw.js` — L1 `CACHE_NAME = "ntb-turnen-offline-v3"`
