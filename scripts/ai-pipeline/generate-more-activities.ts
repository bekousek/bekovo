/**
 * Generate additional activity and experiment JSON files
 * from thorough review of all 35 sborníky
 */
import { writeFile } from 'fs/promises';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content');

interface ContentItem {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  type: string;
  description: string;
  materials?: string[];
}

const newActivities: ContentItem[] = [
  // === MĚŘENÍ ===
  {
    id: 'mereni-pristali-na-planete',
    subtopicId: 'hustota',
    topicId: 'mereni',
    title: 'Přistáli jsme na neznámé planetě',
    type: 'group-work',
    description: 'Projektová aktivita: žáci ve čtyřčlenných posádkách (velitel, lékař, pilot, vědec) měří hustotu „vzorků z neznámé planety". Porovnávají s tabulkovými hodnotami a určují, o jaký materiál jde. Zahrnuje výrobu loga mise a prezentaci výsledků.',
  },
  {
    id: 'mereni-kvarxeso-delka',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Kvarxeso – měření délky',
    type: 'game',
    description: 'Desková hra pro procvičení měření délky a převodů jednotek. Žáci losují úkoly, odhadují a měří délky předmětů v učebně. Za správné odpovědi postupují na herním plánu.',
  },
  {
    id: 'mereni-na-lidskem-tele',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Měření na lidském těle',
    type: 'method',
    description: 'Žáci měří fyzikální veličiny na vlastním těle: obvod hlavy, rozpětí paží, délku kroku, objem plic (balónek), reakční dobu (chytání pravítka), tep. Propojení fyziky s biologií.',
  },
  {
    id: 'mereni-stadiametricky-dalkomer',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Měření vzdálenosti stadiametrickým dálkoměrem',
    type: 'method',
    description: 'Výroba jednoduchého dálkoměru z kartónu a měření vzdáleností na školním dvoře. Princip: známá velikost předmětu + úhlový rozměr → výpočet vzdálenosti. Propojení s matematikou.',
  },

  // === POHYB ===
  {
    id: 'pohyb-aktivity-do-vyuky',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Aktivity do výuky pohybu',
    type: 'method',
    description: 'Sada aktivit pro výuku pohybu: žáci popisují pohyb pomocí vztažných soustav, rozlišují přímočarý a křivočarý pohyb na příkladech z běžného života, třídí obrázky pohybů do kategorií.',
  },
  {
    id: 'pohyb-netradicni-kluzaky',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Netradiční kluzáky',
    type: 'other',
    description: 'Stavba netradičních kluzáků z papíru, polystyrenu a balzového dřeva. Testování letu a optimalizace tvaru. Žáci zkoumají vliv tvaru křídel, hmotnosti a polohy těžiště na letové vlastnosti.',
  },
  {
    id: 'pohyb-videoanalyza',
    subtopicId: 'grafy',
    topicId: 'pohyb',
    title: 'Videoanalýza pohybu',
    type: 'method',
    description: 'Žáci natočí pohyb (kutálení míče, chůze, pád) mobilem a analyzují ho v programu Tracker. Označují polohu tělesa v každém snímku a program vykreslí graf dráhy, rychlosti, zrychlení v čase.',
  },
  {
    id: 'pohyb-fyzika-ve-filmech',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Fyzika ve filmech',
    type: 'method',
    description: 'Analýza fyzikálních nesmyslů ve filmech: odhadování rychlostí, zrychlení, sil z filmových scén. Žáci hodnotí, zda je pohyb ve filmu fyzikálně realistický. Motivační aktivita.',
  },

  // === SÍLA ===
  {
    id: 'sila-newtonovy-zakony-aktivity',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Newtonovy zákony – aktivity',
    type: 'method',
    description: 'Sada aktivit demonstrující tři Newtonovy zákony: setrvačnost (vytržení papíru pod mincí), F=ma (vozík s různou zátěží), akce-reakce (balónkový pohon, odstřelování na kolečkových židlích).',
  },
  {
    id: 'sila-perpetuum-mobile',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Perpetuum mobile tisíckrát jinak',
    type: 'method',
    description: 'Žáci zkoumají různé návrhy perpetuí mobilí a hledají, proč nemohou fungovat. Analyzují síly, tření, energetické ztráty. Rozvíjí kritické myšlení a pochopení zákona zachování energie.',
  },
  {
    id: 'sila-rohova-lista',
    subtopicId: 'jednoduche-stroje',
    topicId: 'sila',
    title: 'Rohová lišta ve výuce fyziky',
    type: 'method',
    description: 'Hliníková rohová lišta jako univerzální pomůcka: nakloněná rovina, páka, rovnoramenné váhy, rampa pro měření rychlosti. Žáci staví jednoduché stroje z jedné pomůcky.',
  },
  {
    id: 'sila-kurz-preziti',
    subtopicId: 'jednoduche-stroje',
    topicId: 'sila',
    title: 'Kurz přežití – jednoduché stroje v praxi',
    type: 'group-work',
    description: 'Projektová aktivita: žáci ve skupinách řeší „záchranné" úkoly pomocí jednoduchých strojů – zvedání břemene kladkou, přesun předmětů nakloněnou rovinou, stavba mostu z tyčí.',
  },

  // === KAPALINY ===
  {
    id: 'kapaliny-archimedes-aktivity',
    subtopicId: 'vztlakova-sila',
    topicId: 'kapaliny-7',
    title: 'Kapaliny a Archimédův zákon – aktivity',
    type: 'method',
    description: 'Sada aktivit k Archimédovu zákonu: porovnání hmotnosti tělesa ve vzduchu a ve vodě na siloměru, odhady „plave/neplave" pro různé předměty, lávová lampa z oleje a vody s šumivou tabletou.',
  },
  {
    id: 'kapaliny-vodni-fontany',
    subtopicId: 'hydrostaticky-tlak',
    topicId: 'kapaliny-7',
    title: 'Vodní fontány',
    type: 'other',
    description: 'Stavba fontán z PET lahví: Heronova fontána (dvě nádoby spojené trubičkami, voda proudí bez čerpadla díky rozdílu tlaků), jednoduchá fontána z lahve s otvory v různých výškách (demonstrace hydrostatického tlaku).',
  },
  {
    id: 'kapaliny-povrchove-napeti-mobil',
    subtopicId: 'tlak',
    topicId: 'kapaliny-7',
    title: 'Povrchové napětí pomocí mobilu',
    type: 'method',
    description: 'Měření povrchového napětí vody fotoaparátem mobilu: fotografování kapek, měření průměru kapky na minci, porovnání čisté vody a vody se saponátem. Kvantitativní přístup k povrchovému napětí.',
  },

  // === PLYNY ===
  {
    id: 'plyny-vlastnosti-plynu-aktivity',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Na vlastnostech plynů záleží',
    type: 'method',
    description: 'Badatelská aktivita: žáci zkoumají vlastnosti různých plynů (vzduch, CO₂, helium) – hustotu (co plave ve vzduchu), hořlavost, rozpustnost ve vodě. Formulují hypotézy a ověřují je.',
  },

  // === ENERGIE / TEPLO ===
  {
    id: 'energie-energeticky-mix',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Energetický mix',
    type: 'method',
    description: 'Žáci zkoumají různé zdroje energie: solární článek, dynamo, termočlánek, chemický článek. Porovnávají jejich výkon a účinnost. Diskuze o energetickém mixu ČR a obnovitelných zdrojích.',
  },
  {
    id: 'energie-zahrat-zchladit',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Zahřát nebo zchladit',
    type: 'method',
    description: 'Aktivity na pochopení tepelné výměny: izolace (který materiál udrží nápoj teplý/studený nejdéle?), cestovní lednička (Peltierův článek), ohřev třením. Propojení s každodenním životem.',
  },
  {
    id: 'energie-tepelne-stroje',
    subtopicId: 'ucinnost',
    topicId: 'energie',
    title: 'Experimenty s tepelnými stroji',
    type: 'method',
    description: 'Demonstrace tepelných strojů z jednoduchých materiálů: parní turbína z plechovky, Stirlingův motor z plechovek, „pastičkomobil" (autíčko na gumičku s pastičkou). Diskuze o účinnosti přeměny energie.',
  },

  // === SKUPENSTVÍ ===
  {
    id: 'skupenstvi-duhova-cokolada',
    subtopicId: 'zmeny-skupenstvi-latek',
    topicId: 'skupenstvi-latek',
    title: 'Duhová čokoláda',
    type: 'method',
    description: 'Žáci pozorují krystalizaci čokolády při různých teplotách (temperování). Bílý povlak na čokoládě = tukový výkvět při nesprávném chladnutí. Propojení chemie, fyziky a běžného života.',
  },

  // === OPTIKA ===
  {
    id: 'optika-opticke-klamy-3d',
    subtopicId: 'oko',
    topicId: 'optika',
    title: 'Optické klamy a 3D tisk',
    type: 'method',
    description: 'Zkoumání optických klamů: Amesova místnost, nemožné objekty (Penroseův trojúhelník), anaglyfy (3D obrázky s červenomodrými brýlemi). Výroba jednoduchých iluzí z papíru.',
  },
  {
    id: 'optika-zelatinova',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Želatinová optika',
    type: 'other',
    description: 'Výroba optických prvků z želatiny: čočky, hranoly, vlnovody. Průhledná želatina láme světlo jako sklo. Žáci si vyrobí vlastní čočku a pozorují lom laserového paprsku.',
  },
  {
    id: 'optika-solarografie',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Solarografie a lumen print',
    type: 'other',
    description: 'Dlouhodobá expozice: plechovka s fotopapírem zachycuje dráhu Slunce na obloze (solarografie). Lumen print: předměty položené na fotopapír na slunci zanechávají otisky. Propojení optiky s uměním.',
  },
  {
    id: 'optika-anamorfni-obrazy',
    subtopicId: 'zrcadla-zakon-odrazu',
    topicId: 'optika',
    title: 'Anamorfní obrazy',
    type: 'other',
    description: 'Žáci kreslí deformované obrázky, které vypadají správně jen při pohledu ve válcovém zrcadle nebo z určitého úhlu. Princip: geometrická transformace obrazu. Propojení optiky s výtvarnem.',
  },
  {
    id: 'optika-spektrometr-vyroba',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'Výroba spektrometru',
    type: 'other',
    description: 'Stavba jednoduchého spektrometru z kartónové krabice a CD/DVD jako difrakční mřížky. Pozorování spekter různých zdrojů světla: žárovka (spojité), zářivka (čárové), LED.',
  },

  // === ELEKTRICKÉ OBVODY ===
  {
    id: 'eo-multimetr-mereni',
    subtopicId: 'multimetr',
    topicId: 'elektricke-obvody',
    title: 'Měření digitálním multimetrem',
    type: 'method',
    description: 'Praktická dílna: žáci se učí správně používat digitální multimetr – měření napětí (paralelně), proudu (sériově), odporu. Řešení typických chyb při zapojení. Čtení stupnice.',
  },
  {
    id: 'eo-vedeni-v-kapalinach',
    subtopicId: 'vedeni-proudu-v-kapalinach',
    topicId: 'elektricke-obvody',
    title: 'Vedení proudu v kapalinách',
    type: 'method',
    description: 'Žáci testují vodivost různých kapalin: destilovaná voda, kohoutková voda, solný roztok, ocet, olej. Zapojení obvodu se žárovkou nebo LED. Diskuze o iontech jako nosičích náboje.',
  },
  {
    id: 'eo-bezpecnost-elektrina',
    subtopicId: 'bezpecnost-pri-praci-s-elektrinou',
    topicId: 'elektricke-obvody',
    title: 'Bezpečnost při práci s elektřinou',
    type: 'method',
    description: 'Interaktivní aktivita o nebezpečí elektrického proudu: demonstrace účinků proudu, bezpečné napětí, první pomoc při úrazu elektrickým proudem, zásady práce s elektřinou v domácnosti.',
  },

  // === ELEKTROSTATIKA ===
  {
    id: 'elektrostatika-tipy-aktivity',
    subtopicId: 'elektricky-naboj',
    topicId: 'elektrostatika',
    title: 'Tipy na aktivity s elektrostatikou',
    type: 'method',
    description: 'Sada aktivit: nabíjení balónku třením a přitahování vlasů, „tancující" alobalové kuličky mezi nabitými deskami, elektrostatický motor z kelímku, Franklinovy zvonky z plechovek.',
  },

  // === MAGNETISMUS ===
  {
    id: 'magnetismus-magneticke-vlastnosti',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Magnetické vlastnosti látek',
    type: 'method',
    description: 'Třídění materiálů na magnetické a nemagnetické. Výroba elektromagnetu z hřebíku a drátu. Měření síly elektromagnetu (kolik sponek zvedne) v závislosti na počtu závitů a proudu.',
  },
  {
    id: 'magnetismus-elektromagnet-hracky',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Elektromagnetické hračky',
    type: 'other',
    description: 'Výroba elektromagnetických hraček: bzučák z elektromagnetu, jednoduchý reproduktor z cívky a magnetu, magnetická houpačka. Žáci pochopí spojení elektřiny a magnetismu.',
  },

  // === ELEKTŘINA (9. ročník) ===
  {
    id: 'elektrina-cesty-proudu',
    subtopicId: 'silnoproud',
    topicId: 'elektrina',
    title: 'Cesty elektrického proudu',
    type: 'method',
    description: 'Aktivity mapující cestu elektrického proudu od elektrárny do zásuvky: model rozvodné sítě, transformace napětí, bezpečnostní prvky. Propojení s praktickým životem.',
  },
  {
    id: 'elektrina-indukcni-strikacka',
    subtopicId: 'elektromagnetismus-a-indukce',
    topicId: 'elektrina',
    title: 'Indukční stříkačka – výroba',
    type: 'other',
    description: 'Stavba „indukční stříkačky": cívka navinutá na injekční stříkačce s neodymovým magnetem uvnitř. Pohybem magnetu se v cívce indukuje napětí – rozsvítí LED. Demonstrace elektromagnetické indukce.',
  },

  // === ASTRONOMIE ===
  {
    id: 'astronomie-astronomie-z-papiru',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Astronomie z papíru',
    type: 'other',
    description: 'Výroba papírových modelů: Sluneční soustava v měřítku, otáčivá mapa hvězdné oblohy, model fází Měsíce. Žáci si vyrobí pomůcky, které pak používají při pozorování.',
  },
  {
    id: 'astronomie-vesmirne-pokusy',
    subtopicId: 'vesmir',
    topicId: 'astronomie',
    title: 'Vesmírné pokusy',
    type: 'method',
    description: 'Aktivity simulující podmínky ve vesmíru: vakuum (zvon s pumpou – balónek se roztáhne), beztíže (volný pád s vodou), impakty (padání kuliček do mouky – krátery). Motivační propojení s kosmonautikou.',
  },
  {
    id: 'astronomie-exoplanety',
    subtopicId: 'dalsi-vesmirna-telesa',
    topicId: 'astronomie',
    title: 'Odhalování exoplanet',
    type: 'method',
    description: 'Modelování tranzitní metody detekce exoplanet: žárovka (hvězda) + kulička na tyčce (planeta) + luxmetr/senzor. Žáci měří pokles jasu při průchodu „planety" před „hvězdou".',
  },

  // === MIKROSVĚT ===
  {
    id: 'mikrosvet-mlzna-komora',
    subtopicId: 'radioaktivita',
    topicId: 'mikrosvet',
    title: 'Mlžná komora',
    type: 'other',
    description: 'Stavba jednoduché mlžné komory z Petriho misky, izopropylalkoholu a suchého ledu. Žáci pozorují stopy částic kosmického záření a přirozené radioaktivity. Fascinující vizualizace mikrosvěta.',
  },
  {
    id: 'mikrosvet-jak-do-mikrosveta',
    subtopicId: 'skaly-v-mikrosvete',
    topicId: 'mikrosvet',
    title: 'Jak se dívat do mikrosvěta',
    type: 'method',
    description: 'Pozorování mikrosvěta pomocí USB mikroskopu a mobilního telefonu (kapka vody na čočce = makro objektiv). Žáci pozorují strukturu látek, krystaly soli, vlákna textilu. Škály od mm po μm.',
  },

  // === VLASTNOSTI LÁTEK ===
  {
    id: 'vlastnosti-neni-plast-jako-plast',
    subtopicId: 'pevne-latky',
    topicId: 'vlastnosti-latek',
    title: 'Není plast jako plast',
    type: 'method',
    description: 'Třídění plastů podle recyklačních symbolů, porovnání vlastností (pružnost, tvrdost, hustota). Test plavání v různých kapalinách. Propojení s ekologií a tříděním odpadu.',
  },
  {
    id: 'vlastnosti-animace-prirovedna',
    subtopicId: 'latky-a-telesa',
    topicId: 'vlastnosti-latek',
    title: 'Animace v přírodovědné výuce',
    type: 'method',
    description: 'Žáci tvoří krátké stop-motion animace fyzikálních jevů (tání ledu, rozpouštění, difúze). Natáčení mobilem, spojení snímků v aplikaci. Propojení kreativity s pochopením jevů.',
  },

  // === ČÁSTICE LÁTKY ===
  {
    id: 'castice-mydlove-hratky',
    subtopicId: 'casticove-slozeni-latek',
    topicId: 'castice-latky',
    title: 'Mýdlové hrátky',
    type: 'method',
    description: 'Experimenty s mýdlovými bublinami: minimální plochy na drátěných rámečkách, obří bubliny, bublina v bublině. Propojení s povrchovým napětím a částicovou stavbou kapalin.',
  },

  // === AKUSTIKA ===
  {
    id: 'akustika-phyphox',
    subtopicId: 'vlneni',
    topicId: 'akustika',
    title: 'Výuka akustiky s aplikací Phyphox',
    type: 'method',
    description: 'Využití aplikace Phyphox pro měření zvuku: frekvence tónu (ladička, hudební nástroj), hladina hluku v učebně, rychlost zvuku (echo). Žáci pracují s vlastním mobilem.',
  },
  {
    id: 'akustika-reproduktor-mikrofon',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Reproduktor a mikrofon – výroba',
    type: 'other',
    description: 'Stavba jednoduchého reproduktoru z cívky, magnetu a papírového kónusu. Opačný postup = mikrofon. Žáci pochopí, že reproduktor a mikrofon fungují na stejném principu (elektromagnetická indukce).',
  },

  // === TEPELNÉ MOTORY ===
  {
    id: 'tepelne-pastickemobil',
    subtopicId: 'spalovaci-motory',
    topicId: 'tepelne-motory',
    title: 'Pastičkomobil',
    type: 'other',
    description: 'Stavba autíčka poháněného pastičkou na myši. Pružina pastičky pohání osu přes provázek navinutý na zadní nápravě. Žáci optimalizují konstrukci pro maximální dojezd. Přeměna energie pružnosti na pohybovou.',
  },

  // === DALŠÍ POKUSY (špatně zařazené, vrátit jako experimenty) ===
];

