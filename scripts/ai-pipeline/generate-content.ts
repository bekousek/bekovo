/**
 * Generate content JSON files from classified PDF articles
 * Each entry represents a ZŠ-appropriate experiment or activity
 * identified from the Dílny Heuréky, VNUF, and Elixír sborníky
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'src', 'content');

interface Experiment {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  type: 'qualitative' | 'measurement';
  description: string;
  materials?: string[];
  procedure?: string;
  source: string;
}

interface Activity {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  type: 'game' | 'method' | 'group-work' | 'other';
  description: string;
  source: string;
}

// ============ EXPERIMENTS ============

const experiments: Experiment[] = [
  // === OPTIKA ===
  {
    id: 'optika-zrcadla-opticka-tabule',
    subtopicId: 'zrcadla-zakon-odrazu',
    topicId: 'optika',
    title: 'Žákovská optická tabule – zrcadla',
    type: 'qualitative',
    description: 'Žáci na optické tabuli (bílá deska s úhloměrem) pozorují odraz laserového paprsku od rovinného zrcadla. Ověřují zákon odrazu – úhel odrazu se rovná úhlu dopadu. Lze rozšířit o dva zrcadla a mnohonásobný odraz.',
    materials: ['optická tabule nebo bílá deska', 'laserové ukazovátko', 'rovinné zrcátko', 'úhloměr', 'držáky'],
    source: 'Dílny Heuréky 2013 – V. Piskač: Žákovská optická tabule – zrcadla'
  },
  {
    id: 'optika-geometricka-akvarium',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Geometrická optika v akváriu',
    type: 'qualitative',
    description: 'Pomocí malého akvária naplněného vodou s kapkou mléka (pro zviditelnění paprsků) se demonstrují jevy geometrické optiky: lom světla na rozhraní, totální odraz, chod paprsků čočkou. Laserový paprsek je viditelný ve vodě díky rozptýlenému světlu.',
    materials: ['akvárium nebo průhledná nádoba', 'laserové ukazovátko', 'mléko', 'voda', 'čočky', 'zrcátka'],
    source: 'Dílny Heuréky 2022 – B. Mikulecká: Geometrická optika nejen v akváriu'
  },
  {
    id: 'optika-pitva-oka',
    subtopicId: 'oko',
    topicId: 'optika',
    title: 'Pitva kravského oka',
    type: 'qualitative',
    description: 'Žáci pitvají kravské oko (z řeznictví) a identifikují jeho části: rohovku, duhovku, čočku, sklivec, sítnici. Pozorují, jak čočka vytváří převrácený obraz. Demonstrace spojení mezi biologií a fyzikou optiky oka.',
    materials: ['kravské oko (z řeznictví)', 'skalpel nebo nůžky', 'pinzeta', 'Petriho miska', 'rukavice'],
    source: 'Dílny Heuréky 2018 – B. Mikulecká: Pitva kravského oka a základní pokusy z optiky'
  },
  {
    id: 'optika-svetelny-tunel',
    subtopicId: 'zrcadla-zakon-odrazu',
    topicId: 'optika',
    title: 'Světelný tunel',
    type: 'qualitative',
    description: 'Dva zrcadla naproti sobě s LED páskem po obvodu vytvářejí optickou iluzi nekonečného tunelu. Žáci pozorují mnohonásobný odraz a diskutují, proč se obraz postupně zmenšuje (ztráty při každém odrazu).',
    materials: ['dvě kulatá zrcadla', 'LED pásek', 'baterie nebo napájecí zdroj', 'průhledná fólie'],
    source: 'Elixír nápadů 1 – Krásy optiky: Světelný tunel a Difrakční brýle'
  },
  {
    id: 'optika-skladani-barev',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'Skládání barev RGB',
    type: 'qualitative',
    description: 'Pomocí tří LED svítilen (červená, zelená, modrá) žáci na bílé stěně skládají barvy: R+G=žlutá, R+B=purpurová, G+B=azurová, R+G+B=bílá. Porovnání aditivního a subtraktivního míchání barev.',
    materials: ['tři LED svítilny nebo LED (červená, zelená, modrá)', 'bílá stěna nebo papír', 'zatemněná učebna'],
    source: 'Dílny Heuréky 2022 – V. Koudelková: Skládání barev na mnoho způsobů'
  },
  {
    id: 'optika-rgb-michacka',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'RGB míchačka – jednoduše',
    type: 'qualitative',
    description: 'Jednoduchá pomůcka z RGB LED a tří potenciometrů umožňuje plynule měnit intenzitu červené, zelené a modré složky. Žáci experimentují s mícháním barev a pozorují, jak se mění výsledná barva.',
    materials: ['RGB LED', 'tři potenciometry', 'rezistory', 'baterie', 'nepájivé kontaktní pole'],
    source: 'Dílny Heuréky 2023 – K. Lipertová: RGB míchačka jednoduše'
  },
  {
    id: 'optika-pokusy-zatemneni',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Pokusy při zatemnění učebny',
    type: 'qualitative',
    description: 'Série jednoduchých pokusů demonstrujících vlastnosti světla: přímočaré šíření (stíny), rozklad bílého světla hranolem, rozptyl světla (Tyndallův jev s mlhou), fluorescence (UV svítilna). Efektní v zatemněné učebně.',
    materials: ['laserové ukazovátko', 'optický hranol', 'UV svítilna', 'mlhová trubice nebo kadidlo', 'fluorescenční předměty'],
    source: 'Dílny Heuréky 2013 – Z. Polák: Pokusy při zatemnění učebny'
  },
  {
    id: 'optika-opticke-iluze',
    subtopicId: 'oko',
    topicId: 'optika',
    title: 'Optické iluze před a za zrcadlem',
    type: 'qualitative',
    description: 'Série optických iluzí využívajících zrcadla a vlastnosti lidského oka: Pepperův duch (polopropustné zrcadlo), nekonečné zrcadlo, thaumatrop (dva obrázky splývající díky setrvačnosti oka). Diskuze o tom, jak mozek zpracovává vizuální informace.',
    materials: ['polopropustné zrcadlo nebo sklo', 'rovinná zrcadla', 'kartičky na thaumatrop', 'provázek'],
    source: 'Dílny Heuréky 2022 – J. Soukupová: Optické iluze nejen před a za zrcadlem'
  },
  {
    id: 'optika-periskop',
    subtopicId: 'zrcadla-zakon-odrazu',
    topicId: 'optika',
    title: 'Výroba periskopu',
    type: 'qualitative',
    description: 'Žáci si vyrobí periskop z kartónové krabice a dvou zrcátek. Pochopí princip dvojitého odrazu světla na rovnoběžných zrcadlech pod úhlem 45°. Využití: pozorování přes překážky, ponorky.',
    materials: ['kartónová krabice nebo tubus', 'dvě zrcátka', 'nůžky', 'lepicí páska', 'pravítko'],
    source: 'Dílny Heuréky 2022 – H. Trhlíková: Výroba periskopu'
  },
  {
    id: 'optika-lidske-oko-vady',
    subtopicId: 'oko',
    topicId: 'optika',
    title: 'Lidské oko a jeho vady',
    type: 'qualitative',
    description: 'Na modelu oka (spojná čočka + stínítko) žáci demonstrují vznik obrazu na sítnici, krátkozrakost (obraz před sítnicí) a dalekozrakost (obraz za sítnicí). Korekce rozptylkou a spojkou.',
    materials: ['spojná čočka', 'stínítko', 'svíčka nebo LED', 'optická lavice', 'rozptylná čočka'],
    source: 'Dílny Heuréky 2024 – T. Kopřiva: Lidské oko a jeho vady'
  },
  {
    id: 'optika-duha',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'Kde leží duha',
    type: 'qualitative',
    description: 'Pomocí zahradní hadice a postřikovače žáci vytvářejí duhu a pozorují, pod jakým úhlem vůči slunečním paprskům se objevuje. Měření úhlu (~42°). Vysvětlení lomu a rozkladu světla na kapkách vody.',
    materials: ['zahradní hadice s postřikovačem', 'slunečné počasí', 'úhloměr'],
    source: 'Dílny Heuréky 2024 – P. Zacharov: Kde leží duha'
  },
  {
    id: 'optika-na-desku',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Optika na desku',
    type: 'qualitative',
    description: 'Sada pokusů demonstrovaných přímo na desce stolu: lom světla v plexisklovém půlkruhu, chod paprsků spojnou a rozptylnou čočkou, rozklad světla. Žáci si sami na desku kreslí chod paprsků.',
    materials: ['plexisklový půlkruh', 'laserové ukazovátko', 'čočky', 'optický hranol', 'papír', 'tužka'],
    source: 'Dílny Heuréky 2024 – Z. Hubáček: Optika na desku'
  },

  // === MAGNETISMUS ===
  {
    id: 'magnetismus-hratky',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Hrátky s magnetismem',
    type: 'qualitative',
    description: 'Série experimentů s magnety: přitahování a odpuzování, magnetické siločáry pomocí pilin, magnetizace hřebíku, kompas z magnetky na vodní hladině, přitahování přes překážky (papír, ruka, voda). Vhodné pro 6. ročník.',
    materials: ['tyčové magnety', 'železné piliny', 'hřebíky', 'kompas', 'papír', 'korkový plovák', 'jehla'],
    source: 'Dílny Heuréky 2015 – Z. Polák: Hrátky s magnetismem'
  },
  {
    id: 'magnetismus-pole-zeme',
    subtopicId: 'magneticke-pole-zeme',
    topicId: 'magnetismus',
    title: 'O magnetu a velikém magnetu Zemi',
    type: 'qualitative',
    description: 'Demonstrace magnetického pole Země: výroba kompasu z jehly potřené magnetem na korku plovoucím na vodě. Měření deklinace. Model Země jako velkého magnetu s póly. Diskuze o přepólování.',
    materials: ['jehla', 'magnet', 'korek', 'miska s vodou', 'kompas', 'globus'],
    source: 'Dílny Heuréky 2016 – L. Dvořák: O magnetu, magnetických tělesech a velikém magnetu Zemi'
  },

  // === ELEKTROSTATIKA ===
  {
    id: 'elektrostatika-neposlusna',
    subtopicId: 'elektricky-naboj',
    topicId: 'elektrostatika',
    title: 'Neposlušná elektrostatika',
    type: 'qualitative',
    description: 'Série pokusů s elektrickým nábojem: nabíjení tyče třením, přitahování papírků, ohýbání proudu vody nabitou tyčí, „létající" igelitový kroužek nad nabitou tyčí, elektroskop z alobalu a sklenice.',
    materials: ['PVC tyč nebo balónek', 'vlněná látka', 'papírky', 'proud vody', 'igelitový sáček', 'alobal', 'sklenice'],
    source: 'Dílny Heuréky 2017 – P. Žilavý: Neposlušná elektrostatika'
  },
  {
    id: 'elektrostatika-pole-znazorneni',
    subtopicId: 'elektricky-naboj',
    topicId: 'elektrostatika',
    title: 'Znázorňování elektrostatického pole',
    type: 'qualitative',
    description: 'Vizualizace elektrického pole pomocí krupice v oleji mezi nabíjenými elektrodami. Krupice se uspořádá podél siločar. Lze ukázat pole bodového náboje, dipólu i deskového kondenzátoru.',
    materials: ['Petriho miska', 'olej', 'krupice nebo semínka trávy', 'elektrody', 'Van de Graaffův generátor nebo nabíjecí zdroj'],
    source: 'Dílny Heuréky 2022 – H. Trhlíková: Znázorňování elektrického pole'
  },

  // === ELEKTRICKÉ OBVODY ===
  {
    id: 'eo-vodiva-paska',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Elektřina s vodivou páskou',
    type: 'qualitative',
    description: 'Stavba jednoduchých elektrických obvodů pomocí měděné vodivé pásky nalepené na papíře. Žáci zapojují LED, rezistory a přepínače. Výhoda: obvod je plochý, přehledný, snadno se kreslí schéma.',
    materials: ['měděná vodivá páska', 'knoflíková baterie 3V', 'LED', 'papír', 'nůžky'],
    source: 'Dílny Heuréky 2023 – V. Boček: Elektřina s vodivou páskou'
  },
  {
    id: 'eo-seriove-paralelne',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Sériově, paralelně s Ohmem a viditelně',
    type: 'measurement',
    description: 'Žáci zapojují žárovky sériově a paralelně a měří napětí a proud v různých místech obvodu. Pozorují vliv zapojení na jas žárovek. Ověřování Ohmova zákona – měření U a I, výpočet R.',
    materials: ['žárovky', 'baterie', 'vodiče', 'voltmetr', 'ampérmetr', 'přepínače'],
    source: 'Dílny Heuréky 2023 – Z. Hubáček: Sériově, paralelně s Ohmem a viditelně'
  },
  {
    id: 'eo-hrajeme-s-odporem',
    subtopicId: 'proud-a-napeti',
    topicId: 'elektricke-obvody',
    title: 'Hrajeme si s odporem',
    type: 'measurement',
    description: 'Série pokusů na porozumění elektrickému odporu: měření odporu různých materiálů, závislost odporu na délce a průřezu vodiče, odpor lidského těla, vodivost roztoku soli. Vizualizace pomocí žárovek.',
    materials: ['různé vodiče (drát, grafit, voda)', 'multimetr', 'baterie', 'žárovky', 'sůl', 'voda'],
    source: 'Dílny Heuréky 2021 – V. Boček: Hrajeme si s odporem'
  },
  {
    id: 'eo-vanocni-obvody',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Vánoční obvody – svítící přání a stromeček',
    type: 'qualitative',
    description: 'Žáci vyrobí vánoční přání s LED diodou zapojenou pomocí měděné pásky a knoflíkové baterie. Pokročilejší varianta: svítící stromeček s více LED zapojenými paralelně. Propojení fyziky s tvořivou činností.',
    materials: ['tvrdý papír', 'měděná vodivá páska', 'knoflíková baterie CR2032', 'LED (různé barvy)', 'nůžky', 'fixy'],
    source: 'Elixír nápadů 1 – Vánoční obvody: Vánoční přání z Těrlicka a Svítící vánoční stromeček'
  },
  {
    id: 'eo-fotorezistor-zs',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Fotorezistor na základní škole',
    type: 'measurement',
    description: 'Měření odporu fotorezistoru v závislosti na osvětlení. Žáci pozorují, jak se mění odpor při zakrytí a osvícení. Zapojení jednoduchého obvodu, kde LED svítí jen ve tmě (noční světlo).',
    materials: ['fotorezistor', 'LED', 'rezistor', 'baterie', 'multimetr', 'nepájivé kontaktní pole'],
    source: 'Dílny Heuréky 2024 – H. Trhlíková: Fotorezistor na základní škole'
  },
  {
    id: 'eo-simulace-obvodu',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Simulace elektrických obvodů',
    type: 'qualitative',
    description: 'Využití simulátoru PhET Circuit Construction Kit pro virtuální stavbu obvodů. Žáci zapojují zdroje, žárovky, spínače, měří napětí a proud. Vhodné jako doplněk k reálným pokusům nebo pro domácí práci.',
    materials: ['počítač s přístupem k internetu', 'PhET simulace (phet.colorado.edu)'],
    source: 'Dílny Heuréky 2022 – L. Dvořák: Simulujeme a kreslíme elektrické obvody'
  },

  // === KAPALINY ===
  {
    id: 'kapaliny-hydraulicky-zvedak',
    subtopicId: 'pascaluv-zakon',
    topicId: 'kapaliny-7',
    title: 'Hydraulický zvedák',
    type: 'qualitative',
    description: 'Výroba jednoduchého modelu hydraulického zvedáku ze dvou injekčních stříkaček spojených hadičkou naplněnou vodou. Demonstrace Pascalova zákona – malá síla na malý píst vytvoří velkou sílu na velkém pístu.',
    materials: ['dvě injekční stříkačky (různé objemy)', 'plastová hadička', 'voda', 'stojan'],
    source: 'Dílny Heuréky 2021 – H. Trhlíková: Hydraulický zvedák'
  },
  {
    id: 'kapaliny-kapky',
    subtopicId: 'tlak',
    topicId: 'kapaliny-7',
    title: 'Kapky a kapičky',
    type: 'qualitative',
    description: 'Pozorování povrchového napětí vody: kapky na minci (kolik se vejde?), mýdlové bubliny, plovoucí kancelářská sponka na hladině, „pepřový pokus" (mýdlo rozbije povrchové napětí).',
    materials: ['mince', 'kapátko', 'voda', 'saponát', 'kancelářská sponka', 'pepř', 'miska'],
    source: 'Dílny Heuréky 2021 – V. Koudelková: Kapky a kapičky'
  },
  {
    id: 'kapaliny-lodky',
    subtopicId: 'lode',
    topicId: 'kapaliny-7',
    title: 'Loďky a lodičky',
    type: 'qualitative',
    description: 'Stavba různých typů lodiček (z alobalu, korku, plastu) a testování jejich nosnosti. Žáci zkoumají, proč lodě plavou – klíčem je vytlačený objem vody a Archimédův zákon. Soutěž: čí loď unese nejvíce mincí.',
    materials: ['alobal', 'korek', 'plastelína', 'mince', 'nádoba s vodou', 'nůžky'],
    source: 'Dílny Heuréky 2019 – K. Lipertová: Loďky a lodičky'
  },
  {
    id: 'kapaliny-potapeni',
    subtopicId: 'vztlakova-sila',
    topicId: 'kapaliny-7',
    title: 'Fyzika potápění',
    type: 'qualitative',
    description: 'Demonstrace fyzikálních principů potápění: vztlaková síla, vliv tlaku na objem (Boyleův zákon), kartézský potápěč z PET láhve. Žáci si vyrobí kartézského potápěče a zkoumají, jak stlačení láhve ovlivní ponor.',
    materials: ['PET láhev', 'kečupová sáček nebo pipeta', 'voda', 'plastelína'],
    source: 'Dílny Heuréky 2022 – V. Krajčová: Fyzika potápění'
  },

  // === PLYNY ===
  {
    id: 'plyny-balonky',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: '30+1 experiment s balónky',
    type: 'qualitative',
    description: 'Série jednoduchých pokusů s nafukovacími balónky demonstrující vlastnosti plynů a atmosférický tlak: balónek v láhvi (nelze nafouknout), balónek na svíčce (tepelná roztažnost), jet balónku (zákon akce a reakce).',
    materials: ['nafukovací balónky', 'PET láhve', 'svíčky', 'jehla', 'lepicí páska'],
    source: 'Dílny Heuréky 2011 – Z. Kielbusová, L. Prusíková: 30+1 experiment s balónky'
  },
  {
    id: 'plyny-vysoky-nizky-tlak',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Vysoký a nízký tlak',
    type: 'qualitative',
    description: 'Pokusy demonstrující atmosférický tlak: obrácená sklenice s vodou (kartón drží díky atm. tlaku), Magdeburské polokoule z misek, vařené vejce nasáté do láhve, drtící plechovka (ochladíme páru → podtlak).',
    materials: ['sklenice', 'kartón', 'voda', 'přísavky nebo misky', 'vejce', 'láhev', 'plechovka', 'vařič'],
    source: 'Dílny Heuréky 2018 – Z. Hubáček: Vysoký a nízký tlak'
  },
  {
    id: 'plyny-voda-vzduch',
    subtopicId: 'vztlak-v-plynech',
    topicId: 'plyny-7',
    title: 'Co umí voda a vzduch',
    type: 'qualitative',
    description: 'Experimenty s vlastnostmi vody a vzduchu: vzduch má hmotnost (vážení balónku), tlak vzduchu (Magdeburské polokoule), Bernoulliho jev (ping-pongový míček v proudu vzduchu), vztlak v plynech (horkovzdušný balón z čajové svíčky).',
    materials: ['balónky', 'váhy', 'fén', 'ping-pongový míček', 'igelitový sáček', 'čajová svíčka'],
    source: 'Dílny Heuréky 2012 – H. Kunzová: Co umí voda a vzduch'
  },

  // === AKUSTIKA ===
  {
    id: 'akustika-pistalky',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Píšťalky, flétny, klarinety',
    type: 'qualitative',
    description: 'Výroba jednoduchých hudebních nástrojů: píšťalka z brčka, flétnička z PVC trubky, klarinet ze stébla trávy. Žáci zkoumají, jak délka trubice ovlivňuje výšku tónu a jak vzniká zvuk rozkmitáním vzduchu.',
    materials: ['brčka', 'PVC trubky různých délek', 'nůžky', 'stébla trávy'],
    source: 'Dílny Heuréky 2016 – T. Krásenský: Píšťalky, flétny, klarinety'
  },
  {
    id: 'akustika-zvucne-hracky',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Zvučné hračky',
    type: 'qualitative',
    description: 'Výroba jednoduchých zvukových hraček: bzučák z knoflíku na niti, řehtačka z kartónu, vodní píšťalka, „bručící" pravítko přes hranu stolu. Žáci pozorují zdroje zvuku a jejich vlastnosti (výška, hlasitost).',
    materials: ['knoflík', 'nit', 'kartón', 'pravítko', 'láhev s vodou'],
    source: 'Dílny Heuréky 2021 – D. Juchelková: Zvučné hračky'
  },
  {
    id: 'akustika-kalimba',
    subtopicId: 'hudebni-nastroje',
    topicId: 'akustika',
    title: 'Výroba kalimby',
    type: 'qualitative',
    description: 'Žáci si vyrobí kalimbu (mbiru) – africký hudební nástroj. Kovové jazýčky různých délek upevněné na dřevěnou destičku vydávají tóny různé výšky. Kratší jazýček = vyšší tón. Propojení fyziky a hudby.',
    materials: ['dřevěná destička', 'kovové jazýčky (sponky, plíšky)', 'šroubky nebo vruty', 'matice'],
    source: 'Elixír nápadů 1 – Výroba hudebního nástroje: Kalimba a mbira'
  },

  // === SÍLA ===
  {
    id: 'sila-teziste',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Těžiště – rovnovážné polohy',
    type: 'qualitative',
    description: 'Hledání těžiště nepravidelných těles zavěšováním na provázku. Balancování předmětů (vidlička+korek+jehla na špičce prstu). Stabilní, labilní a indiferentní rovnovážná poloha na příkladech.',
    materials: ['kartónové tvary', 'provázek', 'špendlík', 'vidlička', 'korek', 'jehla'],
    source: 'Dílny Heuréky 2014 – V. Piskač: Těžiště'
  },
  {
    id: 'sila-rachejtle',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Měření tahové síly rachejtle',
    type: 'measurement',
    description: 'Žáci měří tahovou sílu silvestrovské rachejtle připevněné k siloměru. Pozorují velikost síly v čase a diskutují třetí Newtonův zákon (akce a reakce). Měření ve venkovním prostředí.',
    materials: ['silvestrovská rachejtle', 'siloměr nebo digitální siloměr', 'stojan', 'zápalky', 'ochranné brýle'],
    source: 'Elixír nápadů 1 – Měření tahové síly silvestrovské rachejtle'
  },
  {
    id: 'sila-padajici-hracky',
    subtopicId: 'gravitacni-a-tihova-sila',
    topicId: 'sila',
    title: 'Padající a šplhající hračky',
    type: 'qualitative',
    description: 'Konstrukce hraček demonstrujících gravitaci a pohyb: padající opička (volný pád), šplhající figurka (na niti s mechanismem), jojo (přeměna energie). Žáci analyzují síly působící na hračky.',
    materials: ['kartón', 'provázek', 'korálky', 'nůžky', 'lepidlo'],
    source: 'Dílny Heuréky 2024 – Č. Krejčí: Padající a šplhající hračky'
  },

  // === POHYB ===
  {
    id: 'pohyb-grafy-heureka',
    subtopicId: 'grafy',
    topicId: 'pohyb',
    title: 'Grafy pohybu – pochopení a tvorba',
    type: 'measurement',
    description: 'Žáci se pohybují před ultrazvukovým čidlem a pozorují graf dráhy v závislosti na čase v reálném čase. Učí se „číst" grafy: klid = vodorovná čára, rovnoměrný pohyb = přímka, zrychlení = křivka.',
    materials: ['ultrazvukové čidlo (Vernier/Pasco) nebo aplikace Phyphox', 'počítač', 'metr'],
    source: 'Dílny Heuréky 2017 – J. Reichl: Grafy'
  },
  {
    id: 'pohyb-mereni-rychlosti',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Měření rychlosti pomocí digitálních technologií',
    type: 'measurement',
    description: 'Měření rychlosti chůze a běhu žáků na chodbě pomocí stopek a měřicího pásku. Výpočet průměrné rychlosti. Pokročilejší varianta: videoanalýza pohybu pomocí aplikace Tracker.',
    materials: ['stopky', 'měřicí pásmo', 'telefon s aplikací Tracker nebo Phyphox'],
    source: 'Elixír nápadů 1 – Měření rychlosti pomocí digitálních technologií'
  },
  {
    id: 'pohyb-volny-pad',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Volný pád a vodorovný vrh',
    type: 'measurement',
    description: 'Žáci pouštějí kuličky z různých výšek a měří dobu pádu. Porovnání volného pádu a vodorovného vrhu: puštěná a současně vodorovně vržená kulička dopadnou současně. Fotodokumentace stroboskopem nebo bleskem.',
    materials: ['kuličky', 'stopky', 'metr', 'rampa pro vodorovný vrh', 'telefon s pomalým záznamem'],
    source: 'Dílny Heuréky 2023 – J. Kvapil: Volný pád a vodorovný vrh'
  },

  // === ENERGIE / TEPLO ===
  {
    id: 'energie-hratky-s-teplem',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Hrátky s teplem',
    type: 'qualitative',
    description: 'Pokusy s šířením tepla: vedení tepla různými materiály (kov vs. dřevo), konvekce (spirála nad svíčkou), záření (porovnání bílého a černého povrchu v IR). Tepelný tok jako analogie el. proudu.',
    materials: ['tyčky z různých materiálů (kov, dřevo, plast)', 'svíčka', 'papírová spirála', 'bílý a černý papír', 'teploměr'],
    source: 'Dílny Heuréky 2016 – Z. Polák: Hrajeme si s teplem'
  },
  {
    id: 'energie-teplo-teplota',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Teplo a teplota – obtížná interpretace',
    type: 'qualitative',
    description: 'Experimenty odhalující běžné miskoncepce o teple a teplotě: „proč kov na dotek chladnější než dřevo?" (obojí stejná teplota), míchání teplé a studené vody (T se neprůměruje objemově), smáčení rukou – pocit chladu.',
    materials: ['teploměr', 'teplá a studená voda', 'kovové a dřevěné předměty', 'nádoby'],
    source: 'Dílny Heuréky 2023 – P. Kácovský: Teplo a teplota – vybrané experimenty'
  },
  {
    id: 'skupenstvi-termokamera',
    subtopicId: 'zmeny-skupenstvi-latek',
    topicId: 'skupenstvi-latek',
    title: 'Změny skupenství očima termokamery',
    type: 'qualitative',
    description: 'Pomocí termokamery (i mobilní) žáci pozorují teplotu při tání ledu, vypařování vody, srážení vodní páry. Viditelné: led zůstává na 0 °C během tání, mokrá ruka je chladnější (odpařování).',
    materials: ['termokamera nebo mobilní termovizní nástavec', 'led', 'voda', 'varná konvice'],
    source: 'Dílny Heuréky 2023 – V. Lang: Změny skupenství očima termokamery'
  },

  // === MĚŘENÍ ===
  {
    id: 'mereni-hustota-injekce',
    subtopicId: 'hustota',
    topicId: 'mereni',
    title: 'Hustota v injekční stříkačce',
    type: 'measurement',
    description: 'Měření hustoty kapalin pomocí injekční stříkačky jako odměrného válce (objem) a digitálních vah (hmotnost). Žáci porovnávají hustotu vody, oleje, slaného roztoku. Jednoduchá a přesná metoda.',
    materials: ['injekční stříkačka (bez jehly)', 'digitální váhy', 'voda', 'olej', 'sůl'],
    source: 'Dílny Heuréky 2021 – K. Heřman: Hustota v injekční stříkačce'
  },
  {
    id: 'mereni-teplota-digitalne',
    subtopicId: 'teplota',
    topicId: 'mereni',
    title: 'Měříme teplotu digitálně',
    type: 'measurement',
    description: 'Využití digitálních teploměrů a teplotních čidel pro přesné měření teploty: tání ledu, var vody, teplota lidského těla. Porovnání s rtuťovým teploměrem. Záznam změny teploty v čase.',
    materials: ['digitální teploměr', 'teplotní čidlo', 'led', 'teplá voda', 'nádoba'],
    source: 'Dílny Heuréky 2013 – J. Polák, M. Krbal: Měříme teplotu digitálně'
  },
  {
    id: 'mereni-delka-petraskova',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Měření délky – netradiční metody',
    type: 'measurement',
    description: 'Měření délky pomocí netradičních metod: odhadování, krokování, měření pomocí těla (píď, loket, stopa). Porovnání přesnosti odhadů s měřením pravítkem a pásmem. Historické jednotky délky.',
    materials: ['pravítko', 'měřicí pásmo', 'provázek', 'předměty k měření'],
    source: 'Dílny Heuréky 2024 – E. Petrásková: Měření délky'
  },

  // === VLASTNOSTI LÁTEK ===
  {
    id: 'vlastnosti-hratky-plasty',
    subtopicId: 'pevne-latky',
    topicId: 'vlastnosti-latek',
    title: 'Hrátky s plasty',
    type: 'qualitative',
    description: 'Zkoumání vlastností plastů: pružnost, tvrdost, reakce na zahřátí (termoplasty se měknou, reaktoplasty ne), hustota (plovoucí a tonoucí plasty), rozpoznávání typů plastů podle recyklačních symbolů.',
    materials: ['vzorky plastů (PET, PE, PP, PS)', 'nádoba s vodou', 'svíčka nebo horkovzdušná pistole', 'nůžky'],
    source: 'Dílny Heuréky 2012 – V. Kopecká: Hrátky s plasty'
  },

  // === MECHANIKA ===
  {
    id: 'mechanika-jednoduche-stroje-leonardo',
    subtopicId: 'prace-na-jednoduchych-strojich',
    topicId: 'mechanika',
    title: 'Mechanické stavby – Leonardo da Vinci',
    type: 'qualitative',
    description: 'Stavba Leonardova samonosného mostu ze dřevěných tyčí bez hřebíků a lepidla. Princip vzájemného zaklesnutí. Dále: jednoduché kladky z brček, nakloněná rovina z knih.',
    materials: ['dřevěné tyče nebo prkénka', 'lanka', 'cívky na kladky', 'brčka', 'knihy'],
    source: 'Elixír nápadů 1 – Leonardo da Vinci a Mechanické stavby'
  },

  // === ASTRONOMIE ===
  {
    id: 'astronomie-stellarium',
    subtopicId: 'nocni-obloha',
    topicId: 'astronomie',
    title: 'Stellarium – počítačové planetárium',
    type: 'qualitative',
    description: 'Práce s volně dostupným programem Stellarium: zobrazení noční oblohy pro libovolné místo a čas, hledání souhvězdí, planet, fází Měsíce. Simulace zatmění, pohybu planet, východu a západu Slunce.',
    materials: ['počítač s nainstalovaným Stellariem (stellarium.org)', 'dataprojektor'],
    source: 'Dílny Heuréky 2013 – O. Kéhar, M. Randa: Stellarium – počítačové planetárium'
  },
  {
    id: 'astronomie-slunecni-hodiny',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Sluneční hodiny a sluneční kompas',
    type: 'qualitative',
    description: 'Výroba jednoduchých slunečních hodin: tyč zabodnutá do země, značení polohy stínu každou hodinu. Konstrukce ekvatoriálních slunečních hodin z kartónu. Určování světových stran pomocí Slunce.',
    materials: ['kartón', 'tyčka', 'kompas', 'nůžky', 'pravítko', 'úhloměr'],
    source: 'Dílny Heuréky 2022 – P. Jirman: Sluneční hodiny a sluneční kompas'
  },

  // === MIKROSVĚT ===
  {
    id: 'mikrosvet-atomy',
    subtopicId: 'atom-a-jeho-modely',
    topicId: 'mikrosvet',
    title: 'Atomy – modelování a vizualizace',
    type: 'qualitative',
    description: 'Stavba modelů atomů z polystyrénových kuliček a drátků: atom vodíku, helia, uhlíku. Vizualizace elektronových obalů. Diskuze o velikostech: jádro jako hrášek na fotbalovém stadionu.',
    materials: ['polystyrénové kuličky různých velikostí', 'drátky', 'barvičky', 'modelína'],
    source: 'Dílny Heuréky 2023 – A. Šáfrová: Atomy'
  },
  {
    id: 'mikrosvet-radioaktivita',
    subtopicId: 'radioaktivita',
    topicId: 'mikrosvet',
    title: 'Radioaktivita na vlastní oči',
    type: 'qualitative',
    description: 'Detekce přirozené radioaktivity pomocí Geiger-Müllerova počítače: měření pozadí, radioaktivita draselných hnojiv (KCl), uranového skla, wolframové elektrody. Bezpečné zdroje pro školní měření.',
    materials: ['Geiger-Müllerův počítač nebo detektor MX-10', 'draselné hnojivo', 'uranové sklo (staré)', 'wolframová elektroda'],
    source: 'Dílny Heuréky 2022 – V. Pleskot: Radioaktivita na vlastní oči'
  },

  // === ELEKTŘINA (9. ročník) ===
  {
    id: 'elektrina-elektromotor',
    subtopicId: 'elektromotor',
    topicId: 'elektrina',
    title: 'Stavba jednoduchého elektromotoru',
    type: 'qualitative',
    description: 'Výroba jednoduchého stejnosměrného elektromotoru z cívky měděného drátku, magnetu a baterie. Žáci pochopí princip: proud v magnetickém poli vytváří sílu, komutátor mění směr proudu.',
    materials: ['měděný lakovaný drát', 'neodymový magnet', 'baterie AA', 'kancelářské sponky', 'brusný papír'],
    source: 'Dílny Heuréky 2019 – V. Pazdera: Elektromotor'
  },
  {
    id: 'elektrina-elektrolyza',
    subtopicId: 'elektricke-clanky',
    topicId: 'elektrina',
    title: 'Elektrolýza vody',
    type: 'qualitative',
    description: 'Rozklad vody elektrickým proudem na vodík a kyslík. Dvě elektrody (tužky) ve vodě s trochou sody. U záporné elektrody se tvoří dvakrát více plynu (H₂) než u kladné (O₂). Ověření hořlavosti vodíku.',
    materials: ['sklenice s vodou', 'jedlá soda', 'dvě grafitové elektrody (tužky)', 'baterie 9V', 'vodiče', 'zápalky'],
    source: 'Dílny Heuréky 2022 – B. Mikulecká: Elektrolýza'
  },
  {
    id: 'elektrina-citronovy-clanek',
    subtopicId: 'elektricke-clanky',
    topicId: 'elektrina',
    title: 'Citronový článek – kouzla s citrony',
    type: 'measurement',
    description: 'Výroba galvanického článku ze citronu, měděné mince a pozinkovaného hřebíku. Měření napětí jednoho článku (~0,9 V). Zapojení více citronů sériově pro rozsvícení LED.',
    materials: ['citrony', 'měděné mince nebo drátky', 'pozinkované hřebíky', 'vodiče', 'LED', 'voltmetr'],
    source: 'Dílny Heuréky 2022 – P. Machová: Kouzla s citrony'
  },

  // === ČÁSTICE LÁTKY ===
  {
    id: 'castice-brownuv-pohyb',
    subtopicId: 'brownuv-pohyb-difuze',
    topicId: 'castice-latky',
    title: 'Difúze – pozorování šíření látek',
    type: 'qualitative',
    description: 'Pozorování difúze: kapka inkoustu ve vodě (bez míchání se postupně rozpustí), vonný olej v místnosti, čajový pytlík ve studené vs. teplé vodě. Závislost rychlosti difúze na teplotě potvrzuje částicovou teorii.',
    materials: ['sklenice s vodou (studená a teplá)', 'inkoust nebo potravinářské barvivo', 'čajové pytlíky'],
    source: 'Elixír nápadů 2 – Překvapivá fyzika'
  },
];

// ============ ACTIVITIES ============

const activities: Activity[] = [
  // === OPTIKA ===
  {
    id: 'optika-hracky',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Optické hračky',
    type: 'other',
    description: 'Výroba a zkoumání optických hraček: kaleidoskop, thaumatrop (dva obrázky splývají při rotaci), filmový pásek ze spirálového bloku. Propojení optiky s historií filmu a setrvačností oka.',
    source: 'Dílny Heuréky 2017 – H. Trhlíková: Optické hračky'
  },

  // === MAGNETISMUS ===
  {
    id: 'magnetismus-netradicne',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Magnetismus netradičně',
    type: 'method',
    description: 'Netradiční aktivity s magnety: stavba magnetického vlaku (baterie + neodymové magnety v měděné trubce), magnetická socha, „magnetické kyvadlo" (magnet nad měděnou deskou – vířivé proudy brzdí).',
    source: 'Elixír nápadů 1 – Magnetismus netradičně'
  },
  {
    id: 'magnetismus-elektrina-rukama',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Elektřina a magnetismus vlastníma rukama',
    type: 'method',
    description: 'Hands-on aktivity propojující elektřinu a magnetismus: výroba elektromagnetu (hřebík + drát + baterie), kompas z jehly, Oerstedův pokus (vodič s proudem vychyluje kompas).',
    source: 'Dílny Heuréky 2016 – V. Koudelková: Elektřina a magnetismus vlastníma rukama a hlavou'
  },

  // === ELEKTRICKÉ OBVODY ===
  {
    id: 'eo-led-zs-ss',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'LED pro žáky ZŠ i SŠ',
    type: 'method',
    description: 'Praktická dílna zaměřená na práci s LED: správné zapojení s předřadným rezistorem, sériové a paralelní zapojení LED, výpočet odporu rezistoru, výroba jednoduchého svítidla.',
    source: 'Dílny Heuréky 2019 – H. Trhlíková: LED pro žáky ZŠ i SŠ'
  },
  {
    id: 'eo-rezistory-triady',
    subtopicId: 'proud-a-napeti',
    topicId: 'elektricke-obvody',
    title: 'Nechte děti sáhnout na rezistory',
    type: 'method',
    description: 'Žáci pracují s reálnými rezistory: čtení barevného kódu, měření odporu multimetrem, zapojování do obvodu. Hra „Rezistorové triády" – trojice žáků řeší úlohy na sériové a paralelní zapojení.',
    source: 'Dílny Heuréky 2018 – H. Trhlíková: Nechte děti sáhnout na rezistory'
  },

  // === POHYB ===
  {
    id: 'pohyb-hokej-fyzika',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Hokej ve fyzice – fyzika v hokeji',
    type: 'game',
    description: 'Analýza fyzikálních jevů v hokeji: skluz puku (tření), odraz od mantinelu (zákon odrazu), zakřivená dráha (síla), rychlost střely. Motivační aktivita propojující sport a fyziku.',
    source: 'Dílny Heuréky 2019 – L. Adámek: Hokej ve fyzice? Radši fyzika v hokeji'
  },
  {
    id: 'pohyb-grafy-jinak',
    subtopicId: 'grafy',
    topicId: 'pohyb',
    title: 'Grafy jinak – nejen ve fyzice',
    type: 'method',
    description: 'Aktivity na čtení a tvorbu grafů: žáci kreslí graf na základě příběhu (cesta do školy), přiřazují graf k pohybu, sami se pohybují tak, aby vytvořili zadaný graf. Propojení s matematikou.',
    source: 'Dílny Heuréky 2023 – M. Gembec: Grafy nejen ve fyzice'
  },

  // === SÍLA ===
  {
    id: 'sila-pull-up-site',
    subtopicId: 'skladani-sil',
    topicId: 'sila',
    title: 'Pull-up sítě těles',
    type: 'group-work',
    description: 'Skupinová aktivita, kde žáci pomocí provázků a kladek zvedají různá tělesa. Zjišťují, jak kladka mění směr síly a jak kladkostroj snižuje potřebnou sílu. Propojení s jednoduchými stroji.',
    source: 'Dílny Heuréky 2024 – A. Čermáková: Pull-up sítě těles'
  },

  // === KAPALINY ===
  {
    id: 'kapaliny-plechovkova-fyzika',
    subtopicId: 'tlak',
    topicId: 'kapaliny-7',
    title: 'Plechovková fyzika',
    type: 'method',
    description: 'Série pokusů s plechovkami: drtící plechovka (ochladíme páru → podtlak), kutálení plné a prázdné plechovky (moment setrvačnosti), plovoucí a potápějící se plechovky (hustota obsahu).',
    source: 'Dílny Heuréky 2022 – Č. Krejčí: Plechovková fyzika'
  },
  {
    id: 'kapaliny-fyzika-potapeni-aktivita',
    subtopicId: 'hydrostaticky-tlak',
    topicId: 'kapaliny-7',
    title: 'Fyzika potápění – aktivity',
    type: 'method',
    description: 'Žáci se učí o fyzikálních principech potápění formou praktických aktivit: měření přetlaku pod vodou, výroba kartézského potápěče, demonstrace Boyleova zákona s injekční stříkačkou.',
    source: 'Dílny Heuréky 2022 – V. Krajčová: Fyzika potápění'
  },

  // === MĚŘENÍ ===
  {
    id: 'mereni-odhady-velicin',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Odhady fyzikálních veličin',
    type: 'game',
    description: 'Soutěžní hra: žáci odhadují fyzikální veličiny (hmotnost předmětů, délku učebny, teplotu vody, čas) a pak měří. Body za nejpřesnější odhad. Rozvíjí fyzikální intuici.',
    source: 'Dílny Heuréky 2018 – J. Reichl: Odhady fyzikálních veličin'
  },

  // === ENERGIE ===
  {
    id: 'energie-u-rampa',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'U-rampa – přeměny energie',
    type: 'method',
    description: 'Na U-rampě (halfpipe) žáci pozorují přeměnu polohové a pohybové energie kuličky. Měří výšku výjezdu vs. výšku vjezdu, diskutují ztráty třením. Propojení s energetickými diagramy.',
    source: 'Dílny Heuréky 2022 – V. Pazdera: U-rampa'
  },
  {
    id: 'energie-vrtulniky-guma',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Vrtulníky na gumový pohon',
    type: 'other',
    description: 'Stavba malého vrtulníku poháněného zkroucenou gumičkou. Žáci pozorují přeměnu energie pružnosti na pohybovou energii. Soutěž: čí vrtulník vyletí nejvýš.',
    source: 'Dílny Heuréky 2021 – Z. Hubáček: Vrtulníky na gumový pohon'
  },

  // === ASTRONOMIE ===
  {
    id: 'astronomie-aktivne',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Astronomie aktivně',
    type: 'method',
    description: 'Aktivity pro výuku astronomie: modelování Sluneční soustavy na školním dvoře (poměr vzdáleností), fáze Měsíce s míčkem a lampou, měření průměru Slunce dírkovou kamerou.',
    source: 'Elixír nápadů 2 – Astronomie aktivně'
  },
  {
    id: 'astronomie-hurvinek-vesmir',
    subtopicId: 'vesmir',
    topicId: 'astronomie',
    title: 'S Hurvínkem do vesmíru – družicové dílny',
    type: 'group-work',
    description: 'Žáci ve skupinách navrhují a staví modely družic z jednoduchých materiálů. Diskuze o tom, co družice ve vesmíru dělají (komunikace, pozorování Země, navigace). Propojení s kosmonautikou.',
    source: 'Dílny Heuréky 2022 – J. Veselý: S Hurvínkem do vesmíru'
  },

  // === PAPER SCIENCE (papírové aktivity) ===
  {
    id: 'paper-helikoptera',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Papírové helikoptéry – rotační pohyb',
    type: 'other',
    description: 'Výroba papírových vrtulníků (whirligigs) z šablony. Žáci zkoumají vliv: počtu závaží (sponky) na rychlost pádu, úhlu lopatek na směr rotace, velikosti lopatek na dobu letu. Jednoduchý experiment z papíru.',
    source: 'Paper Science – V. Pejčochová: Everything\'s flying – Paper helicopters'
  },
  {
    id: 'paper-balancujici-ptak',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Balancující ptáček z papíru',
    type: 'other',
    description: 'Výroba papírového ptáčka, který balancuje na zobáku díky nízko položenému těžišti (závaží na křídlech). Žáci pochopí pojem těžiště a stabilní rovnovážná poloha.',
    source: 'Paper Science – V. Pejčochová: Acrobats – Balancing bird'
  },

  // === VLASTNOSTI LÁTEK ===
  {
    id: 'vlastnosti-fyzika-kuchyne',
    subtopicId: 'kapaliny',
    topicId: 'vlastnosti-latek',
    title: 'Fyzika v kuchyni',
    type: 'method',
    description: 'Experimenty s kuchyňskými potřebami: hustota oleje vs. vody (lávová lampa), povrchové napětí (pepř a saponát), rozpouštění (cukr vs. sůl), vaření – skupenské přeměny. Vhodné i jako domácí pokusy.',
    source: 'Dílny Heuréky 2019 – L. Strmisková: Fyzika v kuchyni'
  },

  // === ČÁSTICE LÁTKY ===
  {
    id: 'castice-jednoduche-experimenty',
    subtopicId: 'casticove-slozeni-latek',
    topicId: 'castice-latky',
    title: 'Jednoduché experimenty pro každého',
    type: 'method',
    description: 'Sada minimalistických pokusů z běžně dostupných materiálů: rozpínání balónku (tlak plynu), difúze barviva ve vodě, smršťování PET láhve (podtlak), ohřev vzduchu v láhvi (roztažnost plynů).',
    source: 'Dílny Heuréky 2023 – Z. Kielbusová: Jednoduché experimenty pro každého'
  },

  // === POHYB ===
  {
    id: 'pohyb-letajici-papir',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Létající papír',
    type: 'other',
    description: 'Výroba a testování různých papírových letadel a kluzáků. Zkoumání faktorů ovlivňujících let: tvar křídel, hmotnost, těžiště. Spojení s odporem vzduchu a vztlakovou silou.',
    source: 'Elixír nápadů 2 – Létající papír'
  },
];

async function writeJson(dir: string, id: string, data: Record<string, unknown>) {
  const filePath = join(dir, `${id}.json`);
  // Remove the 'source' field from data before writing - it's only for our reference
  const { source, ...cleanData } = data;
  await writeFile(filePath, JSON.stringify(cleanData, null, 2) + '\n', 'utf-8');
}

async function main() {
  const expDir = join(CONTENT_DIR, 'experiments');
  const actDir = join(CONTENT_DIR, 'activities');

  let expCount = 0;
  let actCount = 0;

  for (const exp of experiments) {
    await writeJson(expDir, exp.id, exp as unknown as Record<string, unknown>);
    expCount++;
  }

  for (const act of activities) {
    await writeJson(actDir, act.id, act as unknown as Record<string, unknown>);
    actCount++;
  }

  console.log(`Created ${expCount} experiment files and ${actCount} activity files`);
}

main();
