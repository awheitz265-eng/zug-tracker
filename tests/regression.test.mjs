import test from 'node:test';
import assert from 'node:assert/strict';
import {loadApp} from './app-harness.mjs';

const routeResult=(date='2026-11-05',time='08:00',from='Basel SBB',to='Bern')=>{
  const departure={station:{name:from,id:'1',coordinate:{x:47.55,y:7.59}},departure:`${date}T${time}:00+0100`,delay:0,platform:'1'};
  const arrival={station:{name:to,id:'2',coordinate:{x:46.95,y:7.44}},arrival:`${date}T09:00:00+0100`,delay:0,platform:'2'};
  return {from:{name:from},to:{name:'Olten'},connections:[{sections:[{departure,arrival,journey:{category:'IC',number:'1',name:'100',to,passList:[departure,arrival]}}]}]};
};
function mockFetch(url){const u=new URL(url);if(u.hostname.includes('transitous'))return Promise.resolve({ok:true,json:async()=>({stopTimes:[]})});return Promise.resolve({ok:true,json:async()=>routeResult(u.searchParams.get('date')||'2026-11-05',u.searchParams.get('time')||'08:00')});}
async function idle(app){for(let i=0;i<50&&app.run('searchBusy');i++)await new Promise(r=>setTimeout(r,0));assert.equal(app.run('searchBusy'),false);}

