const sharp=require('../web/node_modules/sharp');const fs=require('fs');
const dir='../assets/photos/';const files=fs.readdirSync(dir).filter(f=>f.endsWith('.jpg'));
(async()=>{const W=200,H=260,C=9;const comps=[];
for(let i=0;i<files.length;i++){const b=await sharp(dir+files[i]).resize(W,H,{fit:'cover'}).toBuffer();
 const lab=Buffer.from(`<svg width="${W}" height="30"><rect width="60" height="30" fill="black" opacity=".7"/><text x="6" y="22" font-size="22" fill="white">${i}</text></svg>`);
 comps.push({input:b,left:(i%C)*W,top:Math.floor(i/C)*H},{input:lab,left:(i%C)*W,top:Math.floor(i/C)*H});}
await sharp({create:{width:W*C,height:H*Math.ceil(files.length/C),channels:3,background:'#000'}}).composite(comps).png().toFile('contact/photos.png');
console.log(files.map((f,i)=>i+':'+f.replace('pexels-','').replace('.jpg','')).join(' '));})();
