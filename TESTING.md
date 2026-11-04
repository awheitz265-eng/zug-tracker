# Prüfung des Verbesserungsbranches

Stand: 4. November 2026. Basis: `742e588e89d2dcd9eeacd41b1660bd5a67621e36`.

## Automatisiert geprüft

- `node tests/parser.test.mjs`: 73/73 vorhandene Sprachbeispiele bestanden.
- `node --test tests/regression.test.mjs`: 17/17 Regressionstests bestanden.
- JavaScript vollständig geparst und initialisiert; `git diff --check` ohne Fehler.
- Regressionen betreffen echte Anwendungsmethoden. DOM, Karte und Fahrplanantworten sind im netzunabhängigen Test kontrollierte Adapter bzw. Testdaten.
- Die Fokusprüfung testet die Wiederherstellung anhand stabiler Elementidentitäten, nicht das tatsächliche Verhalten eines Screenreaders oder Browsers.

## Prüfung mit echten Daten

Die Anwendungslogik wurde lokal mit echten API-Antworten und DOM-/Kartenadaptern ausgeführt:

- Basel SBB → Bern: Verbindungen vorhanden.
- Bern → Zürich HB über Olten: Zielüberschrift jetzt Zürich HB.
- Bus 31 ab Zürich, Hegibachplatz: Abfahrten vorhanden, inklusive Fallback.
- Schiff Luzern → Flüelen: Verbindungen vorhanden.
- Transitous antwortete aus dieser lokalen Umgebung mit HTTP 403. Der Fallback auf die Abfahrtstafel wurde beobachtet. Die aktuelle Linienidentität mit echten Transitous-Daten ist deshalb noch nicht nachgeprüft; der Abschnittswechsel ist mit kontrollierten Testdaten abgedeckt.

## Vor dem Zusammenführen noch manuell prüfen

Die ursprüngliche veröffentlichte Version wurde umfassend im Browser geprüft. Die überarbeitete Version wurde noch nicht erfolgreich im Browser geprüft: Die lokale Vorschau war im integrierten Browser nicht erreichbar; die anschliessende Windows-Steuerung wurde beendet und beim erneuten Versuch mit Escape gestoppt.

1. Suche «Wo ist das Tram 4 in Zürich»: Status, Fahrzeugkarten und Marker müssen die aktuell passende Linie zeigen; Linienwechsel und beide Richtungen beachten.
2. Suche Basel–Bern mit Ankunft morgen 09:00: Anschlussliste darf keine Abfahrt vor Ankunft plus Umsteige-/Gehzeit anbieten.
3. Alternative 21:00 wählen, Link neu öffnen: 21:00 muss bestehen bleiben. Danach manuell auf 10:00 ändern und erneut suchen.
4. «Später»/«Früher»: Kopfzeile, Ab/An, Uhrzeit, Datum und Link müssen denselben Zustand zeigen, auch nach Neuladen.
5. Tastatur: Verbindungen und Halte mit Enter/Leertaste bedienen; Fokus über mehrere Aktualisierungen hinweg kontrollieren.
6. Darstellung bei 390 und 320 Pixeln sowie mit echter Bildschirmtastatur prüfen.
7. Kontrollierte Ausfallinformationen in Route und Live prüfen. Automatisiert wird eine ausgefallene Route bereits als Ausfall statt «pünktlich» ausgegeben.

Die Live-Version bleibt unverändert, bis dieser Branch zusammengeführt und veröffentlicht wird.
