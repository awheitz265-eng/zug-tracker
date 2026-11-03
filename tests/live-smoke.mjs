// Prüft die Seite mit echten Daten (braucht Netz zu transport.opendata.ch und api.transitous.org).
// Aufruf: node tests/live-smoke.mjs [Ordner für Screenshots]
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const file = "file://" + path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../index.html");
const shots = process.argv[2] || null;

const ZH = {latitude:47.3770, longitude:8.5440};   // Zürich, Central
const BS = {latitude:47.5548, longitude:7.5885};   // Basel, Barfüsserplatz
const CASES = [
  ["route", ZH, "Von hier zum SBB", /Verbindung/],
  ["route", BS, "Von hier zum SBB", /Verbindung/],
  ["route", ZH, "Morgen Nachmittag um fünf nach Luzern", /Verbindung/],
  ["route", ZH, "Mit dem Tram von Zürich, Central nach Zürich, Bellevue", /Verbindung/],
  ["route", ZH, "von Bern nach Zürich HB ohne Umsteigen", /Verbindung/],
  ["route", ZH, "wann kommt der 4er", null],
  ["track", ZH, "Wo ist das Tram 11 Richtung Rehalp", /Fahrzeug|kein Fahrzeug/],
  ["track", ZH, "Wo ist das Tram 4 in Zürich", /Fahrzeug|kein Fahrzeug/],
  ["track", ZH, "Tram 4 Richtung Tiefenbrunnen", /Fahrzeug|kein Fahrzeug/],
  ["track", ZH, "von hier zum SBB", null],
  ["route", ZH, "nach Basel um halb neun", /Verbindung/],
  ["route", ZH, "zum Flughafen", /Verbindung/],
  ["track", ZH, "Bus 31 ab Zürich, Hegibachplatz", null],
  ["track", ZH, "Abfahrten ab hier", null],
  ["track", ZH, "nächster Bus in der Nähe", null],
  ["track", ZH, "IC von Zürich HB nach Bern", null],
  ["track", BS, "Tram 8", /Fahrzeug|kein Fahrzeug/],
];

const browser = await chromium.launch();
let n = 0, bad = 0;
for (const [mode, geo, q, expect] of CASES){
  const ctx = await browser.newContext({geolocation: geo, permissions:["geolocation"], viewport:{width:1280, height:860}, locale:"de-CH", timezoneId:"Europe/Zurich"});
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(file + "?m=" + mode + "&q=" + encodeURIComponent(q));
  await page.waitForFunction(() => !document.getElementById("go").disabled && !/…/.test(document.getElementById("status").textContent), null, {timeout:45000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => ({
    mode: document.querySelector("#mode .on").textContent,
    parsed: document.getElementById("parsed").innerText,
    status: document.getElementById("status").innerText,
    err: document.getElementById("status").classList.contains("err"),
    cards: document.querySelectorAll("#results .card").length,
    deps: document.querySelectorAll("#onward .dep").length,
    empty: (document.querySelector("#results .empty, #onward .empty")||{}).innerText || "",
  }));
  const ok = !r.err && !errors.length && (expect ? expect.test(r.status + " " + r.empty) || r.cards > 0 : (r.cards + r.deps > 0 || r.empty));
  if (!ok) bad++;
  console.log(`${ok?"✓":"✗"} [${mode}→${r.mode}] «${q}»\n    ${r.parsed.replace(/\n/g," ")}\n    Status: ${r.status} | Karten ${r.cards} | Abfahrten ${r.deps}${r.empty?" | "+r.empty.slice(0,140):""}${errors.length?"\n    JS-Fehler: "+errors.join("; "):""}`);
  if (shots) await page.screenshot({path: path.join(shots, `smoke-${++n}.png`)});
  await ctx.close();
}
await browser.close();
console.log(`${CASES.length - bad}/${CASES.length} Abläufe ohne Fehler.`);
process.exit(bad ? 1 : 0);
