# Zug-Tracker

Webseite, die zeigt, wo ein Zug gerade unterwegs ist. Man gibt einen Satz ein, zum Beispiel
«Such mir den TGV, der im Moment von Paris Gare de Lyon nach Basel SBB unterwegs ist».

## Funktionen

- **Suche per Satz:** Die Seite erkennt den Zugtyp (TGV/Lyria, ICE, IC, EC, IR, RE, TER …), «von … nach …» bzw. «zwischen … und …» und optional die Zugnummer. Das geschieht regelbasiert, ohne KI.
- **Position auf der Karte:** Die Position wird aus Fahrplan und Echtzeit-Prognose geschätzt und entlang dem echten Gleisverlauf gezeichnet, sofern Transitous ihn liefert, sonst als Luftlinie. Die bereits gefahrene Strecke ist orange markiert.
- **Echtzeit:** Die Seite zeigt Verspätungen, Gleisänderungen, Ausfälle, Störungsmeldungen und die Auslastungsprognose, soweit die Quellen sie liefern.
- **Anschlüsse:** Tippt man einen Halt an, erscheinen die Abfahrten dort und im Umkreis von 400 m, gefiltert nach Zug, S-Bahn, Tram und Bus. Jede Abfahrt lässt sich auf der Karte verfolgen.
- **Aktualisierung:** Die Daten werden jede Minute neu geladen, die Position alle 2 Sekunden neu berechnet.
- **Links:** Eine Suche lässt sich als Link speichern, z. B. `?q=TGV von Paris Gare de Lyon nach Basel SBB`.

## Datenquellen

- [transport.opendata.ch](https://transport.opendata.ch): Schweizer Fahrplan und Echtzeit (opentransportdata.swiss). Damit läuft die Suche.
- [Transitous](https://transitous.org) ([Quellen](https://transitous.org/sources/)): Gleisverläufe auf Basis von OpenStreetMap, ergänzende Echtzeitdaten und Abfahrten im Umkreis. Die Nutzung ist laut [Richtlinie](https://transitous.org/api/) nur für **nicht-kommerzielle Open-Source-Projekte** erlaubt.
- Karte: © OpenStreetMap-Mitwirkende.

Fällt Transitous aus, arbeitet die Seite mit Luftlinien und der Abfahrtstafel des Bahnhofs weiter.

Die ganze Seite ist eine einzige Datei (`index.html`) und braucht keinen Server und keinen API-Schlüssel.
