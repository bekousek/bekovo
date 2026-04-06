import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SUBTOPICS_DIR = join(__dirname, '../../src/content/subtopics');

// Map: filename (without .json) → notebookEntry HTML content
const entries: Record<string, string> = {

// ============================================================
// GRADE 6 — VLASTNOSTI LÁTEK
// ============================================================

'vlastnosti-latek--latky-a-telesa': `<h2>Látky a tělesa</h2>
<p><strong>Látka</strong> je to, z čeho je těleso vyrobeno (např. dřevo, železo, sklo).</p>
<p><strong>Těleso</strong> je konkrétní předmět vyrobený z jedné nebo více látek (např. stůl, hřebík, sklenice).</p>
<h3>Rozdělení látek</h3>
<table><thead><tr><th>Skupina</th><th>Příklady</th></tr></thead><tbody>
<tr><td>Pevné látky</td><td>železo, dřevo, sklo, led</td></tr>
<tr><td>Kapaliny</td><td>voda, olej, rtuť</td></tr>
<tr><td>Plyny</td><td>vzduch, kyslík, helium</td></tr>
</tbody></table>
<h3>Vlastnosti látek</h3>
<p>Každá látka má své <strong>fyzikální vlastnosti</strong>: barvu, skupenství, hustotu, tvrdost, vodivost tepla a elektřiny, magnetické vlastnosti.</p>
<p>Podle těchto vlastností můžeme látky rozpoznávat a třídit.</p>`,

'vlastnosti-latek--pevne-latky': `<h2>Pevné látky</h2>
<p><strong>Pevné látky</strong> mají stálý tvar i objem. Částice jsou uspořádány těsně vedle sebe a kmitají kolem svých rovnovážných poloh.</p>
<h3>Rozdělení pevných látek</h3>
<table><thead><tr><th>Typ</th><th>Vlastnosti</th><th>Příklady</th></tr></thead><tbody>
<tr><td>Krystalické</td><td>pravidelné uspořádání částic, ostré hrany</td><td>sůl, diamant, led</td></tr>
<tr><td>Amorfní</td><td>nepravidelné uspořádání částic</td><td>sklo, vosk, pryskyřice</td></tr>
</tbody></table>
<h3>Vlastnosti pevných látek</h3>
<p><strong>Tvrdost</strong> — odolnost proti poškrábání. Nejtvrdší přírodní látka je diamant.</p>
<p><strong>Pružnost</strong> — schopnost vrátit se do původního tvaru po deformaci (pružina, guma).</p>
<p><strong>Křehkost</strong> — látka se při nárazu rozbije (sklo, porcelán).</p>
<p><strong>Tvárnost</strong> — látka se dá ohýbat a tvarovat (měď, hliník).</p>`,

'vlastnosti-latek--kapaliny': `<h2>Kapaliny</h2>
<p><strong>Kapaliny</strong> mají stálý objem, ale <strong>nemají stálý tvar</strong> — přizpůsobují se tvaru nádoby.</p>
<h3>Vlastnosti kapalin</h3>
<p><strong>Tekutost</strong> — kapaliny tečou, protože se jejich částice mohou volně přemísťovat.</p>
<p><strong>Povrchové napětí</strong> — povrch kapaliny se chová jako pružná blána. Díky tomu se např. drží kapka pohromadě nebo se může jehla „položit" na hladinu.</p>
<p><strong>Stlačitelnost</strong> — kapaliny jsou téměř nestlačitelné (využití v hydraulických zařízeních).</p>
<h3>Hladina kapaliny</h3>
<p>Volná hladina kapaliny v klidu je vždy <strong>vodorovná</strong> (kolmá ke směru tíhové síly). Tohoto principu využívá vodováha.</p>
<h3>Příklady kapalin</h3>
<table><thead><tr><th>Kapalina</th><th>Hustota (kg/m³)</th></tr></thead><tbody>
<tr><td>Voda</td><td>1 000</td></tr>
<tr><td>Mléko</td><td>1 030</td></tr>
<tr><td>Olej</td><td>900</td></tr>
<tr><td>Rtuť</td><td>13 546</td></tr>
</tbody></table>`,

'vlastnosti-latek--plyny': `<h2>Plyny</h2>
<p><strong>Plyny</strong> nemají stálý tvar ani stálý objem — vyplní celý prostor, který mají k dispozici.</p>
<h3>Vlastnosti plynů</h3>
<p><strong>Rozpínavost</strong> — plyn se rozšíří do celého dostupného prostoru.</p>
<p><strong>Stlačitelnost</strong> — plyny se dají snadno stlačit (na rozdíl od kapalin a pevných látek).</p>
<p><strong>Tekutost</strong> — plyny proudí podobně jako kapaliny.</p>
<h3>Částicový model plynu</h3>
<p>Částice plynu se pohybují <strong>velkou rychlostí všemi směry</strong> a jsou od sebe daleko. Neustále narážejí do stěn nádoby — tím vytvářejí <strong>tlak</strong>.</p>
<h3>Složení vzduchu</h3>
<table><thead><tr><th>Plyn</th><th>Podíl</th></tr></thead><tbody>
<tr><td>Dusík (N₂)</td><td>78 %</td></tr>
<tr><td>Kyslík (O₂)</td><td>21 %</td></tr>
<tr><td>Argon (Ar)</td><td>0,9 %</td></tr>
<tr><td>Oxid uhličitý (CO₂)</td><td>0,04 %</td></tr>
</tbody></table>`,

'vlastnosti-latek--skupenske-prechody': `<h2>Skupenské přechody</h2>
<p><strong>Skupenský přechod</strong> je změna skupenství látky (pevné ↔ kapalné ↔ plynné).</p>
<h3>Přehled skupenských přechodů</h3>
<table><thead><tr><th>Přechod</th><th>Z → Do</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Tání</td><td>pevná → kapalná</td><td>led → voda</td></tr>
<tr><td>Tuhnutí</td><td>kapalná → pevná</td><td>voda → led</td></tr>
<tr><td>Vypařování</td><td>kapalná → plynná</td><td>voda → vodní pára</td></tr>
<tr><td>Kapalnění</td><td>plynná → kapalná</td><td>pára → kapky</td></tr>
<tr><td>Sublimace</td><td>pevná → plynná</td><td>suchý led, naftalen</td></tr>
<tr><td>Desublimace</td><td>plynná → pevná</td><td>jinovatka</td></tr>
</tbody></table>
<h3>Teplota tání a varu</h3>
<p>Při skupenském přechodu se teplota <strong>nemění</strong>, i když dodáváme teplo.</p>
<table><thead><tr><th>Látka</th><th>Teplota tání (°C)</th><th>Teplota varu (°C)</th></tr></thead><tbody>
<tr><td>Voda</td><td>0</td><td>100</td></tr>
<tr><td>Železo</td><td>1 538</td><td>2 862</td></tr>
<tr><td>Rtuť</td><td>−39</td><td>357</td></tr>
</tbody></table>`,

// ============================================================
// GRADE 6 — ČÁSTICE LÁTKY
// ============================================================

'castice-latky--atom': `<h2>Atom</h2>
<p><strong>Atom</strong> je nejmenší částice chemického prvku, která má jeho vlastnosti.</p>
<h3>Stavba atomu</h3>
<p>Atom se skládá z:</p>
<table><thead><tr><th>Část</th><th>Náboj</th><th>Umístění</th></tr></thead><tbody>
<tr><td>Protony (p⁺)</td><td>kladný (+)</td><td>jádro</td></tr>
<tr><td>Neutrony (n⁰)</td><td>bez náboje</td><td>jádro</td></tr>
<tr><td>Elektrony (e⁻)</td><td>záporný (−)</td><td>obal</td></tr>
</tbody></table>
<p><strong>Jádro</strong> je velmi malé, ale obsahuje téměř celou hmotnost atomu.</p>
<p><strong>Obal</strong> tvoří elektrony, které se pohybují kolem jádra.</p>
<h3>Důležité</h3>
<p>Počet protonů = počet elektronů → atom je elektricky <strong>neutrální</strong>.</p>
<p>Průměr atomu je přibližně $$10^{-10} \\, \\text{m}$$ (0,1 nm).</p>`,

'castice-latky--skaly-castic': `<h2>Škály částic</h2>
<p>Svět kolem nás se skládá z částic různých velikostí — od subatomárních po makroskopické.</p>
<h3>Velikosti částic</h3>
<table><thead><tr><th>Částice</th><th>Velikost</th></tr></thead><tbody>
<tr><td>Proton, neutron</td><td>≈ 10⁻¹⁵ m (1 fm)</td></tr>
<tr><td>Atom</td><td>≈ 10⁻¹⁰ m (0,1 nm)</td></tr>
<tr><td>Molekula vody</td><td>≈ 3 × 10⁻¹⁰ m</td></tr>
<tr><td>Molekula DNA</td><td>≈ 2 nm šířka</td></tr>
<tr><td>Virus</td><td>≈ 100 nm</td></tr>
<tr><td>Červená krvinka</td><td>≈ 7 μm</td></tr>
<tr><td>Zrnko písku</td><td>≈ 1 mm</td></tr>
</tbody></table>
<h3>Předpony jednotek</h3>
<table><thead><tr><th>Předpona</th><th>Symbol</th><th>Násobek</th></tr></thead><tbody>
<tr><td>nano</td><td>n</td><td>10⁻⁹</td></tr>
<tr><td>mikro</td><td>μ</td><td>10⁻⁶</td></tr>
<tr><td>mili</td><td>m</td><td>10⁻³</td></tr>
<tr><td>kilo</td><td>k</td><td>10³</td></tr>
<tr><td>mega</td><td>M</td><td>10⁶</td></tr>
</tbody></table>`,

'castice-latky--casticove-slozeni-latek': `<h2>Částicové složení látek</h2>
<p>Všechny látky se skládají z <strong>částic</strong> — atomů nebo molekul. Částice jsou v neustálém pohybu.</p>
<h3>Látky z hlediska částic</h3>
<table><thead><tr><th>Skupenství</th><th>Uspořádání částic</th><th>Pohyb částic</th></tr></thead><tbody>
<tr><td>Pevné</td><td>těsně u sebe, pravidelně</td><td>kmitají kolem rovnovážných poloh</td></tr>
<tr><td>Kapalné</td><td>blízko u sebe, nepravidelně</td><td>přemisťují se, kloužou po sobě</td></tr>
<tr><td>Plynné</td><td>daleko od sebe</td><td>rychle létají všemi směry</td></tr>
</tbody></table>
<h3>Molekuly a atomy</h3>
<p><strong>Molekula</strong> je částice složená ze dvou nebo více atomů (např. H₂O = 2 atomy vodíku + 1 atom kyslíku).</p>
<p><strong>Prvek</strong> — látka složená z atomů jednoho druhu (kyslík, železo).</p>
<p><strong>Sloučenina</strong> — látka složená z atomů více druhů (voda, sůl).</p>
<h3>Důkazy existence částic</h3>
<p>Brownův pohyb, difuze, rozpouštění látek — to vše dokazuje, že se částice neustále pohybují.</p>`,

'castice-latky--brownuv-pohyb-difuze': `<h2>Brownův pohyb a difuze</h2>
<h3>Brownův pohyb</h3>
<p><strong>Brownův pohyb</strong> je neuspořádaný, neustálý pohyb drobných částeček (např. pylu) v kapalině nebo plynu. Způsobují ho nárazy molekul okolní látky.</p>
<p>Pozoroval ho botanik <strong>Robert Brown</strong> (1827) pod mikroskopem — pylová zrna ve vodě se chaoticky pohybovala.</p>
<h3>Difuze</h3>
<p><strong>Difuze</strong> je samovolné pronikání (mísení) částic jedné látky mezi částice druhé látky.</p>
<h3>Příklady difuze</h3>
<table><thead><tr><th>Prostředí</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Plyny</td><td>vůně parfému se rozšíří po místnosti</td></tr>
<tr><td>Kapaliny</td><td>inkoust se rozptýlí ve vodě</td></tr>
<tr><td>Pevné látky</td><td>pozlacení — atomy zlata proniknou do mědi (velmi pomalé)</td></tr>
</tbody></table>
<h3>Vlastnosti difuze</h3>
<p>Difuze probíhá <strong>rychleji při vyšší teplotě</strong> (částice se pohybují rychleji).</p>
<p>Difuze je nejrychlejší v plynech, pomalejší v kapalinách, nejpomalejší v pevných látkách.</p>`,

// ============================================================
// GRADE 6 — MAGNETISMUS
// ============================================================

'magnetismus--magnety': `<h2>Magnety</h2>
<p><strong>Magnet</strong> je těleso, které přitahuje předměty z feromagnetických materiálů (železo, kobalt, nikl).</p>
<h3>Póly magnetu</h3>
<p>Každý magnet má dva <strong>póly</strong>:</p>
<table><thead><tr><th>Pól</th><th>Značení</th><th>Barva</th></tr></thead><tbody>
<tr><td>Severní</td><td>N (north)</td><td>červená</td></tr>
<tr><td>Jižní</td><td>S (south)</td><td>modrá</td></tr>
</tbody></table>
<h3>Vzájemné působení magnetů</h3>
<p><strong>Souhlasné póly</strong> (N–N, S–S) se <strong>odpuzují</strong>.</p>
<p><strong>Nesouhlasné póly</strong> (N–S) se <strong>přitahují</strong>.</p>
<h3>Magnetické pole</h3>
<p>Kolem magnetu existuje <strong>magnetické pole</strong>. Znázorňujeme ho <strong>magnetickými indukčními čarami</strong> — vycházejí ze severního pólu a vcházejí do jižního.</p>
<h3>Druhy magnetů</h3>
<p><strong>Přírodní</strong> — magnetovec (magnetit).</p>
<p><strong>Umělé</strong> — vyrobené z oceli nebo speciálních slitin (permanentní magnety).</p>`,

'magnetismus--magneticke-pole-zeme': `<h2>Magnetické pole Země</h2>
<p><strong>Země</strong> se chová jako obrovský magnet. Má své magnetické póly, které nespadají přesně se zeměpisnými póly.</p>
<h3>Magnetické póly Země</h3>
<p>Magnetický severní pól Země leží blízko zeměpisného jižního pólu a naopak.</p>
<p>Střelka kompasu ukazuje k <strong>magnetickému severu</strong> (přibližně k zeměpisnému severu).</p>
<h3>Kompas</h3>
<p><strong>Kompas</strong> je přístroj s magnetickou střelkou, která se natáčí ve směru magnetického pole Země.</p>
<p>Slouží k orientaci v terénu — severní konec střelky ukazuje přibližně k zeměpisnému severu.</p>
<h3>Magnetosféra</h3>
<p><strong>Magnetosféra</strong> je oblast kolem Země, kde působí její magnetické pole. Chrání nás před nabitými částicemi ze Slunce (<strong>sluneční vítr</strong>).</p>
<p>Nabité částice zachycené magnetosférou vytvářejí <strong>polární záři</strong>.</p>`,

// ============================================================
// GRADE 6 — ELEKTROSTATIKA
// ============================================================

'elektrostatika--elektricky-naboj': `<h2>Elektrický náboj</h2>
<p><strong>Elektrický náboj</strong> je fyzikální veličina, která popisuje elektrické vlastnosti částic. Značíme ho <strong>Q</strong>, jednotka je <strong>coulomb (C)</strong>.</p>
<h3>Druhy nábojů</h3>
<table><thead><tr><th>Náboj</th><th>Nosič</th><th>Značení</th></tr></thead><tbody>
<tr><td>Kladný (+)</td><td>proton</td><td>Q &gt; 0</td></tr>
<tr><td>Záporný (−)</td><td>elektron</td><td>Q &lt; 0</td></tr>
</tbody></table>
<h3>Elektrování (nabíjení) těles</h3>
<p>Třením můžeme přenést elektrony z jednoho tělesa na druhé:</p>
<p>Těleso, které <strong>ztratí</strong> elektrony → získá kladný náboj.</p>
<p>Těleso, které <strong>získá</strong> elektrony → získá záporný náboj.</p>
<h3>Vzájemné působení nábojů</h3>
<p><strong>Souhlasné náboje</strong> (+ a +, − a −) se <strong>odpuzují</strong>.</p>
<p><strong>Nesouhlasné náboje</strong> (+ a −) se <strong>přitahují</strong>.</p>
<p>Nabitá tělesa přitahují i nenabitá (elektrická indukce).</p>`,

'elektrostatika--ionty': `<h2>Ionty</h2>
<p><strong>Ion</strong> je atom nebo molekula, která má elektrický náboj (ztratila nebo získala elektron).</p>
<h3>Druhy iontů</h3>
<table><thead><tr><th>Ion</th><th>Vznik</th><th>Náboj</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Kation (+)</td><td>atom ztratí elektron</td><td>kladný</td><td>Na⁺, Ca²⁺</td></tr>
<tr><td>Anion (−)</td><td>atom získá elektron</td><td>záporný</td><td>Cl⁻, O²⁻</td></tr>
</tbody></table>
<h3>Kde se ionty vyskytují</h3>
<p><strong>Roztoky</strong> — sůl rozpuštěná ve vodě (NaCl → Na⁺ + Cl⁻). Díky iontům vede slaná voda elektrický proud.</p>
<p><strong>Plyny</strong> — ionizovaný vzduch (blesk, polární záře).</p>
<p><strong>Krystaly</strong> — iontová mřížka (kuchyňská sůl).</p>
<h3>Ionizace</h3>
<p><strong>Ionizace</strong> je proces, při kterém neutrální atom ztrácí nebo získává elektron a stává se iontem. Může být způsobena teplem, zářením nebo elektrickým polem.</p>`,

// ============================================================
// GRADE 6 — MĚŘENÍ
// ============================================================

'mereni--delka': `<h2>Délka</h2>
<p><strong>Délka</strong> je fyzikální veličina, která vyjadřuje vzdálenost mezi dvěma body. Značíme ji <strong>l</strong> (nebo s, d, h).</p>
<h3>Jednotky délky</h3>
<table><thead><tr><th>Jednotka</th><th>Značka</th><th>Převod</th></tr></thead><tbody>
<tr><td>kilometr</td><td>km</td><td>1 km = 1 000 m</td></tr>
<tr><td>metr</td><td>m</td><td>základní jednotka</td></tr>
<tr><td>decimetr</td><td>dm</td><td>1 dm = 0,1 m</td></tr>
<tr><td>centimetr</td><td>cm</td><td>1 cm = 0,01 m</td></tr>
<tr><td>milimetr</td><td>mm</td><td>1 mm = 0,001 m</td></tr>
</tbody></table>
<h3>Měřidla délky</h3>
<p><strong>Pravítko</strong>, metr skládací, krejčovský metr, posuvné měřítko, pásmo, laserový dálkoměr.</p>
<h3>Postup při měření</h3>
<p>1. Zvol vhodné měřidlo. 2. Přilož měřidlo správně (počátek stupnice). 3. Odečti hodnotu kolmo ke stupnici. 4. Zapiš výsledek s jednotkou.</p>`,

'mereni--objem': `<h2>Objem</h2>
<p><strong>Objem</strong> je fyzikální veličina, která vyjadřuje, kolik prostoru těleso zaujímá. Značíme ho <strong>V</strong>.</p>
<h3>Jednotky objemu</h3>
<table><thead><tr><th>Jednotka</th><th>Značka</th><th>Převod</th></tr></thead><tbody>
<tr><td>metr krychlový</td><td>m³</td><td>základní jednotka</td></tr>
<tr><td>decimetr krychlový</td><td>dm³</td><td>1 dm³ = 0,001 m³</td></tr>
<tr><td>centimetr krychlový</td><td>cm³</td><td>1 cm³ = 0,000001 m³</td></tr>
<tr><td>litr</td><td>l</td><td>1 l = 1 dm³</td></tr>
<tr><td>mililitr</td><td>ml</td><td>1 ml = 1 cm³</td></tr>
</tbody></table>
<h3>Měření objemu</h3>
<p><strong>Kapaliny:</strong> odměrný válec — odečítáme na spodním okraji menisku.</p>
<p><strong>Pravidelná tělesa:</strong> výpočet (kvádr: $$V = a \\cdot b \\cdot c$$).</p>
<p><strong>Nepravidelná tělesa:</strong> ponořením do vody v odměrném válci — objem tělesa = rozdíl hladin.</p>`,

'mereni--hmotnost': `<h2>Hmotnost</h2>
<p><strong>Hmotnost</strong> je fyzikální veličina vyjadřující množství látky v tělese. Značíme ji <strong>m</strong>.</p>
<h3>Jednotky hmotnosti</h3>
<table><thead><tr><th>Jednotka</th><th>Značka</th><th>Převod</th></tr></thead><tbody>
<tr><td>tuna</td><td>t</td><td>1 t = 1 000 kg</td></tr>
<tr><td>kilogram</td><td>kg</td><td>základní jednotka</td></tr>
<tr><td>dekagram</td><td>dag</td><td>1 dag = 0,01 kg</td></tr>
<tr><td>gram</td><td>g</td><td>1 g = 0,001 kg</td></tr>
<tr><td>miligram</td><td>mg</td><td>1 mg = 0,000001 kg</td></tr>
</tbody></table>
<h3>Měření hmotnosti</h3>
<p>Hmotnost měříme <strong>váhami</strong> (rovnoramenné, digitální, kuchyňské, laboratorní).</p>
<h3>Důležité</h3>
<p>Hmotnost tělesa se <strong>nemění</strong> s místem — na Zemi i na Měsíci má těleso stejnou hmotnost (ale jinou tíhu!).</p>`,

'mereni--cas': `<h2>Čas</h2>
<p><strong>Čas</strong> je fyzikální veličina vyjadřující dobu trvání děje. Značíme ho <strong>t</strong>.</p>
<h3>Jednotky času</h3>
<table><thead><tr><th>Jednotka</th><th>Značka</th><th>Převod</th></tr></thead><tbody>
<tr><td>hodina</td><td>h</td><td>1 h = 3 600 s</td></tr>
<tr><td>minuta</td><td>min</td><td>1 min = 60 s</td></tr>
<tr><td>sekunda</td><td>s</td><td>základní jednotka</td></tr>
<tr><td>milisekunda</td><td>ms</td><td>1 ms = 0,001 s</td></tr>
</tbody></table>
<h3>Měření času</h3>
<p><strong>Stopky</strong> — měření krátkých dějů (sport, pokusy).</p>
<p><strong>Hodiny</strong> — mechanické, digitální, atomové.</p>
<h3>Perioda</h3>
<p><strong>Perioda T</strong> je doba jednoho kmitu (jednoho opakování děje). Jednotka: sekunda (s).</p>
<div class='formula'>$$f = \\frac{1}{T}$$</div>
<p>kde <strong>f</strong> je frekvence (počet kmitů za sekundu), jednotka: hertz (Hz).</p>`,

'mereni--teplota': `<h2>Teplota</h2>
<p><strong>Teplota</strong> je fyzikální veličina vyjadřující míru „zahřátosti" tělesa. Značíme ji <strong>t</strong> (ve °C) nebo <strong>T</strong> (v kelvinech).</p>
<h3>Teplotní stupnice</h3>
<table><thead><tr><th>Stupnice</th><th>Jednotka</th><th>Bod mrazu vody</th><th>Bod varu vody</th></tr></thead><tbody>
<tr><td>Celsiova</td><td>°C</td><td>0 °C</td><td>100 °C</td></tr>
<tr><td>Kelvinova</td><td>K</td><td>273 K</td><td>373 K</td></tr>
<tr><td>Fahrenheitova</td><td>°F</td><td>32 °F</td><td>212 °F</td></tr>
</tbody></table>
<h3>Převod Celsia ↔ Kelvin</h3>
<div class='formula'>$$T = t + 273$$</div>
<div class='formula'>$$t = T - 273$$</div>
<h3>Měření teploty</h3>
<p><strong>Teploměr</strong> — kapalinový (rtuťový, lihový), digitální, bimetalový.</p>
<p>Princip: látka se při zahřátí <strong>roztahuje</strong> (teplotní roztažnost).</p>
<p><strong>Absolutní nula</strong> = 0 K = −273,15 °C (nejnižší možná teplota, částice se přestanou pohybovat).</p>`,

// ============================================================
// GRADE 6 — ELEKTRICKÉ OBVODY
// ============================================================

'elektricke-obvody--elektricky-obvod': `<h2>Elektrický obvod</h2>
<p><strong>Elektrický obvod</strong> je uzavřená cesta, kterou prochází elektrický proud.</p>
<h3>Základní části obvodu</h3>
<table><thead><tr><th>Součástka</th><th>Značka</th><th>Funkce</th></tr></thead><tbody>
<tr><td>Zdroj napětí</td><td>baterie</td><td>dodává energii</td></tr>
<tr><td>Spotřebič</td><td>žárovka, motor</td><td>přeměňuje el. energii</td></tr>
<tr><td>Vodič</td><td>drát</td><td>propojuje obvod</td></tr>
<tr><td>Spínač</td><td>vypínač</td><td>zapíná/vypíná obvod</td></tr>
</tbody></table>
<h3>Druhy zapojení</h3>
<p><strong>Sériové</strong> — spotřebiče za sebou (proud je všude stejný, napětí se dělí).</p>
<p><strong>Paralelní</strong> — spotřebiče vedle sebe (napětí je všude stejné, proud se dělí).</p>
<h3>Podmínka pro proud</h3>
<p>Proud teče pouze v <strong>uzavřeném</strong> obvodu. Stačí jedno přerušení a proud neprochází.</p>`,

'elektricke-obvody--zkrat': `<h2>Zkrat</h2>
<p><strong>Zkrat</strong> nastane, když se vodiče spojí tak, že proud obchází spotřebič a teče cestou s velmi malým odporem.</p>
<h3>Co se při zkratu děje</h3>
<p>Odpor obvodu prudce klesne → proud mnohonásobně vzroste → vodiče se silně zahřívají → hrozí <strong>požár</strong>.</p>
<h3>Příčiny zkratu</h3>
<table><thead><tr><th>Příčina</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Poškozená izolace</td><td>obnažené vodiče se dotknou</td></tr>
<tr><td>Chybné zapojení</td><td>přímé spojení pólů baterie</td></tr>
<tr><td>Vniknutí vody</td><td>voda je vodivá (obsahuje ionty)</td></tr>
</tbody></table>
<h3>Ochrana proti zkratu</h3>
<p><strong>Pojistka</strong> — při nadměrném proudu se přepálí a přeruší obvod.</p>
<p><strong>Jistič</strong> — automaticky vypne obvod při zkratu (dá se znovu zapnout).</p>`,

'elektricke-obvody--proud-a-napeti': `<h2>Proud a napětí</h2>
<h3>Elektrický proud</h3>
<p><strong>Elektrický proud</strong> je uspořádaný pohyb nabitých částic (elektronů v kovech, iontů v kapalinách). Značíme ho <strong>I</strong>, jednotka: <strong>ampér (A)</strong>.</p>
<h3>Elektrické napětí</h3>
<p><strong>Elektrické napětí</strong> je „síla", která uvádí náboje do pohybu. Značíme ho <strong>U</strong>, jednotka: <strong>volt (V)</strong>.</p>
<h3>Analogie s vodou</h3>
<table><thead><tr><th>Elektřina</th><th>Voda</th></tr></thead><tbody>
<tr><td>Napětí (U)</td><td>výškový rozdíl hladin</td></tr>
<tr><td>Proud (I)</td><td>průtok vody</td></tr>
<tr><td>Odpor (R)</td><td>zúžení potrubí</td></tr>
</tbody></table>
<h3>Ohmův zákon</h3>
<div class='formula'>$$I = \\frac{U}{R}$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>proud</td><td>I</td><td>A (ampér)</td></tr>
<tr><td>napětí</td><td>U</td><td>V (volt)</td></tr>
<tr><td>odpor</td><td>R</td><td>Ω (ohm)</td></tr>
</tbody></table>`,

'elektricke-obvody--multimetr': `<h2>Multimetr</h2>
<p><strong>Multimetr</strong> je univerzální měřicí přístroj, kterým měříme napětí, proud i odpor.</p>
<h3>Měření napětí (voltmetr)</h3>
<p>Zapojujeme <strong>paralelně</strong> ke spotřebiči. Nastavíme rozsah na V (DC pro stejnosměrné, AC pro střídavé).</p>
<h3>Měření proudu (ampérmetr)</h3>
<p>Zapojujeme <strong>sériově</strong> do obvodu (obvod musíme přerušit). Nastavíme rozsah na A nebo mA.</p>
<h3>Měření odporu (ohmmetr)</h3>
<p>Měříme na <strong>odpojeném</strong> prvku (ne v obvodu pod napětím!). Nastavíme rozsah na Ω.</p>
<h3>Pravidla pro měření</h3>
<table><thead><tr><th>Pravidlo</th><th>Důvod</th></tr></thead><tbody>
<tr><td>Začni na největším rozsahu</td><td>ochrana přístroje</td></tr>
<tr><td>Správná polarita (+/−)</td><td>správný směr měření</td></tr>
<tr><td>Nepřipojuj ampérmetr paralelně</td><td>způsobí zkrat!</td></tr>
</tbody></table>`,

'elektricke-obvody--elektromagnet': `<h2>Elektromagnet</h2>
<p><strong>Elektromagnet</strong> je cívka (navinutý vodič), kterou prochází elektrický proud a která vytváří magnetické pole.</p>
<h3>Jak funguje</h3>
<p>Průchodem proudu vodičem vzniká kolem něj magnetické pole. Navinutím vodiče do cívky se pole <strong>zesílí</strong>. Vložením železného jádra se zesílí ještě víc.</p>
<h3>Jak zvýšit sílu elektromagnetu</h3>
<table><thead><tr><th>Způsob</th><th>Vysvětlení</th></tr></thead><tbody>
<tr><td>Zvýšit proud</td><td>silnější magnetické pole</td></tr>
<tr><td>Více závitů cívky</td><td>pole se sčítá</td></tr>
<tr><td>Vložit železné jádro</td><td>železo zesiluje pole</td></tr>
</tbody></table>
<h3>Využití elektromagnetu</h3>
<p>Elektrický zvonek, relé, magnetický jeřáb, reproduktor, elektromotor, magnetická rezonance (MRI).</p>
<h3>Výhoda oproti permanentnímu magnetu</h3>
<p>Elektromagnet můžeme <strong>vypnout</strong> — stačí přerušit proud a magnetické pole zmizí.</p>`,

'elektricke-obvody--bezpecnost-pri-praci-s-elektrinou': `<h2>Bezpečnost při práci s elektřinou</h2>
<p>Elektrický proud procházející tělem je <strong>životu nebezpečný</strong>!</p>
<h3>Účinky proudu na lidské tělo</h3>
<table><thead><tr><th>Proud</th><th>Účinek</th></tr></thead><tbody>
<tr><td>1 mA</td><td>pocit brnění</td></tr>
<tr><td>10 mA</td><td>křeče svalů, nelze se pustit</td></tr>
<tr><td>30 mA</td><td>zástava dechu</td></tr>
<tr><td>100 mA</td><td>zástava srdce</td></tr>
</tbody></table>
<h3>Bezpečné napětí</h3>
<p>Za bezpečné se považuje napětí do <strong>50 V střídavých</strong> nebo <strong>120 V stejnosměrných</strong> (v suchém prostředí).</p>
<p>V domácnosti je napětí <strong>230 V</strong> — velmi nebezpečné!</p>
<h3>Zásady bezpečnosti</h3>
<p>1. Neopravuj elektrická zařízení pod napětím.</p>
<p>2. Nesahej na obnažené vodiče.</p>
<p>3. Nedotýkej se elektrických zařízení mokrýma rukama.</p>
<p>4. Při úrazu elektrickým proudem nejprve <strong>vypni proud</strong>, pak poskytni první pomoc.</p>`,

'elektricke-obvody--vedeni-proudu-v-kapalinach': `<h2>Vedení proudu v kapalinách</h2>
<p>Čisté kapaliny (destilovaná voda) proud téměř <strong>nevedou</strong>. Proud vedou kapaliny obsahující <strong>ionty</strong> — tzv. <strong>elektrolyty</strong>.</p>
<h3>Elektrolýza</h3>
<p><strong>Elektrolýza</strong> je rozklad látky elektrickým proudem. Do elektrolytu ponoříme dvě elektrody připojené ke zdroji.</p>
<table><thead><tr><th>Elektroda</th><th>Pól</th><th>Děj</th></tr></thead><tbody>
<tr><td>Katoda (−)</td><td>záporný</td><td>přitahuje kationty (+)</td></tr>
<tr><td>Anoda (+)</td><td>kladný</td><td>přitahuje anionty (−)</td></tr>
</tbody></table>
<h3>Příklady elektrolýzy</h3>
<p><strong>Pokovování</strong> (galvanické pokrytí) — na předmět se nanese vrstva kovu.</p>
<p><strong>Výroba hliníku</strong> — hliník se získává elektrolýzou z bauxitu.</p>
<p><strong>Rozklad vody</strong> — voda se rozloží na vodík a kyslík.</p>`,

// ============================================================
// GRADE 7 — POHYB
// ============================================================

'pohyb--druhy-pohybu': `<h2>Druhy pohybů</h2>
<p><strong>Mechanický pohyb</strong> je změna polohy tělesa vzhledem k jinému tělesu (vztažnému tělesu) v průběhu času.</p>
<h3>Relativnost pohybu</h3>
<p>Pohyb je <strong>relativní</strong> — závisí na volbě vztažného tělesa. Cestující ve vlaku je v klidu vzhledem k vlaku, ale v pohybu vzhledem k nádraží.</p>
<h3>Rozdělení podle trajektorie</h3>
<table><thead><tr><th>Pohyb</th><th>Trajektorie</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Přímočarý</td><td>přímka</td><td>pád tělesa, jízda po rovné silnici</td></tr>
<tr><td>Křivočarý</td><td>křivka</td><td>hozený míč, jízda v zatáčce</td></tr>
<tr><td>Pohyb po kružnici</td><td>kružnice</td><td>kolotoč, Země kolem Slunce</td></tr>
</tbody></table>
<h3>Rozdělení podle rychlosti</h3>
<p><strong>Rovnoměrný</strong> — rychlost se nemění (konstantní).</p>
<p><strong>Nerovnoměrný</strong> — rychlost se mění (zrychlený nebo zpomalený).</p>`,

'pohyb--grafy': `<h2>Grafy pohybu</h2>
<p>Pohyb tělesa popisujeme pomocí grafů závislosti dráhy na čase a rychlosti na čase.</p>
<h3>Graf závislosti dráhy na čase s = f(t)</h3>
<p><strong>Rovnoměrný pohyb:</strong> graf je <strong>přímka</strong> procházející počátkem — čím strmější, tím větší rychlost.</p>
<p><strong>Klid:</strong> graf je vodorovná přímka (dráha se nemění).</p>
<p><strong>Nerovnoměrný pohyb:</strong> graf je křivka.</p>
<h3>Graf závislosti rychlosti na čase v = f(t)</h3>
<p><strong>Rovnoměrný pohyb:</strong> graf je <strong>vodorovná přímka</strong> (rychlost je konstantní).</p>
<p><strong>Rovnoměrně zrychlený:</strong> graf je přímka stoupající nahoru.</p>
<p><strong>Rovnoměrně zpomalený:</strong> graf je přímka klesající dolů.</p>
<h3>Výpočet dráhy z grafu v(t)</h3>
<p>Dráha se rovná <strong>obsahu plochy</strong> pod grafem rychlosti. U rovnoměrného pohybu je to obdélník:</p>
<div class='formula'>$$s = v \\cdot t$$</div>`,

// ============================================================
// GRADE 7 — SÍLA
// ============================================================

'sila--sila-a-jeji-znazorneni': `<h2>Síla a její znázornění</h2>
<p><strong>Síla</strong> je fyzikální veličina, která popisuje vzájemné působení těles. Značíme ji <strong>F</strong>, jednotka: <strong>newton (N)</strong>.</p>
<h3>Účinky síly</h3>
<p>Síla může těleso: <strong>uvést do pohybu</strong>, <strong>zastavit</strong>, <strong>změnit směr pohybu</strong>, <strong>deformovat</strong>.</p>
<h3>Znázornění síly</h3>
<p>Sílu znázorňujeme <strong>orientovanou úsečkou</strong> (šipkou):</p>
<table><thead><tr><th>Vlastnost</th><th>Co udává</th></tr></thead><tbody>
<tr><td>Počátek (bod)</td><td>působiště síly</td></tr>
<tr><td>Směr šipky</td><td>směr působení</td></tr>
<tr><td>Délka šipky</td><td>velikost síly (měřítko)</td></tr>
</tbody></table>
<h3>Příklady sil</h3>
<p>Tíhová síla, gravitační síla, síla pružnosti, třecí síla, vztlaková síla, magnetická síla, elektrická síla.</p>`,

'sila--silomer': `<h2>Siloměr</h2>
<p><strong>Siloměr</strong> je přístroj na měření síly. Nejčastěji se používá <strong>pružinový siloměr</strong>.</p>
<h3>Princip</h3>
<p>Pružina se natáhne úměrně působící síle. Čím větší síla, tím větší prodloužení pružiny.</p>
<h3>Hookův zákon</h3>
<div class='formula'>$$F = k \\cdot \\Delta l$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>síla</td><td>F</td><td>N</td></tr>
<tr><td>tuhost pružiny</td><td>k</td><td>N/m</td></tr>
<tr><td>prodloužení</td><td>Δl</td><td>m</td></tr>
</tbody></table>
<h3>Postup měření</h3>
<p>1. Zkontroluj, že ukazatel je na nule. 2. Zavěs těleso. 3. Počkej, až se pružina ustálí. 4. Odečti hodnotu kolmo ke stupnici.</p>`,

'sila--skladani-sil': `<h2>Skládání sil</h2>
<p>Pokud na těleso působí více sil, můžeme je nahradit jedinou silou — <strong>výslednicí</strong>.</p>
<h3>Síly stejného směru</h3>
<p>Výslednice = součet sil:</p>
<div class='formula'>$$F = F_1 + F_2$$</div>
<h3>Síly opačného směru</h3>
<p>Výslednice = rozdíl sil (směr větší síly):</p>
<div class='formula'>$$F = F_1 - F_2 \\quad (F_1 > F_2)$$</div>
<h3>Rovnováha sil</h3>
<p>Pokud $$F_1 = F_2$$ a síly mají opačný směr, výslednice je <strong>nulová</strong> — těleso je v rovnováze (zůstává v klidu nebo se pohybuje rovnoměrně).</p>
<h3>Příklad</h3>
<p>Na těleso působí síla F₁ = 8 N doprava a F₂ = 3 N doleva. Jaká je výslednice?</p>
<div class='formula'>$$F = F_1 - F_2 = 8 - 3 = 5 \\, \\text{N (doprava)}$$</div>`,

'sila--newtonovy-zakony': `<h2>Newtonovy pohybové zákony</h2>
<h3>1. Newtonův zákon — zákon setrvačnosti</h3>
<p>Těleso setrvává v klidu nebo v rovnoměrném přímočarém pohybu, pokud na něj nepůsobí žádná síla (nebo je výslednice sil nulová).</p>
<p><em>Příklad: cestující v brzdícím autobuse se naklání dopředu.</em></p>
<h3>2. Newtonův zákon — zákon síly</h3>
<div class='formula'>$$F = m \\cdot a$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>síla</td><td>F</td><td>N</td></tr>
<tr><td>hmotnost</td><td>m</td><td>kg</td></tr>
<tr><td>zrychlení</td><td>a</td><td>m/s²</td></tr>
</tbody></table>
<p>Zrychlení tělesa je přímo úměrné síle a nepřímo úměrné hmotnosti.</p>
<h3>3. Newtonův zákon — zákon akce a reakce</h3>
<p>Každá síla (akce) vyvolá stejně velkou sílu opačného směru (reakci).</p>
<p><em>Příklad: raketa — plyny letí dozadu, raketa dopředu.</em></p>`,

'sila--jednoduche-stroje': `<h2>Jednoduché stroje</h2>
<p><strong>Jednoduchý stroj</strong> usnadňuje práci — zmenšuje potřebnou sílu (ale zvětšuje dráhu).</p>
<h3>Přehled jednoduchých strojů</h3>
<table><thead><tr><th>Stroj</th><th>Princip</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Páka</td><td>otáčení kolem osy</td><td>kleště, nůžky, kolečko</td></tr>
<tr><td>Kladka pevná</td><td>mění směr síly</td><td>vlajkový stožár</td></tr>
<tr><td>Kladka volná</td><td>zmenšuje sílu na polovinu</td><td>stavební jeřáb</td></tr>
<tr><td>Nakloněná rovina</td><td>zmenšuje sílu</td><td>rampa, šroub, klín</td></tr>
<tr><td>Kolo na hřídeli</td><td>zvětšuje sílu</td><td>klika, volant</td></tr>
</tbody></table>
<h3>Zákon páky</h3>
<div class='formula'>$$F_1 \\cdot a_1 = F_2 \\cdot a_2$$</div>
<p>kde a₁, a₂ jsou ramena sil (vzdálenosti od osy otáčení).</p>
<h3>Zlaté pravidlo mechaniky</h3>
<p>Co ušetříme na síle, musíme vynaložit na dráze. Práce zůstává stejná.</p>`,

// ============================================================
// GRADE 7 — KAPALINY
// ============================================================

'kapaliny-7--pascaluv-zakon': `<h2>Pascalův zákon</h2>
<p><strong>Pascalův zákon:</strong> Tlak vyvolaný vnější silou na kapalinu v uzavřené nádobě se šíří <strong>rovnoměrně všemi směry</strong>.</p>
<h3>Hydraulické zařízení</h3>
<p>Využívá Pascalova zákona — malou silou na malý píst vytvoříme velkou sílu na velkém pístu.</p>
<div class='formula'>$$\\frac{F_1}{S_1} = \\frac{F_2}{S_2}$$</div>
<table><thead><tr><th>Veličina</th><th>Popis</th></tr></thead><tbody>
<tr><td>F₁</td><td>síla na malém pístu</td></tr>
<tr><td>S₁</td><td>obsah malého pístu</td></tr>
<tr><td>F₂</td><td>síla na velkém pístu</td></tr>
<tr><td>S₂</td><td>obsah velkého pístu</td></tr>
</tbody></table>
<h3>Příklad</h3>
<p>Malý píst má obsah 5 cm², velký píst 200 cm². Na malý píst tlačíme silou 50 N. Jaká síla vznikne na velkém pístu?</p>
<div class='formula'>$$F_2 = F_1 \\cdot \\frac{S_2}{S_1} = 50 \\cdot \\frac{200}{5} = 2000 \\, \\text{N}$$</div>
<h3>Využití</h3>
<p>Hydraulický lis, hydraulické brzdy, zvedák v autoservisu.</p>`,

'kapaliny-7--hydrostaticky-tlak': `<h2>Hydrostatický tlak</h2>
<p><strong>Hydrostatický tlak</strong> je tlak, který vytváří kapalina svou vlastní tíhou.</p>
<h3>Vzorec</h3>
<div class='formula'>$$p_h = h \\cdot \\rho \\cdot g$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>hydrostatický tlak</td><td>p<sub>h</sub></td><td>Pa</td></tr>
<tr><td>hloubka</td><td>h</td><td>m</td></tr>
<tr><td>hustota kapaliny</td><td>ρ</td><td>kg/m³</td></tr>
<tr><td>tíhové zrychlení</td><td>g</td><td>m/s² (≈ 10)</td></tr>
</tbody></table>
<h3>Vlastnosti</h3>
<p>Hydrostatický tlak <strong>roste s hloubkou</strong> a závisí na hustotě kapaliny. Nezávisí na tvaru nádoby!</p>
<h3>Příklad</h3>
<p>Jaký je hydrostatický tlak v hloubce 5 m ve vodě?</p>
<div class='formula'>$$p_h = h \\cdot \\rho \\cdot g = 5 \\cdot 1000 \\cdot 10 = 50\\,000 \\, \\text{Pa} = 50 \\, \\text{kPa}$$</div>`,

'kapaliny-7--spojene-nadoby': `<h2>Spojené nádoby</h2>
<p><strong>Spojené nádoby</strong> jsou nádoby propojené u dna.</p>
<h3>Zákon spojených nádob</h3>
<p>V spojených nádobách se <strong>stejná kapalina</strong> ustálí ve <strong>stejné výšce</strong>, bez ohledu na tvar nádob.</p>
<p>Důvod: hydrostatický tlak na dně musí být ve všech ramenech stejný.</p>
<h3>Různé kapaliny</h3>
<p>Pokud jsou v ramenech <strong>různé kapaliny</strong>, ustálí se v různých výškách — lehčí kapalina stoupne výše.</p>
<div class='formula'>$$h_1 \\cdot \\rho_1 = h_2 \\cdot \\rho_2$$</div>
<h3>Využití</h3>
<p><strong>Vodováha</strong> — hladina je vždy vodorovná.</p>
<p><strong>Vodovod</strong> — voda teče z výše položené nádrže samospádem.</p>
<p><strong>Fontána</strong> — voda stoupá do výšky hladiny v zásobníku.</p>
<p><strong>Plavební komora</strong> — vyrovnává hladiny pro lodě.</p>`,

'kapaliny-7--lode': `<h2>Lodě</h2>
<p>Loď plove, protože <strong>vztlaková síla</strong> vody se rovná <strong>tíhové síle</strong> lodi.</p>
<h3>Proč plove ocelová loď</h3>
<p>Loď má velký objem (dutý trup) → vytlačí velké množství vody → vztlaková síla je dostatečná, i když ocel je hustší než voda.</p>
<h3>Ponor a nosnost</h3>
<p><strong>Ponor</strong> — hloubka, do které je loď ponořená.</p>
<p><strong>Výtlak</strong> — hmotnost vody, kterou loď vytlačí (rovná se hmotnosti lodi s nákladem).</p>
<p><strong>Čára ponoru</strong> (Plimsollova značka) — vyznačuje maximální bezpečný ponor.</p>
<h3>Ponorka</h3>
<p>Ponorka reguluje svůj ponor pomocí <strong>balastních nádrží</strong>:</p>
<p>Napuštění vodou → ponorka klesá (hustota roste).</p>
<p>Vypuštění vodou a naplnění vzduchem → ponorka stoupá.</p>`,

// ============================================================
// GRADE 7 — PLYNY
// ============================================================

'plyny-7--atmosfera': `<h2>Atmosféra</h2>
<p><strong>Atmosféra</strong> je plynný obal Země. Sahá přibližně do výšky 100 km (u povrchu je nejhustší).</p>
<h3>Atmosférický tlak</h3>
<p><strong>Atmosférický tlak</strong> je tlak vzduchu na zemský povrch. Způsobuje ho tíha vzduchového sloupce.</p>
<div class='formula'>$$p_0 \\approx 101\\,325 \\, \\text{Pa} \\approx 1013 \\, \\text{hPa}$$</div>
<p>To je normální atmosférický tlak (na hladině moře, při 0 °C).</p>
<h3>Torricelliho pokus (1643)</h3>
<p>Skleněná trubice naplněná rtutí, obrácená do misky se rtutí. Rtuť klesne na výšku <strong>760 mm</strong> — to odpovídá tlaku atmosféry.</p>
<h3>Změny atmosférického tlaku</h3>
<table><thead><tr><th>Faktor</th><th>Vliv</th></tr></thead><tbody>
<tr><td>Nadmořská výška</td><td>čím výše, tím nižší tlak</td></tr>
<tr><td>Teplota</td><td>teplý vzduch stoupá → nižší tlak</td></tr>
<tr><td>Počasí</td><td>tlaková výše = hezky, tlaková níže = déšť</td></tr>
</tbody></table>
<p>Měříme <strong>barometrem</strong> (rtuťový, aneroid).</p>`,

'plyny-7--vakuum': `<h2>Vakuum</h2>
<p><strong>Vakuum</strong> je prostor, ve kterém je tlak výrazně nižší než atmosférický tlak. Dokonalé vakuum (úplná prázdnota) v praxi neexistuje.</p>
<h3>Magdeburské polokoule (1654)</h3>
<p>Otto von Guericke přiložil dvě kovové polokoule k sobě a vyčerpal z nich vzduch. Ani 16 koní je nedokázalo roztrhnout — atmosférický tlak je přitiskl k sobě.</p>
<h3>Stupně vakua</h3>
<table><thead><tr><th>Stupeň</th><th>Tlak</th><th>Využití</th></tr></thead><tbody>
<tr><td>Nízké vakuum</td><td>300–1 hPa</td><td>vysavač</td></tr>
<tr><td>Střední vakuum</td><td>1–10⁻³ hPa</td><td>žárovky</td></tr>
<tr><td>Vysoké vakuum</td><td>&lt; 10⁻³ hPa</td><td>elektronové mikroskopy</td></tr>
</tbody></table>
<h3>Využití vakua</h3>
<p>Termoska (izoluje teplo), vakuové balení potravin, výroba elektroniky, kosmický výzkum.</p>`,

'plyny-7--vztlak-v-plynech': `<h2>Vztlak v plynech</h2>
<p>Archimédův zákon platí i pro plyny — těleso ponořené v plynu je nadlehčováno vztlakovou silou.</p>
<h3>Vzorec</h3>
<div class='formula'>$$F_{vz} = V \\cdot \\rho_{vzduchu} \\cdot g$$</div>
<p>kde ρ<sub>vzduchu</sub> ≈ 1,29 kg/m³.</p>
<h3>Kdy těleso stoupá ve vzduchu</h3>
<p>Když je <strong>hustota tělesa menší než hustota okolního vzduchu</strong> → vztlaková síla je větší než tíhová síla.</p>
<h3>Balóny</h3>
<table><thead><tr><th>Typ</th><th>Princip</th></tr></thead><tbody>
<tr><td>Horkovzdušný balón</td><td>teplý vzduch je lehčí (menší hustota)</td></tr>
<tr><td>Héliový balón</td><td>helium je lehčí než vzduch</td></tr>
<tr><td>Vzducholoď</td><td>helium + motory pro řízení</td></tr>
</tbody></table>
<h3>Příklad</h3>
<p>Balón o objemu 2 000 m³. Jaká je vztlaková síla ve vzduchu?</p>
<div class='formula'>$$F_{vz} = V \\cdot \\rho \\cdot g = 2000 \\cdot 1{,}29 \\cdot 10 = 25\\,800 \\, \\text{N}$$</div>`,

// ============================================================
// GRADE 7 — OPTIKA
// ============================================================

'optika--svetlo': `<h2>Světlo</h2>
<p><strong>Světlo</strong> je elektromagnetické vlnění, které vnímáme zrakem. Šíří se přímočaře obrovskou rychlostí.</p>
<h3>Rychlost světla</h3>
<div class='formula'>$$c \\approx 300\\,000 \\, \\text{km/s} = 3 \\times 10^8 \\, \\text{m/s}$$</div>
<h3>Zdroje světla</h3>
<p><strong>Přirozené:</strong> Slunce, hvězdy, oheň, blesk.</p>
<p><strong>Umělé:</strong> žárovka, LED, laser, zářivka.</p>
<h3>Šíření světla</h3>
<p>Světlo se šíří <strong>přímočaře</strong> v průhledném stejnorodém prostředí → vznikají <strong>stíny</strong>.</p>
<table><thead><tr><th>Prostředí</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Průhledné</td><td>sklo, vzduch, voda</td></tr>
<tr><td>Průsvitné</td><td>matné sklo, papír</td></tr>
<tr><td>Neprůhledné</td><td>kov, dřevo, kámen</td></tr>
</tbody></table>
<h3>Světelný rok</h3>
<p>Vzdálenost, kterou světlo urazí za 1 rok: přibližně $$9{,}46 \\times 10^{12} \\, \\text{km}$$.</p>`,

'optika--faze-mesice-zatmeni': `<h2>Fáze Měsíce a zatmění</h2>
<h3>Fáze Měsíce</h3>
<p>Měsíc sám nesvítí — odráží sluneční světlo. Jak obíhá kolem Země, vidíme různě osvětlenou část.</p>
<table><thead><tr><th>Fáze</th><th>Vzhled</th><th>Doba</th></tr></thead><tbody>
<tr><td>Nov</td><td>Měsíc nevidíme</td><td>den 0</td></tr>
<tr><td>První čtvrť</td><td>pravá polovina svítí</td><td>~7. den</td></tr>
<tr><td>Úplněk</td><td>celý Měsíc svítí</td><td>~14. den</td></tr>
<tr><td>Poslední čtvrť</td><td>levá polovina svítí</td><td>~21. den</td></tr>
</tbody></table>
<p>Celý cyklus trvá přibližně <strong>29,5 dne</strong> (synodický měsíc).</p>
<h3>Zatmění Slunce</h3>
<p>Měsíc se dostane mezi Zemi a Slunce a zakryje sluneční disk. Nastává vždy při <strong>novu</strong>.</p>
<h3>Zatmění Měsíce</h3>
<p>Země se dostane mezi Slunce a Měsíc — Měsíc vstoupí do stínu Země. Nastává při <strong>úplňku</strong>.</p>`,

'optika--zrcadla-zakon-odrazu': `<h2>Zrcadla a zákon odrazu</h2>
<h3>Zákon odrazu</h3>
<p><strong>Úhel odrazu</strong> se rovná <strong>úhlu dopadu</strong>. Odražený paprsek leží v rovině dopadu.</p>
<div class='formula'>$$\\alpha' = \\alpha$$</div>
<p>kde α je úhel dopadu a α' je úhel odrazu (měřeno od kolmice).</p>
<h3>Rovinné zrcadlo</h3>
<p>Vytváří <strong>zdánlivý, vzpřímený</strong> obraz stejné velikosti. Obraz je za zrcadlem ve stejné vzdálenosti jako předmět před ním. Obraz je <strong>stranově převrácený</strong>.</p>
<h3>Duté (konkávní) zrcadlo</h3>
<p>Paprsky se po odrazu <strong>sbíhají</strong> v ohnisku. Vytváří skutečný obraz (převrácený, zmenšený/zvětšený). Využití: reflektor, zubařské zrcátko.</p>
<h3>Vypuklé (konvexní) zrcadlo</h3>
<p>Paprsky se po odrazu <strong>rozbíhají</strong>. Vytváří zdánlivý, vzpřímený, zmenšený obraz. Využití: zpětné zrcátko, bezpečnostní zrcadla.</p>`,

'optika--cocky-zakon-lomu': `<h2>Čočky a zákon lomu</h2>
<h3>Zákon lomu (Snellův zákon)</h3>
<p>Při přechodu světla z jednoho prostředí do jiného se paprsek <strong>láme</strong> (mění směr).</p>
<p>Z řidšího do hustšího prostředí → paprsek se láme <strong>ke kolmici</strong>.</p>
<p>Z hustšího do řidšího → paprsek se láme <strong>od kolmice</strong>.</p>
<h3>Druhy čoček</h3>
<table><thead><tr><th>Čočka</th><th>Tvar</th><th>Účinek</th><th>Obraz</th></tr></thead><tbody>
<tr><td>Spojka (+)</td><td>uprostřed tlustší</td><td>sbíhá paprsky</td><td>skutečný nebo zdánlivý</td></tr>
<tr><td>Rozptylka (−)</td><td>uprostřed tenčí</td><td>rozbíhá paprsky</td><td>vždy zdánlivý, zmenšený</td></tr>
</tbody></table>
<h3>Ohnisková vzdálenost</h3>
<div class='formula'>$$D = \\frac{1}{f}$$</div>
<p>kde D je optická mohutnost (dioptrie, dpt) a f je ohnisková vzdálenost (m).</p>`,

'optika--oko': `<h2>Oko</h2>
<p><strong>Oko</strong> je smyslový orgán pro vnímání světla. Funguje jako optický přístroj — čočka vytváří obraz na sítnici.</p>
<h3>Stavba oka</h3>
<table><thead><tr><th>Část</th><th>Funkce</th></tr></thead><tbody>
<tr><td>Rohovka</td><td>průhledná vrstva, láme světlo</td></tr>
<tr><td>Duhovka (iris)</td><td>reguluje množství světla (zornice)</td></tr>
<tr><td>Čočka</td><td>zaostřuje obraz na sítnici</td></tr>
<tr><td>Sítnice</td><td>obsahuje světločivné buňky (tyčinky, čípky)</td></tr>
<tr><td>Zrakový nerv</td><td>přenáší signál do mozku</td></tr>
</tbody></table>
<h3>Akomodace</h3>
<p><strong>Akomodace</strong> je schopnost oka měnit zakřivení čočky a zaostřovat na různé vzdálenosti.</p>
<h3>Oční vady</h3>
<table><thead><tr><th>Vada</th><th>Problém</th><th>Korekce</th></tr></thead><tbody>
<tr><td>Krátkozrakost</td><td>vidí špatně do dálky</td><td>rozptylka (−)</td></tr>
<tr><td>Dalekozrakost</td><td>vidí špatně na blízko</td><td>spojka (+)</td></tr>
</tbody></table>`,

'optika--opticke-pristroje': `<h2>Optické přístroje</h2>
<p>Optické přístroje využívají čočky a zrcadla k <strong>zvětšení</strong> nebo <strong>přiblížení</strong> obrazu.</p>
<h3>Přehled optických přístrojů</h3>
<table><thead><tr><th>Přístroj</th><th>Princip</th><th>Využití</th></tr></thead><tbody>
<tr><td>Lupa</td><td>spojka, zvětšený zdánlivý obraz</td><td>čtení drobného textu</td></tr>
<tr><td>Mikroskop</td><td>dvě spojky (objektiv + okulár)</td><td>pozorování malých objektů</td></tr>
<tr><td>Dalekohled</td><td>objektiv + okulár</td><td>pozorování vzdálených objektů</td></tr>
<tr><td>Fotoaparát</td><td>spojka vytváří obraz na snímači</td><td>zachycení obrazu</td></tr>
<tr><td>Projektor</td><td>silný zdroj + spojka</td><td>promítání obrazu</td></tr>
</tbody></table>
<h3>Zvětšení lupy</h3>
<div class='formula'>$$Z = \\frac{d}{f}$$</div>
<p>kde d = konvenční zraková vzdálenost (25 cm) a f = ohnisková vzdálenost lupy.</p>`,

'optika--barvy': `<h2>Barvy</h2>
<p><strong>Bílé světlo</strong> je směsí všech barev viditelného spektra. Můžeme je rozložit pomocí <strong>hranolu</strong> na jednotlivé barvy.</p>
<h3>Spektrum viditelného světla</h3>
<table><thead><tr><th>Barva</th><th>Vlnová délka (nm)</th></tr></thead><tbody>
<tr><td>Červená</td><td>620–750</td></tr>
<tr><td>Oranžová</td><td>590–620</td></tr>
<tr><td>Žlutá</td><td>570–590</td></tr>
<tr><td>Zelená</td><td>495–570</td></tr>
<tr><td>Modrá</td><td>450–495</td></tr>
<tr><td>Fialová</td><td>380–450</td></tr>
</tbody></table>
<h3>Barva předmětů</h3>
<p>Předmět má tu barvu, kterou <strong>odráží</strong>. Ostatní barvy pohlcuje. Bílý předmět odráží všechny barvy, černý je pohlcuje.</p>
<h3>Míchání barev</h3>
<p><strong>Aditivní</strong> (světla): červená + zelená + modrá = bílá (RGB — displeje).</p>
<p><strong>Subtraktivní</strong> (pigmenty): azurová + purpurová + žlutá = černá (CMYK — tisk).</p>
<h3>Duha</h3>
<p>Vzniká rozkladem slunečního světla na kapkách vody v atmosféře.</p>`,

// ============================================================
// GRADE 8 — MECHANIKA
// ============================================================

'mechanika--prace': `<h2>Práce</h2>
<p><strong>Mechanická práce</strong> se koná, když síla působí na těleso a těleso se posouvá ve směru síly.</p>
<h3>Vzorec</h3>
<div class='formula'>$$W = F \\cdot s$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>práce</td><td>W</td><td>J (joule)</td></tr>
<tr><td>síla</td><td>F</td><td>N</td></tr>
<tr><td>dráha</td><td>s</td><td>m</td></tr>
</tbody></table>
<h3>Jednotky práce</h3>
<p>1 J = 1 N · 1 m, 1 kJ = 1 000 J, 1 MJ = 1 000 000 J</p>
<h3>Kdy se práce nekoná</h3>
<p>Síla působí, ale těleso se nepohybuje (držíme tašku). Těleso se pohybuje, ale ne ve směru síly (nesení tašky vodorovně).</p>
<h3>Příklad</h3>
<p>Jakou práci vykonáme, když zvedneme krabici o hmotnosti 20 kg do výšky 1,5 m?</p>
<div class='formula'>$$F = m \\cdot g = 20 \\cdot 10 = 200 \\, \\text{N}$$</div>
<div class='formula'>$$W = F \\cdot s = 200 \\cdot 1{,}5 = 300 \\, \\text{J}$$</div>`,

'mechanika--prace-na-jednoduchych-strojich': `<h2>Práce na jednoduchých strojích</h2>
<p>Jednoduché stroje <strong>nezmenšují</strong> vykonanou práci — jen mění poměr síly a dráhy.</p>
<h3>Zlaté pravidlo mechaniky</h3>
<div class='formula'>$$F_1 \\cdot s_1 = F_2 \\cdot s_2$$</div>
<p>Menší silou musíme působit na delší dráze. Celková práce je stejná.</p>
<h3>Nakloněná rovina</h3>
<div class='formula'>$$F = G \\cdot \\frac{h}{l}$$</div>
<p>kde h je výška, l je délka rampy. Čím delší rampa, tím menší potřebná síla.</p>
<h3>Kladkostroj</h3>
<p>Kombinace pevných a volných kladek. Síla se zmenší podle počtu nosných lan:</p>
<div class='formula'>$$F = \\frac{G}{n}$$</div>
<p>kde n je počet nosných lan. Ale lano musíme vytáhnout n-krát delší.</p>
<h3>Příklad</h3>
<p>Po nakloněné rovině dlouhé 4 m vytlačíme sud o tíze 600 N do výšky 1 m. Jakou silou?</p>
<div class='formula'>$$F = G \\cdot \\frac{h}{l} = 600 \\cdot \\frac{1}{4} = 150 \\, \\text{N}$$</div>`,

'mechanika--vykon': `<h2>Výkon</h2>
<p><strong>Výkon</strong> vyjadřuje, jak rychle se koná práce (jaká práce se vykoná za jednotku času).</p>
<h3>Vzorec</h3>
<div class='formula'>$$P = \\frac{W}{t}$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>výkon</td><td>P</td><td>W (watt)</td></tr>
<tr><td>práce</td><td>W</td><td>J</td></tr>
<tr><td>čas</td><td>t</td><td>s</td></tr>
</tbody></table>
<h3>Jednotky výkonu</h3>
<table><thead><tr><th>Jednotka</th><th>Převod</th></tr></thead><tbody>
<tr><td>1 W</td><td>1 J/s</td></tr>
<tr><td>1 kW</td><td>1 000 W</td></tr>
<tr><td>1 MW</td><td>1 000 000 W</td></tr>
<tr><td>1 k (kůň)</td><td>≈ 735 W</td></tr>
</tbody></table>
<h3>Příklad</h3>
<p>Jeřáb zvedne náklad o hmotnosti 500 kg do výšky 12 m za 20 s. Jaký je výkon?</p>
<div class='formula'>$$W = F \\cdot s = m \\cdot g \\cdot h = 500 \\cdot 10 \\cdot 12 = 60\\,000 \\, \\text{J}$$</div>
<div class='formula'>$$P = \\frac{W}{t} = \\frac{60\\,000}{20} = 3\\,000 \\, \\text{W} = 3 \\, \\text{kW}$$</div>`,

// ============================================================
// GRADE 8 — ENERGIE
// ============================================================

'energie--energie': `<h2>Energie</h2>
<p><strong>Energie</strong> je schopnost tělesa konat práci. Značíme ji <strong>E</strong>, jednotka: <strong>joule (J)</strong>.</p>
<h3>Druhy mechanické energie</h3>
<h3>Polohová (potenciální) energie</h3>
<div class='formula'>$$E_p = m \\cdot g \\cdot h$$</div>
<p>Závisí na hmotnosti a výšce tělesa nad povrchem.</p>
<h3>Pohybová (kinetická) energie</h3>
<div class='formula'>$$E_k = \\frac{1}{2} m \\cdot v^2$$</div>
<p>Závisí na hmotnosti a rychlosti tělesa.</p>
<h3>Zákon zachování energie</h3>
<p>Energie nevzniká ani nezaniká — pouze se <strong>přeměňuje</strong> z jedné formy na jinou.</p>
<h3>Příklady přeměn</h3>
<table><thead><tr><th>Přeměna</th><th>Příklad</th></tr></thead><tbody>
<tr><td>E<sub>p</sub> → E<sub>k</sub></td><td>padající míč</td></tr>
<tr><td>E<sub>k</sub> → teplo</td><td>brzdění auta</td></tr>
<tr><td>chemická → E<sub>k</sub></td><td>motor spaluje benzín</td></tr>
<tr><td>elektrická → světlo</td><td>žárovka</td></tr>
</tbody></table>`,

'energie--ucinnost': `<h2>Účinnost</h2>
<p><strong>Účinnost</strong> vyjadřuje, jaká část dodané energie se přemění na užitečnou práci (energii).</p>
<h3>Vzorec</h3>
<div class='formula'>$$\\eta = \\frac{W_{užitečná}}{W_{dodaná}} \\cdot 100 \\, \\%$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>účinnost</td><td>η (éta)</td><td>% (nebo bezrozměrné číslo)</td></tr>
<tr><td>užitečná práce</td><td>W<sub>už</sub></td><td>J</td></tr>
<tr><td>dodaná práce</td><td>W<sub>dod</sub></td><td>J</td></tr>
</tbody></table>
<h3>Účinnost je vždy menší než 100 %</h3>
<p>Část energie se vždy přemění na <strong>teplo</strong> (tření, odpor vzduchu).</p>
<h3>Účinnosti vybraných strojů</h3>
<table><thead><tr><th>Stroj</th><th>Účinnost</th></tr></thead><tbody>
<tr><td>Elektromotor</td><td>80–95 %</td></tr>
<tr><td>Dieselový motor</td><td>30–45 %</td></tr>
<tr><td>Benzínový motor</td><td>20–35 %</td></tr>
<tr><td>Parní stroj</td><td>10–20 %</td></tr>
<tr><td>Žárovka</td><td>5 %</td></tr>
<tr><td>LED</td><td>30–50 %</td></tr>
</tbody></table>`,

'energie--teplo-a-jeho-sireni': `<h2>Teplo a jeho šíření</h2>
<p><strong>Teplo (Q)</strong> je energie, která přechází z teplejšího tělesa na chladnější. Jednotka: <strong>joule (J)</strong>.</p>
<h3>Vzorec</h3>
<div class='formula'>$$Q = m \\cdot c \\cdot \\Delta t$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>teplo</td><td>Q</td><td>J</td></tr>
<tr><td>hmotnost</td><td>m</td><td>kg</td></tr>
<tr><td>měrná tepelná kapacita</td><td>c</td><td>J/(kg·°C)</td></tr>
<tr><td>změna teploty</td><td>Δt</td><td>°C</td></tr>
</tbody></table>
<h3>Měrná tepelná kapacita</h3>
<table><thead><tr><th>Látka</th><th>c [J/(kg·°C)]</th></tr></thead><tbody>
<tr><td>Voda</td><td>4 180</td></tr>
<tr><td>Železo</td><td>450</td></tr>
<tr><td>Měď</td><td>383</td></tr>
<tr><td>Vzduch</td><td>1 005</td></tr>
</tbody></table>
<h3>Způsoby šíření tepla</h3>
<p><strong>Vedení</strong> — v pevných látkách (kov, vaření na sporáku).</p>
<p><strong>Proudění</strong> — v kapalinách a plynech (ohřev vody, topení).</p>
<p><strong>Záření</strong> — i vakuem (Slunce → Země).</p>`,

// ============================================================
// GRADE 8 — SKUPENSTVÍ LÁTEK
// ============================================================

'skupenstvi-latek--zmeny-skupenstvi-latek': `<h2>Změny skupenství látek</h2>
<p>Při dodávání nebo odebírání tepla se může změnit skupenství látky.</p>
<h3>Tání a tuhnutí</h3>
<p><strong>Tání</strong> — pevná → kapalná (led → voda při 0 °C). Potřebuje teplo.</p>
<p><strong>Tuhnutí</strong> — kapalná → pevná (voda → led). Uvolňuje teplo.</p>
<p>Při tání i tuhnutí je teplota <strong>konstantní</strong> (teplota tání).</p>
<h3>Vypařování a var</h3>
<p><strong>Vypařování</strong> — probíhá z povrchu kapaliny při jakékoliv teplotě.</p>
<p><strong>Var</strong> — probíhá v celém objemu kapaliny při teplotě varu (100 °C pro vodu při normálním tlaku).</p>
<h3>Kapalnění (kondenzace)</h3>
<p>Plyn → kapalina. Uvolňuje teplo. Příklad: rosa, mlha, kapky na studeném skle.</p>
<h3>Sublimace a desublimace</h3>
<p><strong>Sublimace:</strong> pevná → plynná (suchý led, naftalen). <strong>Desublimace:</strong> plynná → pevná (jinovatka, námraza).</p>`,

'skupenstvi-latek--skupenske-teplo': `<h2>Skupenské teplo</h2>
<p><strong>Skupenské teplo</strong> je energie potřebná ke změně skupenství látky <strong>bez změny teploty</strong>.</p>
<h3>Skupenské teplo tání</h3>
<div class='formula'>$$Q_t = m \\cdot l_t$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>skupenské teplo tání</td><td>Q<sub>t</sub></td><td>J</td></tr>
<tr><td>hmotnost</td><td>m</td><td>kg</td></tr>
<tr><td>měrné skupenské teplo tání</td><td>l<sub>t</sub></td><td>J/kg</td></tr>
</tbody></table>
<h3>Skupenské teplo varu</h3>
<div class='formula'>$$Q_v = m \\cdot l_v$$</div>
<h3>Hodnoty měrného skupenského tepla</h3>
<table><thead><tr><th>Látka</th><th>l<sub>t</sub> (kJ/kg)</th><th>l<sub>v</sub> (kJ/kg)</th></tr></thead><tbody>
<tr><td>Voda / Led</td><td>334</td><td>2 260</td></tr>
<tr><td>Železo</td><td>277</td><td>6 090</td></tr>
<tr><td>Hliník</td><td>397</td><td>10 900</td></tr>
</tbody></table>
<h3>Příklad</h3>
<p>Kolik tepla potřebujeme k roztavení 2 kg ledu?</p>
<div class='formula'>$$Q_t = m \\cdot l_t = 2 \\cdot 334\\,000 = 668\\,000 \\, \\text{J} = 668 \\, \\text{kJ}$$</div>`,

'skupenstvi-latek--vztah-teploty-a-tlaku': `<h2>Vztah teploty a tlaku</h2>
<p>Teplota a tlak plynu spolu úzce souvisejí.</p>
<h3>Gay-Lussacův zákon</h3>
<p>Při stálém objemu: zvýšíme-li teplotu plynu, <strong>tlak vzroste</strong>.</p>
<div class='formula'>$$\\frac{p_1}{T_1} = \\frac{p_2}{T_2}$$</div>
<p>(teploty musí být v kelvinech!)</p>
<h3>Příklady z praxe</h3>
<table><thead><tr><th>Jev</th><th>Vysvětlení</th></tr></thead><tbody>
<tr><td>Přetlak v pneumatice za jízdy</td><td>třením se zahřeje vzduch → tlak roste</td></tr>
<tr><td>Tlakový hrnec</td><td>vyšší tlak → vyšší teplota varu → rychlejší vaření</td></tr>
<tr><td>Sprej u ohně exploduje</td><td>zahřátí → prudký nárůst tlaku</td></tr>
</tbody></table>
<h3>Teplota varu a tlak</h3>
<p>Při vyšším tlaku je teplota varu <strong>vyšší</strong>. Na horách (nízký tlak) voda vře pod 100 °C.</p>`,

// ============================================================
// GRADE 8 — TEPELNÉ MOTORY
// ============================================================

'tepelne-motory--parni-stroj': `<h2>Parní stroj</h2>
<p><strong>Parní stroj</strong> je tepelný motor, který přeměňuje tepelnou energii páry na mechanickou práci.</p>
<h3>Princip činnosti</h3>
<p>1. V kotli se zahřeje voda a vznikne pára pod tlakem.</p>
<p>2. Pára tlačí na píst ve válci.</p>
<p>3. Píst se pohybuje sem a tam → otáčivý pohyb (přes ojnici a kliku).</p>
<p>4. Použitá pára odchází do kondenzátoru.</p>
<h3>Historie</h3>
<table><thead><tr><th>Vynálezce</th><th>Rok</th><th>Přínos</th></tr></thead><tbody>
<tr><td>Thomas Newcomen</td><td>1712</td><td>první použitelný parní stroj</td></tr>
<tr><td>James Watt</td><td>1769</td><td>zásadní vylepšení (kondenzátor)</td></tr>
</tbody></table>
<h3>Využití</h3>
<p>Parní lokomotivy, parní lodě, pohon továren v 18.–19. století. Průmyslová revoluce.</p>
<h3>Účinnost</h3>
<p>Parní stroj má účinnost přibližně <strong>10–20 %</strong>.</p>`,

'tepelne-motory--spalovaci-motory': `<h2>Spalovací motory</h2>
<p><strong>Spalovací motor</strong> spaluje palivo přímo uvnitř válce. Tepelná energie se přeměňuje na mechanickou práci.</p>
<h3>Čtyřdobý zážehový motor (benzínový)</h3>
<table><thead><tr><th>Doba</th><th>Děj</th></tr></thead><tbody>
<tr><td>1. Sání</td><td>píst jde dolů, nasává směs paliva a vzduchu</td></tr>
<tr><td>2. Komprese</td><td>píst jde nahoru, stlačuje směs</td></tr>
<tr><td>3. Expanze</td><td>svíčka zapálí směs, plyny tlačí píst dolů (práce!)</td></tr>
<tr><td>4. Výfuk</td><td>píst jde nahoru, vytlačuje spaliny ven</td></tr>
</tbody></table>
<h3>Vznětový motor (dieselový)</h3>
<p>Rozdíl: nemá svíčku. Vzduch se stlačí tak silně, že se zahřeje na vysokou teplotu. Vstříknuté palivo se vznítí samo.</p>
<h3>Srovnání</h3>
<table><thead><tr><th>Vlastnost</th><th>Benzínový</th><th>Dieselový</th></tr></thead><tbody>
<tr><td>Zapalování</td><td>svíčka</td><td>samovznícení</td></tr>
<tr><td>Účinnost</td><td>20–35 %</td><td>30–45 %</td></tr>
<tr><td>Palivo</td><td>benzín</td><td>nafta</td></tr>
</tbody></table>`,

'tepelne-motory--proudovy-raketovy-motor': `<h2>Proudový a raketový motor</h2>
<h3>Proudový motor</h3>
<p><strong>Proudový motor</strong> nasává vzduch, stlačí ho, smísí s palivem a zapálí. Horké plyny vystřelují dozadu → motor (letadlo) se pohybuje dopředu.</p>
<p>Pracuje na principu <strong>3. Newtonova zákona</strong> (akce a reakce).</p>
<p>Potřebuje vzduch z atmosféry → funguje jen v atmosféře.</p>
<h3>Raketový motor</h3>
<p><strong>Raketový motor</strong> nese palivo i okysličovadlo s sebou → funguje i ve <strong>vakuu</strong> (ve vesmíru).</p>
<table><thead><tr><th>Vlastnost</th><th>Proudový</th><th>Raketový</th></tr></thead><tbody>
<tr><td>Vzduch z okolí</td><td>ano (potřebuje)</td><td>ne (nese si vše)</td></tr>
<tr><td>Funkce ve vakuu</td><td>ne</td><td>ano</td></tr>
<tr><td>Využití</td><td>letadla</td><td>rakety, kosmické lodě</td></tr>
</tbody></table>
<h3>Druhy letadel</h3>
<p><strong>Vrtulové</strong> — pístový motor pohání vrtuli.</p>
<p><strong>Proudové</strong> — proudový motor.</p>
<p><strong>Nadzvukové</strong> — překonávají rychlost zvuku (Mach 1 ≈ 340 m/s).</p>`,

// ============================================================
// GRADE 8 — AKUSTIKA
// ============================================================

'akustika--zdroje-zvuku': `<h2>Zdroje zvuku</h2>
<p><strong>Zvuk</strong> vzniká <strong>chvěním (kmitáním)</strong> těles. Šíří se jako podélné vlnění prostředím (vzduch, voda, pevné látky). Ve vakuu se zvuk nešíří!</p>
<h3>Vlastnosti zvuku</h3>
<table><thead><tr><th>Vlastnost</th><th>Závisí na</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>Výška tónu</td><td>frekvence (počet kmitů za sekundu)</td><td>Hz</td></tr>
<tr><td>Hlasitost</td><td>amplituda kmitání</td><td>dB (decibel)</td></tr>
<tr><td>Barva tónu</td><td>tvar zvukové vlny</td><td>—</td></tr>
</tbody></table>
<h3>Frekvence a výška</h3>
<p>Čím vyšší frekvence → vyšší tón. Lidské ucho slyší <strong>20 Hz až 20 000 Hz</strong>.</p>
<table><thead><tr><th>Oblast</th><th>Frekvence</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Infrazvuk</td><td>&lt; 20 Hz</td><td>zemětřesení, sloni</td></tr>
<tr><td>Slyšitelný zvuk</td><td>20–20 000 Hz</td><td>řeč, hudba</td></tr>
<tr><td>Ultrazvuk</td><td>&gt; 20 000 Hz</td><td>netopýři, ultrazvuk v medicíně</td></tr>
</tbody></table>
<h3>Rychlost zvuku</h3>
<p>Ve vzduchu (20 °C): přibližně <strong>343 m/s</strong>. Ve vodě: ~1 480 m/s. V oceli: ~5 000 m/s.</p>`,

'akustika--vlneni': `<h2>Vlnění</h2>
<p><strong>Vlnění</strong> je šíření kmitání (rozruchu) prostředím. Přenáší energii, ale látka se nepřemísťuje.</p>
<h3>Druhy vlnění</h3>
<table><thead><tr><th>Typ</th><th>Směr kmitání</th><th>Příklad</th></tr></thead><tbody>
<tr><td>Příčné</td><td>kolmo na směr šíření</td><td>vlny na vodě, světlo</td></tr>
<tr><td>Podélné</td><td>rovnoběžně se směrem šíření</td><td>zvuk</td></tr>
</tbody></table>
<h3>Veličiny vlnění</h3>
<div class='formula'>$$v = \\lambda \\cdot f$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>rychlost vlnění</td><td>v</td><td>m/s</td></tr>
<tr><td>vlnová délka</td><td>λ (lambda)</td><td>m</td></tr>
<tr><td>frekvence</td><td>f</td><td>Hz</td></tr>
</tbody></table>
<h3>Odraz zvuku — ozvěna</h3>
<p><strong>Ozvěna</strong> vznikne, když se zvuk odrazí od překážky a vrátí se zpět. Slyšíme ji, pokud je překážka vzdálená alespoň <strong>17 m</strong> (zvuk cestuje tam a zpět, potřebuje minimálně 0,1 s).</p>`,

'akustika--hudebni-nastroje': `<h2>Hudební nástroje</h2>
<p>Hudební nástroje vytvářejí <strong>tóny</strong> — pravidelné kmitání o určité frekvenci.</p>
<h3>Rozdělení hudebních nástrojů</h3>
<table><thead><tr><th>Skupina</th><th>Zdroj zvuku</th><th>Příklady</th></tr></thead><tbody>
<tr><td>Strunné</td><td>kmitající struna</td><td>kytara, housle, klavír</td></tr>
<tr><td>Dechové</td><td>kmitající vzduchový sloupec</td><td>flétna, trubka, klarinet</td></tr>
<tr><td>Bicí</td><td>kmitající blána nebo těleso</td><td>buben, činely, xylofon</td></tr>
<tr><td>Elektronické</td><td>elektrický obvod</td><td>syntezátor, elektrická kytara</td></tr>
</tbody></table>
<h3>Výška tónu u struny</h3>
<p>Závisí na: <strong>délce</strong> (kratší → vyšší tón), <strong>napětí</strong> (napjatější → vyšší tón), <strong>tloušťce</strong> (tenčí → vyšší tón).</p>
<h3>Rezonance</h3>
<p><strong>Rezonance</strong> nastane, když frekvence vnější síly odpovídá vlastní frekvenci tělesa — kmitání se zesílí. U nástrojů rezonanční skříň zesiluje zvuk.</p>`,

// ============================================================
// GRADE 9 — ELEKTŘINA
// ============================================================

'elektrina--elektromagnetismus-a-indukce': `<h2>Elektromagnetismus a indukce</h2>
<h3>Elektromagnetická indukce</h3>
<p><strong>Elektromagnetická indukce:</strong> Při změně magnetického pole v okolí vodiče (cívky) se v něm indukuje <strong>elektrické napětí</strong>.</p>
<p>Objevil ji Michael <strong>Faraday</strong> (1831).</p>
<h3>Jak indukovat napětí</h3>
<p>1. Pohybem magnetu v cívce (nebo cívky v magnetickém poli).</p>
<p>2. Změnou proudu v sousední cívce.</p>
<h3>Velikost indukovaného napětí závisí na</h3>
<table><thead><tr><th>Faktor</th><th>Vliv</th></tr></thead><tbody>
<tr><td>Rychlost změny pole</td><td>čím rychlejší, tím větší napětí</td></tr>
<tr><td>Počet závitů cívky</td><td>více závitů → větší napětí</td></tr>
<tr><td>Síla magnetu</td><td>silnější magnet → větší napětí</td></tr>
</tbody></table>
<h3>Využití</h3>
<p>Generátor (dynamo), transformátor, indukční varná deska, bezdrátové nabíjení.</p>`,

'elektrina--stridavy-proud': `<h2>Střídavý proud</h2>
<p><strong>Střídavý proud (AC)</strong> periodicky mění svůj směr i velikost. V ČR má frekvenci <strong>50 Hz</strong> (50 cyklů za sekundu).</p>
<h3>Srovnání</h3>
<table><thead><tr><th>Vlastnost</th><th>Stejnosměrný (DC)</th><th>Střídavý (AC)</th></tr></thead><tbody>
<tr><td>Směr proudu</td><td>stále stejný</td><td>střídá se</td></tr>
<tr><td>Zdroj</td><td>baterie, akumulátor</td><td>generátor, zásuvka</td></tr>
<tr><td>Přenos na dálku</td><td>velké ztráty</td><td>malé ztráty (transformátor)</td></tr>
</tbody></table>
<h3>Efektivní hodnoty</h3>
<p>V zásuvce je napětí <strong>230 V</strong> — to je efektivní (průměrná) hodnota. Maximální (amplitudová) hodnota je vyšší:</p>
<div class='formula'>$$U_0 = U_{ef} \\cdot \\sqrt{2} \\approx 230 \\cdot 1{,}41 \\approx 325 \\, \\text{V}$$</div>
<h3>Výroba střídavého proudu</h3>
<p>Otáčením cívky v magnetickém poli (generátor/alternátor) se indukuje střídavé napětí.</p>`,

'elektrina--elektrarny': `<h2>Elektrárny</h2>
<p><strong>Elektrárna</strong> vyrábí elektrickou energii. Většina elektráren pracuje na principu <strong>elektromagnetické indukce</strong> — otáčení turbíny pohání generátor.</p>
<h3>Typy elektráren</h3>
<table><thead><tr><th>Typ</th><th>Zdroj energie</th><th>Výhody</th><th>Nevýhody</th></tr></thead><tbody>
<tr><td>Tepelná</td><td>uhlí, plyn</td><td>vysoký výkon</td><td>CO₂, znečištění</td></tr>
<tr><td>Jaderná</td><td>uran (štěpení)</td><td>velký výkon, bez CO₂</td><td>radioaktivní odpad</td></tr>
<tr><td>Vodní</td><td>proudící voda</td><td>čistá, obnovitelná</td><td>zásah do krajiny</td></tr>
<tr><td>Větrná</td><td>vítr</td><td>čistá, obnovitelná</td><td>závislá na počasí</td></tr>
<tr><td>Solární</td><td>sluneční záření</td><td>čistá, tichá</td><td>závislá na počasí</td></tr>
</tbody></table>
<h3>Energetický mix ČR</h3>
<p>ČR využívá převážně tepelné a jaderné elektrárny (Dukovany, Temelín). Podíl obnovitelných zdrojů roste.</p>`,

'elektrina--elektricke-clanky': `<h2>Elektrické články a akumulátory</h2>
<p><strong>Elektrický článek</strong> přeměňuje chemickou energii na elektrickou.</p>
<h3>Galvanický článek (baterie)</h3>
<p>Dvě různé elektrody ponořené v elektrolytu. Chemickou reakcí vzniká napětí.</p>
<table><thead><tr><th>Typ</th><th>Napětí</th><th>Vlastnost</th></tr></thead><tbody>
<tr><td>Zinkouhlíkový</td><td>1,5 V</td><td>levný, menší kapacita</td></tr>
<tr><td>Alkalický</td><td>1,5 V</td><td>vyšší kapacita</td></tr>
<tr><td>Lithiový</td><td>3 V</td><td>dlouhá životnost</td></tr>
</tbody></table>
<h3>Akumulátor</h3>
<p><strong>Akumulátor</strong> je <strong>nabíjecí</strong> článek — chemický děj je vratný.</p>
<table><thead><tr><th>Typ</th><th>Napětí/článek</th><th>Využití</th></tr></thead><tbody>
<tr><td>Olověný</td><td>2 V</td><td>autobaterie</td></tr>
<tr><td>NiMH</td><td>1,2 V</td><td>nabíjecí AA/AAA</td></tr>
<tr><td>Li-ion</td><td>3,7 V</td><td>telefony, notebooky, elektromobily</td></tr>
</tbody></table>
<h3>Sériové zapojení článků</h3>
<p>Napětí se sčítá: 4 články × 1,5 V = <strong>6 V</strong>.</p>`,

'elektrina--civky-a-kondenzatory': `<h2>Cívky a kondenzátory</h2>
<h3>Cívka (induktor)</h3>
<p><strong>Cívka</strong> je navinutý vodič. V obvodu se střídavým proudem se „brání" změnám proudu (<strong>induktance</strong>).</p>
<p>Značka induktance: <strong>L</strong>, jednotka: <strong>henry (H)</strong>.</p>
<p>Využití: filtry, transformátory, tlumivky, elektromagnety.</p>
<h3>Kondenzátor</h3>
<p><strong>Kondenzátor</strong> uchovává elektrický náboj. Skládá se ze dvou vodivých desek oddělených izolantem (dielektrikem).</p>
<p>Značka kapacity: <strong>C</strong>, jednotka: <strong>farad (F)</strong>.</p>
<div class='formula'>$$Q = C \\cdot U$$</div>
<table><thead><tr><th>Veličina</th><th>Symbol</th><th>Jednotka</th></tr></thead><tbody>
<tr><td>náboj</td><td>Q</td><td>C (coulomb)</td></tr>
<tr><td>kapacita</td><td>C</td><td>F (farad)</td></tr>
<tr><td>napětí</td><td>U</td><td>V</td></tr>
</tbody></table>
<p>Využití: vyhlazování napětí, časovače, filtry, startér zářivky.</p>`,

'elektrina--transformator': `<h2>Transformátor</h2>
<p><strong>Transformátor</strong> mění velikost střídavého napětí. Pracuje na principu elektromagnetické indukce.</p>
<h3>Stavba</h3>
<p>Dvě cívky (primární a sekundární) navinuté na společném železném jádře.</p>
<h3>Transformační poměr</h3>
<div class='formula'>$$\\frac{U_1}{U_2} = \\frac{N_1}{N_2}$$</div>
<table><thead><tr><th>Veličina</th><th>Popis</th></tr></thead><tbody>
<tr><td>U₁, N₁</td><td>napětí a počet závitů primární cívky</td></tr>
<tr><td>U₂, N₂</td><td>napětí a počet závitů sekundární cívky</td></tr>
</tbody></table>
<h3>Typy transformátorů</h3>
<p><strong>Zvyšující:</strong> N₂ &gt; N₁ → U₂ &gt; U₁ (pro přenos na dálku).</p>
<p><strong>Snižující:</strong> N₂ &lt; N₁ → U₂ &lt; U₁ (nabíječka telefonu).</p>
<h3>Příklad</h3>
<p>Primární cívka má 1 000 závitů a napětí 230 V. Sekundární má 50 závitů. Jaké je výstupní napětí?</p>
<div class='formula'>$$U_2 = U_1 \\cdot \\frac{N_2}{N_1} = 230 \\cdot \\frac{50}{1000} = 11{,}5 \\, \\text{V}$$</div>`,

'elektrina--trojfazova-soustava': `<h2>Trojfázová elektrická soustava</h2>
<p><strong>Trojfázová soustava</strong> se skládá ze tří střídavých napětí vzájemně posunutých o 120°.</p>
<h3>Proč trojfázová</h3>
<p>Výhodou je <strong>rovnoměrný přenos výkonu</strong> — celkový výkon je konstantní (u jednofázového kolísá).</p>
<h3>Napětí v síti</h3>
<table><thead><tr><th>Typ</th><th>Napětí</th><th>Kde</th></tr></thead><tbody>
<tr><td>Fázové</td><td>230 V</td><td>mezi fází a nulákem (zásuvka)</td></tr>
<tr><td>Sdružené</td><td>400 V</td><td>mezi dvěma fázemi</td></tr>
</tbody></table>
<div class='formula'>$$U_s = U_f \\cdot \\sqrt{3} \\approx 230 \\cdot 1{,}73 \\approx 400 \\, \\text{V}$$</div>
<h3>Vodiče</h3>
<p><strong>3 fáze</strong> (L1, L2, L3) — hnědý, černý, šedý vodič.</p>
<p><strong>Nulák</strong> (N) — modrý vodič.</p>
<p><strong>Zemnění</strong> (PE) — žlutozelený vodič (ochranný).</p>
<h3>Využití</h3>
<p>Trojfázové motory, průmyslové stroje, elektrické sporáky.</p>`,

'elektrina--elektromotor': `<h2>Elektromotor</h2>
<p><strong>Elektromotor</strong> přeměňuje elektrickou energii na mechanickou (pohyb). Pracuje na principu síly působící na vodič s proudem v magnetickém poli.</p>
<h3>Princip</h3>
<p>Proud prochází cívkou (rotorem) umístěnou v magnetickém poli → na vodič působí síla → cívka se otáčí.</p>
<h3>Části elektromotoru</h3>
<table><thead><tr><th>Část</th><th>Funkce</th></tr></thead><tbody>
<tr><td>Stator</td><td>nepohyblivá část (magnety nebo cívky)</td></tr>
<tr><td>Rotor</td><td>otáčivá část (cívka)</td></tr>
<tr><td>Komutátor</td><td>přepíná směr proudu (u DC motoru)</td></tr>
<tr><td>Kartáče</td><td>přivádí proud k rotoru</td></tr>
</tbody></table>
<h3>Druhy elektromotorů</h3>
<p><strong>Stejnosměrný (DC)</strong> — hračky, malé přístroje.</p>
<p><strong>Střídavý (AC)</strong> — pračky, průmysl, elektromobily.</p>
<h3>Výhody</h3>
<p>Vysoká účinnost (80–95 %), tichý chod, žádné spaliny, okamžitý krouticí moment.</p>`,

'elektrina--elektromagneticke-vlneni': `<h2>Elektromagnetické vlnění</h2>
<p><strong>Elektromagnetické vlnění</strong> je příčné vlnění tvořené elektrickým a magnetickým polem. Šíří se i vakuem rychlostí světla.</p>
<div class='formula'>$$c = \\lambda \\cdot f = 3 \\times 10^8 \\, \\text{m/s}$$</div>
<h3>Elektromagnetické spektrum</h3>
<table><thead><tr><th>Záření</th><th>Vlnová délka</th><th>Využití</th></tr></thead><tbody>
<tr><td>Rádiové vlny</td><td>km – mm</td><td>rozhlas, TV, Wi-Fi</td></tr>
<tr><td>Mikrovlny</td><td>mm – cm</td><td>mikrovlnka, radar</td></tr>
<tr><td>Infračervené</td><td>μm – mm</td><td>dálkový ovladač, teplo</td></tr>
<tr><td>Viditelné světlo</td><td>380–750 nm</td><td>zrak</td></tr>
<tr><td>Ultrafialové</td><td>nm – stovky nm</td><td>opalování, dezinfekce</td></tr>
<tr><td>Rentgenové</td><td>pm – nm</td><td>lékařství (RTG snímky)</td></tr>
<tr><td>Gama záření</td><td>&lt; pm</td><td>léčba rakoviny</td></tr>
</tbody></table>
<p>Čím kratší vlnová délka, tím vyšší energie záření.</p>`,

'elektrina--silnoproud': `<h2>Silnoproud</h2>
<p><strong>Silnoproud</strong> se zabývá přenosem a využitím elektrické energie o velkých výkonech.</p>
<h3>Přenos elektrické energie</h3>
<p>Z elektrárny do domácností vede energie přes <strong>rozvodnou síť</strong>:</p>
<p>Elektrárna (10–20 kV) → zvyšující transformátor → <strong>vysoké napětí (110–400 kV)</strong> → přenosová soustava → snižující transformátor → <strong>230/400 V</strong> → domácnost.</p>
<h3>Proč vysoké napětí</h3>
<p>Při stejném výkonu: vyšší napětí → menší proud → menší ztráty na vedení (teplo).</p>
<div class='formula'>$$P = U \\cdot I$$</div>
<div class='formula'>$$P_{ztráty} = R \\cdot I^2$$</div>
<h3>Elektrická přípojka</h3>
<p>Do domu vedou typicky: 3 fáze (L1, L2, L3), nulový vodič (N), ochranný vodič (PE).</p>
<p>Běžná domácí zásuvka: 230 V, jistič 16 A → max. výkon ≈ 3 680 W.</p>`,

'elektrina--pojistky-a-jistice': `<h2>Pojistky a jističe</h2>
<p><strong>Pojistky a jističe</strong> chrání elektrické obvody před <strong>přetížením</strong> a <strong>zkratem</strong>.</p>
<h3>Pojistka</h3>
<p>Obsahuje tavný drát, který se při nadměrném proudu <strong>přepálí</strong> a přeruší obvod. Je jednorázová — po přepálení ji musíme vyměnit.</p>
<h3>Jistič</h3>
<p>Automaticky vypne obvod při nadměrném proudu. Dá se <strong>znovu zapnout</strong> (páčkou). V domácnostech nejčastější.</p>
<h3>Proudový chránič (FI)</h3>
<p>Chrání <strong>osoby</strong> — vypne obvod, pokud proud uniká mimo obvod (např. přes lidské tělo). Reaguje na rozdíl proudů ve fázi a nuláku.</p>
<h3>Hodnoty jističů v domácnosti</h3>
<table><thead><tr><th>Jistič</th><th>Max. proud</th><th>Obvod</th></tr></thead><tbody>
<tr><td>6 A</td><td>6 A</td><td>osvětlení</td></tr>
<tr><td>10 A</td><td>10 A</td><td>osvětlení, lehké spotřebiče</td></tr>
<tr><td>16 A</td><td>16 A</td><td>zásuvkové obvody</td></tr>
<tr><td>25 A</td><td>25 A</td><td>sporák, bojler</td></tr>
</tbody></table>`,

'elektrina--polovodice': `<h2>Polovodiče</h2>
<p><strong>Polovodič</strong> je látka, jejíž elektrická vodivost leží mezi vodiči a izolanty. Nejčastější polovodič: <strong>křemík (Si)</strong>.</p>
<h3>Vlastnosti</h3>
<p>Vodivost polovodiče <strong>roste s teplotou</strong> (na rozdíl od kovů!) a závisí na příměsích.</p>
<h3>Dopování — typ N a P</h3>
<table><thead><tr><th>Typ</th><th>Příměs</th><th>Nosič náboje</th></tr></thead><tbody>
<tr><td>Typ N</td><td>fosfor, arsen (5 valenčních e⁻)</td><td>elektrony (−)</td></tr>
<tr><td>Typ P</td><td>bor, hliník (3 valenční e⁻)</td><td>díry (+)</td></tr>
</tbody></table>
<h3>PN přechod — dioda</h3>
<p><strong>Dioda</strong> propouští proud jen jedním směrem. Využití: usměrnění střídavého proudu.</p>
<h3>Polovodičové součástky</h3>
<table><thead><tr><th>Součástka</th><th>Funkce</th></tr></thead><tbody>
<tr><td>Dioda</td><td>propouští proud jedním směrem</td></tr>
<tr><td>LED</td><td>dioda, která svítí</td></tr>
<tr><td>Tranzistor</td><td>zesiluje signál, spíná obvod</td></tr>
<tr><td>Fotovoltaický článek</td><td>přeměňuje světlo na elektřinu</td></tr>
</tbody></table>`,

// ============================================================
// GRADE 9 — MIKROSVĚT
// ============================================================

'mikrosvet--skaly-v-mikrosvete': `<h2>Škály v mikrosvětě</h2>
<p>Mikrosvět zahrnuje objekty, které nelze pozorovat pouhým okem — od atomů po buňky.</p>
<h3>Velikosti objektů</h3>
<table><thead><tr><th>Objekt</th><th>Velikost</th><th>Řád</th></tr></thead><tbody>
<tr><td>Atomové jádro</td><td>10⁻¹⁵ m</td><td>femtometry</td></tr>
<tr><td>Proton</td><td>≈ 0,87 fm</td><td>femtometry</td></tr>
<tr><td>Atom</td><td>10⁻¹⁰ m</td><td>ångströmy</td></tr>
<tr><td>Molekula DNA (šířka)</td><td>2 nm</td><td>nanometry</td></tr>
<tr><td>Virus</td><td>20–300 nm</td><td>nanometry</td></tr>
<tr><td>Bakterie</td><td>1–10 μm</td><td>mikrometry</td></tr>
<tr><td>Červená krvinka</td><td>7 μm</td><td>mikrometry</td></tr>
<tr><td>Lidský vlas</td><td>70 μm</td><td>mikrometry</td></tr>
</tbody></table>
<h3>Přístroje pro pozorování</h3>
<p><strong>Optický mikroskop:</strong> zvětšení až 1 500×, vidí objekty nad ~200 nm.</p>
<p><strong>Elektronový mikroskop:</strong> zvětšení nad 100 000×, vidí až atomy.</p>
<p><strong>Tunelovací mikroskop:</strong> zobrazuje jednotlivé atomy na povrchu.</p>`,

'mikrosvet--atom-a-jeho-modely': `<h2>Atom a jeho modely</h2>
<p>Představa o stavbě atomu se vyvíjela postupně.</p>
<h3>Modely atomu</h3>
<table><thead><tr><th>Model</th><th>Autor</th><th>Rok</th><th>Popis</th></tr></thead><tbody>
<tr><td>Pudinkový</td><td>Thomson</td><td>1904</td><td>kladný náboj rovnoměrně, elektrony „zapíchané"</td></tr>
<tr><td>Planetární</td><td>Rutherford</td><td>1911</td><td>malé kladné jádro, elektrony obíhají</td></tr>
<tr><td>Kvantový</td><td>Bohr</td><td>1913</td><td>elektrony na určitých drahách (hladinách)</td></tr>
<tr><td>Současný</td><td>kvantová mechanika</td><td>1926+</td><td>elektronový oblak (orbital)</td></tr>
</tbody></table>
<h3>Rutherfordův pokus</h3>
<p>Ostřelování zlaté fólie alfa částicemi. Většina proletěla, některé se odrazily → atom je z většiny <strong>prázdný</strong>, hmotnost je v malém <strong>jádře</strong>.</p>
<h3>Energetické hladiny</h3>
<p>Elektron může být jen na určitých hladinách. Při přechodu na nižší hladinu <strong>vyzáří foton</strong> (světlo). Při absorpci fotonu přeskočí na vyšší hladinu.</p>`,

'mikrosvet--radioaktivita': `<h2>Radioaktivita</h2>
<p><strong>Radioaktivita</strong> je samovolný rozpad nestabilních atomových jader za vyzáření ionizujícího záření.</p>
<h3>Druhy radioaktivního záření</h3>
<table><thead><tr><th>Záření</th><th>Co je to</th><th>Průraznost</th><th>Stínění</th></tr></thead><tbody>
<tr><td>Alfa (α)</td><td>jádro helia (2p + 2n)</td><td>nízká</td><td>papír</td></tr>
<tr><td>Beta (β)</td><td>elektron nebo pozitron</td><td>střední</td><td>hliníkový plech</td></tr>
<tr><td>Gama (γ)</td><td>elektromagnetické záření</td><td>vysoká</td><td>olovo, beton</td></tr>
</tbody></table>
<h3>Poločas rozpadu</h3>
<p><strong>Poločas rozpadu</strong> je doba, za kterou se rozpadne polovina jader.</p>
<table><thead><tr><th>Izotop</th><th>Poločas</th></tr></thead><tbody>
<tr><td>Uran-238</td><td>4,5 miliardy let</td></tr>
<tr><td>Uhlík-14</td><td>5 730 let</td></tr>
<tr><td>Jod-131</td><td>8 dní</td></tr>
<tr><td>Radon-222</td><td>3,8 dne</td></tr>
</tbody></table>
<h3>Využití</h3>
<p>Lékařství (diagnostika, léčba), datování (uhlík-14), energetika (jaderné elektrárny), detektory kouře.</p>`,

'mikrosvet--jaderna-energie': `<h2>Jaderná energie</h2>
<p>V atomovém jádře je uloženo obrovské množství energie. Můžeme ji uvolnit <strong>štěpením</strong> nebo <strong>fúzí</strong>.</p>
<h3>Jaderné štěpení</h3>
<p>Těžké jádro (uran-235) se po zásahu neutronem rozpadne na dvě menší jádra + neutrony + energie.</p>
<p><strong>Řetězová reakce:</strong> uvolněné neutrony štěpí další jádra → lavina reakcí.</p>
<h3>Jaderná elektrárna</h3>
<table><thead><tr><th>Část</th><th>Funkce</th></tr></thead><tbody>
<tr><td>Reaktor</td><td>řízená řetězová reakce</td></tr>
<tr><td>Regulační tyče</td><td>řídí (brzdí) reakci</td></tr>
<tr><td>Parogenerátor</td><td>teplo → pára</td></tr>
<tr><td>Turbína + generátor</td><td>pára → elektřina</td></tr>
</tbody></table>
<h3>Jaderná fúze</h3>
<p>Slučování lehkých jader (vodík → helium). Probíhá ve hvězdách. Na Zemi se snažíme zvládnout řízenou fúzi (tokamak) — zatím ve výzkumu.</p>
<h3>Einsteinův vztah</h3>
<div class='formula'>$$E = m \\cdot c^2$$</div>
<p>I malý úbytek hmotnosti uvolní obrovskou energii.</p>`,

// ============================================================
// GRADE 9 — ASTRONOMIE
// ============================================================

'astronomie--slunecni-soustava': `<h2>Sluneční soustava</h2>
<p><strong>Sluneční soustava</strong> se skládá ze Slunce a všech těles, která kolem něj obíhají.</p>
<h3>Planety (od Slunce)</h3>
<table><thead><tr><th>Planeta</th><th>Typ</th><th>Průměr (km)</th><th>Vzdálenost od Slunce</th></tr></thead><tbody>
<tr><td>Merkur</td><td>kamenná</td><td>4 879</td><td>0,39 AU</td></tr>
<tr><td>Venuše</td><td>kamenná</td><td>12 104</td><td>0,72 AU</td></tr>
<tr><td>Země</td><td>kamenná</td><td>12 756</td><td>1 AU</td></tr>
<tr><td>Mars</td><td>kamenná</td><td>6 792</td><td>1,52 AU</td></tr>
<tr><td>Jupiter</td><td>plynný obr</td><td>142 984</td><td>5,20 AU</td></tr>
<tr><td>Saturn</td><td>plynný obr</td><td>120 536</td><td>9,54 AU</td></tr>
<tr><td>Uran</td><td>ledový obr</td><td>51 118</td><td>19,2 AU</td></tr>
<tr><td>Neptun</td><td>ledový obr</td><td>49 528</td><td>30,1 AU</td></tr>
</tbody></table>
<p><strong>1 AU</strong> (astronomická jednotka) ≈ 150 milionů km (vzdálenost Země–Slunce).</p>`,

'astronomie--vesmir': `<h2>Vesmír</h2>
<p><strong>Vesmír</strong> je veškerý prostor, hmota, energie a čas. Vznikl <strong>Velkým třeskem</strong> přibližně před 13,8 miliardami let.</p>
<h3>Struktura vesmíru</h3>
<table><thead><tr><th>Úroveň</th><th>Příklad</th><th>Velikost</th></tr></thead><tbody>
<tr><td>Planetární soustava</td><td>Sluneční soustava</td><td>~100 AU</td></tr>
<tr><td>Hvězdná soustava</td><td>dvojhvězdy</td><td>—</td></tr>
<tr><td>Galaxie</td><td>Mléčná dráha</td><td>~100 000 ly</td></tr>
<tr><td>Kupa galaxií</td><td>Místní skupina</td><td>~10 mil. ly</td></tr>
<tr><td>Pozorovatelný vesmír</td><td>—</td><td>~93 miliard ly</td></tr>
</tbody></table>
<h3>Mléčná dráha</h3>
<p>Naše galaxie — spirální, obsahuje 100–400 miliard hvězd. Slunce je v jednom z ramen, asi 26 000 ly od středu.</p>
<h3>Rozpínání vesmíru</h3>
<p>Vesmír se <strong>rozpíná</strong> — vzdálené galaxie se od nás vzdalují. Čím dále, tím rychleji (Hubbleův zákon).</p>`,

'astronomie--vznik-a-zanik-hvezd': `<h2>Vznik a zánik hvězd</h2>
<h3>Život hvězdy</h3>
<p>1. <strong>Mlhovina</strong> — oblak plynu a prachu se vlastní gravitací smršťuje.</p>
<p>2. <strong>Protohvězda</strong> — zahřívání, roste tlak a teplota.</p>
<p>3. <strong>Hlavní posloupnost</strong> — stabilní fáze, jaderná fúze (vodík → helium). Slunce je v této fázi.</p>
<p>4. <strong>Červený obr</strong> — vyčerpání vodíku v jádře, hvězda se nafoukne.</p>
<h3>Konec hvězdy závisí na hmotnosti</h3>
<table><thead><tr><th>Hmotnost</th><th>Konec</th><th>Pozůstatek</th></tr></thead><tbody>
<tr><td>Malá (jako Slunce)</td><td>planetární mlhovina</td><td>bílý trpaslík</td></tr>
<tr><td>Velká (8–25× Slunce)</td><td>supernova</td><td>neutronová hvězda</td></tr>
<tr><td>Velmi velká (&gt;25× Slunce)</td><td>supernova</td><td>černá díra</td></tr>
</tbody></table>
<h3>Slunce</h3>
<p>Stáří: ~4,6 miliardy let. Zbývá: ~5 miliard let. Skončí jako bílý trpaslík.</p>`,

'astronomie--nocni-obloha': `<h2>Noční obloha a souhvězdí</h2>
<h3>Souhvězdí</h3>
<p><strong>Souhvězdí</strong> jsou skupiny hvězd, které na obloze tvoří obrazce. Je jich celkem <strong>88</strong> (podle Mezinárodní astronomické unie).</p>
<h3>Důležitá souhvězdí</h3>
<table><thead><tr><th>Souhvězdí</th><th>Význam</th></tr></thead><tbody>
<tr><td>Velký vůz (Velká medvědice)</td><td>ukazuje k Polárce</td></tr>
<tr><td>Malý vůz (Malá medvědice)</td><td>obsahuje Polárku</td></tr>
<tr><td>Orion</td><td>zimní souhvězdí, tři hvězdy v pásu</td></tr>
<tr><td>Kasiopeja</td><td>tvar písmene W</td></tr>
</tbody></table>
<h3>Polárka</h3>
<p><strong>Polárka</strong> (Severka) leží téměř přesně nad severním pólem → ukazuje směr na sever. Najdeme ji prodloužením zadní strany Velkého vozu 5×.</p>
<h3>Zvířetníkový pás</h3>
<p>12 souhvězdí podél ekliptiky (dráhy Slunce po obloze). Slunce prochází jedním souhvězdím přibližně 1 měsíc.</p>
<h3>Hvězdná obloha se otáčí</h3>
<p>Zdánlivě — ve skutečnosti se otáčí <strong>Země</strong>. Hvězdy se pohybují od východu k západu (15°/h).</p>`,

'astronomie--dalsi-vesmirna-telesa': `<h2>Další vesmírná tělesa</h2>
<h3>Trpasličí planety</h3>
<p>Obíhají kolem Slunce, ale „nevyčistily" svou oběžnou dráhu. Příklady: <strong>Pluto</strong>, Ceres, Eris.</p>
<h3>Měsíce (přirozené družice)</h3>
<p>Tělesa obíhající kolem planet. Země má 1 (Měsíc), Jupiter jich má přes 90.</p>
<h3>Asteroidy</h3>
<p>Malá skalnatá tělesa, většina obíhá v <strong>pásu asteroidů</strong> (mezi Marsem a Jupiterem). Největší: Ceres (nyní trpasličí planeta).</p>
<h3>Komety</h3>
<p>Tělesa ze směsi ledu a prachu. Při přiblížení ke Slunci se zahřívají → vzniká <strong>ohon</strong> (plyn a prach). Příklad: Halleyova kometa (perioda ~76 let).</p>
<h3>Meteory a meteority</h3>
<table><thead><tr><th>Pojem</th><th>Popis</th></tr></thead><tbody>
<tr><td>Meteoroid</td><td>malé těleso ve vesmíru</td></tr>
<tr><td>Meteor</td><td>světelný jev v atmosféře („padající hvězda")</td></tr>
<tr><td>Meteorit</td><td>zbytek, který dopadl na Zem</td></tr>
</tbody></table>`,

};

// -------------------------------------------------------
// MAIN — Read each subtopic file, add notebookEntry, write
// -------------------------------------------------------

let updated = 0;
let skipped = 0;

for (const [fileKey, content] of Object.entries(entries)) {
  const filePath = join(SUBTOPICS_DIR, `${fileKey}.json`);

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (data.notebookEntry) {
      skipped++;
      continue;
    }

    data.notebookEntry = { content };

    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    updated++;
    console.log(`✅ ${fileKey}`);
  } catch (err: any) {
    console.error(`❌ ${fileKey}: ${err.message}`);
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped (already had content): ${skipped}`);