test('invalid calendar dates rejected, leap year accepted',()=>{
 const a=loadApp();
 for(const q of ['am 31. Februar nach Bern','am 31.04.2027 nach Bern','am 29.02.2027 nach Bern','am 32. Januar nach Bern','am 12.13.2027 nach Bern'])assert.throws(()=>a.run('parseWhen(testArgs)',q),/Datum/);
 assert.equal(a.run('parseWhen("am 29.02.2028 nach Bern").date'),'2028-02-29');
});
test('invalid clock times rejected, midnight leaves clean destination',()=>{
 const a=loadApp();for(const q of ['um 25:00 nach Bern','um 24:30 nach Bern','um 09:99 nach Bern'])assert.throws(()=>a.run('parseWhen(testArgs)',q),/Uhr|Zeit/);
 assert.equal(a.run('parseQuery(parseWhen("von Basel nach Bern morgen um Mitternacht").rest).to'),'Bern');
});
test('current section controls line and destination, including shared boundary',()=>{
 const a=loadApp();
 const place=(name,time)=>({name,lat:47,lon:8,scheduledArrival:`2026-11-04T${time}:00Z`,scheduledDeparture:`2026-11-04T${time}:00Z`});
 const itin={legs:[{mode:'TRAM',displayName:'13',tripId:'first',headsign:'HB',from:place('A','07:00'),to:place('HB','08:00'),intermediateStops:[]},{mode:'TRAM',displayName:'4',tripId:'second',headsign:'Rehalp',from:place('HB','08:00'),to:place('Rehalp','09:00'),intermediateStops:[]}]};
 a.run('var fixtureTrip=txTrip(testArgs)',itin);
 assert.equal(a.run('tripIdentity(fixtureTrip,new Date("2026-11-04T07:30Z")).label'),'Tram 13');
 assert.equal(a.run('tripIdentity(fixtureTrip,new Date("2026-11-04T08:00Z")).label'),'Tram 4');
 assert.equal(a.run('tripIdentity(fixtureTrip,new Date("2026-11-04T08:30Z")).dest'),'Rehalp');
});
test('connections exclude early, simultaneous and unreachable nearby departures',()=>{
 const a=loadApp();a.run('var arrival=new Date("2026-11-05T08:56Z");var o={at:arrival,board:false};');
 for(const time of ['08:55','08:56','08:58'])assert.equal(a.run(`departureReachable({exp:new Date('2026-11-05T${time}Z'),dist:0},o,arrival)`),false);
 assert.equal(a.run(`departureReachable({exp:new Date('2026-11-05T08:59Z'),dist:0},o,arrival)`),true);
 assert.equal(a.run(`departureReachable({exp:new Date('2026-11-05T09:00Z'),dist:400},o,arrival)`),false);
 assert.equal(a.run(`departureReachable({exp:new Date('2026-11-05T09:04Z'),dist:400},o,arrival)`),true);
 assert.equal(a.run(`departureReachable({exp:new Date('2026-11-05T09:04Z'),dist:0,cancelled:true},o,arrival)`),false);
 assert.equal(a.run(`departureReachable({exp:arrival},{at:arrival,board:true},arrival)`),true);
});
test('cancelled trip and cancelled stop override punctual route badge',()=>{
 const a=loadApp();for(const trip of [{cancelled:true,stops:[]},{cancelled:false,stops:[{cancelled:true}]}]){
 const badge=a.run('routeBadge({rt:true,maxDelay:0,legs:[{kind:"ride",trip:testArgs}]})',trip);assert.match(badge,/fällt aus/);assert.doesNotMatch(badge,/pünktlich/);
 }
});
test('manual time survives a repeated natural-language search',async()=>{
 const a=loadApp({fetch:mockFetch});const q='Basel SBB nach Bern morgen Ankunft 9 Uhr';await a.run('run(testArgs)',q);
 a.element('t').value='10:00';await a.run('run(testArgs)',q);
 assert.equal(a.element('t').value,'10:00');assert.match(a.element('parsed').innerHTML,/10:00/);assert.equal(new URL(a.url).searchParams.get('t'),'10:00');
});
test('explicit link time wins over the sentence when loaded',async()=>{
 const a=loadApp({search:'?m=route&q=Basel+SBB+nach+Bern+morgen+Ankunft+9+Uhr&d=2026-11-05&t=21%3A00&a=1',fetch:mockFetch});await idle(a);
 assert.equal(a.element('t').value,'21:00');assert.match(a.element('parsed').innerHTML,/21:00/);assert.equal(new URL(a.url).searchParams.get('t'),'21:00');
});
test('pagination updates header, fields, URL, and reload state',async()=>{
 const a=loadApp({fetch:mockFetch});await a.run('run("Basel SBB nach Bern morgen Ankunft 9 Uhr")');await a.run('pageRoute(1)');
 const w=a.run('route.qWhen');assert.equal(a.element('t').value,w.time);assert.equal(new URL(a.url).searchParams.get('t'),w.time);assert.equal(new URL(a.url).searchParams.get('a'),'0');assert.match(a.element('parsed').innerHTML,/Abfahrt/);
 const b=loadApp({search:new URL(a.url).search,fetch:mockFetch});await idle(b);assert.equal(b.element('t').value,w.time);assert.equal(b.run('abArr'),false);
});
test('via response uses the actual final endpoint instead of API summary',async()=>{
 const a=loadApp({fetch:mockFetch});await a.run('run("von Basel SBB nach Bern über Olten")');assert.equal(a.run('route.toName'),'Bern');assert.match(a.element('parsed').innerHTML,/nach <b>Bern<\/b>/);
});
test('empty/invalid search removes stale results and share link',async()=>{
 const a=loadApp({fetch:mockFetch});await a.run('run("von Basel SBB nach Bern")');assert.ok(a.element('results').innerHTML);await a.run('run("")');assert.equal(a.element('results').innerHTML,'');assert.equal(a.element('parsed').innerHTML,'');assert.match(a.element('status').textContent,/Ziel nicht erkannt/);assert.equal(new URL(a.url).search,'');
});
test('old search response cannot overwrite a new mode',async()=>{
 let resolve;const a=loadApp({fetch:()=>new Promise(r=>{resolve=r;})});const pending=a.run('run("von Basel SBB nach Bern")');a.run('setMode("track")');resolve({ok:true,json:async()=>routeResult()});await pending;
 assert.equal(a.run('modePref'),'track');assert.equal(a.element('results').innerHTML,'');assert.equal(a.element('go').disabled,false);
});
test('dates, transport terminology and accessible states are rendered',async()=>{
 const a=loadApp({fetch:mockFetch});await a.run('run("von Basel SBB nach Bern am 5.11.2026 um 08:00")');assert.match(a.element('results').innerHTML,/05\.11\.2026/);assert.equal(a.run('platformWord("ship")'),'Steg');assert.equal(a.run('platformWord("tram")'),'Kante');assert.equal(a.element('mode').children[0].attributes['aria-pressed'],'true');
});
test('HTTP errors and timeout have actionable messages',async()=>{
 for(const [status,text] of [[429,/bremst/],[503,/503/]]){const a=loadApp({fetch:async()=>({status,ok:false})});await assert.rejects(a.run('getJSON("https://test.local","Quelle")'),text);}
 const a=loadApp({fetch:async()=>{const e=new Error();e.name='AbortError';throw e;}});await assert.rejects(a.run('getJSON("https://test.local","Quelle")'),/nicht rechtzeitig/);
});
test('cancelled route is rendered as cancelled, with no punctual badge',async()=>{
 const a=loadApp({fetch:mockFetch});await a.run('run("von Basel SBB nach Bern")');
 a.run('route.list[0].legs[0].trip.cancelled=true;renderRoutes(new Date())');
 assert.match(a.element('results').innerHTML,/Fahrt fällt aus/);assert.doesNotMatch(a.element('results').innerHTML,/>pünktlich</);
});
test('a newer search wins when the older response arrives last',async()=>{
 const resolvers=[];const a=loadApp({fetch:url=>new URL(url).hostname.includes('transitous')?Promise.resolve({ok:true,json:async()=>({stopTimes:[]})}):new Promise(resolve=>resolvers.push(resolve))});
 const older=a.run('run("von Basel SBB nach Bern")');const newer=a.run('run("von Zürich HB nach Luzern")');
 resolvers[1]({ok:true,json:async()=>routeResult('2026-11-05','08:00','Zürich HB','Luzern')});await newer;
 resolvers[0]({ok:true,json:async()=>routeResult()});await older;
 assert.equal(a.run('route.toName'),'Luzern');assert.match(a.element('parsed').innerHTML,/Luzern/);
});
test('an old departure panel cannot reopen after it is closed',async()=>{
 const a=loadApp();a.run('var finishBoard; loadOnward=()=>new Promise(resolve=>finishBoard=resolve); var testTrip={stops:[{name:"Bern",lat:46.9,lon:7.4,arr:new Date()}]}');
 const pending=a.run('openOnward(testTrip,0)');a.run('onward=null;renderOnward();finishBoard({deps:[]})');await pending;
 assert.equal(a.element('onward').innerHTML,'');
});
test('focus restoration chooses the same identity, not a shifted row index',()=>{
 const a=loadApp();
 const old={dataset:{focusKey:'route-b'},id:''};const other={dataset:{focusKey:'route-a'},focus(){throw new Error('Wrong focus target');}};
 let focused=false;const replacement={dataset:{focusKey:'route-b'},focus(options){focused=options.preventScroll;}};
 let rendered=false;const box={querySelectorAll:()=>rendered?[other,replacement]:[old],set innerHTML(_v){rendered=true;}};
 a.document.activeElement=old;a.context.focusBox=box;a.run('replaceContent(focusBox,"new contents")');assert.equal(focused,true);
});
