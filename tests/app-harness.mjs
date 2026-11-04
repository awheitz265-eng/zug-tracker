// No browser or network: run the actual inline app with minimal DOM/Leaflet adapters.
// Rendering/focus must additionally be checked in a real browser.
import fs from 'node:fs';
import vm from 'node:vm';

export function loadApp({search = '', fetch: fetchImpl} = {}) {
  const elements = new Map();
  class Element {
    constructor(id='') { this.id=id; this.value=''; this.dataset={}; this.children=[]; this.options=[]; this.attributes={}; this._html=''; this.textContent=''; this.disabled=false; this.classList={add(){},remove(){},toggle(){},contains(){return false;}}; }
    set innerHTML(v) {this._html=v; if(this.id==='d') this.options=[...v.matchAll(/<option value="([^"]*)"/g)].map(m=>({value:m[1]}));}
    get innerHTML(){return this._html;}
    querySelectorAll(selector){return selector==='button' ? this.children : [];}
    setAttribute(k,v){this.attributes[k]=v;}
    appendChild(e){this.options.push(e);}
    addEventListener(){}
    scrollIntoView(){}
    focus(){document.activeElement=this;}
  }
  const element=id=>{if(!elements.has(id)) elements.set(id,new Element(id));return elements.get(id);};
  for (const [id,key,values] of [['mode','m',['route','track']],['ab','a',['ab','an']]]) element(id).children=values.map(v=>{const e=new Element();e.dataset[key]=v;return e;});
  const document={getElementById:element,createElement:()=>new Element(),body:new Element('body'),activeElement:null};
  document.activeElement=document.body;
  const chain=()=>new Proxy({},{get(target,key){if(key==='getElement')return ()=>({classList:{toggle(){}},style:{}});if(key==='getZoom')return ()=>7;if(key==='getCenter')return ()=>({lat:47, lng:8});if(key==='identityLabel')return target[key];return (...args)=>key==='pad'?chain():chain();},set(t,k,v){t[k]=v;return true;}});
  const L=new Proxy({},{get:()=>()=>chain()});
  const location={pathname:'/',search};
  let url='http://test.local/'+search;
  const context=vm.createContext({console,URL,URLSearchParams,AbortController,TypeError,setTimeout,clearTimeout,
    setInterval:()=>1,clearInterval(){},L,document,location,history:{replaceState(_a,_b,value){url=new URL(value,url).href;}},
    localStorage:{getItem(){return null;},setItem(){}},navigator:{},window:{matchMedia:()=>({matches:false})},
    fetch:fetchImpl || (async()=>{throw new Error('Unexpected network request');})});
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const script=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
  vm.runInContext(script,context,{filename:'index.html'});
  return {context,element,document,get url(){return url;},run(code,args){context.testArgs=args;return vm.runInContext(code,context);}};
}
