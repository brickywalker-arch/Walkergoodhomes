import sharp from 'sharp';
import fs from 'node:fs';
const names = process.argv[2].split(',');
const cols = +(process.argv[4]||4), cw=430, ch=287;
const rows = Math.ceil(names.length/cols);
const comps=[];
for (let i=0;i<names.length;i++){
  const f=`public/assets/cgi/${names[i]}-640.webp`;
  if(!fs.existsSync(f)) { console.log('missing',f); continue; }
  const buf = await sharp(f).resize(cw-4,ch-4,{fit:'cover'}).extend({top:2,bottom:2,left:2,right:2,background:'#fff'}).png().toBuffer();
  comps.push({input:buf,left:(i%cols)*cw,top:Math.floor(i/cols)*ch});
}
await sharp({create:{width:cols*cw,height:rows*ch,channels:3,background:'#222'}}).composite(comps).png().toFile(process.argv[3]);
console.log('ok', cols*cw, rows*ch);
