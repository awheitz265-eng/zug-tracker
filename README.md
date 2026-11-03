# Zug-Tracker

Webseite mit zwei Modi für den ganzen öffentlichen Verkehr der Schweiz (Bahn, S-Bahn, Tram, Bus, Postauto, Schiff, Seilbahn):
**Route** plant Verbindungen, **Live** zeigt, wo Fahrzeuge gerade unterwegs sind und was als Nächstes abfährt.
Eingegeben wird ein einfacher Satz, z. B. «Von hier zum SBB», «Morgen Nachmittag um fünf nach Luzern» oder «Wo ist das Tram 4 in Zürich».

## Funktionen

- **Route planen:** Verbindungen von A nach B, z. B. «Von hier nach Zürich HB», «zum SBB», «Ich bin in Thun und möchte nach Interlaken Ost». Start und Ziel können Haltestellen, Adressen oder dein Standort («hier») sein. Angezeigt werden bis zu 6 Varianten mit Fusswegen, Umsteigezeiten, Gleis bzw. Kante, Echtzeit und Live-Fahrzeugen auf der Karte.
- **Bahnhof umgangssprachlich:** «zum SBB», «zum HB», «an den Bahnhof» führt zum Hauptbahnhof des Orts, in dem du bist (bzw. in dem der Start liegt), z. B. Basel → Basel SBB.
- **Verkehrsmittel und Optionen:** «mit dem Tram», «nur Bus», «ohne Bus», «mit dem 11er», «ohne Umsteigen», «über Olten».
- **Zeiten wie man sie sagt:** «nach acht», «um halb neun», «Viertel nach acht», «fünf vor halb neun», «morgen Nachmittag um fünf», «heute Abend», «morgen früh», «in 20 Minuten», «in einer halben Stunde», «nächsten Dienstag um 7», «am 24. Dezember um 16 Uhr», «spätestens um 9 in Zürich sein», «am Wochenende». Einige Mundartformen gehen auch («am halbi nüni»). Ist eine Uhrzeit mehrdeutig («um 8» = 08:00 oder 20:00), nimmt die Seite den nächsten Zeitpunkt in der Zukunft und bietet die andere Lesart als Knopf an.
- **Live – ganze Linie:** «Wo ist das Tram 4 in Zürich», «Tram 8 Richtung Kleinhüningen», «Bus 31»: alle Fahrzeuge der Linie im Umkreis von rund 9 km auf der Karte, jedes mit Halten und Verspätung. Ohne Ortsangabe gilt dein Standort. Passt die Richtung zu keinem Fahrzeug, nennt die Seite die aktuellen Ziele der Linie.
- **Live – Abfahrten:** «Abfahrten ab hier», «wann kommt der 31er», «Bus 31 ab Zürich, Hegibachplatz», «nächster Bus in der Nähe», «was fährt ab Bellevue»: Abfahrtstafel, gefiltert nach Linie, Richtung oder Verkehrsmittel. Jede Abfahrt lässt sich auf der Karte verfolgen.
- **Live – Strecke:** «IC von Zürich HB nach Bern», «S3 von Aarau nach Olten», «TGV von Paris Gare de Lyon nach Basel SBB», optional mit Zugnummer: Fahrten, die jetzt ohne Umsteigen zwischen A und B unterwegs sind.
- **Automatischer Wechsel:** Fragt man im Modus «Route» nach einer Linie oder nach Abfahrten, wechselt die Seite selbst zu «Live».
- **Datum, Zeit, Ab/An:** zusätzlich über die Felder einstellbar. Ohne Angabe gilt «jetzt». «Live» zeigt immer die aktuelle Lage.
- **Satzerkennung:** regelbasiert, ohne KI. Die erkannten Teile stehen über den Ergebnissen.
- **Position auf der Karte:** aus Fahrplan und Echtzeit-Prognose geschätzt und entlang dem echten Strecken- bzw. Linienverlauf gezeichnet, sofern Transitous ihn liefert, sonst als Luftlinie.
- **Echtzeit:** Verspätungen, Gleis- und Kantenänderungen, Ausfälle, Störungsmeldungen und Auslastungsprognose, soweit die Quellen sie liefern.
- **Aktualisierung:** Daten jede Minute, Position alle 2 Sekunden.
- **Links:** Eine Suche lässt sich als Link speichern, z. B. `?m=track&q=Wo ist das Tram 4 in Zürich`.

## Tests

- `node tests/parser.test.mjs`: prüft die Satzerkennung mit 70 Beispielsätzen bei fester Bezugszeit (braucht Playwright mit Chromium, kein Netz).
- `node tests/live-smoke.mjs [Ordner]`: spielt typische Suchen mit echten Daten durch und speichert auf Wunsch Screenshots (braucht Netz).

## Datenquellen

- [transport.opendata.ch](https://transport.opendata.ch): Schweizer Fahrplan und Echtzeit (opentransportdata.swiss). Damit läuft die Suche.
- [Transitous](https://transitous.org) ([Quellen](https://transitous.org/sources/)): Strecken- und Linienverläufe auf Basis von OpenStreetMap, ergänzende Echtzeitdaten, Abfahrten im Umkreis und die Live-Fahrzeuge einer ganzen Linie. Die Nutzung ist laut [Richtlinie](https://transitous.org/api/) nur für **nicht-kommerzielle Open-Source-Projekte** erlaubt.
- Karte: © OpenStreetMap-Mitwirkende.

Fällt Transitous aus, arbeitet die Seite mit Luftlinien und der Abfahrtstafel des Bahnhofs weiter; statt der Fahrzeuge einer ganzen Linie zeigt sie dann die Abfahrten.

Die ganze Seite ist eine einzige Datei (`index.html`) und braucht keinen Server und keinen API-Schlüssel.
