// Prüft, welchen Bahnhof «zum HB», «zum SBB» und «zum Bahnhof» an verschiedenen Orten ergeben.
// Braucht Netz zu transport.opendata.ch. Aufruf: node tests/station.test.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const file = "file://" + path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../index.html");

const P = {
  riehen:{lat:47.5840, lon:7.6470}, allschwil:{lat:47.5510, lon:7.5370}, barfi:{lat:47.5548, lon:7.5885},
  central:{lat:47.3770, lon:8.5440}, oerlikon:{lat:47.4110, lon:8.5450}, burgernziel:{lat:46.9435, lon:7.4660},
  dietikon:{lat:47.4040, lon:8.4000}, thun:{lat:46.7580, lon:7.6280}, toess:{lat:47.4900, lon:8.7080},
};
const CASES = [
  ["riehen","@SBB","Basel SBB"], ["riehen","@HB","Basel SBB"], ["riehen","@BHF","Riehen"],
  ["allschwil","@SBB","Basel SBB"], ["allschwil","@BHF","Basel SBB"],
  ["barfi","@SBB","Basel SBB"], ["barfi","@BHF","Basel SBB"],
  ["central","@HB","Zürich HB"], ["central","@SBB","Zürich HB"], ["central","@BHF","Zürich HB"],
  ["oerlikon","@HB","Zürich HB"], ["oerlikon","@BHF","Zürich Oerlikon"],
  ["burgernziel","@BHF","Bern"], ["burgernziel","@SBB","Bern"],
  ["dietikon","@HB","Zürich HB"], ["dietikon","@BHF","Dietikon"],
  ["thun","@SBB","Thun"], ["toess","@HB","Winterthur"],
  ["Barfüsserplatz","@SBB","Basel SBB"], ["Riehen, Dorf","@BHF","Riehen"],
];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.route(/tile\.openstreetmap|transitous/, r => r.abort());
await page.goto(file);
await page.waitForFunction(() => window.__zt);
let bad = 0;
for (const [where, kind, exp] of CASES){
  const ref = P[where] || where;
  const got = await page.evaluate(([r,k]) => window.__zt.mainStationNear(r,k).catch(e => "FEHLER: "+e.message), [ref, kind]);
  const ok = got === exp; if (!ok) bad++;
  console.log(`${ok?"✓":"✗"} ${where} ${kind} → ${got}${ok?"":"  (erwartet "+exp+")"}`);
}
await browser.close();
console.log(`${CASES.length-bad}/${CASES.length} Bahnhöfe richtig.`);
process.exit(bad ? 1 : 0);
