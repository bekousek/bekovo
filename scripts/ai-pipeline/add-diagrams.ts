import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SUBTOPICS_DIR = join(__dirname, '../../src/content/subtopics');

const wrap = (svg: string) => `<div style="text-align:center;margin:1.5rem auto;max-width:520px;">` + svg + `</div>`;

const diagrams: Record<string, string> = {

// ============ VLASTNOSTI LÁTEK ============

'vlastnosti-latek--latky-a-telesa': wrap(`<svg viewBox='0 0 500 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='10' y='10' width='220' height='160' rx='12' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <text x='120' y='38' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='16'>LÁTKA</text>
  <text x='120' y='60' text-anchor='middle' fill='#374151' font-size='13'>= z čeho to je</text>
  <rect x='40' y='75' width='160' height='28' rx='6' fill='#dbeafe'/>
  <text x='120' y='94' text-anchor='middle' fill='#1e40af' font-size='13'>dřevo, železo, sklo</text>
  <rect x='40' y='112' width='160' height='28' rx='6' fill='#dbeafe'/>
  <text x='120' y='131' text-anchor='middle' fill='#1e40af' font-size='13'>voda, vzduch, zlato</text>
  <rect x='270' y='10' width='220' height='160' rx='12' fill='#f0fdf4' stroke='#22c55e' stroke-width='2'/>
  <text x='380' y='38' text-anchor='middle' font-weight='bold' fill='#166534' font-size='16'>TĚLESO</text>
  <text x='380' y='60' text-anchor='middle' fill='#374151' font-size='13'>= konkrétní předmět</text>
  <rect x='300' y='75' width='160' height='28' rx='6' fill='#dcfce7'/>
  <text x='380' y='94' text-anchor='middle' fill='#166534' font-size='13'>stůl, hřebík, láhev</text>
  <rect x='300' y='112' width='160' height='28' rx='6' fill='#dcfce7'/>
  <text x='380' y='131' text-anchor='middle' fill='#166534' font-size='13'>míč, klíč, mince</text>
</svg>`),

'vlastnosti-latek--pevne-latky': wrap(`<svg viewBox='0 0 500 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='125' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>Krystalická</text>
  <g transform='translate(50,30)'>
    ${Array.from({length:4},(_,r)=>Array.from({length:5},(_,c)=>`<circle cx='${c*35}' cy='${r*30}' r='8' fill='#3b82f6' opacity='0.8'/>`).join('')).join('')}
    ${Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>`<line x1='${c*35}' y1='${r*30}' x2='${(c+1)*35}' y2='${r*30}' stroke='#93c5fd' stroke-width='1.5'/>`).join('')).join('')}
    ${Array.from({length:3},(_,r)=>Array.from({length:5},(_,c)=>`<line x1='${c*35}' y1='${r*30}' x2='${c*35}' y2='${(r+1)*30}' stroke='#93c5fd' stroke-width='1.5'/>`).join('')).join('')}
  </g>
  <text x='125' y='155' text-anchor='middle' fill='#6b7280' font-size='12'>pravidelné uspořádání</text>
  <text x='375' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>Amorfní</text>
  <g transform='translate(300,35)'>
    <circle cx='15' cy='10' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='55' cy='5' r='8' fill='#3b82f6' opacity='0.8'/>
    <circle cx='95' cy='15' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='135' cy='8' r='8' fill='#3b82f6' opacity='0.8'/>
    <circle cx='30' cy='45' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='70' cy='40' r='8' fill='#3b82f6' opacity='0.8'/>
    <circle cx='110' cy='50' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='145' cy='42' r='8' fill='#3b82f6' opacity='0.8'/>
    <circle cx='10' cy='80' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='50' cy='75' r='8' fill='#3b82f6' opacity='0.8'/>
    <circle cx='90' cy='85' r='8' fill='#3b82f6' opacity='0.8'/><circle cx='130' cy='78' r='8' fill='#3b82f6' opacity='0.8'/>
  </g>
  <text x='375' y='155' text-anchor='middle' fill='#6b7280' font-size='12'>nepravidelné uspořádání</text>
</svg>`),

'vlastnosti-latek--kapaliny': wrap(`<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <path d='M80,40 L80,180 Q80,190 90,190 L210,190 Q220,190 220,180 L220,40' fill='none' stroke='#374151' stroke-width='3'/>
  <path d='M82,100 Q150,92 218,100 L218,188 Q218,188 210,188 L90,188 Q82,188 82,188 Z' fill='#93c5fd' opacity='0.5'/>
  <path d='M82,100 Q150,92 218,100' fill='none' stroke='#3b82f6' stroke-width='2'/>
  <line x1='230' y1='100' x2='280' y2='100' stroke='#ef4444' stroke-width='1.5' stroke-dasharray='4'/>
  <text x='290' y='104' fill='#ef4444' font-size='12'>hladina</text>
  <text x='150' y='155' text-anchor='middle' fill='#1e40af' font-size='13'>kapalina</text>
  <text x='150' y='25' text-anchor='middle' fill='#374151' font-size='13' font-weight='bold'>Přizpůsobí se tvaru nádoby</text>
  <path d='M290,60 Q310,55 330,60 Q350,55 370,60 L370,190 L290,190 Z' fill='#93c5fd' opacity='0.3' stroke='#3b82f6'/>
  <path d='M290,60 Q310,55 330,60 Q350,55 370,60' fill='none' stroke='#3b82f6' stroke-width='2'/>
  <text x='330' y='140' text-anchor='middle' fill='#1e40af' font-size='11'>stejný</text>
  <text x='330' y='155' text-anchor='middle' fill='#1e40af' font-size='11'>objem</text>
</svg>`),

'vlastnosti-latek--plyny': wrap(`<svg viewBox='0 0 400 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='60' y='20' width='160' height='140' rx='10' fill='#eff6ff' stroke='#374151' stroke-width='2'/>
  <text x='140' y='15' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Plyn v nádobě</text>
  ${[{x:90,y:50,dx:12,dy:-8},{x:150,y:40,dx:-10,dy:10},{x:180,y:80,dx:-8,dy:12},{x:100,y:100,dx:15,dy:5},{x:160,y:120,dx:-5,dy:-15},{x:120,y:70,dx:10,dy:10},{x:180,y:140,dx:-12,dy:-5},{x:90,y:140,dx:8,dy:-10}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='6' fill='#3b82f6'/><line x1='${p.x}' y1='${p.y}' x2='${p.x+p.dx}' y2='${p.y+p.dy}' stroke='#ef4444' stroke-width='2' marker-end='url(#arr)'/>`).join('')}
  <defs><marker id='arr' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker></defs>
  <text x='330' y='60' text-anchor='middle' fill='#374151' font-size='12'>Částice se pohybují</text>
  <text x='330' y='78' text-anchor='middle' fill='#374151' font-size='12'>rychle a chaoticky</text>
  <text x='330' y='100' text-anchor='middle' fill='#374151' font-size='12'>→ vyplní celý prostor</text>
  <text x='330' y='140' text-anchor='middle' fill='#ef4444' font-size='12'>→ tlak na stěny</text>
</svg>`),

'vlastnosti-latek--skupenske-prechody': wrap(`<svg viewBox='0 0 520 200' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='20' y='70' width='120' height='60' rx='10' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/>
  <text x='80' y='105' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>PEVNÁ</text>
  <rect x='200' y='70' width='120' height='60' rx='10' fill='#bfdbfe' stroke='#3b82f6' stroke-width='2'/>
  <text x='260' y='105' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>KAPALNÁ</text>
  <rect x='380' y='70' width='120' height='60' rx='10' fill='#93c5fd' stroke='#3b82f6' stroke-width='2'/>
  <text x='440' y='105' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>PLYNNÁ</text>
  <line x1='140' y1='88' x2='198' y2='88' stroke='#22c55e' stroke-width='2' marker-end='url(#ga)'/><text x='170' y='82' text-anchor='middle' fill='#22c55e' font-size='11'>tání</text>
  <line x1='198' y1='112' x2='140' y2='112' stroke='#ef4444' stroke-width='2' marker-end='url(#ra)'/><text x='170' y='128' text-anchor='middle' fill='#ef4444' font-size='11'>tuhnutí</text>
  <line x1='320' y1='88' x2='378' y2='88' stroke='#22c55e' stroke-width='2' marker-end='url(#ga)'/><text x='350' y='82' text-anchor='middle' fill='#22c55e' font-size='11'>var/vypař.</text>
  <line x1='378' y1='112' x2='320' y2='112' stroke='#ef4444' stroke-width='2' marker-end='url(#ra)'/><text x='350' y='128' text-anchor='middle' fill='#ef4444' font-size='11'>kapalnění</text>
  <path d='M80,70 Q80,20 260,20 Q440,20 440,70' fill='none' stroke='#f59e0b' stroke-width='2' marker-end='url(#ya)'/><text x='260' y='15' text-anchor='middle' fill='#f59e0b' font-size='11'>sublimace →</text>
  <path d='M440,130 Q440,180 260,180 Q80,180 80,130' fill='none' stroke='#8b5cf6' stroke-width='2' marker-end='url(#pa)'/><text x='260' y='195' text-anchor='middle' fill='#8b5cf6' font-size='11'>← desublimace</text>
  <defs>
    <marker id='ga' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='ra' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
    <marker id='ya' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker>
    <marker id='pa' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#8b5cf6'/></marker>
  </defs>
</svg>`),

// ============ ČÁSTICE LÁTKY ============

'castice-latky--atom': wrap(`<svg viewBox='0 0 400 220' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>Stavba atomu</text>
  <circle cx='200' cy='120' r='90' fill='none' stroke='#93c5fd' stroke-width='1.5' stroke-dasharray='5'/>
  <circle cx='200' cy='120' r='55' fill='none' stroke='#bfdbfe' stroke-width='1.5' stroke-dasharray='5'/>
  <circle cx='200' cy='120' r='25' fill='#fecaca' stroke='#ef4444' stroke-width='2'/>
  <circle cx='195' cy='115' r='7' fill='#ef4444'/><text x='195' y='119' text-anchor='middle' fill='white' font-size='8' font-weight='bold'>p⁺</text>
  <circle cx='210' cy='115' r='7' fill='#9ca3af'/><text x='210' y='119' text-anchor='middle' fill='white' font-size='8' font-weight='bold'>n</text>
  <circle cx='200' cy='130' r='7' fill='#ef4444'/><text x='200' y='134' text-anchor='middle' fill='white' font-size='8' font-weight='bold'>p⁺</text>
  <circle cx='200' cy='65' r='8' fill='#3b82f6'/><text x='200' y='69' text-anchor='middle' fill='white' font-size='9' font-weight='bold'>e⁻</text>
  <circle cx='255' cy='120' r='8' fill='#3b82f6'/><text x='255' y='124' text-anchor='middle' fill='white' font-size='9' font-weight='bold'>e⁻</text>
  <circle cx='130' cy='165' r='8' fill='#3b82f6'/><text x='130' y='169' text-anchor='middle' fill='white' font-size='9' font-weight='bold'>e⁻</text>
  <line x1='240' y1='125' x2='310' y2='135' stroke='#374151' stroke-width='1'/><text x='330' y='140' fill='#374151' font-size='11'>obal (elektrony)</text>
  <line x1='215' y1='130' x2='310' y2='170' stroke='#374151' stroke-width='1'/><text x='330' y='175' fill='#ef4444' font-size='11'>jádro (p⁺, n)</text>
</svg>`),

'castice-latky--skaly-castic': wrap(`<svg viewBox='0 0 500 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <line x1='30' y1='60' x2='470' y2='60' stroke='#d1d5db' stroke-width='2'/>
  ${[{x:50,l:'10⁻¹⁵ m',t:'jádro',c:'#ef4444'},{x:140,l:'10⁻¹⁰ m',t:'atom',c:'#f59e0b'},{x:230,l:'10⁻⁹ m',t:'molekula',c:'#22c55e'},{x:320,l:'10⁻⁶ m',t:'buňka',c:'#3b82f6'},{x:410,l:'10⁻³ m',t:'zrnko',c:'#8b5cf6'}].map(p=>`<circle cx='${p.x}' cy='60' r='6' fill='${p.c}'/><text x='${p.x}' y='40' text-anchor='middle' fill='${p.c}' font-size='11' font-weight='bold'>${p.t}</text><text x='${p.x}' y='85' text-anchor='middle' fill='#6b7280' font-size='10'>${p.l}</text>`).join('')}
  <text x='50' y='110' fill='#6b7280' font-size='11'>← menší</text>
  <text x='410' y='110' fill='#6b7280' font-size='11' text-anchor='end'>větší →</text>
