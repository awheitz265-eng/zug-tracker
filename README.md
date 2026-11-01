# Zug-Tracker

Webseite mit zwei Modi: **Route** plant Verbindungen mit Bahn, Tram und Bus in der ganzen Schweiz,
**Zug live** zeigt, wo ein Zug gerade unterwegs ist. Eingegeben wird ein einfacher Satz,
z. B. «Von hier nach Zürich HB» oder «TGV von Paris Gare de Lyon nach Basel SBB».

## Funktionen

- **Route planen:** Die Seite plant Verbindungen von A nach B, z. B. «Von hier nach Zürich HB» oder «Ich bin in Thun und möchte nach Interlaken Ost» oder «morgen um 8 in Zürich ankommen». Start und Ziel können Haltestellen, Adressen oder dein Standort («hier») sein. Angezeigt werden bis zu 5 Varianten mit Fusswegen, Umsteigezeiten, Gleis bzw. Kante, Echtzeit und Live-Fahrzeugen auf der Karte.
- **Datum, Zeit, Ab/An:** Datum, Zeit und Ab/An lassen sich über die Felder einstellen oder im Satz angeben, z. B. «morgen Ankunft 9 Uhr», «am 5.11. um 14:30» oder «am Montag bis 18:00». Ohne Angabe gilt «jetzt».
- **Zwei Modi:** **Route** plant Verbindungen, Datum, Zeit und Ab/An sind dabei aktiv. **Zug live** verfolgt Züge, die jetzt unterwegs sind, Datum und Zeit sind dabei gesperrt. Die Seite merkt sich den zuletzt gewählten Modus auf dem Gerät.
- **Suche per Satz:** Die Seite erkennt «von … nach …», «zwischen … und …», «in … ankommen», bei «Zug live» zusätzlich den Zugtyp (TGV/Lyria, ICE, IC, EC, IR, RE, TER …) und optional die Zugnummer. Das geschieht regelbasiert, ohne KI. Uhrzeiten werden als Ziffern erkannt («um 8», «8:30»), nicht als Wörter.
- **Position auf der Karte:** Die Position wird aus Fahrplan und Echtzeit-Prognose geschätzt und entlang dem echten Gleisverlauf gezeichnet, sofern Transitous ihn liefert, sonst als Luftlinie. Die bereits gefahrene Strecke ist orange markiert.
- **Echtzeit:** Die Seite zeigt Verspätungen, Gleisänderungen, Ausfälle, Störungsmeldungen und die Auslastungsprognose, soweit die Quellen sie liefern.
- **Anschlüsse:** Tippt man einen Halt an, erscheinen die Abfahrten dort und im Umkreis von 400 m, gefiltert nach Zug, S-Bahn, Tram und Bus. Jede Abfahrt lässt sich auf der Karte verfolgen.
- **Aktualisierung:** Die Daten werden jede Minute neu geladen, die Position alle 2 Sekunden neu berechnet.
- **Links:** Eine Suche lässt sich als Link speichern, z. B. `?m=track&q=TGV von Paris Gare de Lyon nach Basel SBB`.

## Datenquellen

- [transport.opendata.ch](https://transport.opendata.ch): Schweizer Fahrplan und Echtzeit (opentransportdata.swiss). Damit läuft die Suche.
- [Transitous](https://transitous.org) ([Quellen](https://transitous.org/sources/)): Gleisverläufe auf Basis von OpenStreetMap, ergänzende Echtzeitdaten und Abfahrten im Umkreis. Die Nutzung ist laut [Richtlinie](https://transitous.org/api/) nur für **nicht-kommerzielle Open-Source-Projekte** erlaubt.
- Karte: © OpenStreetMap-Mitwirkende.

Fällt Transitous aus, arbeitet die Seite mit Luftlinien und der Abfahrtstafel des Bahnhofs weiter.

Die ganze Seite ist eine einzige Datei (`index.html`) und braucht keinen Server und keinen API-Schlüssel.
