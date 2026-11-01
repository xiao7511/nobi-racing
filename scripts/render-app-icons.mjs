import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch(process.env.NOBI_BROWSER_CHANNEL?{channel:process.env.NOBI_BROWSER_CHANNEL}:{});
try{
 const page=await browser.newPage();
 const png=async(size)=>{const data=await page.evaluate(size=>{const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1119';ctx.fillRect(0,0,size,size);ctx.save();ctx.scale(size/1024,size/1024);ctx.fillStyle='#ff5d45';ctx.beginPath();ctx.moveTo(275,250);ctx.lineTo(430,250);ctx.lineTo(605,600);ctx.lineTo(675,250);ctx.lineTo(810,250);ctx.lineTo(665,775);ctx.lineTo(510,775);ctx.lineTo(335,425);ctx.lineTo(265,775);ctx.lineTo(130,775);ctx.closePath();ctx.fill();ctx.restore();return canvas.toDataURL('image/png').split(',')[1];},size);return Buffer.from(data,'base64');};
 await writeFile('apps/fan/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',await png(1024));
 for(const [density,size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]){
  const dir='apps/fan/android/app/src/main/res/mipmap-'+density;await mkdir(dir,{recursive:true});const image=await png(size);await writeFile(dir+'/ic_launcher.png',image);await writeFile(dir+'/ic_launcher_round.png',image);await writeFile(dir+'/ic_launcher_foreground.png',image);
 }
}finally{await browser.close();}
