// Satzerkennung ohne Browser, Kartenbibliothek oder Netz.
// Aufruf: node tests/parser.test.mjs
import {loadApp} from './app-harness.mjs';
const NOW = "2026-11-03T18:50:00Z";
// [Eingabe, erwartete Felder]  (nur angegebene Felder werden geprüft)
const CASES = [
  // --- Zeit ---
  ["Von hier nach Zürich HB", {from:"hier", to:"Zürich HB", time:null, date:null}],
  ["Basel SBB nach Bern morgen um 8", {from:"Basel SBB", to:"Bern", date:"2026-11-04", time:"08:00"}],
  ["Basel SBB nach Bern morgen Ankunft 9 Uhr", {date:"2026-11-04", time:"09:00", isArr:true}],
  ["von hier nach Bern nach acht", {from:"hier", to:"Bern", time:"20:00", isArr:false}],
  ["nach Bern nach acht", {to:"Bern", time:"20:00", isArr:false}],
  ["morgen Nachmittag um fünf nach Luzern", {to:"Luzern", date:"2026-11-04", time:"17:00"}],
  ["heute Abend um 8 nach Thun", {to:"Thun", date:"2026-11-03", time:"20:00"}],
  ["morgen früh nach Genf", {to:"Genf", date:"2026-11-04", time:"07:00"}],
  ["morgen Morgen nach Genf", {to:"Genf", date:"2026-11-04", time:"08:00"}],
  ["um halb neun nach Olten", {to:"Olten", time:"20:30"}],
  ["morgen um halb neun nach Olten", {date:"2026-11-04", time:"08:30"}],
  ["morgen Viertel nach acht nach Olten", {date:"2026-11-04", time:"08:15"}],
  ["morgen viertel vor neun nach Olten", {date:"2026-11-04", time:"08:45"}],
  ["morgen zehn vor acht nach Olten", {date:"2026-11-04", time:"07:50"}],
  ["morgen fünf vor halb neun nach Olten", {date:"2026-11-04", time:"08:25"}],
  ["morgen dreiviertel neun nach Olten", {date:"2026-11-04", time:"08:45"}],
  ["morgen am halbi nüni uf Bärn", {date:"2026-11-04", time:"08:30"}],
  ["in 20 Minuten nach Winterthur", {to:"Winterthur", date:"2026-11-03", time:"20:10"}],
  ["in einer halben Stunde nach Winterthur", {time:"20:20"}],
  ["in einer Stunde nach Winterthur", {time:"20:50"}],
  ["am Montag bis 18:00 nach Zug", {to:"Zug", date:"2026-11-09", time:"18:00", isArr:true}],
  ["nächsten Dienstag um 7 nach Chur", {date:"2026-11-10", time:"07:00"}],
  ["am 5.11. um 14:30 nach Lugano", {date:"2026-11-05", time:"14:30"}],
  ["am 24. Dezember um 16 Uhr nach Bern", {date:"2026-12-24", time:"16:00"}],
  ["spätestens um 9 in Zürich ankommen", {to:"Zürich", time:"21:00", isArr:true}],
  ["morgen spätestens um 9 in Zürich sein", {to:"Zürich", date:"2026-11-04", time:"09:00", isArr:true}],
  ["nach Basel um 20h", {time:"20:00"}],
  ["nach Basel um 08:15", {time:"08:15"}],
  ["nach Basel 8 Uhr 15", {time:"20:15"}],
  ["nach Basel um Mitternacht", {date:"2026-11-04", time:"00:00"}],
  ["nach Basel gegen Mittag", {date:"2026-11-04", time:"12:00"}],
  ["am Wochenende nach Bern", {date:"2026-11-07"}],
  ["um 7 nach Chur", {date:"2026-11-04", time:"07:00"}],
  // --- Orte, Bahnhof, Linien ---
  ["von hier zum SBB", {from:"hier", to:"@SBB"}],
  ["zum HB", {from:null, to:"@HB"}],
  ["an den Bahnhof", {to:"@BHF"}],
  ["vom Barfüsserplatz zum Bahnhof", {from:"Barfüsserplatz", to:"@BHF"}],
  ["heim", {to:"@HOME"}],
  ["mit dem 6er zum SBB", {line:"6", to:"@SBB"}],
  ["zum Hauptbahnhof", {to:"@HB"}],
  ["zum Bahnhof SBB", {to:"@SBB"}],
  ["Ich bin in Thun und möchte nach Interlaken Ost", {from:"Thun", to:"Interlaken Ost"}],
  ["von Luzern nach Zug", {from:"Luzern", to:"Zug", mode:null}],
  ["mit dem Zug von Luzern nach Zug", {from:"Luzern", to:"Zug", mode:"train"}],
  ["mit dem 11er zum Bellevue", {line:"11", to:"Bellevue"}],
  ["Tram 4 Richtung Tiefenbrunnen", {line:"4", mode:"tram", dir:"Tiefenbrunnen"}],
  ["Wo ist das Tram 4 Richtung Tiefenbrunnen", {line:"4", mode:"tram", dir:"Tiefenbrunnen", intent:"where"}],
  ["wann kommt der 31er", {line:"31", intent:"when"}],
  ["wann kommt der Bus 31 am Hegibachplatz", {line:"31", mode:"bus", stop:"Hegibachplatz", intent:"when"}],
  ["Bus 31 ab Hegibachplatz", {line:"31", mode:"bus", stop:"Hegibachplatz"}],
  ["Tram 4 ab Central Richtung Tiefenbrunnen", {line:"4", stop:"Central", dir:"Tiefenbrunnen"}],
  ["S3 von Aarau nach Olten", {line:"S3", mode:"s", from:"Aarau", to:"Olten"}],
  ["IR 36 von Basel SBB nach Zürich HB", {line:"IR36", from:"Basel SBB", to:"Zürich HB"}],
  ["N1 Richtung Bellevue", {line:"N1"}],
  ["Wo ist das Tram 4 in Zürich", {line:"4", intent:"where", stop:"Zürich"}],
  ["Bus 31 in Zürich", {line:"31", mode:"bus", stop:"Zürich"}],
  ["Tram 8", {line:"8", mode:"tram", from:null, to:null, stop:null}],
  ["Postauto 101 ab Thun, Bahnhof", {line:"101", mode:"bus", stop:"Thun, Bahnhof"}],
  ["Abfahrten ab hier", {intent:"departures", stop:"hier"}],
  ["Abfahrten Bern Bahnhof", {intent:"departures", stop:"Bern Bahnhof"}],
  ["nächster Bus in der Nähe", {mode:"bus", stop:"hier"}],
  ["was fährt ab Bellevue", {intent:"departures", stop:"Bellevue"}],
  ["nur Tram von Central nach Bellevue", {from:"Central", to:"Bellevue", only:["tram"]}],
  ["von Bern nach Zürich ohne Bus", {without:["bus"]}],
  ["von Bern nach Zürich ohne Umsteigen", {from:"Bern", to:"Zürich", direct:true}],
  ["von Bern nach Zürich über Olten", {from:"Bern", to:"Zürich", via:"Olten"}],
  ["mit dem Schiff von Luzern nach Flüelen", {mode:"ship", from:"Luzern", to:"Flüelen"}],
  ["Seilbahn von Stechelberg nach Mürren", {mode:"cableway"}],
  // --- Fernverkehr wie bisher ---
  ["TGV von Paris Gare de Lyon nach Basel SBB", {type:"TGV", from:"Paris Gare de Lyon", to:"Basel SBB"}],
  ["ICE 75 von Basel SBB nach Zürich HB", {type:"ICE", number:"75"}],
  ["IC von Zürich HB nach Bern", {type:"IC", from:"Zürich HB", to:"Bern"}],
  ["EC von Zürich HB nach Milano Centrale", {type:"EC", to:"Milano Centrale"}],
  ["Zürich, Bahnhofstrasse 1 nach Luzern", {from:"Zürich, Bahnhofstrasse 1", to:"Luzern"}],
];


const app = loadApp();
const res = CASES.map(([q]) => app.run(`(() => {
  const w = parseWhen(testArgs.q, new Date(testArgs.now));
  const p = parseQuery(w.rest);
  return {date:w.date, time:w.time, isArr:w.isArr, alt:w.alt, ...p, ...p.opts};
})()`, {q, now:NOW}));

let fail = 0;
CASES.forEach(([q, exp], i) => {
  const got = res[i], bad = [];
  for (const [k, v] of Object.entries(exp)) if (JSON.stringify(got[k] ?? null) !== JSON.stringify(v)) bad.push(`${k}: erwartet ${JSON.stringify(v)}, erhalten ${JSON.stringify(got[k] ?? null)}`);
  if (bad.length){ fail++; console.log("✗ «"+q+"»\n    "+bad.join("\n    ")); }
});
console.log(`${CASES.length - fail}/${CASES.length} Sätze korrekt erkannt.`);
process.exit(fail ? 1 : 0);