</svg>`),

'castice-latky--casticove-slozeni-latek': wrap(`<svg viewBox='0 0 520 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='10' y='30' width='150' height='100' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='85' y='25' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Pevná látka</text>
  ${Array.from({length:3},(_,r)=>Array.from({length:5},(_,c)=>`<circle cx='${30+c*28}' cy='${55+r*28}' r='9' fill='#3b82f6' opacity='0.7'/>`).join('')).join('')}
  <rect x='185' y='30' width='150' height='100' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='260' y='25' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Kapalina</text>
  ${[{x:210,y:55},{x:240,y:48},{x:275,y:58},{x:305,y:50},{x:215,y:82},{x:250,y:78},{x:285,y:85},{x:310,y:75},{x:225,y:108},{x:260,y:105},{x:295,y:110},{x:320,y:102}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='9' fill='#3b82f6' opacity='0.6'/>`).join('')}
  <rect x='360' y='30' width='150' height='100' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='435' y='25' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Plyn</text>
  ${[{x:385,y:50},{x:430,y:70},{x:475,y:45},{x:400,y:100},{x:460,y:110},{x:490,y:80}].map(p=>`<circle cx='${p.x}' cy='${p.y}' r='9' fill='#3b82f6' opacity='0.5'/>`).join('')}
</svg>`),

'castice-latky--brownuv-pohyb-difuze': wrap(`<svg viewBox='0 0 460 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='115' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Brownův pohyb</text>
  <rect x='10' y='25' width='210' height='145' rx='10' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <path d='M60,140 L75,120 L65,100 L80,85 L70,65 L90,55 L85,40 L105,50 L120,35 L130,55 L150,45 L155,70 L140,85 L160,100 L145,120 L165,135' fill='none' stroke='#ef4444' stroke-width='2'/>
  <circle cx='60' cy='140' r='6' fill='#f59e0b'/><circle cx='165' cy='135' r='6' fill='#f59e0b'/>
  <text x='115' y='165' text-anchor='middle' fill='#6b7280' font-size='11'>dráha pylu ve vodě</text>
  <text x='345' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Difuze</text>
  <rect x='240' y='25' width='210' height='60' rx='8' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/>
  <text x='345' y='60' text-anchor='middle' fill='#991b1b' font-size='11'>inkoust + voda — začátek</text>
  <rect x='240' y='105' width='210' height='60' rx='8' fill='#fde8e8' stroke='#ef4444' stroke-width='1.5'/>
  <text x='345' y='140' text-anchor='middle' fill='#991b1b' font-size='11'>po čase — rovnoměrně</text>
  <text x='345' y='90' text-anchor='middle' fill='#6b7280' font-size='20'>↓</text>
</svg>`),

// ============ MAGNETISMUS ============

'magnetismus--magnety': wrap(`<svg viewBox='0 0 460 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='130' y='65' width='100' height='50' rx='5' fill='#ef4444'/><text x='180' y='95' text-anchor='middle' fill='white' font-weight='bold' font-size='16'>N</text>
  <rect x='230' y='65' width='100' height='50' rx='5' fill='#3b82f6'/><text x='280' y='95' text-anchor='middle' fill='white' font-weight='bold' font-size='16'>S</text>
  ${[[-40,0],[-35,-25],[-25,-45],[-10,-55],[10,-55],[25,-45],[35,-25],[40,0],[40,0],[35,25],[25,45],[10,55],[-10,55],[-25,45],[-35,25],[-40,0]].reduce((acc,p,i,a)=>{if(i===0)return'';const prev=a[i-1];if(i===8)return acc;return acc+`<path d='M${130+prev[0]},${90+prev[1]} Q${130+(prev[0]+p[0])/2},${90+(prev[1]+p[1])/2} ${130+p[0]},${90+p[1]}' fill='none' stroke='#9ca3af' stroke-width='1' opacity='0.6'/>`},'')}
  <text x='80' y='95' fill='#ef4444' font-size='12' text-anchor='middle'>severní pól</text>
  <text x='380' y='95' fill='#3b82f6' font-size='12' text-anchor='middle'>jižní pól</text>
  <path d='M130,55 Q60,30 60,90 Q60,150 130,125' fill='none' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#mg)'/>
  <path d='M130,60 Q80,40 80,90 Q80,140 130,120' fill='none' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#mg)'/>
  <path d='M330,55 Q400,30 400,90 Q400,150 330,125' fill='none' stroke='#9ca3af' stroke-width='1.5' marker-start='url(#mg)'/>
  <path d='M330,60 Q380,40 380,90 Q380,140 330,120' fill='none' stroke='#9ca3af' stroke-width='1.5' marker-start='url(#mg)'/>
  <text x='230' y='25' text-anchor='middle' fill='#374151' font-size='12'>magnetické indukční čáry</text>
  <defs><marker id='mg' viewBox='0 0 6 6' refX='3' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#9ca3af'/></marker></defs>
</svg>`),

'magnetismus--magneticke-pole-zeme': wrap(`<svg viewBox='0 0 400 260' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <circle cx='200' cy='140' r='80' fill='#bfdbfe' stroke='#3b82f6' stroke-width='2'/>
  <text x='200' y='145' text-anchor='middle' fill='#1e40af' font-size='14' font-weight='bold'>Země</text>
  <ellipse cx='200' cy='140' rx='120' ry='50' fill='none' stroke='#9ca3af' stroke-width='1' stroke-dasharray='4' transform='rotate(12,200,140)'/>
  <ellipse cx='200' cy='140' rx='130' ry='70' fill='none' stroke='#9ca3af' stroke-width='1' stroke-dasharray='4' transform='rotate(12,200,140)'/>
  <circle cx='200' cy='55' r='8' fill='#3b82f6'/><text x='200' y='59' text-anchor='middle' fill='white' font-size='9' font-weight='bold'>S</text>
  <text x='200' y='40' text-anchor='middle' fill='#374151' font-size='11'>zeměpisný sever</text>
  <text x='200' y='30' text-anchor='middle' fill='#3b82f6' font-size='10'>(magnet. jih)</text>
  <circle cx='200' cy='225' r='8' fill='#ef4444'/><text x='200' y='229' text-anchor='middle' fill='white' font-size='9' font-weight='bold'>N</text>
  <text x='200' y='250' text-anchor='middle' fill='#374151' font-size='11'>zeměpisný jih</text>
  <rect x='320' y='100' width='55' height='20' rx='3' fill='#f3f4f6' stroke='#374151' stroke-width='1'/>
  <polygon points='345,102 345,118 360,110' fill='#ef4444'/><text x='338' y='113' fill='#3b82f6' font-size='8'>N</text>
  <text x='347' y='90' fill='#374151' font-size='10'>kompas</text>
</svg>`),

// ============ ELEKTROSTATIKA ============

'elektrostatika--elektricky-naboj': wrap(`<svg viewBox='0 0 460 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='115' y='20' text-anchor='middle' font-weight='bold' fill='#22c55e' font-size='13'>Přitahují se</text>
  <circle cx='70' cy='70' r='30' fill='#fecaca' stroke='#ef4444' stroke-width='2'/><text x='70' y='76' text-anchor='middle' fill='#ef4444' font-size='22' font-weight='bold'>+</text>
  <circle cx='160' cy='70' r='30' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/><text x='160' y='76' text-anchor='middle' fill='#3b82f6' font-size='22' font-weight='bold'>−</text>
  <line x1='100' y1='70' x2='130' y2='70' stroke='#22c55e' stroke-width='3'/>
  <polygon points='118,64 130,70 118,76' fill='#22c55e'/><polygon points='112,64 100,70 112,76' fill='#22c55e'/>
  <text x='345' y='20' text-anchor='middle' font-weight='bold' fill='#ef4444' font-size='13'>Odpuzují se</text>
  <circle cx='300' cy='70' r='30' fill='#fecaca' stroke='#ef4444' stroke-width='2'/><text x='300' y='76' text-anchor='middle' fill='#ef4444' font-size='22' font-weight='bold'>+</text>
  <circle cx='390' cy='70' r='30' fill='#fecaca' stroke='#ef4444' stroke-width='2'/><text x='390' y='76' text-anchor='middle' fill='#ef4444' font-size='22' font-weight='bold'>+</text>
  <line x1='330' y1='70' x2='340' y2='70' stroke='#ef4444' stroke-width='3' marker-start='url(#re)'/><line x1='350' y1='70' x2='360' y2='70' stroke='#ef4444' stroke-width='3' marker-end='url(#re2)'/>
  <text x='230' y='140' text-anchor='middle' fill='#6b7280' font-size='12'>Souhlasné náboje se odpuzují, nesouhlasné se přitahují</text>
  <defs>
    <marker id='re' viewBox='0 0 6 6' refX='0' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M6,0 L0,3 L6,6Z' fill='#ef4444'/></marker>
    <marker id='re2' viewBox='0 0 6 6' refX='6' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

'elektrostatika--ionty': wrap(`<svg viewBox='0 0 460 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='115' y='20' text-anchor='middle' font-weight='bold' fill='#ef4444' font-size='13'>Kation (+)</text>
  <circle cx='115' cy='75' r='35' fill='#fef2f2' stroke='#ef4444' stroke-width='2'/>
  <text x='115' y='72' text-anchor='middle' fill='#ef4444' font-size='14'>Na</text>
  <text x='135' y='62' fill='#ef4444' font-size='14' font-weight='bold'>+</text>
  <text x='115' y='130' text-anchor='middle' fill='#6b7280' font-size='11'>ztratil e⁻</text>
  <path d='M150,60 Q180,30 200,50' fill='none' stroke='#9ca3af' stroke-width='1.5'/>
  <circle cx='200' cy='50' r='6' fill='#3b82f6'/><text x='200' y='54' text-anchor='middle' fill='white' font-size='8'>e⁻</text>
  <text x='345' y='20' text-anchor='middle' font-weight='bold' fill='#3b82f6' font-size='13'>Anion (−)</text>
  <circle cx='345' cy='75' r='35' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <text x='345' y='72' text-anchor='middle' fill='#3b82f6' font-size='14'>Cl</text>
  <text x='370' y='62' fill='#3b82f6' font-size='14' font-weight='bold'>−</text>
  <text x='345' y='130' text-anchor='middle' fill='#6b7280' font-size='11'>získal e⁻</text>
  <path d='M300,50 Q320,30 340,45' fill='none' stroke='#9ca3af' stroke-width='1.5' marker-end='url(#ia)'/>
  <circle cx='300' cy='50' r='6' fill='#3b82f6'/><text x='300' y='54' text-anchor='middle' fill='white' font-size='8'>e⁻</text>
  <defs><marker id='ia' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#9ca3af'/></marker></defs>
</svg>`),

// ============ MĚŘENÍ ============

'mereni--delka': wrap(`<svg viewBox='0 0 460 100' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='30' y='35' width='400' height='30' rx='3' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  ${Array.from({length:21},(_,i)=>`<line x1='${30+i*20}' y1='${i%5===0?35:i%1===0?42:45}' x2='${30+i*20}' y2='65' stroke='#92400e' stroke-width='${i%5===0?1.5:0.8}'/>${i%5===0?`<text x='${30+i*20}' y='80' text-anchor='middle' fill='#374151' font-size='10'>${i}</text>`:''}`).join('')}
  <text x='460' y='55' fill='#374151' font-size='11'>cm</text>
  <line x1='70' y1='22' x2='270' y2='22' stroke='#ef4444' stroke-width='2'/>
  <polygon points='70,18 70,26 62,22' fill='#ef4444'/><polygon points='270,18 270,26 278,22' fill='#ef4444'/>
  <text x='170' y='17' text-anchor='middle' fill='#ef4444' font-size='12' font-weight='bold'>l = 10 cm = 0,1 m</text>
</svg>`),

'mereni--objem': wrap(`<svg viewBox='0 0 360 220' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='100' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Odměrný válec</text>
  <path d='M60,30 L60,200 Q60,210 80,210 L120,210 Q140,210 140,200 L140,30' fill='none' stroke='#374151' stroke-width='2'/>
  <rect x='62' y='100' width='76' height='108' fill='#93c5fd' opacity='0.4'/>
  <path d='M62,100 Q100,95 138,100' fill='none' stroke='#3b82f6' stroke-width='2'/>
  ${[{y:50,v:100},{y:75,v:75},{y:100,v:50},{y:125,v:37},{y:150,v:25},{y:175,v:12}].map(p=>`<line x1='55' y1='${p.y}' x2='65' y2='${p.y}' stroke='#374151' stroke-width='1'/><text x='50' y='${p.y+4}' text-anchor='end' fill='#374151' font-size='9'>${p.v}</text>`).join('')}
  <text x='42' y='210' fill='#374151' font-size='9'>0 ml</text>
  <line x1='145' y1='100' x2='200' y2='80' stroke='#ef4444' stroke-width='1' stroke-dasharray='3'/>
  <text x='210' y='78' fill='#ef4444' font-size='11'>odečítáme zde</text>
  <text x='210' y='92' fill='#ef4444' font-size='11'>V = 50 ml</text>
  <text x='280' y='150' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Kvádr</text>
  <path d='M240,165 L310,165 L310,200 L240,200 Z' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <path d='M240,165 L260,150 L330,150 L310,165' fill='#bfdbfe' stroke='#3b82f6' stroke-width='1.5'/>
  <path d='M310,165 L330,150 L330,185 L310,200' fill='#93c5fd' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='275' y='210' text-anchor='middle' fill='#374151' font-size='10'>V = a · b · c</text>
</svg>`),

'mereni--hmotnost': wrap(`<svg viewBox='0 0 400 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Rovnoramenné váhy</text>
  <rect x='185' y='25' width='30' height='10' rx='3' fill='#f59e0b'/>
  <polygon points='200,35 200,80' fill='none' stroke='#374151' stroke-width='3'/>
  <line x1='100' y1='80' x2='300' y2='80' stroke='#374151' stroke-width='3'/>
  <polygon points='200,80 195,90 205,90' fill='#374151'/>
  <rect x='160' y='140' width='80' height='15' rx='3' fill='#9ca3af'/>
  <line x1='100' y1='80' x2='80' y2='115' stroke='#374151' stroke-width='2'/>
  <line x1='300' y1='80' x2='320' y2='115' stroke='#374151' stroke-width='2'/>
  <path d='M50,115 Q80,120 110,115' fill='none' stroke='#374151' stroke-width='2'/>
  <path d='M50,115 L50,125 L110,125 L110,115' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='80' y='140' text-anchor='middle' fill='#1e40af' font-size='11'>těleso</text>
  <path d='M290,115 Q320,120 350,115' fill='none' stroke='#374151' stroke-width='2'/>
  <path d='M290,115 L290,125 L350,125 L350,115' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='320' y='140' text-anchor='middle' fill='#92400e' font-size='11'>závaží</text>
</svg>`),

'mereni--hustota': wrap(`<svg viewBox='0 0 420 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>Trojúhelník veličin</text>
  <polygon points='210,35 130,115 290,115' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <line x1='130' y1='82' x2='290' y2='82' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='210' y='72' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>m</text>
  <text x='170' y='108' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>ρ</text>
  <text x='240' y='108' text-anchor='middle' fill='#6b7280' font-size='18'>×</text>
  <text x='250' y='108' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>V</text>
  <text x='360' y='60' fill='#374151' font-size='12'>ρ = m / V</text>
  <text x='360' y='80' fill='#374151' font-size='12'>m = ρ · V</text>
  <text x='360' y='100' fill='#374151' font-size='12'>V = m / ρ</text>
</svg>`),

'mereni--cas': wrap(`<svg viewBox='0 0 400 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='120' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Kyvadlo</text>
  <line x1='120' y1='25' x2='120' y2='25' stroke='#374151' stroke-width='3'/>
  <rect x='80' y='22' width='80' height='6' fill='#374151'/>
  <line x1='120' y1='28' x2='80' y2='110' stroke='#374151' stroke-width='1.5' stroke-dasharray='4' opacity='0.4'/>
  <line x1='120' y1='28' x2='120' y2='115' stroke='#374151' stroke-width='1.5' stroke-dasharray='4' opacity='0.4'/>
  <line x1='120' y1='28' x2='160' y2='110' stroke='#374151' stroke-width='2'/>
  <circle cx='160' cy='110' r='12' fill='#3b82f6'/>
  <circle cx='80' cy='110' r='12' fill='#3b82f6' opacity='0.3'/>
  <path d='M80,125 Q120,140 160,125' fill='none' stroke='#ef4444' stroke-width='2'/>
  <text x='120' y='155' text-anchor='middle' fill='#ef4444' font-size='12' font-weight='bold'>T = perioda</text>
  <rect x='260' y='30' width='110' height='110' rx='55' fill='#f3f4f6' stroke='#374151' stroke-width='2'/>
  <text x='315' y='95' text-anchor='middle' fill='#1e40af' font-size='28' font-weight='bold'>⏱</text>
  <text x='315' y='120' text-anchor='middle' fill='#374151' font-size='11'>stopky</text>
  <text x='315' y='155' text-anchor='middle' fill='#6b7280' font-size='11'>t [s, min, h]</text>
</svg>`),

'mereni--teplota': wrap(`<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='100' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Teploměr</text>
  <rect x='90' y='25' width='20' height='140' rx='10' fill='#f3f4f6' stroke='#374151' stroke-width='1.5'/>
  <circle cx='100' cy='170' r='14' fill='#ef4444' stroke='#374151' stroke-width='1.5'/>
  <rect x='95' y='80' width='10' height='85' rx='5' fill='#ef4444'/>
  ${[{y:30,t:'100°C — var'},{y:60,t:'50°C'},{y:90,t:'0°C — tání'},{y:120,t:'-20°C'},{y:150,t:'-40°C'}].map(p=>`<line x1='110' y1='${p.y}' x2='120' y2='${p.y}' stroke='#374151' stroke-width='1'/><text x='125' y='${p.y+4}' fill='#374151' font-size='10'>${p.t}</text>`).join('')}
  <line x1='115' y1='80' x2='125' y2='80' stroke='#ef4444' stroke-width='2'/>
  <text x='127' y='84' fill='#ef4444' font-size='10' font-weight='bold'>← 37°C</text>
  <rect x='260' y='40' width='120' height='130' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='320' y='65' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Převod</text>
  <text x='320' y='90' text-anchor='middle' fill='#374151' font-size='12'>T = t + 273</text>
  <text x='320' y='115' text-anchor='middle' fill='#374151' font-size='12'>0 °C = 273 K</text>
  <text x='320' y='140' text-anchor='middle' fill='#374151' font-size='12'>100 °C = 373 K</text>
  <text x='320' y='165' text-anchor='middle' fill='#ef4444' font-size='11'>−273 °C = 0 K</text>
</svg>`),

// ============ ELEKTRICKÉ OBVODY ============

'elektricke-obvody--elektricky-obvod': wrap(`<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Jednoduchý obvod</text>
  <rect x='50' y='40' width='300' height='140' rx='15' fill='none' stroke='#374151' stroke-width='3'/>
  <rect x='160' y='30' width='80' height='20' fill='white'/><line x1='170' y1='40' x2='190' y2='40' stroke='#374151' stroke-width='3'/><line x1='195' y1='33' x2='195' y2='47' stroke='#374151' stroke-width='3'/><line x1='200' y1='36' x2='200' y2='44' stroke='#374151' stroke-width='2'/><line x1='200' y1='40' x2='230' y2='40' stroke='#374151' stroke-width='3'/><text x='200' y='25' text-anchor='middle' fill='#374151' font-size='10'>zdroj</text>
  <rect x='160' y='170' width='80' height='20' fill='white'/><circle cx='200' cy='180' r='12' fill='none' stroke='#374151' stroke-width='2'/><line x1='194' y1='174' x2='206' y2='186' stroke='#374151' stroke-width='1.5'/><line x1='206' y1='174' x2='194' y2='186' stroke='#374151' stroke-width='1.5'/><text x='200' y='205' text-anchor='middle' fill='#374151' font-size='10'>žárovka</text>
  <rect x='30' y='100' width='40' height='20' fill='white'/><line x1='40' y1='110' x2='55' y2='100' stroke='#374151' stroke-width='2.5'/><circle cx='40' cy='110' r='3' fill='#374151'/><text x='50' y='135' text-anchor='middle' fill='#374151' font-size='10'>spínač</text>
  <polygon points='270,60 280,55 280,65' fill='#ef4444'/><text x='295' y='63' fill='#ef4444' font-size='10'>I</text>
</svg>`),

'elektricke-obvody--zkrat': wrap(`<svg viewBox='0 0 440 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='130' y='18' text-anchor='middle' font-weight='bold' fill='#22c55e' font-size='12'>Správně</text>
  <rect x='20' y='30' width='220' height='110' rx='10' fill='none' stroke='#22c55e' stroke-width='2.5'/>
  <rect x='90' y='22' width='80' height='16' fill='white'/><line x1='100' y1='30' x2='120' y2='30' stroke='#374151' stroke-width='2'/><line x1='130' y1='25' x2='130' y2='35' stroke='#374151' stroke-width='2'/><line x1='135' y1='28' x2='135' y2='32' stroke='#374151' stroke-width='1.5'/><line x1='135' y1='30' x2='160' y2='30' stroke='#374151' stroke-width='2'/>
  <rect x='90' y='132' width='80' height='16' fill='white'/><circle cx='130' cy='140' r='8' fill='none' stroke='#374151' stroke-width='1.5'/><line x1='125' y1='135' x2='135' y2='145' stroke='#374151' stroke-width='1'/>
  <text x='340' y='18' text-anchor='middle' font-weight='bold' fill='#ef4444' font-size='12'>Zkrat!</text>
  <rect x='250' y='30' width='180' height='110' rx='10' fill='none' stroke='#ef4444' stroke-width='2.5'/>
  <rect x='310' y='22' width='60' height='16' fill='white'/><line x1='320' y1='30' x2='340' y2='30' stroke='#374151' stroke-width='2'/><line x1='350' y1='25' x2='350' y2='35' stroke='#374151' stroke-width='2'/>
  <line x1='340' y1='80' x2='340' y2='80' stroke='#ef4444' stroke-width='3'/>
  <line x1='300' y1='50' x2='300' y2='120' stroke='#ef4444' stroke-width='3' stroke-dasharray='5'/>
  <text x='340' y='90' text-anchor='middle' fill='#ef4444' font-size='10'>vodič obchází</text>
  <text x='340' y='103' text-anchor='middle' fill='#ef4444' font-size='10'>spotřebič!</text>
  <text x='340' y='155' text-anchor='middle' fill='#ef4444' font-size='11'>→ velký proud → přehřátí</text>
</svg>`),

'elektricke-obvody--proud-a-napeti': wrap(`<svg viewBox='0 0 460 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='230' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Analogie s vodou</text>
  <rect x='30' y='30' width='180' height='55' rx='8' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='120' y='52' text-anchor='middle' fill='#1e40af' font-size='12' font-weight='bold'>NAPĚTÍ U [V]</text>
  <text x='120' y='72' text-anchor='middle' fill='#374151' font-size='11'>= výškový rozdíl</text>
  <rect x='250' y='30' width='180' height='55' rx='8' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/>
  <text x='340' y='52' text-anchor='middle' fill='#166534' font-size='12' font-weight='bold'>PROUD I [A]</text>
  <text x='340' y='72' text-anchor='middle' fill='#374151' font-size='11'>= průtok vody</text>
  <rect x='140' y='100' width='180' height='55' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='230' y='122' text-anchor='middle' fill='#92400e' font-size='12' font-weight='bold'>ODPOR R [Ω]</text>
  <text x='230' y='142' text-anchor='middle' fill='#374151' font-size='11'>= zúžení potrubí</text>
</svg>`),

'elektricke-obvody--multimetr': wrap(`<svg viewBox='0 0 460 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='120' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Voltmetr — paralelně</text>
  <rect x='20' y='30' width='200' height='90' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <line x1='40' y1='75' x2='90' y2='75' stroke='#374151' stroke-width='2'/>
  <rect x='90' y='60' width='60' height='30' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='120' y='80' text-anchor='middle' fill='#92400e' font-size='10'>R</text>
  <line x1='150' y1='75' x2='200' y2='75' stroke='#374151' stroke-width='2'/>
  <path d='M90,55 Q120,30 150,55' fill='none' stroke='#3b82f6' stroke-width='2'/>
  <circle cx='120' cy='38' r='12' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/><text x='120' y='42' text-anchor='middle' fill='#1e40af' font-size='10' font-weight='bold'>V</text>
  <text x='350' y='20' text-anchor='middle' font-weight='bold' fill='#22c55e' font-size='12'>Ampérmetr — sériově</text>
  <rect x='250' y='30' width='200' height='90' rx='8' fill='#f0fdf4' stroke='#22c55e' stroke-width='1.5'/>
  <line x1='270' y1='75' x2='320' y2='75' stroke='#374151' stroke-width='2'/>
  <circle cx='340' cy='75' r='15' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/><text x='340' y='79' text-anchor='middle' fill='#166534' font-size='11' font-weight='bold'>A</text>
  <line x1='355' y1='75' x2='390' y2='75' stroke='#374151' stroke-width='2'/>
  <rect x='390' y='60' width='40' height='30' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='410' y='80' text-anchor='middle' fill='#92400e' font-size='10'>R</text>
</svg>`),

'elektricke-obvody--elektromagnet': wrap(`<svg viewBox='0 0 400 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Elektromagnet</text>
  <rect x='130' y='55' width='140' height='60' rx='5' fill='#d1d5db'/>
  <text x='200' y='90' text-anchor='middle' fill='#374151' font-size='11'>železné jádro</text>
  ${Array.from({length:8},(_,i)=>`<ellipse cx='${140+i*16}' cy='85' rx='8' ry='30' fill='none' stroke='#f59e0b' stroke-width='2'/>`).join('')}
  <text x='200' y='45' text-anchor='middle' fill='#f59e0b' font-size='11'>cívka (vinutí)</text>
  <line x1='130' y1='130' x2='130' y2='150' stroke='#374151' stroke-width='2'/><line x1='130' y1='150' x2='80' y2='150' stroke='#374151' stroke-width='2'/>
  <line x1='270' y1='130' x2='270' y2='150' stroke='#374151' stroke-width='2'/><line x1='270' y1='150' x2='320' y2='150' stroke='#374151' stroke-width='2'/>
  <line x1='80' y1='150' x2='80' y2='160' stroke='#374151' stroke-width='3'/><line x1='72' y1='160' x2='88' y2='160' stroke='#374151' stroke-width='3'/>
  <line x1='320' y1='145' x2='320' y2='155' stroke='#374151' stroke-width='3'/><text x='80' y='172' text-anchor='middle' fill='#374151' font-size='10'>−</text><text x='320' y='172' text-anchor='middle' fill='#374151' font-size='10'>+</text>
  <text x='108' y='32' fill='#ef4444' font-size='12' font-weight='bold'>N</text>
  <text x='278' y='32' fill='#3b82f6' font-size='12' font-weight='bold'>S</text>
</svg>`),

'elektricke-obvody--bezpecnost-pri-praci-s-elektrinou': wrap(`<svg viewBox='0 0 400 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <polygon points='70,10 10,100 130,100' fill='#fef3c7' stroke='#f59e0b' stroke-width='3'/>
  <text x='70' y='82' text-anchor='middle' fill='#f59e0b' font-size='40' font-weight='bold'>⚡</text>
  <text x='70' y='115' text-anchor='middle' fill='#92400e' font-size='11' font-weight='bold'>NEBEZPEČÍ</text>
  <rect x='170' y='15' width='210' height='90' rx='8' fill='#fef2f2' stroke='#ef4444' stroke-width='1.5'/>
  <text x='275' y='38' text-anchor='middle' fill='#991b1b' font-size='12' font-weight='bold'>Bezpečné napětí</text>
  <text x='275' y='58' text-anchor='middle' fill='#374151' font-size='11'>do 50 V AC / 120 V DC</text>
  <line x1='180' y1='68' x2='370' y2='68' stroke='#fecaca' stroke-width='1'/>
  <text x='275' y='85' text-anchor='middle' fill='#ef4444' font-size='12' font-weight='bold'>V zásuvce: 230 V !</text>
  <text x='275' y='100' text-anchor='middle' fill='#ef4444' font-size='11'>→ životu nebezpečné</text>
</svg>`),

'elektricke-obvody--vedeni-proudu-v-kapalinach': wrap(`<svg viewBox='0 0 400 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Elektrolýza</text>
  <rect x='80' y='70' width='240' height='100' rx='5' fill='#bfdbfe' opacity='0.4' stroke='#374151' stroke-width='2'/>
  <rect x='130' y='40' width='10' height='90' fill='#9ca3af' stroke='#374151' stroke-width='1'/><text x='135' y='35' text-anchor='middle' fill='#3b82f6' font-size='11' font-weight='bold'>− katoda</text>
  <rect x='260' y='40' width='10' height='90' fill='#9ca3af' stroke='#374151' stroke-width='1'/><text x='265' y='35' text-anchor='middle' fill='#ef4444' font-size='11' font-weight='bold'>+ anoda</text>
  <text x='200' y='105' text-anchor='middle' fill='#1e40af' font-size='11'>elektrolyt</text>
  <circle cx='170' cy='120' r='8' fill='#ef4444' opacity='0.6'/><text x='170' y='124' text-anchor='middle' fill='white' font-size='8'>+</text>
  <circle cx='230' cy='140' r='8' fill='#3b82f6' opacity='0.6'/><text x='230' y='144' text-anchor='middle' fill='white' font-size='8'>−</text>
  <path d='M170,120 Q155,120 145,110' fill='none' stroke='#ef4444' stroke-width='1.5' marker-end='url(#el1)'/><text x='155' y='152' fill='#ef4444' font-size='9'>kationty → katoda</text>
  <path d='M230,140 Q245,140 255,130' fill='none' stroke='#3b82f6' stroke-width='1.5' marker-end='url(#el2)'/><text x='215' y='165' fill='#3b82f6' font-size='9'>anionty → anoda</text>
  <defs>
    <marker id='el1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
    <marker id='el2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
  </defs>
</svg>`),

// ============ POHYB ============

'pohyb--druhy-pohybu': wrap(`<svg viewBox='0 0 480 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='10' y='10' width='140' height='110' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='80' y='30' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='11'>Přímočarý</text>
  <line x1='30' y1='65' x2='130' y2='65' stroke='#3b82f6' stroke-width='3' marker-end='url(#pm)'/>
  <circle cx='30' cy='65' r='8' fill='#3b82f6'/><text x='80' y='95' text-anchor='middle' fill='#6b7280' font-size='10'>přímka</text>
  <rect x='170' y='10' width='140' height='110' rx='8' fill='#f0fdf4' stroke='#22c55e' stroke-width='1.5'/>
  <text x='240' y='30' text-anchor='middle' font-weight='bold' fill='#166534' font-size='11'>Křivočarý</text>
  <path d='M190,80 Q220,30 250,60 Q280,90 300,50' fill='none' stroke='#22c55e' stroke-width='3' marker-end='url(#pm2)'/>
  <circle cx='190' cy='80' r='8' fill='#22c55e'/><text x='240' y='105' text-anchor='middle' fill='#6b7280' font-size='10'>křivka</text>
  <rect x='330' y='10' width='140' height='110' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='400' y='30' text-anchor='middle' font-weight='bold' fill='#92400e' font-size='11'>Po kružnici</text>
  <circle cx='400' cy='70' r='30' fill='none' stroke='#f59e0b' stroke-width='3'/>
  <circle cx='430' cy='70' r='6' fill='#f59e0b'/><text x='400' y='112' text-anchor='middle' fill='#6b7280' font-size='10'>kružnice</text>
  <defs>
    <marker id='pm' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
    <marker id='pm2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

'pohyb--rychlost': wrap(`<svg viewBox='0 0 420 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='20' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='14'>Trojúhelník veličin</text>
  <polygon points='210,30 130,110 290,110' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <line x1='130' y1='77' x2='290' y2='77' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='210' y='68' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>s</text>
  <text x='175' y='100' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>v</text>
  <text x='240' y='100' text-anchor='middle' fill='#6b7280' font-size='18'>×</text>
  <text x='252' y='100' text-anchor='middle' fill='#1e40af' font-size='22' font-weight='bold'>t</text>
  <text x='360' y='55' fill='#374151' font-size='12'>v = s / t</text>
  <text x='360' y='75' fill='#374151' font-size='12'>s = v · t</text>
  <text x='360' y='95' fill='#374151' font-size='12'>t = s / v</text>
</svg>`),

'pohyb--grafy': wrap(`<svg viewBox='0 0 480 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='120' y='15' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>s = f(t)</text>
  <line x1='30' y1='140' x2='220' y2='140' stroke='#374151' stroke-width='1.5' marker-end='url(#gax)'/><text x='225' y='150' fill='#374151' font-size='10'>t</text>
  <line x1='30' y1='140' x2='30' y2='25' stroke='#374151' stroke-width='1.5' marker-end='url(#gay)'/><text x='22' y='25' fill='#374151' font-size='10'>s</text>
  <line x1='30' y1='140' x2='200' y2='40' stroke='#3b82f6' stroke-width='2.5'/>
  <text x='145' y='72' fill='#3b82f6' font-size='10' transform='rotate(-30,145,72)'>rovnoměrný</text>
  <line x1='30' y1='90' x2='200' y2='90' stroke='#22c55e' stroke-width='2' stroke-dasharray='5'/>
  <text x='140' y='85' fill='#22c55e' font-size='10'>klid</text>
  <text x='360' y='15' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>v = f(t)</text>
  <line x1='270' y1='140' x2='460' y2='140' stroke='#374151' stroke-width='1.5' marker-end='url(#gax)'/><text x='465' y='150' fill='#374151' font-size='10'>t</text>
  <line x1='270' y1='140' x2='270' y2='25' stroke='#374151' stroke-width='1.5' marker-end='url(#gay)'/><text x='262' y='25' fill='#374151' font-size='10'>v</text>
  <line x1='270' y1='70' x2='440' y2='70' stroke='#3b82f6' stroke-width='2.5'/>
  <text x='370' y='63' fill='#3b82f6' font-size='10'>rovnoměrný</text>
  <rect x='270' y='70' width='170' height='70' fill='#3b82f6' opacity='0.1'/>
  <text x='355' y='115' fill='#3b82f6' font-size='10'>s = plocha</text>
  <defs>
    <marker id='gax' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#374151'/></marker>
    <marker id='gay' viewBox='0 0 6 6' refX='3' refY='1' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#374151'/></marker>
  </defs>
</svg>`),

// ============ SÍLA ============

'sila--sila-a-jeji-znazorneni': wrap(`<svg viewBox='0 0 400 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Znázornění síly</text>
  <circle cx='100' cy='75' r='25' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/>
  <text x='100' y='80' text-anchor='middle' fill='#1e40af' font-size='11'>těleso</text>
  <line x1='125' y1='75' x2='300' y2='75' stroke='#ef4444' stroke-width='3' marker-end='url(#sf)'/>
  <text x='210' y='65' text-anchor='middle' fill='#ef4444' font-size='14' font-weight='bold'>F = 10 N</text>
  <text x='100' y='120' text-anchor='middle' fill='#6b7280' font-size='10'>působiště</text>
  <line x1='100' y1='100' x2='100' y2='110' stroke='#6b7280' stroke-width='1'/>
  <text x='300' y='65' fill='#6b7280' font-size='10'>směr</text>
  <text x='350' y='100' fill='#6b7280' font-size='10'>délka = velikost</text>
  <defs><marker id='sf' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='8' markerHeight='8' orient='auto'><path d='M0,0 L10,5 L0,10Z' fill='#ef4444'/></marker></defs>
</svg>`),

'sila--silomer': wrap(`<svg viewBox='0 0 300 200' xmlns='http://www.w3.org/2000/svg' style='width:80%;font-family:sans-serif'>
  <rect x='120' y='10' width='60' height='25' rx='5' fill='#374151'/><text x='150' y='28' text-anchor='middle' fill='white' font-size='10'>úchyt</text>
  <path d='M150,35 Q140,50 160,65 Q140,80 160,95 Q140,110 150,125' fill='none' stroke='#f59e0b' stroke-width='3'/>
  <text x='90' y='85' fill='#f59e0b' font-size='11' text-anchor='end'>pružina</text>
  <rect x='125' y='125' width='50' height='8' fill='#374151'/>
  <line x1='150' y1='133' x2='150' y2='170' stroke='#374151' stroke-width='2'/>
  <rect x='125' y='170' width='50' height='25' rx='5' fill='#3b82f6'/><text x='150' y='187' text-anchor='middle' fill='white' font-size='10'>závaží</text>
  <line x1='175' y1='50' x2='200' y2='50' stroke='#9ca3af' stroke-width='1'/><text x='210' y='54' fill='#6b7280' font-size='10'>0 N</text>
  <line x1='175' y1='80' x2='200' y2='80' stroke='#9ca3af' stroke-width='1'/><text x='210' y='84' fill='#6b7280' font-size='10'>1 N</text>
  <line x1='175' y1='110' x2='200' y2='110' stroke='#9ca3af' stroke-width='1'/><text x='210' y='114' fill='#6b7280' font-size='10'>2 N</text>
  <line x1='175' y1='130' x2='200' y2='130' stroke='#ef4444' stroke-width='1.5'/><text x='210' y='134' fill='#ef4444' font-size='10' font-weight='bold'>F</text>
</svg>`),

'sila--skladani-sil': wrap(`<svg viewBox='0 0 460 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='115' y='18' text-anchor='middle' font-weight='bold' fill='#22c55e' font-size='12'>Stejný směr</text>
  <circle cx='50' cy='60' r='15' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <line x1='65' y1='55' x2='130' y2='55' stroke='#3b82f6' stroke-width='2.5' marker-end='url(#cs1)'/><text x='100' y='50' fill='#3b82f6' font-size='10'>F₁</text>
  <line x1='65' y1='65' x2='110' y2='65' stroke='#22c55e' stroke-width='2.5' marker-end='url(#cs2)'/><text x='90' y='80' fill='#22c55e' font-size='10'>F₂</text>
  <line x1='65' y1='100' x2='180' y2='100' stroke='#ef4444' stroke-width='3' marker-end='url(#cs3)'/><text x='125' y='120' fill='#ef4444' font-size='11' font-weight='bold'>F = F₁+F₂</text>
  <text x='345' y='18' text-anchor='middle' font-weight='bold' fill='#ef4444' font-size='12'>Opačný směr</text>
  <circle cx='310' cy='60' r='15' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <line x1='325' y1='55' x2='420' y2='55' stroke='#3b82f6' stroke-width='2.5' marker-end='url(#cs1)'/><text x='375' y='50' fill='#3b82f6' font-size='10'>F₁</text>
  <line x1='295' y1='65' x2='250' y2='65' stroke='#22c55e' stroke-width='2.5' marker-end='url(#cs4)'/><text x='268' y='80' fill='#22c55e' font-size='10'>F₂</text>
  <line x1='325' y1='100' x2='385' y2='100' stroke='#ef4444' stroke-width='3' marker-end='url(#cs3)'/><text x='355' y='120' fill='#ef4444' font-size='11' font-weight='bold'>F = F₁−F₂</text>
  <defs>
    <marker id='cs1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
    <marker id='cs2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='cs3' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
    <marker id='cs4' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

'sila--gravitacni-a-tihova-sila': wrap(`<svg viewBox='0 0 350 180' xmlns='http://www.w3.org/2000/svg' style='width:90%;font-family:sans-serif'>
  <circle cx='175' cy='140' r='35' fill='#bfdbfe' stroke='#3b82f6' stroke-width='2'/>
  <text x='175' y='145' text-anchor='middle' fill='#1e40af' font-size='12' font-weight='bold'>Země</text>
  <rect x='160' y='55' width='30' height='30' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/>
  <text x='175' y='75' text-anchor='middle' fill='#991b1b' font-size='10'>m</text>
  <line x1='175' y1='85' x2='175' y2='102' stroke='#ef4444' stroke-width='3' marker-end='url(#gf)'/><text x='200' y='100' fill='#ef4444' font-size='12' font-weight='bold'>G = m·g</text>
  <text x='175' y='25' text-anchor='middle' fill='#374151' font-size='12'>g ≈ 10 m/s²</text>
  <text x='175' y='40' text-anchor='middle' fill='#6b7280' font-size='10'>(tíhové zrychlení na Zemi)</text>
  <defs><marker id='gf' viewBox='0 0 8 8' refX='7' refY='4' markerWidth='6' markerHeight='6' orient='auto'><path d='M0,0 L8,4 L0,8Z' fill='#ef4444'/></marker></defs>
</svg>`),

'sila--newtonovy-zakony': wrap(`<svg viewBox='0 0 480 110' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='5' y='10' width='148' height='90' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='79' y='32' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='11'>1. zákon</text>
  <text x='79' y='50' text-anchor='middle' fill='#374151' font-size='10'>setrvačnost</text>
  <rect x='30' y='60' width='30' height='20' rx='3' fill='#3b82f6'/><line x1='60' y1='70' x2='120' y2='70' stroke='#3b82f6' stroke-width='2' stroke-dasharray='4' marker-end='url(#nw)'/><text x='90' y='90' fill='#3b82f6' font-size='9'>F=0 → v=konst.</text>
  <rect x='168' y='10' width='148' height='90' rx='8' fill='#f0fdf4' stroke='#22c55e' stroke-width='1.5'/>
  <text x='242' y='32' text-anchor='middle' font-weight='bold' fill='#166534' font-size='11'>2. zákon</text>
  <text x='242' y='50' text-anchor='middle' fill='#374151' font-size='10'>F = m · a</text>
  <rect x='195' y='60' width='30' height='20' rx='3' fill='#22c55e'/><line x1='225' y1='70' x2='290' y2='70' stroke='#22c55e' stroke-width='3' marker-end='url(#nw2)'/><text x='257' y='64' fill='#22c55e' font-size='10' font-weight='bold'>F</text>
  <rect x='330' y='10' width='148' height='90' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='404' y='32' text-anchor='middle' font-weight='bold' fill='#92400e' font-size='11'>3. zákon</text>
  <text x='404' y='50' text-anchor='middle' fill='#374151' font-size='10'>akce a reakce</text>
  <rect x='365' y='60' width='25' height='20' rx='3' fill='#f59e0b'/><rect x='415' y='60' width='25' height='20' rx='3' fill='#ef4444'/>
  <line x1='390' y1='67' x2='415' y2='67' stroke='#f59e0b' stroke-width='2' marker-end='url(#nw3)'/><line x1='415' y1='73' x2='390' y2='73' stroke='#ef4444' stroke-width='2' marker-end='url(#nw4)'/>
  <defs>
    <marker id='nw' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
    <marker id='nw2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='nw3' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker>
    <marker id='nw4' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

'sila--jednoduche-stroje': wrap(`<svg viewBox='0 0 420 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Páka</text>
  <line x1='50' y1='70' x2='370' y2='70' stroke='#374151' stroke-width='4'/>
  <polygon points='210,70 200,100 220,100' fill='#374151'/>
  <text x='210' y='118' text-anchor='middle' fill='#374151' font-size='10'>osa otáčení</text>
  <line x1='80' y1='40' x2='80' y2='70' stroke='#ef4444' stroke-width='2.5' marker-start='url(#pk)'/><text x='65' y='38' fill='#ef4444' font-size='11' font-weight='bold'>F₁</text>
  <rect x='60' y='70' width='40' height='20' rx='3' fill='#dbeafe' stroke='#3b82f6' stroke-width='1'/><text x='80' y='85' text-anchor='middle' fill='#1e40af' font-size='9'>závaží</text>
  <line x1='340' y1='40' x2='340' y2='70' stroke='#22c55e' stroke-width='2.5' marker-start='url(#pk2)'/><text x='355' y='38' fill='#22c55e' font-size='11' font-weight='bold'>F₂</text>
  <line x1='80' y1='130' x2='210' y2='130' stroke='#ef4444' stroke-width='1.5'/><text x='145' y='145' text-anchor='middle' fill='#ef4444' font-size='10'>a₁</text>
  <line x1='210' y1='130' x2='340' y2='130' stroke='#22c55e' stroke-width='1.5'/><text x='275' y='145' text-anchor='middle' fill='#22c55e' font-size='10'>a₂</text>
  <text x='210' y='30' text-anchor='middle' fill='#374151' font-size='11'>F₁ · a₁ = F₂ · a₂</text>
  <defs>
    <marker id='pk' viewBox='0 0 6 6' refX='3' refY='0' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#ef4444'/></marker>
    <marker id='pk2' viewBox='0 0 6 6' refX='3' refY='0' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

// ============ KAPALINY 7 ============

'kapaliny-7--pascaluv-zakon': wrap(`<svg viewBox='0 0 420 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Hydraulický lis</text>
  <rect x='50' y='60' width='320' height='70' rx='5' fill='#bfdbfe' opacity='0.3' stroke='#374151' stroke-width='1.5'/>
  <rect x='70' y='30' width='30' height='50' rx='3' fill='#9ca3af' stroke='#374151' stroke-width='1.5'/>
  <text x='85' y='52' text-anchor='middle' fill='white' font-size='9'>S₁</text>
  <line x1='85' y1='22' x2='85' y2='30' stroke='#ef4444' stroke-width='2.5' marker-start='url(#hy)'/><text x='60' y='20' fill='#ef4444' font-size='11'>F₁</text>
  <rect x='290' y='30' width='70' height='50' rx='3' fill='#9ca3af' stroke='#374151' stroke-width='1.5'/>
  <text x='325' y='52' text-anchor='middle' fill='white' font-size='11'>S₂</text>
  <line x1='325' y1='22' x2='325' y2='30' stroke='#22c55e' stroke-width='3' marker-start='url(#hy2)'/><text x='350' y='20' fill='#22c55e' font-size='13' font-weight='bold'>F₂</text>
  <text x='210' y='100' text-anchor='middle' fill='#1e40af' font-size='11'>kapalina</text>
  <text x='85' y='148' text-anchor='middle' fill='#6b7280' font-size='10'>malý píst</text>
  <text x='325' y='148' text-anchor='middle' fill='#6b7280' font-size='10'>velký píst</text>
  <defs>
    <marker id='hy' viewBox='0 0 6 6' refX='3' refY='0' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#ef4444'/></marker>
    <marker id='hy2' viewBox='0 0 6 6' refX='3' refY='0' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

'kapaliny-7--hydrostaticky-tlak': wrap(`<svg viewBox='0 0 350 190' xmlns='http://www.w3.org/2000/svg' style='width:90%;font-family:sans-serif'>
  <rect x='80' y='30' width='120' height='140' rx='5' fill='none' stroke='#374151' stroke-width='2'/>
  <rect x='82' y='50' width='116' height='118' fill='#93c5fd' opacity='0.4'/>
  <path d='M82,50 Q140,45 198,50' fill='none' stroke='#3b82f6' stroke-width='2'/>
  <line x1='200' y1='50' x2='240' y2='50' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <line x1='200' y1='100' x2='240' y2='100' stroke='#6b7280' stroke-width='1' stroke-dasharray='3'/>
  <line x1='235' y1='50' x2='235' y2='100' stroke='#ef4444' stroke-width='2'/><polygon points='230,50 240,50 235,55' fill='#ef4444'/><polygon points='230,100 240,100 235,95' fill='#ef4444'/>
  <text x='255' y='80' fill='#ef4444' font-size='12' font-weight='bold'>h</text>
  <line x1='90' y1='100' x2='90' y2='115' stroke='#1e40af' stroke-width='2' marker-end='url(#hp)'/><text x='80' y='128' fill='#1e40af' font-size='10'>p₁</text>
  <line x1='140' y1='140' x2='140' y2='160' stroke='#1e40af' stroke-width='3' marker-end='url(#hp)'/><text x='130' y='172' fill='#1e40af' font-size='11' font-weight='bold'>p₂</text>
  <text x='280' y='50' fill='#374151' font-size='11'>hladina</text>
  <text x='280' y='140' fill='#1e40af' font-size='12' font-weight='bold'>p = h·ρ·g</text>
  <text x='280' y='160' fill='#6b7280' font-size='10'>čím hlouběji,</text>
  <text x='280' y='175' fill='#6b7280' font-size='10'>tím větší tlak</text>
  <defs><marker id='hp' viewBox='0 0 6 6' refX='3' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,0 L3,6Z' fill='#1e40af'/></marker></defs>
</svg>`),

'kapaliny-7--spojene-nadoby': wrap(`<svg viewBox='0 0 400 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Spojené nádoby — stejná kapalina</text>
  <path d='M40,30 L40,130 L160,130 L160,100 L240,100 L240,130 L360,130 L360,30' fill='none' stroke='#374151' stroke-width='2.5'/>
  <rect x='42' y='70' width='116' height='58' fill='#93c5fd' opacity='0.4'/><rect x='162' y='70' width='76' height='58' fill='#93c5fd' opacity='0.4'/><rect x='242' y='70' width='116' height='58' fill='#93c5fd' opacity='0.4'/>
  <line x1='30' y1='70' x2='370' y2='70' stroke='#ef4444' stroke-width='1.5' stroke-dasharray='5'/>
  <text x='385' y='74' fill='#ef4444' font-size='11' font-weight='bold'>stejná výška</text>
</svg>`),

'kapaliny-7--lode': wrap(`<svg viewBox='0 0 400 170' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='20' y='90' width='360' height='70' fill='#bfdbfe' opacity='0.3'/>
  <path d='M20,90 L380,90' stroke='#3b82f6' stroke-width='1.5'/>
  <path d='M120,90 Q120,120 150,130 L250,130 Q280,120 280,90 Z' fill='#9ca3af' stroke='#374151' stroke-width='2'/>
  <rect x='160' y='50' width='80' height='40' rx='3' fill='#d1d5db' stroke='#374151' stroke-width='1.5'/>
  <text x='200' y='75' text-anchor='middle' fill='#374151' font-size='10'>loď</text>
  <line x1='200' y1='130' x2='200' y2='155' stroke='#ef4444' stroke-width='2.5' marker-end='url(#ld)'/><text x='230' y='152' fill='#ef4444' font-size='11' font-weight='bold'>G</text>
  <line x1='200' y1='100' x2='200' y2='55' stroke='#22c55e' stroke-width='2.5' marker-end='url(#ld2)'/><text x='230' y='72' fill='#22c55e' font-size='11' font-weight='bold'>F_vz</text>
  <text x='200' y='25' text-anchor='middle' fill='#374151' font-size='12'>G = F_vz → loď plove</text>
  <line x1='30' y1='90' x2='30' y2='130' stroke='#f59e0b' stroke-width='1.5'/><text x='50' y='115' fill='#f59e0b' font-size='10'>ponor</text>
  <defs>
    <marker id='ld' viewBox='0 0 6 6' refX='3' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,0 L3,6Z' fill='#ef4444'/></marker>
    <marker id='ld2' viewBox='0 0 6 6' refX='3' refY='1' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,6 L3,0 L6,6Z' fill='#22c55e'/></marker>
  </defs>
</svg>`),

'kapaliny-7--vztlakova-sila': wrap(`<svg viewBox='0 0 420 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='30' y='30' width='120' height='110' fill='#bfdbfe' opacity='0.3' stroke='#3b82f6' stroke-width='1.5'/>
  <rect x='60' y='50' width='40' height='40' rx='5' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='80' y='75' text-anchor='middle' font-size='9' fill='#991b1b'>klesá</text>
  <text x='80' y='108' text-anchor='middle' fill='#6b7280' font-size='9'>ρ_t > ρ_k</text>
  <rect x='175' y='30' width='120' height='110' fill='#bfdbfe' opacity='0.3' stroke='#3b82f6' stroke-width='1.5'/>
  <rect x='205' y='55' width='40' height='40' rx='5' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='225' y='80' text-anchor='middle' font-size='9' fill='#92400e'>vznáší</text>
  <text x='225' y='108' text-anchor='middle' fill='#6b7280' font-size='9'>ρ_t = ρ_k</text>
  <rect x='320' y='30' width='120' height='110' fill='#bfdbfe' opacity='0.3' stroke='#3b82f6' stroke-width='1.5'/>
  <rect x='350' y='28' width='40' height='25' rx='5' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/><text x='370' y='45' text-anchor='middle' font-size='9' fill='#166534'>plove</text>
  <text x='370' y='108' text-anchor='middle' fill='#6b7280' font-size='9'>ρ_t &lt; ρ_k</text>
</svg>`),

// ============ OPTIKA ============

'optika--svetlo': wrap(`<svg viewBox='0 0 420 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <circle cx='60' cy='75' r='35' fill='#fef3c7' stroke='#f59e0b' stroke-width='2'/>
  <text x='60' y='80' text-anchor='middle' fill='#f59e0b' font-size='20'>☀</text>
  ${[0,30,-30].map(a=>`<line x1='95' y1='75' x2='${250+Math.sin(a*Math.PI/180)*40}' y2='${75+Math.sin(a*Math.PI/180)*60}' stroke='#f59e0b' stroke-width='2' marker-end='url(#lr)'/>`).join('')}
  <rect x='250' y='40' width='15' height='70' fill='#374151'/>
  <rect x='280' y='55' width='100' height='40' fill='#d1d5db' opacity='0.4'/>
  <text x='330' y='80' text-anchor='middle' fill='#374151' font-size='11'>stín</text>
  <text x='200' y='140' text-anchor='middle' fill='#374151' font-size='12'>Světlo se šíří přímočaře → vznikají stíny</text>
  <defs><marker id='lr' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker></defs>
</svg>`),

'optika--zrcadla-zakon-odrazu': wrap(`<svg viewBox='0 0 400 180' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Zákon odrazu</text>
  <rect x='90' y='25' width='220' height='8' fill='#9ca3af'/>
  <line x1='200' y1='33' x2='200' y2='160' stroke='#6b7280' stroke-width='1' stroke-dasharray='4'/>
  <text x='205' y='170' fill='#6b7280' font-size='10'>kolmice</text>
  <line x1='120' y1='150' x2='200' y2='33' stroke='#ef4444' stroke-width='2.5' marker-end='url(#od1)'/><text x='140' y='140' fill='#ef4444' font-size='11'>dopadající</text>
  <line x1='200' y1='33' x2='280' y2='150' stroke='#3b82f6' stroke-width='2.5' marker-end='url(#od2)'/><text x='255' y='140' fill='#3b82f6' font-size='11'>odražený</text>
  <path d='M180,60 Q180,50 190,45' fill='none' stroke='#ef4444' stroke-width='1.5'/><text x='170' y='65' fill='#ef4444' font-size='11'>α</text>
  <path d='M220,60 Q220,50 210,45' fill='none' stroke='#3b82f6' stroke-width='1.5'/><text x='225' y='65' fill='#3b82f6' font-size='11'>α'</text>
  <text x='330' y='100' fill='#374151' font-size='13' font-weight='bold'>α = α'</text>
  <defs>
    <marker id='od1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
    <marker id='od2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
  </defs>
</svg>`),

'optika--cocky-zakon-lomu': wrap(`<svg viewBox='0 0 440 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='110' y='18' text-anchor='middle' font-weight='bold' fill='#22c55e' font-size='12'>Spojka (+)</text>
  <ellipse cx='110' cy='70' rx='12' ry='45' fill='#dbeafe' opacity='0.5' stroke='#3b82f6' stroke-width='2'/>
  <line x1='20' y1='50' x2='98' y2='70' stroke='#f59e0b' stroke-width='2'/><line x1='20' y1='70' x2='98' y2='70' stroke='#f59e0b' stroke-width='2'/><line x1='20' y1='90' x2='98' y2='70' stroke='#f59e0b' stroke-width='2'/>
  <line x1='122' y1='70' x2='200' y2='70' stroke='#ef4444' stroke-width='2' marker-end='url(#lk1)'/><line x1='122' y1='65' x2='200' y2='70' stroke='#ef4444' stroke-width='1.5' marker-end='url(#lk1)'/><line x1='122' y1='75' x2='200' y2='70' stroke='#ef4444' stroke-width='1.5' marker-end='url(#lk1)'/>
  <circle cx='200' cy='70' r='4' fill='#ef4444'/><text x='200' y='100' text-anchor='middle' fill='#ef4444' font-size='10'>ohnisko F</text>
  <text x='330' y='18' text-anchor='middle' font-weight='bold' fill='#ef4444' font-size='12'>Rozptylka (−)</text>
  <ellipse cx='330' cy='70' rx='8' ry='45' fill='#fef3c7' opacity='0.3' stroke='#f59e0b' stroke-width='2'/>
  <line x1='240' y1='50' x2='322' y2='70' stroke='#f59e0b' stroke-width='2'/><line x1='240' y1='70' x2='322' y2='70' stroke='#f59e0b' stroke-width='2'/><line x1='240' y1='90' x2='322' y2='70' stroke='#f59e0b' stroke-width='2'/>
  <line x1='338' y1='65' x2='420' y2='45' stroke='#ef4444' stroke-width='1.5' marker-end='url(#lk1)'/><line x1='338' y1='70' x2='420' y2='70' stroke='#ef4444' stroke-width='1.5' marker-end='url(#lk1)'/><line x1='338' y1='75' x2='420' y2='95' stroke='#ef4444' stroke-width='1.5' marker-end='url(#lk1)'/>
  <text x='370' y='120' text-anchor='middle' fill='#6b7280' font-size='10'>rozbíhají se</text>
  <defs><marker id='lk1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker></defs>
</svg>`),

'optika--oko': wrap(`<svg viewBox='0 0 400 160' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Průřez okem</text>
  <ellipse cx='200' cy='90' rx='100' ry='55' fill='#f3f4f6' stroke='#374151' stroke-width='2'/>
  <ellipse cx='130' cy='90' rx='15' ry='35' fill='#dbeafe' opacity='0.6' stroke='#3b82f6' stroke-width='1.5'/><text x='130' y='135' text-anchor='middle' fill='#3b82f6' font-size='9'>čočka</text>
  <circle cx='115' cy='90' r='8' fill='#374151'/><text x='115' y='80' text-anchor='middle' fill='#374151' font-size='8'>zornice</text>
  <path d='M145,55 Q300,55 300,90 Q300,125 145,125' fill='none' stroke='#f59e0b' stroke-width='1.5'/><text x='260' y='70' fill='#f59e0b' font-size='9'>sítnice</text>
  <line x1='300' y1='90' x2='370' y2='90' stroke='#374151' stroke-width='2'/><text x='360' y='80' fill='#374151' font-size='9'>zrakový nerv</text>
  <line x1='30' y1='60' x2='115' y2='88' stroke='#f59e0b' stroke-width='1.5'/><line x1='30' y1='120' x2='115' y2='92' stroke='#f59e0b' stroke-width='1.5'/>
  <circle cx='280' cy='95' r='3' fill='#ef4444'/><text x='280' y='110' text-anchor='middle' fill='#ef4444' font-size='8'>obraz</text>
</svg>`),

'optika--barvy': wrap(`<svg viewBox='0 0 420 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Rozklad bílého světla hranolem</text>
  <line x1='20' y1='60' x2='150' y2='60' stroke='#f59e0b' stroke-width='3'/>
  <polygon points='150,30 220,60 150,90' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  ${[{y:32,c:'#ef4444',n:'červená'},{y:42,c:'#f97316',n:'oranžová'},{y:52,c:'#eab308',n:'žlutá'},{y:62,c:'#22c55e',n:'zelená'},{y:72,c:'#3b82f6',n:'modrá'},{y:82,c:'#8b5cf6',n:'fialová'}].map(p=>`<line x1='220' y1='60' x2='380' y2='${p.y}' stroke='${p.c}' stroke-width='2.5'/><text x='390' y='${p.y+4}' fill='${p.c}' font-size='10'>${p.n}</text>`).join('')}
  <text x='90' y='50' fill='#f59e0b' font-size='10'>bílé světlo</text>
</svg>`),

// ============ MECHANIKA 8 ============

'mechanika--prace': wrap(`<svg viewBox='0 0 400 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='80' y='60' width='50' height='40' rx='5' fill='#dbeafe' stroke='#3b82f6' stroke-width='2'/><text x='105' y='85' text-anchor='middle' fill='#1e40af' font-size='11'>m</text>
  <line x1='130' y1='80' x2='280' y2='80' stroke='#ef4444' stroke-width='3' marker-end='url(#wp)'/><text x='205' y='72' text-anchor='middle' fill='#ef4444' font-size='13' font-weight='bold'>F</text>
  <line x1='80' y1='110' x2='280' y2='110' stroke='#22c55e' stroke-width='1.5'/><polygon points='80,106 80,114 72,110' fill='#22c55e'/><polygon points='280,106 280,114 288,110' fill='#22c55e'/><text x='180' y='125' text-anchor='middle' fill='#22c55e' font-size='12' font-weight='bold'>s</text>
  <text x='340' y='65' fill='#1e40af' font-size='16' font-weight='bold'>W = F · s</text>
  <text x='340' y='85' fill='#374151' font-size='11'>[J] = [N] · [m]</text>
  <text x='200' y='20' text-anchor='middle' fill='#374151' font-size='12'>Síla působí ve směru pohybu → koná se práce</text>
  <line x1='80' y1='100' x2='280' y2='100' stroke='#374151' stroke-width='1'/>
  <defs><marker id='wp' viewBox='0 0 8 8' refX='7' refY='4' markerWidth='6' markerHeight='6' orient='auto'><path d='M0,0 L8,4 L0,8Z' fill='#ef4444'/></marker></defs>
</svg>`),

'mechanika--vykon': wrap(`<svg viewBox='0 0 400 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='30' y='20' width='140' height='80' rx='10' fill='#eff6ff' stroke='#3b82f6' stroke-width='2'/>
  <text x='100' y='50' text-anchor='middle' fill='#1e40af' font-size='16' font-weight='bold'>W [J]</text>
  <text x='100' y='75' text-anchor='middle' fill='#374151' font-size='12'>práce</text>
  <rect x='230' y='20' width='140' height='80' rx='10' fill='#f0fdf4' stroke='#22c55e' stroke-width='2'/>
  <text x='300' y='50' text-anchor='middle' fill='#166534' font-size='16' font-weight='bold'>t [s]</text>
  <text x='300' y='75' text-anchor='middle' fill='#374151' font-size='12'>čas</text>
  <line x1='170' y1='60' x2='230' y2='60' stroke='#374151' stroke-width='2'/>
  <text x='200' y='55' text-anchor='middle' fill='#374151' font-size='16'>÷</text>
  <text x='200' y='115' text-anchor='middle' fill='#ef4444' font-size='16' font-weight='bold'>P = W / t [W]</text>
</svg>`),

// ============ ENERGIE 8 ============

'energie--energie': wrap(`<svg viewBox='0 0 420 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='20' y='10' width='170' height='55' rx='8' fill='#dbeafe' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='105' y='32' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='12'>Polohová E_p</text>
  <text x='105' y='52' text-anchor='middle' fill='#374151' font-size='11'>E_p = m·g·h</text>
  <rect x='230' y='10' width='170' height='55' rx='8' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/>
  <text x='315' y='32' text-anchor='middle' font-weight='bold' fill='#166534' font-size='12'>Pohybová E_k</text>
  <text x='315' y='52' text-anchor='middle' fill='#374151' font-size='11'>E_k = ½·m·v²</text>
  <path d='M170,65 Q210,90 230,65' fill='none' stroke='#f59e0b' stroke-width='2' marker-end='url(#en1)'/><text x='200' y='95' text-anchor='middle' fill='#f59e0b' font-size='10'>pád</text>
  <path d='M230,15 Q210,0 170,15' fill='none' stroke='#8b5cf6' stroke-width='2' marker-end='url(#en2)'/><text x='200' y='0' text-anchor='middle' fill='#8b5cf6' font-size='10'>hod nahoru</text>
  <rect x='120' y='100' width='180' height='35' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='210' y='122' text-anchor='middle' font-weight='bold' fill='#92400e' font-size='11'>E_p + E_k = konst.</text>
  <defs>
    <marker id='en1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker>
    <marker id='en2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#8b5cf6'/></marker>
  </defs>
</svg>`),

'energie--teplo-a-jeho-sireni': wrap(`<svg viewBox='0 0 480 110' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='10' y='10' width='140' height='90' rx='8' fill='#fef2f2' stroke='#ef4444' stroke-width='1.5'/>
  <text x='80' y='32' text-anchor='middle' font-weight='bold' fill='#991b1b' font-size='11'>Vedení</text>
  <text x='80' y='50' text-anchor='middle' fill='#374151' font-size='10'>pevné látky</text>
  <line x1='30' y1='70' x2='130' y2='70' stroke='#ef4444' stroke-width='3'/>${[30,55,80,105,130].map(x=>`<circle cx='${x}' cy='70' r='5' fill='#fecaca' stroke='#ef4444' stroke-width='1'/>`).join('')}
  <rect x='170' y='10' width='140' height='90' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/>
  <text x='240' y='32' text-anchor='middle' font-weight='bold' fill='#92400e' font-size='11'>Proudění</text>
  <text x='240' y='50' text-anchor='middle' fill='#374151' font-size='10'>kapaliny, plyny</text>
  <path d='M200,85 Q220,60 240,85 Q260,60 280,85' fill='none' stroke='#f59e0b' stroke-width='2.5' marker-end='url(#tp)'/><text x='240' y='98' text-anchor='middle' fill='#f59e0b' font-size='9'>↑ teplý stoupá</text>
  <rect x='330' y='10' width='140' height='90' rx='8' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/>
  <text x='400' y='32' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='11'>Záření</text>
  <text x='400' y='50' text-anchor='middle' fill='#374151' font-size='10'>i vakuem</text>
  <circle cx='370' cy='75' r='12' fill='#fef3c7' stroke='#f59e0b' stroke-width='1'/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1='${370+18*Math.cos(a*Math.PI/180)}' y1='${75+18*Math.sin(a*Math.PI/180)}' x2='${370+28*Math.cos(a*Math.PI/180)}' y2='${75+28*Math.sin(a*Math.PI/180)}' stroke='#f59e0b' stroke-width='1.5'/>`).join('')}
  <defs><marker id='tp' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#f59e0b'/></marker></defs>
</svg>`),

'energie--ucinnost': wrap(`<svg viewBox='0 0 400 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <rect x='30' y='30' width='100' height='70' rx='8' fill='#fef3c7' stroke='#f59e0b' stroke-width='2'/>
  <text x='80' y='58' text-anchor='middle' fill='#92400e' font-size='11' font-weight='bold'>Dodaná</text>
  <text x='80' y='78' text-anchor='middle' fill='#92400e' font-size='11'>energie</text>
  <text x='80' y='92' text-anchor='middle' fill='#92400e' font-size='10'>100 %</text>
  <line x1='130' y1='55' x2='190' y2='55' stroke='#22c55e' stroke-width='3' marker-end='url(#uc1)'/><text x='160' y='48' fill='#22c55e' font-size='10'>užitečná</text>
  <line x1='130' y1='85' x2='190' y2='85' stroke='#ef4444' stroke-width='2' marker-end='url(#uc2)'/><text x='160' y='100' fill='#ef4444' font-size='10'>ztráty (teplo)</text>
  <rect x='190' y='35' width='100' height='30' rx='6' fill='#dcfce7' stroke='#22c55e' stroke-width='1.5'/><text x='240' y='55' text-anchor='middle' fill='#166534' font-size='10'>30 % užitek</text>
  <rect x='190' y='72' width='100' height='30' rx='6' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='240' y='92' text-anchor='middle' fill='#991b1b' font-size='10'>70 % ztráty</text>
  <text x='350' y='65' fill='#1e40af' font-size='14' font-weight='bold'>η = 30 %</text>
  <defs>
    <marker id='uc1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#22c55e'/></marker>
    <marker id='uc2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
  </defs>
</svg>`),

// ============ AKUSTIKA ============

'akustika--zdroje-zvuku': wrap(`<svg viewBox='0 0 420 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Zvuková vlna</text>
  <rect x='30' y='40' width='40' height='60' rx='5' fill='#374151'/><text x='50' y='75' text-anchor='middle' fill='white' font-size='9'>🔊</text>
  ${[80,110,145,185,230].map((x,i)=>`<path d='M${x},${40+i*2} Q${x+15},70 ${x},${100-i*2}' fill='none' stroke='#3b82f6' stroke-width='${2-i*0.3}' opacity='${1-i*0.15}'/>`).join('')}
  <text x='300' y='55' fill='#374151' font-size='11'>zhušťování</text>
  <text x='300' y='75' fill='#374151' font-size='11'>a zřeďování</text>
  <text x='300' y='95' fill='#374151' font-size='11'>částic vzduchu</text>
  <text x='300' y='120' fill='#ef4444' font-size='11'>v ≈ 343 m/s (vzduch)</text>
</svg>`),

'akustika--vlneni': wrap(`<svg viewBox='0 0 450 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='225' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Příčné vlnění</text>
  <line x1='30' y1='70' x2='420' y2='70' stroke='#d1d5db' stroke-width='1'/>
  <path d='M30,70 Q70,20 110,70 Q150,120 190,70 Q230,20 270,70 Q310,120 350,70 Q390,20 420,70' fill='none' stroke='#3b82f6' stroke-width='2.5'/>
  <line x1='110' y1='75' x2='270' y2='75' stroke='#ef4444' stroke-width='1.5'/><polygon points='110,71 110,79 102,75' fill='#ef4444'/><polygon points='270,71 270,79 278,75' fill='#ef4444'/><text x='190' y='92' text-anchor='middle' fill='#ef4444' font-size='11' font-weight='bold'>λ (vlnová délka)</text>
  <line x1='70' y1='25' x2='70' y2='70' stroke='#22c55e' stroke-width='1.5'/><polygon points='66,25 74,25 70,18' fill='#22c55e'/><text x='56' y='50' fill='#22c55e' font-size='10'>A</text>
  <text x='380' y='55' fill='#6b7280' font-size='10'>v = λ · f</text>
</svg>`),

'akustika--hudebni-nastroje': wrap(`<svg viewBox='0 0 400 110' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Kmitající struna</text>
  <circle cx='40' cy='60' r='5' fill='#374151'/><circle cx='360' cy='60' r='5' fill='#374151'/>
  <path d='M45,60 Q200,15 355,60' fill='none' stroke='#3b82f6' stroke-width='2.5'/>
  <path d='M45,60 Q200,100 355,60' fill='none' stroke='#3b82f6' stroke-width='1.5' stroke-dasharray='4' opacity='0.5'/>
  <line x1='200' y1='20' x2='200' y2='60' stroke='#ef4444' stroke-width='1.5' stroke-dasharray='3'/><text x='210' y='40' fill='#ef4444' font-size='10'>A</text>
  <text x='200' y='105' text-anchor='middle' fill='#6b7280' font-size='10'>kratší struna → vyšší tón | napjatější → vyšší tón</text>
</svg>`),

// ============ ELEKTŘINA 9 ============

'elektrina--elektromagnetismus-a-indukce': wrap(`<svg viewBox='0 0 400 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='200' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Elektromagnetická indukce</text>
  <rect x='140' y='35' width='120' height='80' rx='3' fill='none' stroke='#f59e0b' stroke-width='2'/>
  ${Array.from({length:5},(_,i)=>`<ellipse cx='${155+i*22}' cy='75' rx='10' ry='40' fill='none' stroke='#f59e0b' stroke-width='1.5'/>`).join('')}
  <text x='200' y='130' text-anchor='middle' fill='#f59e0b' font-size='10'>cívka</text>
  <rect x='50' y='55' width='30' height='40' rx='5' fill='#ef4444' stroke='#991b1b' stroke-width='1.5'/>
  <text x='65' y='72' text-anchor='middle' fill='white' font-size='9'>N</text>
  <text x='65' y='84' text-anchor='middle' fill='white' font-size='9'>S</text>
  <line x1='80' y1='75' x2='135' y2='75' stroke='#ef4444' stroke-width='2.5' marker-end='url(#em1)'/><text x='107' y='68' fill='#ef4444' font-size='10'>pohyb</text>
  <line x1='260' y1='55' x2='310' y2='55' stroke='#374151' stroke-width='2'/><line x1='260' y1='95' x2='310' y2='95' stroke='#374151' stroke-width='2'/>
  <circle cx='335' cy='75' r='22' fill='#eff6ff' stroke='#3b82f6' stroke-width='1.5'/><text x='335' y='79' text-anchor='middle' fill='#1e40af' font-size='10' font-weight='bold'>V</text>
  <line x1='310' y1='55' x2='335' y2='53' stroke='#374151' stroke-width='1.5'/><line x1='310' y1='95' x2='335' y2='97' stroke='#374151' stroke-width='1.5'/>
  <text x='335' y='140' text-anchor='middle' fill='#3b82f6' font-size='10'>indukované U</text>
  <defs><marker id='em1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker></defs>
</svg>`),

'elektrina--stridavy-proud': wrap(`<svg viewBox='0 0 420 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Střídavý proud (AC)</text>
  <line x1='30' y1='70' x2='400' y2='70' stroke='#d1d5db' stroke-width='1'/>
  <line x1='30' y1='30' x2='30' y2='110' stroke='#d1d5db' stroke-width='1'/>
  <path d='M30,70 Q70,20 110,70 Q150,120 190,70 Q230,20 270,70 Q310,120 350,70 Q390,20 400,55' fill='none' stroke='#3b82f6' stroke-width='2.5'/>
  <text x='405' y='75' fill='#374151' font-size='10'>t</text>
  <text x='22' y='30' fill='#374151' font-size='10'>U</text>
  <line x1='70' y1='25' x2='70' y2='70' stroke='#ef4444' stroke-width='1.5' stroke-dasharray='3'/><text x='55' y='50' fill='#ef4444' font-size='9'>U₀</text>
  <text x='200' y='125' text-anchor='middle' fill='#6b7280' font-size='11'>f = 50 Hz, U_ef = 230 V</text>
</svg>`),

'elektrina--transformator': wrap(`<svg viewBox='0 0 420 150' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='210' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Transformátor</text>
  <rect x='160' y='30' width='100' height='100' rx='5' fill='#d1d5db' stroke='#374151' stroke-width='2'/>
  <text x='210' y='85' text-anchor='middle' fill='#374151' font-size='10'>jádro</text>
  ${Array.from({length:4},(_,i)=>`<ellipse cx='${140-i*2}' cy='80' rx='8' ry='35' fill='none' stroke='#3b82f6' stroke-width='2'/>`).join('')}
  ${Array.from({length:7},(_,i)=>`<ellipse cx='${280+i*2}' cy='80' rx='8' ry='35' fill='none' stroke='#ef4444' stroke-width='1.5'/>`).join('')}
  <text x='100' y='130' text-anchor='middle' fill='#3b82f6' font-size='10'>N₁ závitů</text>
  <text x='100' y='142' text-anchor='middle' fill='#3b82f6' font-size='10'>U₁</text>
  <text x='320' y='130' text-anchor='middle' fill='#ef4444' font-size='10'>N₂ závitů</text>
  <text x='320' y='142' text-anchor='middle' fill='#ef4444' font-size='10'>U₂</text>
  <text x='60' y='80' text-anchor='middle' fill='#3b82f6' font-size='11'>~</text>
  <text x='380' y='80' text-anchor='middle' fill='#ef4444' font-size='11'>~</text>
</svg>`),

// ============ MIKROSVĚT ============

'mikrosvet--radioaktivita': wrap(`<svg viewBox='0 0 450 130' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <circle cx='60' cy='65' r='30' fill='#fef3c7' stroke='#f59e0b' stroke-width='2'/><text x='60' y='70' text-anchor='middle' fill='#92400e' font-size='10' font-weight='bold'>jádro</text>
  <line x1='90' y1='55' x2='160' y2='35' stroke='#ef4444' stroke-width='3' marker-end='url(#rd1)'/><text x='170' y='35' fill='#ef4444' font-size='11' font-weight='bold'>α</text><text x='210' y='35' fill='#6b7280' font-size='10'>→ papír zastaví</text>
  <line x1='90' y1='65' x2='200' y2='65' stroke='#3b82f6' stroke-width='2.5' marker-end='url(#rd2)'/><text x='210' y='68' fill='#3b82f6' font-size='11' font-weight='bold'>β</text><text x='250' y='68' fill='#6b7280' font-size='10'>→ hliník zastaví</text>
  <line x1='90' y1='75' x2='250' y2='95' stroke='#8b5cf6' stroke-width='2' stroke-dasharray='4' marker-end='url(#rd3)'/><text x='260' y='98' fill='#8b5cf6' font-size='11' font-weight='bold'>γ</text><text x='290' y='98' fill='#6b7280' font-size='10'>→ olovo/beton</text>
  <defs>
    <marker id='rd1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#ef4444'/></marker>
    <marker id='rd2' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker>
    <marker id='rd3' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='5' markerHeight='5' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#8b5cf6'/></marker>
  </defs>
</svg>`),

'mikrosvet--jaderna-energie': wrap(`<svg viewBox='0 0 450 140' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <text x='225' y='18' text-anchor='middle' font-weight='bold' fill='#1e40af' font-size='13'>Jaderné štěpení</text>
  <circle cx='60' cy='70' r='6' fill='#3b82f6'/><text x='60' y='55' fill='#3b82f6' font-size='9'>n</text>
  <line x1='66' y1='70' x2='95' y2='70' stroke='#3b82f6' stroke-width='2' marker-end='url(#jd1)'/>
  <circle cx='130' cy='70' r='25' fill='#fef3c7' stroke='#f59e0b' stroke-width='2'/><text x='130' y='75' text-anchor='middle' fill='#92400e' font-size='10'>U-235</text>
  <text x='185' y='75' fill='#374151' font-size='20'>→</text>
  <circle cx='230' cy='45' r='18' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='230' y='50' text-anchor='middle' fill='#991b1b' font-size='8'>jádro 1</text>
  <circle cx='240' cy='95' r='15' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='240' y='100' text-anchor='middle' fill='#991b1b' font-size='8'>jádro 2</text>
  <circle cx='280' cy='35' r='5' fill='#3b82f6'/><circle cx='285' cy='65' r='5' fill='#3b82f6'/><circle cx='270' cy='110' r='5' fill='#3b82f6'/>
  <text x='310' y='40' fill='#3b82f6' font-size='9'>neutrony</text>
  <text x='350' y='80' fill='#ef4444' font-size='12' font-weight='bold'>+ ENERGIE</text>
  <text x='350' y='100' fill='#6b7280' font-size='10'>→ řetězová reakce</text>
  <text x='350' y='130' fill='#1e40af' font-size='11'>E = m·c²</text>
  <defs><marker id='jd1' viewBox='0 0 6 6' refX='5' refY='3' markerWidth='4' markerHeight='4' orient='auto'><path d='M0,0 L6,3 L0,6Z' fill='#3b82f6'/></marker></defs>
</svg>`),

// ============ ASTRONOMIE ============

'astronomie--slunecni-soustava': wrap(`<svg viewBox='0 0 480 120' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <circle cx='30' cy='60' r='22' fill='#fef3c7' stroke='#f59e0b' stroke-width='2'/><text x='30' y='65' text-anchor='middle' font-size='12'>☀</text>
  ${[{x:70,r:3,c:'#9ca3af',n:'Me'},{x:95,r:5,c:'#f59e0b',n:'V'},{x:125,r:5,c:'#3b82f6',n:'Z'},{x:155,r:4,c:'#ef4444',n:'Ma'},{x:210,r:14,c:'#f59e0b',n:'Ju'},{x:280,r:12,c:'#eab308',n:'Sa'},{x:340,r:8,c:'#93c5fd',n:'U'},{x:400,r:7,c:'#3b82f6',n:'N'}].map(p=>`<circle cx='${p.x}' cy='60' r='${p.r}' fill='${p.c}' opacity='0.7'/><text x='${p.x}' y='${60+p.r+14}' text-anchor='middle' fill='#374151' font-size='8'>${p.n}</text>`).join('')}
  <circle cx='280' cy='60' rx='12' fill='none' stroke='#eab308' stroke-width='1'/>
  <line x1='265' y1='55' x2='295' y2='55' stroke='#eab308' stroke-width='1.5'/>
  <text x='240' y='110' text-anchor='middle' fill='#6b7280' font-size='9'>kamenné planety | plynní a ledoví obři</text>
  <line x1='180' y1='100' x2='180' y2='95' stroke='#6b7280' stroke-width='1'/>
</svg>`),

'astronomie--vznik-a-zanik-hvezd': wrap(`<svg viewBox='0 0 500 100' xmlns='http://www.w3.org/2000/svg' style='width:100%;font-family:sans-serif'>
  <circle cx='50' cy='50' r='25' fill='#e5e7eb' opacity='0.5'/><text x='50' y='55' text-anchor='middle' fill='#6b7280' font-size='8'>mlhovina</text>
  <text x='90' y='55' fill='#9ca3af' font-size='16'>→</text>
  <circle cx='130' cy='50' r='20' fill='#fef3c7' stroke='#f59e0b' stroke-width='1.5'/><text x='130' y='55' text-anchor='middle' fill='#92400e' font-size='8'>hvězda</text>
  <text x='165' y='55' fill='#9ca3af' font-size='16'>→</text>
  <circle cx='210' cy='50' r='28' fill='#fecaca' stroke='#ef4444' stroke-width='1.5'/><text x='210' y='55' text-anchor='middle' fill='#991b1b' font-size='8'>červený obr</text>
  <text x='250' y='42' fill='#9ca3af' font-size='12'>→</text>
  <text x='250' y='68' fill='#9ca3af' font-size='12'>→</text>
  <circle cx='310' cy='35' r='10' fill='#f3f4f6' stroke='#9ca3af' stroke-width='1.5'/><text x='310' y='39' text-anchor='middle' fill='#6b7280' font-size='7'>bílý trp.</text>
  <text x='340' y='35' fill='#6b7280' font-size='8'>malá ★</text>
  <circle cx='310' cy='70' r='15' fill='#374151'/><text x='310' y='74' text-anchor='middle' fill='#f59e0b' font-size='7'>supernova</text>
  <text x='340' y='65' fill='#374151' font-size='8'>→ neutron. ★</text>
  <text x='340' y='78' fill='#374151' font-size='8'>→ černá díra</text>
  <text x='390' y='78' fill='#6b7280' font-size='8'>velká ★</text>
</svg>`),

};

// -------------------------------------------------------
// MAIN
// -------------------------------------------------------
let updated = 0;
let notFound = 0;

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
      // Append at the end if no <h3>
      content = content + svgHtml;
    }

    data.notebookEntry.content = content;
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    updated++;
    console.log(`✅ ${fileKey}`);
  } catch (err: any) {
    console.error(`❌ ${fileKey}: ${err.message}`);
    notFound++;
  }
}

console.log(`\nDone! Updated: ${updated}, Errors: ${notFound}`);
console.log(`Total diagrams available: ${Object.keys(diagrams).length}`);
