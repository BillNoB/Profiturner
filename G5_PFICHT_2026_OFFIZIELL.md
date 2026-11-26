# NTB Pflichtprogramm 2026 – Stufe G5 (offizielle Quelldaten)

**Status:** Einzige auf Disk gespeicherte Kopie des offiziellen G5-Programms (Stand 02/2026, vom Nutzer bestätigt).
Vor dem Anpassen von G5-Elementen in `data/*.json` immer diese Datei lesen. Änderungen an dieser Datei nur nach Absprache mit dem Nutzer.

**Konventionen** (Details: TODO.md, Konventionszeile):
- Element-IDs: fortlaufend pro Gerät, Muster wie die vorhandenen Stufen (z. B. nach `g4_boden_2` kommt `g5_boden_1`, `g5_boden_2`, …). Exaktes ID-Muster vor dem Anlegen in der jeweiligen Datei abgleichen.
- Vorübungs-IDs: `vu_g…` wie bestehend; die zweite Vorübung desselben Elements erhält Suffix `_b` (Beispiel aus G1: `vu_g1_sprung_1b`).
- Bonus = eigenes Element, Titel beginnt mit „Bonus –".
- Die Pflichtpunkte einer Stufe müssen zum `ausgangswert` addiert werden.

---

## 1) Sprung — sprung.json (Ausgangswert 7.0 + max. 1.0 Bonus)

**Gerät:** Anlauf mind. 15 m, Sprungbrett, Mattenblock 80 cm (bei Bonus: Mattenblock 90 cm). → In die Stage-`beschreibung`.

| # | Element | Punkte |
|---|---------|--------|
| E1 | Handstütz-Sprungüberschlag mit Abdruck und Landung im Stand mit Bogenspannung | 7.0 |
| E2 | Bonus – Salto vorwärts gehockt (3. Sprung, Mattenblock 90 cm) | +1.0 |

**E1 Kriterien:**
- Beschleunigter Anlauf bis zum Sprungbrett
- Gestreckte Flugphase (Hüftwinkel max. 10° Abweichung)
- Aktiver Schulterabdruck
- Landung im Stand mit Bogenspannung (leichte, gespannte Überstreckung mit offenem Arm-Rumpf-Winkel)

**E2 Kriterien:**
- Dynamischer Absprung vom Sprungbrett
- Deutliche Hockphase
- Rechtzeitiges Öffnen zur kontrollierten Landung

**Status: umgesetzt und verifiziert** (IDs `g5_sprung_1`, `g5_sprung_2`; Vorübungen unverändert).

---

## 2) Barren — barren.json (Ausgangswert 7.0 + max. 1.0 Bonus)

**Gerät:** Stufenbarren original (unterer Holm; Mattenlage 30 cm möglich).
**Entscheidung (Nutzer bestätigt):** Kippaufschwung = **2.5 P** → Pflicht-Summe exakt 7.0.

| # | Element | Punkte |
|---|---------|--------|
| E1 | Kippaufschwung (Schwebekippe) direkt in den Stütz | 2.5 |
| E2 | Rückschwung 90° zum gespannten Stütz | 1.0 |
| E3 | Vorschwung – Rückschwung 90° | 1.0 |
| Bonus (ersetzt Pos. 3) | Bonus – Rückschwung > 160° | +0.5 |
| E4 | Hüftumschwung vorlings rückwärts, Vorschwung | 1.0 |
| E5 | Unterschwung aus dem Stütz mit 1/2 Drehung (Felgunterschwung / Abgang) | 1.5 |
| Bonus | Bonus – Unterschwung mit 1/1 Drehung oder Flugelement zum oberen Holm | +0.5 |

**Kriterien:**
- E1: volle Körperstreckung beim Vorschweben; gestreckte Arme beim Aufkippen.
- E2: direkter Anschluss nach der Kippe; gestreckte Arme; kein Hohlkreuz (Zwischenschwung zum Bremsen erlaubt).
- E3: gestreckte Arme; für den Bonus max. 10° Abweichung.
- E4: Hüftkontakt an der Stange; gestreckte Beine; offener Hüftwinkel.
- E5: ausreichende Höhe über Holmhöhe; gestreckte Körperhaltung; kontrollierte Landung.

**Vorübungen:** müssen auch **Reck-Schlaufe / tiefer Holm** enthalten.

---

## 3) Balken — balken.json (Ausgangswert 6.0 + max. 1.0 Bonus)

**Gerät:** Balken original mit zwei Matten (je 30 cm) unter dem Balken oder Balken 75 cm über Mattenlage. → In die Stage-`beschreibung`.