// Also create some more experiments that were missed
const newExperiments: ContentItem[] = [
  {
    id: 'optika-geogebra-geometricka',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'GeoGebra v geometrické optice',
    type: 'qualitative',
    description: 'Simulace chodu paprsků v GeoGebře: konstrukce obrazu v zrcadle a čočce, měření ohniskové vzdálenosti, ověření zobrazovací rovnice. Žáci interaktivně mění polohu předmětu a pozorují změnu obrazu.',
    materials: ['počítač s GeoGebrou', 'dataprojektor'],
  },
  {
    id: 'sila-sila-aktivity',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Síla – co na nás působí',
    type: 'qualitative',
    description: 'Série pokusů demonstrující účinky síly: deformace pružiny (Hookův zákon), změna pohybu (kutálení míče), tření (klouzání po různých površích). Žáci kreslí šipky sil do obrázků.',
    materials: ['pružina', 'siloměr', 'míč', 'různé povrchy (dřevo, koberec, led)'],
  },
  {
    id: 'elektrina-magneticky-vlak',
    subtopicId: 'elektromagnetismus-a-indukce',
    topicId: 'elektrina',
    title: 'Magnetický vlak v měděné trubce',
    type: 'qualitative',
    description: 'Baterie s neodymovými magnety na koncích se sama pohybuje měděnou trubkou. Magnety indukují v trubce vířivé proudy, které vytváří magnetické pole posunující „vlak" vpřed. Efektní demonstrace indukce.',
    materials: ['měděná trubka (délka ~1 m)', 'baterie AA', 'neodymové magnety (průměr jako trubka)'],
  },
  {
    id: 'kapaliny-spojene-nadoby-pokus',
    subtopicId: 'spojene-nadoby',
    topicId: 'kapaliny-7',
    title: 'Spojené nádoby – hladiny se vyrovnají',
    type: 'qualitative',
    description: 'Dvě průhledné nádoby spojené hadičkou: po nalití vody do jedné se hladiny vyrovnají bez ohledu na tvar nádob. S olejem a vodou: olej v jedné straně → hladiny nejsou stejně vysoko (různé hustoty).',
    materials: ['dvě průhledné nádoby různých tvarů', 'průhledná hadička', 'voda', 'olej', 'potravinářské barvivo'],
  },
  {
    id: 'energie-termoelektricke-jevy',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Termočlánek v hodinách fyziky',
    type: 'measurement',
    description: 'Výroba termočlánku ze dvou různých drátů (měď + železo). Zahřátí spoje generuje napětí měřitelné multimetrem. Seebeckův jev. Měření závislosti napětí na teplotním rozdílu.',
    materials: ['měděný drát', 'železný drát', 'multimetr', 'svíčka nebo plamen', 'led'],
  },
];

async function main() {
  let actCount = 0;
  let expCount = 0;

  for (const act of newActivities) {
    const filePath = join(CONTENT_DIR, 'activities', `${act.id}.json`);
    const data: Record<string, unknown> = {
      id: act.id,
      subtopicId: act.subtopicId,
      topicId: act.topicId,
      title: act.title,
      type: act.type,
      description: act.description,
    };
    await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    actCount++;
  }

  for (const exp of newExperiments) {
    const filePath = join(CONTENT_DIR, 'experiments', `${exp.id}.json`);
    const data: Record<string, unknown> = {
      id: exp.id,
      subtopicId: exp.subtopicId,
      topicId: exp.topicId,
      title: exp.title,
      type: exp.type,
      description: exp.description,
    };
    if (exp.materials) {
      data.materials = exp.materials;
    }
    await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    expCount++;
  }

  console.log(`Created ${actCount} new activity files and ${expCount} new experiment files`);
}

main();
