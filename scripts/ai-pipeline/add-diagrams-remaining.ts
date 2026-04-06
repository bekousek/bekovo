import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SUBTOPICS_DIR = join(__dirname, '../../src/content/subtopics');

const wrap = (svg: string) => `<div style="text-align:center;margin:1.5rem auto;max-width:520px;">` + svg + `</div>`;

const diagrams: Record<string, string> = {

// ============ OPTIKA — remaining ============

'optika--faze-mesice-zatmeni': wrap(`<svg viewBox='0 0 480 200' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='240' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Fáze Měsíce</text>
  <circle cx='240' cy='110' r='20' fill='#3b82f6'/><text x='240' y='115' text-anchor='middle' fill='white' font-size='10'>Země</text>
  <circle cx='240' cy='110' r='75' fill='none' stroke='#d1d5db' stroke-width='1' stroke-dasharray='4'/>
  ${[
    {a:0,n:'úplněk',f:1},{a:45,n:'',f:0.75},{a:90,n:'posl. čtvrť',f:0.5},{a:135,n:'',f:0.25},
    {a:180,n:'nov',f:0},{a:225,n:'',f:0.25},{a:270,n:'první čtvrť',f:0.5},{a:315,n:'',f:0.75}
  ].map(p => {
    const x = 240 + 75 * Math.cos((p.a - 90) * Math.PI / 180);
    const y = 110 + 75 * Math.sin((p.a - 90) * Math.PI / 180);
    const r = 12;
    return `<circle cx='${x}' cy='${y}' r='${r}' fill='#1f2937'/>` +
      (p.f > 0 ? `<circle cx='${x + (1-p.f)*r*0.5}' cy='${y}' r='${r * p.f}' fill='#fef3c7'/>` : '') +
      (p.n ? `<text x='${x}' y='${y + (p.a > 90 && p.a < 270 ? -18 : 22)}' text-anchor='middle' fill='#374151' font-size='9'>${p.n}</text>` : '');
  }).join('')}
  <circle cx='420' cy='35' r='25' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='420' y='40' text-anchor='middle' fill='#f59e0b' font-size='14'>☀</text>
  <text x='420' y='70' text-anchor='middle' fill='#6b7280' font-size='9'>Slunce</text>
</svg>`),

'optika--opticke-pristroje': wrap(`<svg viewBox='0 0 460 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='230' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Mikroskop — princip</text>
  <line x1='20' y1='70' x2='120' y2='70' stroke='#374151' stroke-width='1' stroke-dasharray='3'/>
  <line x1='40' y1='50' x2='40' y2='70' stroke='#22c55e' stroke-width='2'/><text x='40' y='45' text-anchor='middle' fill='#22c55e' font-size='9'>předmět</text>
  <ellipse cx='120' cy='70' rx='8' ry='35' fill='#dbeafe' opacity='0.5' stroke='#3b82f6' stroke-width='2'/><text x='120' y='120' text-anchor='middle' fill='#3b82f6' font-size='9'>objektiv</text>
  <line x1='40' y1='50' x2='128' y2='70' stroke='#f59e0b' stroke-width='1.5'/><line x1='40' y1='70' x2='128' y2='55' stroke='#f59e0b' stroke-width='1.5'/>
  <line x1='128' y1='55' x2='250' y2='40' stroke='#f59e0b' stroke-width='1.5'/><line x1='128' y1='70' x2='250' y2='85' stroke='#f59e0b' stroke-width='1.5'/>
  <line x1='250' y1='40' x2='250' y2='85' stroke='#ef4444' stroke-width='2'/><text x='270' y='65' fill='#ef4444' font-size='9'>mezizobraz</text>
  <ellipse cx='310' cy='62' rx='8' ry='35' fill='#dcfce7' opacity='0.5' stroke='#22c55e' stroke-width='2'/><text x='310' y='120' text-anchor='middle' fill='#22c55e' font-size='9'>okulár</text>
  <line x1='318' y1='50' x2='430' y2='30' stroke='#f59e0b' stroke-width='1.5' stroke-dasharray='3'/><line x1='318' y1='75' x2='430' y2='100' stroke='#f59e0b' stroke-width='1.5' stroke-dasharray='3'/>
  <circle cx='440' cy='65' r='12' fill='#f3f4f6' stroke='#374151' stroke-width='1.5'/><text x='440' y='69' text-anchor='middle' fill='#374151' font-size='10'>👁</text>
</svg>`),

// ============ MECHANIKA — remaining ============

'mechanika--prace-na-jednoduchych-strojich': wrap(`<svg viewBox='0 0 420 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Nakloněná rovina</text>
  <line x1='50' y1='130' x2='350' y2='130' stroke='#374151' stroke-width='2'/>
  <line x1='50' y1='130' x2='350' y2='40' stroke='#374151' stroke-width='3'/>
  <line x1='350' y1='40' x2='350' y2='130' stroke='#374151' stroke-width='2' stroke-dasharray='4'/>
  <rect x='160' y='60' width='40' height='30' rx='5' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5' transform='rotate(-16.7,180,75)'/>
  <line x1='180' y1='75' x2='120' y2='57' stroke='#22c55e' stroke-width='2.5' marker-end='url(#nr1)'/><text x='130' y='48' fill='#22c55e' font-size='11' font-weight='bold'>F</text>
  <line x1='180' y1='75' x2='180' y2='115' stroke='#ef4444' stroke-width='2' marker-end='url(#nr2)'/><text x='190' y='110' fill='#ef4444' font-size='11'>G</text>
  <line x1='55' y1='140' x2='345' y2='140' stroke='#f59e0b' stroke-width='1.5'/><text x='200' y='155' text-anchor='middle' fill='#f59e0b' font-size='11'>l (délka rampy)</text>
  <line x1='355' y1='45' x2='355' y2='125' stroke='#8b5cf6' stroke-width='1.5'/><text x='375' y='90' fill='#8b5cf6' font-size='11'>h</text>
  <text x='210' y='145' text-anchor='middle' fill='#374151' font-size='10'>F = G · h/l</text>
  <defs>
    <marker id='nr1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='nr2' viewBox='0 0 6 6' refX='3' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,0 L3,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

// ============ SKUPENSTVÍ LÁTEK ============

'skupenstvi-latek--zmeny-skupenstvi-latek': wrap(`<svg viewBox='0 0 420 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Křivka ohřevu</text>
  <line x1='50' y1='150' x2='400' y2='150' stroke='#374151' stroke-width='1.5' marker-end='url(#ko1)'/><text x='405' y='155' fill='#374151' font-size='10'>Q</text>
  <line x1='50' y1='150' x2='50' y2='20' stroke='#374151' stroke-width='1.5' marker-end='url(#ko2)'/><text x='38' y='20' fill='#374151' font-size='10'>t°C</text>
  <polyline points='70,140 130,100 200,100 260,60 340,60 380,30' fill='none' stroke='#3b82f6' stroke-width='2.5'/>
  <line x1='130' y1='100' x2='130' y2='155' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <line x1='200' y1='100' x2='200' y2='155' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <line x1='260' y1='60' x2='260' y2='155' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <line x1='340' y1='60' x2='340' y2='155' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <text x='165' y='95' text-anchor='middle' fill='#ef4444' font-size='10' font-weight='bold'>tání</text>
  <text x='300' y='55' text-anchor='middle' fill='#ef4444' font-size='10' font-weight='bold'>var</text>
  <text x='100' y='130' text-anchor='middle' fill='#6b7280' font-size='9'>led</text>
  <text x='230' y='85' text-anchor='middle' fill='#6b7280' font-size='9'>voda</text>
  <text x='360' y='45' text-anchor='middle' fill='#6b7280' font-size='9'>pára</text>
  <text x='42' y='103' fill='#374151' font-size='9'>0°C</text>
  <text x='36' y='63' fill='#374151' font-size='9'>100°C</text>
  <defs>
    <marker id='ko1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#374151'/></marker>
    <marker id='ko2' viewBox='0 0 6 6' refX='3' refY='1' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#374151'/></marker>
  </defs>
</svg>`),

'skupenstvi-latek--skupenske-teplo': wrap(`<svg viewBox='0 0 420 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Skupenské teplo tání</text>
  <rect x='30' y='40' width='120' height='70' rx='8' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/>
  <text x='90' y='70' text-anchor='middle' fill='#1e40af' font-size='13' font-weight='bold'>LED</text>
  <text x='90' y='90' text-anchor='middle' fill='#374151' font-size='11'>0 °C</text>
  <text x='200' y='80' text-anchor='middle' fill='#f59e0b' font-size='24'>+ Q</text>
  <path d='M155,75 L240,75' fill='none' stroke='#f59e0b' stroke-width='2.5' marker-end='url(#st1)'/>
  <rect x='270' y='40' width='120' height='70' rx='8' fill='#bfdbfe' stroke='#3b82f6' stroke-width='2'/>
  <text x='330' y='70' text-anchor='middle' fill='#1e40af' font-size='13' font-weight='bold'>VODA</text>
  <text x='330' y='90' text-anchor='middle' fill='#374151' font-size='11'>0 °C</text>
  <text x='210' y='130' text-anchor='middle' fill='#ef4444' font-size='12' font-weight='bold'>Q = m · l_t</text>
  <text x='210' y='22' text-anchor='middle' fill='#6b7280' font-size='10'>teplota se nemění!</text>
  <defs><marker id='st1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker></defs>
</svg>`),

'skupenstvi-latek--vztah-teploty-a-tlaku': wrap(`<svg viewBox='0 0 400 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Teplota roste → tlak roste</text>
  <rect x='50' y='40' width='120' height='90' rx='10' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <text x='110' y='65' text-anchor='middle' fill='#374151' font-size='11'>studený plyn</text>
  ${[{x:75,y:80},{x:100,y:90},{x:130,y:75},{x:90,y:105},{x:145,y:100}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='4' fill='#3b82f6' opacity='0.6'/>`).join('')}
  <text x='110' y='145' text-anchor='middle' fill='#3b82f6' font-size='11'>nízký tlak</text>
  <text x='225' y='90' fill='#374151' font-size='22'>→</text>
  <rect x='260' y='40' width='120' height='90' rx='10' fill='#fef2f2' stroke='#ef4444' stroke-width='2'/>
  <text x='320' y='65' text-anchor='middle' fill='#374151' font-size='11'>horký plyn</text>
  ${[{x:280,y:78,dx:8,dy:-6},{x:310,y:85,dx:-6,dy:8},{x:340,y:72,dx:-5,dy:-8},{x:295,y:100,dx:10,dy:4},{x:355,y:95,dx:-8,dy:6},{x:320,y:110,dx:5,dy:-10},{x:285,y:115,dx:8,dy:-4}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='4' fill='#ef4444'/><line x1='${p.x}' y1='${p.y}' x2='${p.x+p.dx}' y2='${p.y+p.dy}' stroke='#ef4444' stroke-width='1.5'/>`).join('')}
  <text x='320' y='145' text-anchor='middle' fill='#ef4444' font-size='11' font-weight='bold'>vysoký tlak</text>
</svg>`),

// ============ TEPELNÉ MOTORY ============

'tepelne-motory--parni-stroj': wrap(`<svg viewBox='0 0 450 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='225' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Princip parního stroje</text>
  <rect x='20' y='50' width='80' height='80' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='2'/><text x='60' y='85' text-anchor='middle' fill='#991b1b' font-size='10'>kotel</text><text x='60' y='100' text-anchor='middle' fill='#991b1b' font-size='9'>🔥</text>
  <line x1='100' y1='80' x2='145' y2='80' stroke='#9ca3af' stroke-width='3'/><text x='122' y='72' fill='#6b7280' font-size='9'>pára</text>
  <rect x='145' y='50' width='120' height='80' rx='5' fill='#e5e7eb' stroke='#374151' stroke-width='2'/>
  <rect x='155' y='60' width='30' height='60' rx='3' fill='#9ca3af'/><text x='170' y='95' text-anchor='middle' fill='white' font-size='9'>píst</text>
  <line x1='185' y1='90' x2='255' y2='90' stroke='#374151' stroke-width='3'/><text x='220' y='85' fill='#374151' font-size='9'>ojnice</text>
  <circle cx='295' cy='90' r='25' fill='none' stroke='#3b82f6' stroke-width='2.5'/><circle cx='295' cy='90' r='4' fill='#3b82f6'/>
  <line x1='255' y1='90' x2='280' y2='75' stroke='#374151' stroke-width='2.5'/>
  <text x='295' y='130' text-anchor='middle' fill='#3b82f6' font-size='9'>setrvačník</text>
  <line x1='320' y1='90' x2='380' y2='90' stroke='#22c55e' stroke-width='3' marker-end='url(#ps1)'/><text x='400' y='95' fill='#22c55e' font-size='11' font-weight='bold'>W</text>
  <text x='350' y='80' fill='#22c55e' font-size='9'>práce</text>
  <defs><marker id='ps1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker></defs>
</svg>`),

'tepelne-motory--spalovaci-motory': wrap(`<svg viewBox='0 0 500 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='250' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Čtyři doby spalovacího motoru</text>
  ${[{x:30,n:'1. Sání',c:'#3b82f6',py:80,d:'↓'},{x:150,n:'2. Komprese',c:'#f59e0b',py:50,d:'↑'},{x:270,n:'3. Expanze',c:'#ef4444',py:80,d:'↓💥'},{x:390,n:'4. Výfuk',c:'#9ca3af',py:50,d:'↑'}].map(p=>`
    <rect x='${p.x}' y='30' width='90' height='80' rx='5' fill='#f3f4f6' stroke='${p.c}' stroke-width='2'/>
    <rect x='${p.x+25}' y='${p.py}' width='40' height='8' rx='2' fill='${p.c}'/>
    <text x='${p.x+45}' y='${p.py-5}' text-anchor='middle' fill='${p.c}' font-size='14'>${p.d}</text>
    <text x='${p.x+45}' y='125' text-anchor='middle' fill='${p.c}' font-size='10' font-weight='bold'>${p.n}</text>
  `).join('')}
</svg>`),

'tepelne-motory--proudovy-raketovy-motor': wrap(`<svg viewBox='0 0 460 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='230' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>3. Newtonův zákon — akce a reakce</text>
  <path d='M180,40 L330,40 Q350,40 350,55 L350,85 Q350,100 330,100 L180,100 Q160,100 150,70 Q160,40 180,40 Z' fill='#d1d5db' stroke='#374151' stroke-width='2'/>
  <text x='260' y='75' text-anchor='middle' fill='#374151' font-size='12' font-weight='bold'>RAKETA</text>
  <line x1='350' y1='70' x2='430' y2='70' stroke='#22c55e' stroke-width='3' marker-end='url(#rk1)'/><text x='400' y='60' fill='#22c55e' font-size='11' font-weight='bold'>pohyb →</text>
  ${[55,65,70,75,85].map(y=>`<line x1='150' y1='${y}' x2='${80+Math.random()*30}' y2='${y+Math.random()*10-5}' stroke='#ef4444' stroke-width='2.5' marker-end='url(#rk2)'/>`).join('')}
  <text x='80' y='60' text-anchor='middle' fill='#ef4444' font-size='11' font-weight='bold'>← plyny</text>
  <text x='260' y='120' text-anchor='middle' fill='#6b7280' font-size='10'>akce (plyny dozadu) = reakce (raketa dopředu)</text>
  <defs>
    <marker id='rk1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='rk2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

// ============ PLYNY 7 ============

'plyny-7--atmosfera': wrap(`<svg viewBox='0 0 400 190' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Atmosférický tlak</text>
  <rect x='80' y='140' width='240' height='35' rx='5' fill='#a7f3d0' stroke='#22c55e' stroke-width='1.5'/><text x='200' y='163' text-anchor='middle' fill='#166534' font-size='11'>zemský povrch</text>
  <rect x='100' y='30' width='200' height='110' fill='#bfdbfe' opacity='0.15'/>
  <rect x='100' y='30' width='200' height='35' fill='#bfdbfe' opacity='0.05'/>
  <rect x='100' y='65' width='200' height='35' fill='#bfdbfe' opacity='0.15'/>
  <rect x='100' y='100' width='200' height='40' fill='#bfdbfe' opacity='0.3'/>
  <text x='310' y='50' fill='#6b7280' font-size='9'>řídký vzduch</text>
  <text x='310' y='120' fill='#3b82f6' font-size='9'>hustý vzduch</text>
  <line x1='200' y1='30' x2='200' y2='140' stroke='#ef4444' stroke-width='2.5' marker-end='url(#at1)'/>
  <text x='230' y='90' fill='#ef4444' font-size='11' font-weight='bold'>p₀</text>
  <text x='200' y='188' text-anchor='middle' fill='#374151' font-size='11'>p₀ ≈ 101 325 Pa ≈ 1013 hPa</text>
  <defs><marker id='at1' viewBox='0 0 6 6' refX='3' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,0 L3,6Z' fill='#ef4444'/></marker></defs>
</svg>`),

'plyny-7--vakuum': wrap(`<svg viewBox='0 0 420 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Magdeburské polokoule (1654)</text>
  <path d='M130,80 Q130,40 170,40 L170,120 Q130,120 130,80 Z' fill='#d1d5db' stroke='#374151' stroke-width='2'/>
  <path d='M290,80 Q290,40 250,40 L250,120 Q290,120 290,80 Z' fill='#d1d5db' stroke='#374151' stroke-width='2'/>
  <rect x='170' y='40' width='80' height='80' fill='#eff6ff' stroke='none'/>
  <text x='210' y='85' text-anchor='middle' fill='#3b82f6' font-size='11' font-weight='bold'>vakuum</text>
  <line x1='130' y1='80' x2='50' y2='80' stroke='#ef4444' stroke-width='3' marker-end='url(#vk1)'/><text x='60' y='72' fill='#ef4444' font-size='10'>← tah</text>
  <line x1='290' y1='80' x2='370' y2='80' stroke='#ef4444' stroke-width='3' marker-end='url(#vk2)'/><text x='350' y='72' fill='#ef4444' font-size='10'>tah →</text>
  ${[40,60,100,120].map(y=>`<line x1='155' y1='${y}' x2='165' y2='${y}' stroke='#9ca3af' stroke-width='1.5'/>`).join('')}
  ${[40,60,100,120].map(y=>`<line x1='255' y1='${y}' x2='265' y2='${y}' stroke='#9ca3af' stroke-width='1.5'/>`).join('')}
  <text x='210' y='150' text-anchor='middle' fill='#6b7280' font-size='10'>Atmosférický tlak drží polokoule u sebe!</text>
  <defs>
    <marker id='vk1' viewBox='0 0 6 6' refX='0' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M6,0 L0,3 L6,6Z' fill='#ef4444'/></marker>
    <marker id='vk2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

'plyny-7--vztlak-v-plynech': wrap(`<svg viewBox='0 0 380 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='190' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Horkovzdušný balón</text>
  <ellipse cx='190' cy='80' rx='65' ry='55' fill='#fecaca' opacity='0.4' stroke='#ef4444' stroke-width='2'/>
  <text x='190' y='75' text-anchor='middle' fill='#ef4444' font-size='11'>teplý vzduch</text>
  <text x='190' y='90' text-anchor='middle' fill='#ef4444' font-size='10'>(menší ρ)</text>
  <line x1='155' y1='130' x2='225' y2='130' stroke='#374151' stroke-width='2'/>
  <rect x='160' y='130' width='60' height='25' rx='3' fill='#f3f4f6' stroke='#374151' stroke-width='1.5'/><text x='190' y='147' text-anchor='middle' fill='#374151' font-size='9'>koš</text>
  <line x1='155' y1='130' x2='135' y2='105' stroke='#374151' stroke-width='1.5'/><line x1='225' y1='130' x2='245' y2='105' stroke='#374151' stroke-width='1.5'/>
  <line x1='190' y1='50' x2='190' y2='20' stroke='#22c55e' stroke-width='3' marker-end='url(#vp1)'/><text x='220' y='30' fill='#22c55e' font-size='11' font-weight='bold'>F_vz</text>
  <line x1='190' y1='145' x2='190' y2='175' stroke='#ef4444' stroke-width='2.5' marker-end='url(#vp2)'/><text x='220' y='172' fill='#ef4444' font-size='11' font-weight='bold'>G</text>
  <text x='310' y='90' fill='#374151' font-size='10'>F_vz > G</text>
  <text x='310' y='108' fill='#22c55e' font-size='10'>→ stoupá!</text>
  <defs>
    <marker id='vp1' viewBox='0 0 6 6' refX='3' refY='1' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#22c55e'/></marker>
    <marker id='vp2' viewBox='0 0 6 6' refX='3' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,0 L3,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

// ============ ELEKTŘINA 9 — remaining ============

'elektrina--elektrarny': wrap(`<svg viewBox='0 0 480 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='240' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Princip tepelné elektrárny</text>
  <rect x='20' y='40' width='70' height='55' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='55' y='62' text-anchor='middle' fill='#991b1b' font-size='9'>kotel</text><text x='55' y='78' text-anchor='middle' fill='#ef4444' font-size='14'>🔥</text>
  <line x1='90' y1='65' x2='120' y2='65' stroke='#9ca3af' stroke-width='2.5' marker-end='url(#el1)'/><text x='105' y='58' fill='#6b7280' font-size='8'>pára</text>
  <rect x='120' y='35' width='70' height='65' rx='5' fill='#e5e7eb' stroke='#374151' stroke-width='1.5'/>
  <circle cx='155' cy='68' r='18' fill='none' stroke='#f59e0b' stroke-width='2.5'/><text x='155' y='73' text-anchor='middle' fill='#f59e0b' font-size='9'>turbína</text>
  <line x1='190' y1='65' x2='220' y2='65' stroke='#374151' stroke-width='3'/>
  <rect x='220' y='35' width='70' height='65' rx='5' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <circle cx='255' cy='68' r='18' fill='none' stroke='#3b82f6' stroke-width='2.5'/><text x='255' y='73' text-anchor='middle' fill='#3b82f6' font-size='8'>generátor</text>
  <line x1='290' y1='65' x2='330' y2='65' stroke='#22c55e' stroke-width='2.5' marker-end='url(#el2)'/><text x='310' y='58' fill='#22c55e' font-size='8'>el. energie</text>
  <rect x='330' y='40' width='60' height='50' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='360' y='63' text-anchor='middle' fill='#92400e' font-size='8'>transf.</text><text x='360' y='78' text-anchor='middle' fill='#92400e' font-size='8'>↑ U</text>
  <line x1='390' y1='65' x2='430' y2='65' stroke='#374151' stroke-width='2' marker-end='url(#el1)'/><text x='440' y='70' fill='#374151' font-size='9'>síť</text>
  <defs>
    <marker id='el1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#9ca3af'/></marker>
    <marker id='el2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

'elektrina--elektricke-clanky': wrap(`<svg viewBox='0 0 400 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Galvanický článek</text>
  <rect x='100' y='35' width='200' height='85' rx='8' fill='#f3f4f6' stroke='#374151' stroke-width='2'/>
  <rect x='140' y='30' width='15' height='65' fill='#9ca3af' stroke='#374151' stroke-width='1.5'/><text x='147' y='105' text-anchor='middle' fill='#374151' font-size='9'>Zn (−)</text>
  <rect x='245' y='30' width='15' height='65' fill='#f59e0b' stroke='#374151' stroke-width='1.5'/><text x='252' y='105' text-anchor='middle' fill='#374151' font-size='9'>Cu (+)</text>
  <rect x='105' y='60' width='190' height='55' fill='#bfdbfe' opacity='0.3'/><text x='200' y='90' text-anchor='middle' fill='#3b82f6' font-size='10'>elektrolyt</text>
  <line x1='147' y1='30' x2='147' y2='20' stroke='#374151' stroke-width='2'/><line x1='252' y1='30' x2='252' y2='20' stroke='#374151' stroke-width='2'/>
  <line x1='147' y1='20' x2='252' y2='20' stroke='#374151' stroke-width='2'/>
  <circle cx='200' cy='20' r='12' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='200' y='24' text-anchor='middle' fill='#f59e0b' font-size='9'>💡</text>
  <text x='130' y='140' fill='#374151' font-size='10'>chemická E → elektrická E</text>
  <text x='330' y='60' fill='#374151' font-size='10'>U = 1,5 V</text>
</svg>`),

'elektrina--civky-a-kondenzatory': wrap(`<svg viewBox='0 0 460 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='20' y='15' width='190' height='100' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='115' y='35' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Cívka (induktor)</text>
  ${Array.from({length:6},(_,i)=>`<path d='M${50+i*22},80 Q${61+i*22},55 ${72+i*22},80' fill='none' stroke='#3b82f6' stroke-width='2.5'/>`).join('')}
  <text x='115' y='105' text-anchor='middle' fill='#374151' font-size='10'>L [henry, H]</text>
  <rect x='250' y='15' width='190' height='100' rx='8' fill='#f0fdf4' stroke='#22c55e' stroke-width='1.5'/>
  <text x='345' y='35' text-anchor='middle' font-weight='bold' fill='#166534' font-size='12'>Kondenzátor</text>
  <line x1='310' y1='55' x2='310' y2='95' stroke='#22c55e' stroke-width='3'/><line x1='330' y1='55' x2='330' y2='95' stroke='#22c55e' stroke-width='3'/>
  <line x1='280' y1='75' x2='310' y2='75' stroke='#374151' stroke-width='2'/><line x1='330' y1='75' x2='360' y2='75' stroke='#374151' stroke-width='2'/>
  <text x='290' y='55' fill='#374151' font-size='10'>+</text><text x='340' y='55' fill='#374151' font-size='10'>−</text>
  <text x='370' y='70' fill='#374151' font-size='9'>Q = C · U</text>
  <text x='345' y='105' text-anchor='middle' fill='#374151' font-size='10'>C [farad, F]</text>
</svg>`),

'elektrina--trojfazova-soustava': wrap(`<svg viewBox='0 0 440 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='220' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Trojfázový proud — 3 fáze posunuté o 120°</text>
  <line x1='40' y1='80' x2='420' y2='80' stroke='#d1d5db' stroke-width='1'/>
  <line x1='40' y1='30' x2='40' y2='130' stroke='#d1d5db' stroke-width='1'/>
  <path d='M40,80 Q70,30 100,80 Q130,130 160,80 Q190,30 220,80 Q250,130 280,80 Q310,30 340,80 Q370,130 400,80' fill='none' stroke='#ef4444' stroke-width='2'/>
  <path d='M80,80 Q110,30 140,80 Q170,130 200,80 Q230,30 260,80 Q290,130 320,80 Q350,30 380,80 Q410,130 420,110' fill='none' stroke='#22c55e' stroke-width='2'/>
  <path d='M120,80 Q150,30 180,80 Q210,130 240,80 Q270,30 300,80 Q330,130 360,80 Q390,30 420,60' fill='none' stroke='#3b82f6' stroke-width='2'/>
  <text x='405' y='50' fill='#ef4444' font-size='10'>L1</text><text x='405' y='95' fill='#22c55e' font-size='10'>L2</text><text x='405' y='115' fill='#3b82f6' font-size='10'>L3</text>
  <text x='220' y='145' text-anchor='middle' fill='#374151' font-size='10'>U_fáz = 230 V | U_sdruž = 400 V</text>
</svg>`),

'elektrina--elektromotor': wrap(`<svg viewBox='0 0 400 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Elektromotor</text>
  <circle cx='200' cy='90' r='55' fill='#f3f4f6' stroke='#374151' stroke-width='2.5'/>
  <text x='200' y='140' text-anchor='middle' fill='#374151' font-size='10'>stator</text>
  <rect x='140' y='35' width='15' height='50' rx='2' fill='#ef4444'/><text x='147' y='32' text-anchor='middle' fill='#ef4444' font-size='10'>N</text>
  <rect x='245' y='35' width='15' height='50' rx='2' fill='#3b82f6'/><text x='252' y='32' text-anchor='middle' fill='#3b82f6' font-size='10'>S</text>
  <rect x='175' y='65' width='50' height='50' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='2' transform='rotate(30,200,90)'/>
  <text x='200' y='95' text-anchor='middle' fill='#92400e' font-size='10'>rotor</text>
  <circle cx='200' cy='90' r='5' fill='#374151'/>
  <path d='M255' y='90' fill='none' stroke='#22c55e' stroke-width='0'/>
  <path d='M220,65 Q240,55 245,70' fill='none' stroke='#22c55e' stroke-width='2' marker-end='url(#em2)'/><text x='250' y='58' fill='#22c55e' font-size='10'>otáčení</text>
  <text x='340' y='80' fill='#374151' font-size='10'>el. → mech.</text>
  <text x='340' y='95' fill='#374151' font-size='10'>energie</text>
  <text x='340' y='115' fill='#22c55e' font-size='10'>η = 80–95 %</text>
  <defs><marker id='em2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker></defs>
</svg>`),

'elektrina--elektromagneticke-vlneni': wrap(`<svg viewBox='0 0 500 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='250' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Elektromagnetické spektrum</text>
  <rect x='10' y='35' width='60' height='50' rx='4' fill='#ef4444' opacity='0.2' stroke='#ef4444' stroke-width='1'/><text x='40' y='55' text-anchor='middle' fill='#991b1b' font-size='8'>rádio</text><text x='40' y='68' text-anchor='middle' fill='#991b1b' font-size='7'>km–mm</text>
  <rect x='75' y='35' width='55' height='50' rx='4' fill='#f59e0b' opacity='0.2' stroke='#f59e0b' stroke-width='1'/><text x='102' y='55' text-anchor='middle' fill='#92400e' font-size='8'>mikro</text><text x='102' y='68' text-anchor='middle' fill='#92400e' font-size='7'>mm–cm</text>
  <rect x='135' y='35' width='55' height='50' rx='4' fill='#ef4444' opacity='0.15' stroke='#ef4444' stroke-width='1'/><text x='162' y='55' text-anchor='middle' fill='#991b1b' font-size='8'>IR</text><text x='162' y='68' text-anchor='middle' fill='#991b1b' font-size='7'>μm</text>
  <rect x='195' y='30' width='60' height='60' rx='4' fill='none' stroke='#374151' stroke-width='2'/>
  <rect x='197' y='32' width='56' height='56' rx='3' fill='url(#rainbow)'/>
  <text x='225' y='105' text-anchor='middle' fill='#374151' font-size='8' font-weight='bold'>viditelné</text>
  <rect x='260' y='35' width='55' height='50' rx='4' fill='#8b5cf6' opacity='0.15' stroke='#8b5cf6' stroke-width='1'/><text x='287' y='55' text-anchor='middle' fill='#5b21b6' font-size='8'>UV</text><text x='287' y='68' text-anchor='middle' fill='#5b21b6' font-size='7'>nm</text>
  <rect x='320' y='35' width='55' height='50' rx='4' fill='#3b82f6' opacity='0.15' stroke='#3b82f6' stroke-width='1'/><text x='347' y='55' text-anchor='middle' fill='#1e40af' font-size='8'>RTG</text><text x='347' y='68' text-anchor='middle' fill='#1e40af' font-size='7'>pm–nm</text>
  <rect x='380' y='35' width='55' height='50' rx='4' fill='#374151' opacity='0.15' stroke='#374151' stroke-width='1'/><text x='407' y='55' text-anchor='middle' fill='#374151' font-size='8'>gama</text><text x='407' y='68' text-anchor='middle' fill='#374151' font-size='7'>&lt;pm</text>
  <text x='40' y='100' fill='#6b7280' font-size='8'>← delší λ</text><text x='410' y='100' fill='#6b7280' font-size='8' text-anchor='end'>kratší λ →</text>
  <defs><linearGradient id='rainbow' x1='0' y1='0' x2='1' y2='0'><stop offset='0%' stop-color='#ef4444'/><stop offset='20%' stop-color='#f59e0b'/><stop offset='40%' stop-color='#eab308'/><stop offset='55%' stop-color='#22c55e'/><stop offset='75%' stop-color='#3b82f6'/><stop offset='100%' stop-color='#8b5cf6'/></linearGradient></defs>
</svg>`),

'elektrina--silnoproud': wrap(`<svg viewBox='0 0 500 110' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='250' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Přenos elektrické energie</text>
  <rect x='10' y='35' width='80' height='45' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='50' y='55' text-anchor='middle' fill='#991b1b' font-size='9'>Elektrárna</text><text x='50' y='68' text-anchor='middle' fill='#991b1b' font-size='8'>10 kV</text>
  <line x1='90' y1='57' x2='120' y2='57' stroke='#374151' stroke-width='2' marker-end='url(#sp1)'/>
  <rect x='120' y='35' width='70' height='45' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='155' y='55' text-anchor='middle' fill='#92400e' font-size='8'>Transf. ↑</text><text x='155' y='68' text-anchor='middle' fill='#92400e' font-size='8'>→ 400 kV</text>
  <line x1='190' y1='57' x2='230' y2='57' stroke='#374151' stroke-width='2' marker-end='url(#sp1)'/>
  <rect x='230' y='30' width='80' height='55' rx='5' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/><text x='270' y='50' text-anchor='middle' fill='#1e40af' font-size='9'>Vedení VN</text><text x='270' y='63' text-anchor='middle' fill='#1e40af' font-size='8'>110–400 kV</text><text x='270' y='76' text-anchor='middle' fill='#22c55e' font-size='7'>malé ztráty</text>
  <line x1='310' y1='57' x2='340' y2='57' stroke='#374151' stroke-width='2' marker-end='url(#sp1)'/>
  <rect x='340' y='35' width='70' height='45' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='375' y='55' text-anchor='middle' fill='#92400e' font-size='8'>Transf. ↓</text><text x='375' y='68' text-anchor='middle' fill='#92400e' font-size='8'>→ 230 V</text>
  <line x1='410' y1='57' x2='440' y2='57' stroke='#374151' stroke-width='2' marker-end='url(#sp1)'/>
  <rect x='440' y='35' width='50' height='45' rx='5' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/><text x='465' y='55' text-anchor='middle' fill='#166534' font-size='8'>🏠</text><text x='465' y='68' text-anchor='middle' fill='#166534' font-size='8'>230 V</text>
  <text x='250' y='105' text-anchor='middle' fill='#6b7280' font-size='9'>Vyšší napětí → menší proud → menší ztráty</text>
  <defs><marker id='sp1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#374151'/></marker></defs>
</svg>`),

'elektrina--pojistky-a-jistice': wrap(`<svg viewBox='0 0 440 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='220' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Ochrana obvodu</text>
  <rect x='20' y='35' width='180' height='75' rx='8' fill='#fef2f2' stroke='#ef4444' stroke-width='1.5'/>
  <text x='110' y='55' text-anchor='middle' font-weight='bold' fill='#991b1b' font-size='11'>Pojistka</text>
  <line x1='50' y1='78' x2='80' y2='78' stroke='#374151' stroke-width='2'/><path d='M80,78 Q95,68 110,78 Q125,88 140,78' fill='none' stroke='#f59e0b' stroke-width='2'/><line x1='140' y1='78' x2='170' y2='78' stroke='#374151' stroke-width='2'/>
  <text x='110' y='100' text-anchor='middle' fill='#6b7280' font-size='9'>tavný drát — jednorázová</text>
  <rect x='240' y='35' width='180' height='75' rx='8' fill='#f0fdf4' stroke='#22c55e' stroke-width='1.5'/>
  <text x='330' y='55' text-anchor='middle' font-weight='bold' fill='#166534' font-size='11'>Jistič</text>
  <rect x='290' y='65' width='40' height='25' rx='5' fill='#d1d5db' stroke='#374151' stroke-width='1.5'/>
  <rect x='340' y='65' width='30' height='15' rx='3' fill='#22c55e'/><text x='355' y='76' text-anchor='middle' fill='white' font-size='8'>ON</text>
  <text x='330' y='100' text-anchor='middle' fill='#6b7280' font-size='9'>automatický — znovu zapnout</text>
</svg>`),

'elektrina--polovodice': wrap(`<svg viewBox='0 0 420 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>PN přechod — dioda</text>
  <rect x='80' y='40' width='120' height='60' rx='5' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/><text x='140' y='65' text-anchor='middle' fill='#1e40af' font-size='13' font-weight='bold'>P</text><text x='140' y='85' text-anchor='middle' fill='#1e40af' font-size='10'>díry (+)</text>
  <rect x='200' y='40' width='120' height='60' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='2'/><text x='260' y='65' text-anchor='middle' fill='#991b1b' font-size='13' font-weight='bold'>N</text><text x='260' y='85' text-anchor='middle' fill='#991b1b' font-size='10'>elektrony (−)</text>
  <line x1='200' y1='40' x2='200' y2='100' stroke='#374151' stroke-width='2.5'/>
  <text x='200' y='35' text-anchor='middle' fill='#374151' font-size='9'>PN přechod</text>
  <line x1='60' y1='70' x2='80' y2='70' stroke='#374151' stroke-width='2'/><line x1='320' y1='70' x2='340' y2='70' stroke='#374151' stroke-width='2'/>
  <text x='50' y='74' fill='#ef4444' font-size='12' font-weight='bold'>+</text><text x='348' y='74' fill='#3b82f6' font-size='12' font-weight='bold'>−</text>
  <line x1='140' y1='110' x2='260' y2='110' stroke='#22c55e' stroke-width='2.5' marker-end='url(#pn1)'/><text x='200' y='130' text-anchor='middle' fill='#22c55e' font-size='10'>proud prochází ✓</text>
  <defs><marker id='pn1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker></defs>
</svg>`),

// ============ MIKROSVĚT — remaining ============

'mikrosvet--skaly-v-mikrosvete': wrap(`<svg viewBox='0 0 500 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='250' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Od jádra po buňku</text>
  <line x1='30' y1='60' x2='470' y2='60' stroke='#d1d5db' stroke-width='2'/>
  ${[
    {x:50,r:5,c:'#ef4444',t:'jádro',s:'fm'},
    {x:130,r:8,c:'#f59e0b',t:'atom',s:'Å'},
    {x:210,r:11,c:'#22c55e',t:'molekula',s:'nm'},
    {x:300,r:14,c:'#3b82f6',t:'virus',s:'100 nm'},
    {x:400,r:20,c:'#8b5cf6',t:'buňka',s:'μm'}
  ].map(p=>`
    <circle cx='${p.x}' cy='60' r='${p.r}' fill='${p.c}' opacity='0.7'/>
    <text x='${p.x}' y='40' text-anchor='middle' fill='${p.c}' font-size='10' font-weight='bold'>${p.t}</text>
    <text x='${p.x}' y='95' text-anchor='middle' fill='#6b7280' font-size='9'>${p.s}</text>
  `).join('')}
  <text x='50' y='110' fill='#6b7280' font-size='9'>← menší</text>
  <text x='400' y='110' fill='#6b7280' font-size='9' text-anchor='end'>větší →</text>
</svg>`),

'mikrosvet--atom-a-jeho-modely': wrap(`<svg viewBox='0 0 480 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='240' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Vývoj modelů atomu</text>
  <circle cx='70' cy='70' r='30' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  ${[{x:55,y:55},{x:80,y:60},{x:65,y:80},{x:85,y:78},{x:72,y:65}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='4' fill='#3b82f6'/>`).join('')}
  <text x='70' y='110' text-anchor='middle' fill='#374151' font-size='9'>Thomson</text>
  <text x='70' y='122' text-anchor='middle' fill='#6b7280' font-size='8'>(1904)</text>
  <text x='130' y='70' fill='#9ca3af' font-size='16'>→</text>
  <circle cx='190' cy='70' r='30' fill='none' stroke='#d1d5db' stroke-width='1' stroke-dasharray='3'/>
  <circle cx='190' cy='70' r='18' fill='none' stroke='#d1d5db' stroke-width='1' stroke-dasharray='3'/>
  <circle cx='190' cy='70' r='6' fill='#ef4444'/><circle cx='190' cy='52' r='4' fill='#3b82f6'/><circle cx='208' cy='70' r='4' fill='#3b82f6'/><circle cx='178' cy='85' r='4' fill='#3b82f6'/>
  <text x='190' y='110' text-anchor='middle' fill='#374151' font-size='9'>Rutherford</text>
  <text x='190' y='122' text-anchor='middle' fill='#6b7280' font-size='8'>(1911)</text>
  <text x='245' y='70' fill='#9ca3af' font-size='16'>→</text>
  <circle cx='310' cy='70' r='30' fill='none' stroke='#d1d5db' stroke-width='1.5'/>
  <circle cx='310' cy='70' r='20' fill='none' stroke='#93c5fd' stroke-width='1.5'/>
  <circle cx='310' cy='70' r='6' fill='#ef4444'/><circle cx='310' cy='40' r='4' fill='#3b82f6'/><circle cx='330' cy='70' r='4' fill='#3b82f6'/>
  <text x='310' y='110' text-anchor='middle' fill='#374151' font-size='9'>Bohr</text>
  <text x='310' y='122' text-anchor='middle' fill='#6b7280' font-size='8'>(1913)</text>
  <text x='365' y='70' fill='#9ca3af' font-size='16'>→</text>
  <circle cx='430' cy='70' r='30' fill='#3b82f6' opacity='0.1'/>
  <circle cx='430' cy='70' r='22' fill='#3b82f6' opacity='0.1'/>
  <circle cx='430' cy='70' r='14' fill='#3b82f6' opacity='0.15'/>
  <circle cx='430' cy='70' r='6' fill='#ef4444'/>
  <text x='430' y='110' text-anchor='middle' fill='#374151' font-size='9'>Současný</text>
  <text x='430' y='122' text-anchor='middle' fill='#6b7280' font-size='8'>(orbital)</text>
</svg>`),

// ============ ASTRONOMIE — remaining ============

'astronomie--vesmir': wrap(`<svg viewBox='0 0 480 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='240' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Struktura vesmíru — škály</text>
  ${[
    {x:50,r:12,c:'#f59e0b',t:'Sluneční',t2:'soustava',s:'~100 AU'},
    {x:160,r:20,c:'#3b82f6',t:'Mléčná',t2:'dráha',s:'100 000 ly'},
    {x:290,r:28,c:'#8b5cf6',t:'Kupa',t2:'galaxií',s:'~10 mil. ly'},
    {x:420,r:35,c:'#374151',t:'Pozorovatelný',t2:'vesmír',s:'93 mld. ly'}
  ].map(p=>`
    <circle cx='${p.x}' cy='65' r='${p.r}' fill='${p.c}' opacity='0.15' stroke='${p.c}' stroke-width='1.5'/>
    <text x='${p.x}' y='${65-p.r-4}' text-anchor='middle' fill='${p.c}' font-size='9' font-weight='bold'>${p.t}</text>
    <text x='${p.x}' y='${65-p.r+6}' text-anchor='middle' fill='${p.c}' font-size='8'>${p.t2}</text>
    <text x='${p.x}' y='${65+p.r+14}' text-anchor='middle' fill='#6b7280' font-size='8'>${p.s}</text>
  `).join('')}
</svg>`),

'astronomie--nocni-obloha': wrap(`<svg viewBox='0 0 420 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='0' y='0' width='420' height='180' rx='10' fill='#1e293b'/>
  <text x='210' y='22' text-anchor='middle' font-weight='bold' fill='#fef3c7' font-size='13'>Velký vůz → Polárka</text>
  ${[{x:80,y:50},{x:100,y:55},{x:120,y:70},{x:140,y:72},{x:175,y:68},{x:195,y:50},{x:220,y:55}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='3' fill='#fef3c7'/>`).join('')}
  <polyline points='80,50 100,55 120,70 140,72 175,68 195,50 220,55' fill='none' stroke='#fef3c7' stroke-width='1' opacity='0.6'/>
  <text x='150' y='95' text-anchor='middle' fill='#93c5fd' font-size='10'>Velký vůz</text>
  <line x1='195' y1='50' x2='330' y2='40' stroke='#f59e0b' stroke-width='1.5' stroke-dasharray='4' marker-end='url(#no1)'/>
  <line x1='220' y1='55' x2='330' y2='40' stroke='#f59e0b' stroke-width='1.5' stroke-dasharray='4'/>
  <circle cx='330' cy='40' r='5' fill='#f59e0b'/><text x='330' y='30' text-anchor='middle' fill='#f59e0b' font-size='11' font-weight='bold'>Polárka</text>
  <text x='355' y='55' fill='#93c5fd' font-size='9'>SEVER</text>
  ${[{x:310,y:120},{x:330,y:110},{x:345,y:130},{x:360,y:105},{x:370,y:135}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='2.5' fill='#fef3c7'/>`).join('')}
  <text x='340' y='155' text-anchor='middle' fill='#93c5fd' font-size='9'>Kasiopeja (W)</text>
  <polyline points='310,120 330,110 345,130 360,105 370,135' fill='none' stroke='#fef3c7' stroke-width='1' opacity='0.5'/>
  <defs><marker id='no1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker></defs>
</svg>`),

'astronomie--dalsi-vesmirna-telesa': wrap(`<svg viewBox='0 0 460 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='10' y='10' width='130' height='90' rx='8' fill='#f3f4f6' stroke='#9ca3af' stroke-width='1.5'/>
  <text x='75' y='32' text-anchor='middle' font-weight='bold' fill='#374151' font-size='11'>Asteroid</text>
  <circle cx='55' cy='60' r='10' fill='#9ca3af' opacity='0.7'/><circle cx='85' cy='65' r='7' fill='#9ca3af' opacity='0.6'/><circle cx='75' cy='50' r='5' fill='#9ca3af' opacity='0.5'/>
  <text x='75' y='92' text-anchor='middle' fill='#6b7280' font-size='8'>skalnatá tělesa</text>
  <rect x='160' y='10' width='140' height='90' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='230' y='32' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='11'>Kometa</text>
  <circle cx='200' cy='60' r='8' fill='#93c5fd'/><path d='M208,58 Q260,40 290,50' fill='none' stroke='#93c5fd' stroke-width='2' opacity='0.6'/><path d='M208,62 Q260,55 285,60' fill='none' stroke='#bfdbfe' stroke-width='3' opacity='0.4'/>
  <text x='230' y='92' text-anchor='middle' fill='#6b7280' font-size='8'>led + prach → ohon</text>
  <rect x='320' y='10' width='130' height='90' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='385' y='32' text-anchor='middle' font-weight='bold' fill='#92400e' font-size='11'>Meteor</text>
  <circle cx='345' cy='45' r='4' fill='#f59e0b'/><line x1='349' y1='45' x2='410' y2='75' stroke='#f59e0b' stroke-width='2' opacity='0.5'/><line x1='349' y1='45' x2='400' y2='72' stroke='#fef3c7' stroke-width='4' opacity='0.3'/>
  <text x='385' y='92' text-anchor='middle' fill='#6b7280' font-size='8'>„padající hvězda"</text>
</svg>`),

};

// -------------------------------------------------------
// MAIN
// -------------------------------------------------------
let updated = 0;
let errors = 0;

for (const [fileKey, svgHtml] of Object.entries(diagrams)) {
  const filePath = join(SUBTOPICS_DIR, `${fileKey}.json`);

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (!data.notebookEntry || !data.notebookEntry.content) {
      console.log(`⚠️  ${fileKey}: no notebookEntry, skipping`);
      continue;
    }

    let content = data.notebookEntry.content;

    // Remove any previously inserted diagram (idempotent)
    content = content.replace(/<div style="text-align:center;margin:1\.5rem auto;max-width:520px;">.*?<\/svg><\/div>/gs, '');

    // Insert SVG before the first <h3> tag
    const h3Index = content.indexOf('<h3>');
    if (h3Index !== -1) {
      content = content.slice(0, h3Index) + svgHtml + content.slice(h3Index);
    } else {
      content = content + svgHtml;
    }

    data.notebookEntry.content = content;
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    updated++;
    console.log(`✅ ${fileKey}`);
  } catch (err: any) {
    console.error(`❌ ${fileKey}: ${err.message}`);
    errors++;
  }
}

console.log(`\nDone! Updated: ${updated}, Errors: ${errors}`);
console.log(`Total diagrams in this batch: ${Object.keys(diagrams).length}`);