| # | Element | Punkte |
|---|---------|--------|
| E1 | Angang: Absprung und Heben zum Bückstand – Senken in den Grätschschwebestütz (2 Sek.), 1/4 Drehung zum Reitsitz, Rückaufhocken auf den Fußrist, Aufrichten mit gestreckten Beinen | 0.5 |
| E2 | 1–2x Heben und Senken ins Relevé, 3 Hüpfer im Demi-Plié/Relevé | 0.2 |
| E3 | Bogengang rückwärts | 1.0 |
| Bonus (E3) | Bonus – Flick-Flack auf dem Balken | +0.5 |
| E4 | Gymnastische Verbindung: Chassé und Spagatsprung 135° | 0.8 |
| E5 | Enge Schrittstellung, 1/1 Drehung einbeinig mit Spielbein Passé, Arme in Hochhalte | 0.5 |
| E6 | Kombination: Rolle vorwärts (gestreckte Arme) – gehockt in den Handstand, Abbücken mit gestreckten Beinen | 1.0 |
| E7 | Prellen mit gestreckten Beinen in den Handstand, Abrollen mit gestreckten Armen und Aufrichten mit gestreckten Beinen | 1.0 |
| E8 | Abgang: Rondat oder Handstützüberschlag seitwärts vom Balkenende | 1.0 |
| Bonus (E8) | Bonus – Salto rückwärts gehockt als Abgang | +0.5 |

**Kriterien:**
- E1: gleichzeitiges Heben beider Beine (kein Springen); 2 Sek. Halten; gestreckte Beine beim Aufrichten.
- E2: hohes Relevé; gestreckte Beine; saubere Fußarbeit.
- E3: exakte Körperausrichtung auf der Balkenlinie; flüssiger Übergang (gilt auch für den Bonus Flick-Flack).
- E4: mind. 135° Spreizwinkel; ausreichende Sprunghöhe; ruhige Landung ohne Wackler.
- E5: kein vorzeitiges Abheben der Ferse; saubere Passé-Position am Knie; kontrollierter Abschluss.
- E6: gestreckte Arme bei der Rolle; Erreichen der Senkrechten; gestreckte Beine beim Abbücken.
- E7: kein Zwischenstopp; kontrolliertes Abrollen über den Nacken.
- E8: dynamischer Abdruck vom Balken; gestreckte Flugphase; sichere Landung im Stand.

---

## 4) Boden — boden.json (Ausgangswert 7.0 + max. 1.0 Bonus)

**Besonderheit:** Pflichtmusik **ohne Gesang**. → In die Stage-`beschreibung`.

| # | Element | Punkte |
|---|---------|--------|
| E1 | Verbindung: (Schritt) Anhüpfer, Rondat – 2x Flick-Flack zum reaktiven Streksprung | 0.5 + je 0.5 + 1.5 |
| Bonus (E1-Variante) | Bonus – Rondat – 3x Flick-Flack – Streksprung ODER Rondat – Flick-Flack – Salto rückwärts gehockt | +0.5 |
| E2 | Felgrolle in den Handstand, Absenken in den Stand beliebig | 0.5 |
| E3 | Aus dem Strecksitz: aktives Öffnen in den Spagat (kurzes Verharren), Schließen in den Strecksitz, beide Seiten ohne Handstütz | 0.5 |
| E4 | Gymnastische Kombination: Durchschlagsprung 135° + Spagatsprung 160° | 1.5 |
| E5 | 1/1 Drehung einbeinig im Passé | 0.5 |
| E6 | Kombination: Rolle vorwärts – Absprung in den Handstand mit 1/2 Drehung zum Abrollen, Aufstehen über gestreckte Beine | 0.5 |
| E7 | Anhüpfer Schrittüberschlag vorwärts | 1.0 |
| E8 | Kombination: Quergrätschsprung 135°, Rebound, Quergrätschsprung 135° andere Seite | 1.0 |
| Bonus (E8) | Bonus – Salto vorwärts gehockt | +0.5 |

**Kriterien:**
- E1: flüssiger Rhythmus ohne Pause; deutlicher reaktiver Absprung am Ende.
- E2: Erreichen der Senkrechten (max 30° Abweichung); gestreckte Arme beim Hochdrücken.
- E3: Arme in Seithalte; kein Abstützen mit den Händen; voller Spagatwinkel.
- E4: mind. 135° bzw. 160°; harmonische Verbindung ohne Zwischenschritt.
- E5: hoher Ballenstand; geschlossene Passé-Position; ruhiger Stand am Ende.
- E6: deutliche Handstandphase vor der 1/2 Drehung; gestreckte Beine beim Aufstehen.
- E7: Flugphase nach dem Handabdruck; gestrecktes Schwungbein; aufrechte Landung.
- E8: mind. 135° Grätschwinkel; sofortiger reaktiver Absprung zwischen den Sprüngen.

---

## Offene Frage (vor/beim Abschluss Phase B)

1. **Boden G5 Punkte-Summe:** Mit den oben angegebenen Werten ergibt die Pflichtkette E1–E8 = 0,5 + 2×0,5 + 1,5 + 0,5 + 0,5 + 1,5 + 0,5 + 0,5 + 1,0 + 1,0 = **8.5 statt Ausgangswert 7.0**. Mit dem Nutzer klären, welche Teilpunkte zählen (ggf. zählt die Flick-Flack–Streksprung-Kombination als Ganzes nur 1.5 P).
