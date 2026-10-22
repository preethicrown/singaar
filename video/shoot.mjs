import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const EDGE='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ROOT='file:///C:/Users/preet/OneDrive/Desktop/build/index.html';
const port=9333;
const p=spawn(EDGE,['--headless=new','--disable-gpu',`--remote-debugging-port=${port}`,'--user-data-dir='+process.env.TEMP+'\edge-shoot','--window-size=390,844','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list; for(let i=0;i<40;i++){try{list=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(list.length)break}catch{}await sleep(250)}
const ws=new WebSocket(list.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result);pend.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
await send('Emulation.setTouchEmulationEnabled',{enabled:true});
const ev=(expression)=>send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
const shot=async f=>{const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(f,Buffer.from(r.data,'base64'))};
const scenes=JSON.parse(process.argv[2]);
mkdirSync('shots',{recursive:true});
for(const s of scenes){
  await send('Page.navigate',{url:ROOT+s.hash});
  await sleep(2500);
  if(s.js) await ev(s.js);
  await sleep(s.wait||800);
  await shot(`shots/${s.name}.png`);
  console.log('shot',s.name);
}
p.kill();ws.close();process.exit(0);
