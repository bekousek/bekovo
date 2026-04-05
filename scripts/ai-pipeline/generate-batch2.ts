/**
 * Batch 2: Generate additional experiment and activity JSON files
 * from comprehensive reading of ALL 35 sborníky.
 *
 * Sources: Dílny Heuréky 2011-2024, VNUF 2011-2024,
 * Elixír nápadů 1-5, Sborník dílen Elixíru 2017/2019, Paper Science
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
}

interface Activity {
  id: string;
  subtopicId: string;
  topicId: string;
  title: string;
  type: 'game' | 'method' | 'group-work' | 'other';
  description: string;
}

// ============ NEW EXPERIMENTS ============

const experiments: Experiment[] = [
  // === DH 2011 - Kielbusová: 30+1 experiment s balónky ===
  {
    id: 'plyny-balonek-bernoulli',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Bernoulliho princip s balónky',
    type: 'qualitative',
    description: 'Dva balónky zavěšené blízko sebe se při foukání brčkem mezi ně přibližují místo vzdalování. Pokus demonstruje snížení tlaku v proudícím vzduchu (Bernoulliho princip).',
    materials: ['dva nafukovací balónky', 'brčko', 'nit'],
  },
  {
    id: 'plyny-balonek-podtlak',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Balónek vtažený do láhve podtlakem',
    type: 'qualitative',
    description: 'Do láhve se vhodí hořící papír a rychle přiloží nafouknutý balónek. Po zhasnutí ohně se balónek vtáhne dovnitř – ochlazení vzduchu sníží tlak a vnější atmosférický tlak zatlačí balónek do láhve.',
    materials: ['skleněná láhev', 'nafukovací balónek', 'papír', 'zápalky'],
  },
  {
    id: 'plyny-prefukovani-balonku',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Přefukování balónků',
    type: 'qualitative',
    description: 'Dva různě nafouknuté balónky se propojí ventilem. Menší balónek se vyfoukne do většího, protože tlak uvnitř malého balónku je větší než ve velkém. Výsledek je proti intuici.',
    materials: ['dva nafukovací balónky', 'dvojcestný ventil'],
  },
  {
    id: 'kapaliny-hydrostaticky-balonek',
    subtopicId: 'hydrostaticky-tlak',
    topicId: 'kapaliny-7',
    title: 'Hydrostatický tlak stlačuje balónek',
    type: 'qualitative',
    description: 'Nafouknutý balónek v PET láhvi je spojen s hadicí plnou vody. Při zvedání hadice hydrostatický tlak stlačuje balónek. Ukazuje závislost tlaku na výšce vodního sloupce.',
    materials: ['PET láhev', 'balónek', 'hadice', 'voda'],
  },
  {
    id: 'kapaliny-model-rybi-mechyr',
    subtopicId: 'vztlakova-sila',
    topicId: 'kapaliny-7',
    title: 'Model rybího měchýře',
    type: 'qualitative',
    description: 'Dutá plastová hračka ryby s balónkem spojeným hadičkou. Nafukováním/vyfukováním se mění průměrná hustota modelu – ryba klesá, vznáší se nebo plave. Modeluje princip plynového měchýře ryb.',
    materials: ['dutá plastová hračka', 'hadička', 'balónek', 'akvárium s vodou'],
  },
  // === DH 2011 - Reichl: Fyzikální experimenty ===
  {
    id: 'sila-kecup-setrvacnost',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Záhada kečupu – zákon setrvačnosti',
    type: 'qualitative',
    description: 'Pomocí roličky od toaletního papíru se demonstruje zákon setrvačnosti. Při klepnutí shora kulička zůstane na místě, při klepnutí zdola vypadne. Stejný princip se používá při vyklepávání kečupu z láhve.',
    materials: ['rolička od toaletního papíru', 'list papíru', 'kulička'],
  },
  {
    id: 'energie-zachovani-pet-kyvadlo',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Zákon zachování energie s PET kyvadlem',
    type: 'qualitative',
    description: 'PET láhev s vodou na provázku se vychýlí k bradě dobrovolníka a pustí. Láhev se zastaví těsně před obličejem – nikdy nedoletí zpět do stejné výšky. Názorná demonstrace zákona zachování energie a vlivu odporu vzduchu.',
    materials: ['dvoulitrová PET láhev', 'provázek 3–4 m', 'voda'],
  },
  {
    id: 'energie-maxwellovo-kyvadlo-cd',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Maxwellovo kyvadlo z CD',
    type: 'qualitative',
    description: 'Z CD a víček od PET lahví se vyrobí Maxwellovo kyvadlo. CD navíjí nit a klesá pomaleji než volný pád, protože energie se rozdělí mezi pohyb translační a rotační. Demonstruje přeměny potenciální a kinetické energie.',
    materials: ['CD', 'víčka od PET lahví', 'nit', 'špejle'],
  },
  {
    id: 'sila-princip-klenby',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Princip klenby – rozklad sil',
    type: 'qualitative',
    description: 'Rovný papír mezi dvěma podpěrami závaží nepodepře, ale složí-li se do harmoniky, závaží udrží. Demonstruje rozklad tíhové síly na složky v rovině – stejný princip jako u stavebních kleneb a mostních oblouků.',
    materials: ['list papíru A4', 'dvě plechovky nebo knihy', 'závaží'],
  },
  {
    id: 'energie-moment-setrvacnosti-lahve',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Moment setrvačnosti – láhev s vodou vs. rýží',
    type: 'qualitative',
    description: 'Dvě PET láhve stejné hmotnosti (voda a rýže) se pouštějí z nakloněné plochy. Láhev s vodou dojede dříve – voda uvnitř nerotuje. Rýže rotuje s láhví a spotřebuje část energie na rotaci.',
    materials: ['dvě PET láhve', 'voda', 'syrová rýže', 'nakloněná plocha'],
  },
  // === DH 2011 - Pazdera: Bunsenův fotometr ===
  {
    id: 'optika-fotometr-fotorezistory',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Bunsenův fotometr z fotorezistorů',
    type: 'measurement',
    description: 'Ze dvou fotorezistorů na dřevěné destičce se vyrobí jednoduchý fotometr. Porovnáním odporů fotorezistorů žáci určují poměr svítivostí dvou zdrojů světla. Lze ověřit zákon o poklesu osvětlení se čtvercem vzdálenosti.',
    materials: ['dva fotorezistory', 'dřevěná destička', 'mosazné hřebíčky', 'ohmmetry'],
  },
  // === DH 2012 - Kunzová: Co umí voda a vzduch ===
  {
    id: 'kapaliny-povrchove-napeti-experimenty',
    subtopicId: 'tlak',
    topicId: 'kapaliny-7',
    title: 'Pokusy s povrchovým napětím',
    type: 'qualitative',
    description: 'Sada pokusů demonstrující povrchové napětí: bublina v drátěném rámečku, lodička poháněná saponátem, kancelářská sponka plovoucí na hladině. Po přidání saponátu sponka klesne – povrchové napětí se snížilo.',
    materials: ['drát', 'nit', 'saponát', 'kancelářské sponky', 'miska s vodou'],
  },
  {
    id: 'optika-zkumavka-cocka',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Zkumavka jako válcová čočka',
    type: 'qualitative',
    description: 'Zkumavka naplněná vodou funguje jako válcová čočka. Při čtení textu přes zkumavku se symetrická slova převrátí a nesymetrická jsou nečitelná. Demonstruje lom světla a převracení obrazu čočkou.',
    materials: ['zkumavka', 'voda', 'tištěný text'],
  },
  {
    id: 'plyny-reaktivni-motor-pet',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Reaktivní motor z PET láhve',
    type: 'qualitative',
    description: 'Do spodní části PET láhve se propálí otvory a upevní ohnutá brčka. Zavěšená láhev naplněná vodou se roztočí – vytékající voda z brček způsobí otáčení reaktivním principem, podobně jako Héronova baňka.',
    materials: ['PET láhev', 'brčka', 'voda', 'provázek'],
  },
  // === DH 2014 - Biezeveld: Appetizers ===
  {
    id: 'sila-beztize-krabicka',
    subtopicId: 'gravitacni-a-tihova-sila',
    topicId: 'sila',
    title: 'Krabička na demonstraci beztíže',
    type: 'qualitative',
    description: 'Krabička s kuličkou a spínačem vydává zvuk, když kulička leží na spínači. Při hodu do vzduchu zvuk utichne – kulička je v beztíži a nespíná kontakt. Demonstrace stavu beztíže při volném pádu.',
    materials: ['dřevěná krabička', 'kulička', 'spínač', 'bzučák', 'baterie'],
  },
  {
    id: 'optika-totalni-odraz-voda',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Totální odraz na rozhraní voda–vzduch',
    type: 'qualitative',
    description: 'Zrcadlo ponořené do vody pod určitým úhlem ukazuje totální vnitřní odraz. Při pohledu přes vodní hladinu na prst za zrcadlem se při dostatečném úhlu uplatní totální odraz – prst zmizí.',
    materials: ['zrcadlo', 'nádoba s vodou'],
  },
  {
    id: 'kapaliny-hydrogel-perly',
    subtopicId: 'vztlakova-sila',
    topicId: 'kapaliny-7',
    title: 'Hydrogelové perly – neviditelné ve vodě',
    type: 'qualitative',
    description: 'Hydrogelové perly nabobtnalé ve vodě jsou téměř neviditelné – mají podobný index lomu jako voda. Demonstrace lomu světla, optické hustoty a vztlaku. Perly mění velikost v různých roztocích.',
    materials: ['hydrogelové perly', 'voda', 'skleněné nádoby'],
  },
  // === DH 2016 - Dvořák: O magnetu ===
  {
    id: 'magnetismus-kompas-neodym',
    subtopicId: 'magneticke-pole-zeme',
    topicId: 'magnetismus',
    title: 'Výroba kompasu z neodymového magnetu',
    type: 'qualitative',
    description: 'Z malých neodymových magnetů na niti se vyrobí jednoduchý kompas. Magnety nad hliníkovou destičkou se rychle utlumí vířivými proudy a ukáží směr sever–jih. Lze pozorovat i inklinaci magnetického pole.',
    materials: ['neodymové magnety', 'nit', 'hliníková destička'],
  },
  {
    id: 'magnetismus-mapovani-pole',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Mapování magnetického pole kolem magnetu',
    type: 'qualitative',
    description: 'Malý magnet na krátké niti slouží jako střelka. Čárky kreslené na papír ve směru střelky kolem magnetu vytvářejí obraz siločar magnetického pole. Žáci vidí, jak siločáry vycházejí z jednoho pólu a vcházejí do druhého.',
    materials: ['neodymový magnet', 'nit', 'papír', 'tužka'],
  },
  {
    id: 'magnetismus-model-pole-zeme',
    subtopicId: 'magneticke-pole-zeme',
    topicId: 'magnetismus',
    title: 'Model magnetického pole Země',
    type: 'qualitative',
    description: 'Do malého glóbusu se vloží tyčový magnet. Magnetická střelka na niti v různých místech kolem glóbusu ukazuje směr indukce – u rovníku vodorovně, v našich šířkách šikmo dolů. Názorný 3D model zemského magnetismu.',
    materials: ['malý plastový glóbus', 'tyčový magnet', 'nit', 'malý kompas'],
  },
  {
    id: 'magnetismus-mereni-sily',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Měření síly mezi póly magnetů',
    type: 'measurement',
    description: 'Pomocí vahadla z dlouhého magnetu se měří síla mezi dvěma magnety v závislosti na vzdálenosti. Výsledky ukazují, že síla klesá se čtvercem vzdálenosti, analogicky s Coulombovým zákonem.',
    materials: ['neodymové magnety', 'nit', 'pravítko', 'váhy'],
  },
  // === DH 2017 - Kunzová: Využití spinnerů ===
  {
    id: 'pohyb-spinner-experimenty',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Fyzikální experimenty se spinnery',
    type: 'measurement',
    description: 'Spinnery jako pomůcka pro měření otáček, demonstraci momentu setrvačnosti a stroboskopického efektu. Žáci měří dobu rotace, porovnávají spinnery různých hmotností a zkoumají vliv tření na zpomalování.',
    materials: ['spinnery různých typů', 'stopky', 'stroboskop nebo LED'],
  },
  // === DH 2018 - Dvořák: Magnety a proudy ===
  {
    id: 'magnetismus-tangentova-buzola',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Tangentová buzola – měření proudu magnetem',
    type: 'measurement',
    description: 'Žáci si vyrobí tangentovou buzolu z kruhu drátu a magnetky na niti. Průchod proudu kruhovým závitem vychyluje magnetku. Z úhlu výchylky lze určit velikost proudu. Historicky první přesný měřicí přístroj.',
    materials: ['lakovaný měděný drát', 'magnet na niti', 'zdroj proudu', 'úhloměr'],
  },
  // === DH 2018 - Svoboda: Bioakustika ===
  {
    id: 'akustika-bioakustika-experimenty',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Střípky z bioakustiky',
    type: 'measurement',
    description: 'Experimenty propojující akustiku s biologií: měření frekvence lidského hlasu, analýza zvuků zvířat pomocí spektrogramu, vliv rezonance na vnímání zvuku. Žáci nahrávají zvuky a analyzují je v počítači.',
    materials: ['mikrofon', 'počítač se zvukovým softwarem', 'reproduktor'],
  },
  // === DH 2019 - Hubáček: Rotující soustavy ===
  {
    id: 'pohyb-rotujici-soustavy',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Pokusy s rotujícími soustavami',
    type: 'qualitative',
    description: 'Experimenty s otáčivým pohybem: gyroskopu, točna, rotující válec na nakloněné rovině. Žáci pozorují, jak se mění chování těles při rotaci – gyroskopický efekt, precese, stabilita rotujícího tělesa.',
    materials: ['gyroskop nebo setrvačník', 'otočná stolička', 'válec', 'nakloněná rovina'],
  },
  // === DH 2019 - Dolejší: Trochu si posvítit ===
  {
    id: 'optika-svetlo-experimenty-dolejsi',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Trochu si posvítit – pokusy se světlem',
    type: 'qualitative',
    description: 'Sada pokusů se světlem: rozklad bílého světla hranolem, míchání barev pomocí LED, polarizace světla pomocí fólií, fluorescence a fosforescence. Experimenty vhodné do zatemnělé učebny.',
    materials: ['optický hranol', 'LED diody', 'polarizační fólie', 'UV lampa'],
  },
  // === DH 2021 - Dolejší: Odporná zkoušečka ===
  {
    id: 'eo-odporna-zkousecka',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Odporná zkoušečka – měření odporu těla',
    type: 'measurement',
    description: 'Jednoduchý obvod s LED a odporem slouží jako zkoušečka vodivosti. Žáci měří odpor různých materiálů i vlastního těla (mokré vs. suché ruce). Uvědomí si, proč je elektrický proud nebezpečný.',
    materials: ['LED dioda', 'rezistor', 'baterie', 'vodiče', 'krokodýlky'],
  },
  // === DH 2021 - Dvořák: Hrající destička ===
  {
    id: 'akustika-chladniho-obrazce',
    subtopicId: 'vlneni',
    topicId: 'akustika',
    title: 'Chladniho obrazce – zvuk zviditelněný',
    type: 'qualitative',
    description: 'Na kovovou destičku se nasype jemný písek a destička se rozkmitá smyčcem. Písek se shromáždí v uzlových čarách a vytvoří symetrické obrazce. Demonstrace stojaté vlnění a vlastních frekvencí.',
    materials: ['kovová destička', 'smyčec', 'jemný písek nebo sůl', 'stojánek'],
  },
  // === DH 2021 - Polák: Termočlánek ===
  {
    id: 'energie-termoclanek',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Termočlánek v hodinách fyziky',
    type: 'measurement',
    description: 'Ze dvou různých drátů (měď a konstantan) se vyrobí termočlánek. Zahříváním spoje vzniká napětí, které se měří voltmetrem. Žáci ověřují závislost napětí na teplotním rozdílu a využití pro měření teploty.',
    materials: ['měděný drát', 'konstantanový drát', 'voltmetr', 'kahan', 'led'],
  },
  // === DH 2022 - Horváth: Vlastnosti plynov ===
  {
    id: 'plyny-vlastnosti-pokus',
    subtopicId: 'atmosfera',
    topicId: 'plyny-7',
    title: 'Vlastnosti plynů – experimenty na hranici s chemií',
    type: 'qualitative',
    description: 'Experimenty s CO₂: hasení svíčky oxidem uhličitým, přelévání CO₂ z nádoby do nádoby (těžší než vzduch), nafukování balónku reakcí sody s octem. Demonstrace vlastností plynů na pomezí fyziky a chemie.',
    materials: ['svíčka', 'jedlá soda', 'ocet', 'sklenice', 'balónek'],
  },
  // === DH 2022 - Machová: Kouzla s citrony ===
  {
    id: 'elektrina-citronovy-clanek-pokus',
    subtopicId: 'elektricke-clanky',
    topicId: 'elektrina',
    title: 'Kouzla s citrony – ovocné elektrické články',
    type: 'measurement',
    description: 'Žáci zapichují měděnou a zinkovou elektrodu do citronů a měří vznikající napětí. Sériovým zapojením více citronů rozsvítí LED diodu. Zkoumají vliv typu ovoce/zeleniny na velikost napětí.',
    materials: ['citrony', 'měděné plíšky', 'zinkové plíšky', 'voltmetr', 'LED', 'vodiče'],
  },
  // === DH 2023 - Dvořák: Přenášíme zvuk světlem ===
  {
    id: 'optika-prenos-zvuku-svetlem',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Přenos zvuku světlem (IR zářením)',
    type: 'qualitative',
    description: 'Pomocí IR LED modulované zvukovým signálem a fototranzistoru na přijímači se přenáší hudba na vzdálenost několika metrů. Demonstrace přenosu informace optickým vláknem i volným prostorem.',
    materials: ['IR LED', 'fototranzistor', 'reproduktor', 'zesilovač', 'baterie'],
  },
  // === DH 2023 - Kielbusová: Jednoduché experimenty ===
  {
    id: 'sila-kelimky-experimenty',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Jednoduché experimenty s kelímky',
    type: 'qualitative',
    description: 'Kelímky jako nečekaně užitečná pomůcka: stavění věží (těžiště, rovnováha), katapulty (páka), přetahovaná (třecí síla), zvukové telefony (šíření zvuku). Sada pokusů z běžně dostupného materiálu.',
    materials: ['plastové nebo papírové kelímky', 'provázek', 'gumičky'],
  },
  // === DH 2023 - Vybíral: Tajemné plátno ===
  {
    id: 'optika-tajemne-platno',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Tajemné plátno – Pepperův duch',
    type: 'qualitative',
    description: 'Pomocí polopropustné fólie se vytvoří iluze levitujícího předmětu nebo „ducha" – Pepperův duch. Demonstruje odraz a lom světla na polopropustném rozhraní. Efektní pokus do zatemnělé učebny.',
    materials: ['polopropustná fólie', 'svíčka nebo LED', 'tmavé prostředí'],
  },
  // === DH 2024 - Pazdera: IR záření ===
  {
    id: 'optika-ir-zareni-vlastnosti',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Vlastnosti infračerveného záření',
    type: 'qualitative',
    description: 'Experimenty s IR zářením pomocí upravené webkamery: pozorování IR LED ovladačů, průchod IR záření Colou a vínem (ale ne roztokem modré skalice), zobrazení spirály sklokeramického vařiče v IR spektru.',
    materials: ['webkamera bez IR filtru', 'IR LED', 'dálkový ovladač', 'Cola', 'roztok modré skalice'],
  },
  // === DH 2024 - Zacharov: Kde leží duha ===
  {
    id: 'optika-geometrie-duhy',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'Kde leží duha – geometrie a fyzika',
    type: 'qualitative',
    description: 'Experimenty vysvětlující geometrii duhy: proč je duha oblouk, jak závisí její poloha na výšce Slunce, proč jsou barvy vždy ve stejném pořadí. Demonstrace s vodní mlhou a laserovým ukazovátkem.',
    materials: ['rozprašovač s vodou', 'laserové ukazovátko', 'skleněná kulička', 'bílá deska'],
  },
  // === DH 2024 - Böhm: Experimenty se zvukem ===
  {
    id: 'akustika-hladina-hlasitosti-mereni',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Měření hladiny hlasitosti – závislost na vzdálenosti',
    type: 'measurement',
    description: 'Žáci měří hladinu hlasitosti v různých vzdálenostech od zdroje zvuku. Zdvojnásobení vzdálenosti sníží hladinu o 6 dB. Měření vhodné pro venkovní prostředí, ověření poklesu intenzity se čtvercem vzdálenosti.',
    materials: ['reproduktor', 'měřič hlasitosti nebo mobil s aplikací', 'pásmo'],
  },
  {
    id: 'akustika-pocet-zdroju-hlasitost',
    subtopicId: 'zdroje-zvuku',
    topicId: 'akustika',
    title: 'Hladina hlasitosti a počet zdrojů zvuku',
    type: 'measurement',
    description: 'Zdvojnásobení počtu zdrojů zvuku způsobí nárůst hladiny hlasitosti o 3 dB, nikoliv na dvojnásobek. Žáci postupně přidávají reproduktory s bílým šumem a měří celkovou hladinu hlasitosti.',
    materials: ['několik reproduktorů', 'měřič hlasitosti', 'zdroj bílého šumu'],
  },
  // === VNUF 2024 - Bochníček: Solární článek ===
  {
    id: 'elektrina-solarni-clanek-mereni',
    subtopicId: 'elektricke-clanky',
    topicId: 'elektrina',
    title: 'Měření charakteristik solárního článku',
    type: 'measurement',
    description: 'Žáci měří voltampérovou charakteristiku solárního článku pomocí proměnného odporu. Určují pracovní bod s maximálním výkonem. Porovnávají výkon na slunci a ve stínu – pracovní bod se dramaticky posouvá.',
    materials: ['solární článek', 'reostat', 'voltmetr', 'ampérmetr', 'vodiče'],
  },
  // === VNUF - Bochníček: Hustota kapalin ===
  {
    id: 'mereni-hustota-kapalin-areometr',
    subtopicId: 'hustota',
    topicId: 'mereni',
    title: 'Měření hustoty kapalin areometrem',
    type: 'measurement',
    description: 'Žáci vyrábějí jednoduchý areometr z brčka zalepeného plastelínou a měří hustotu různých kapalin (voda, slané roztoky, olej). Areometr se ponoří tím více, čím menší je hustota kapaliny.',
    materials: ['brčko', 'plastelína', 'odměrný válec', 'různé kapaliny'],
  },
  // === VNUF - Dvořáková: Lawsonův test ===
  {
    id: 'sila-treti-zakon-interakce',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Třetí Newtonův zákon – akce a reakce',
    type: 'qualitative',
    description: 'Dva žáci na kolečkových židlích se od sebe odstrkují – oba se rozjedou. Lehčí žák získá větší rychlost. Pokus s dvěma siloměry: při tahání se oba siloměry ukazují stejnou sílu, i když jeden žák je silnější.',
    materials: ['dvě kolečkové židle', 'dva siloměry', 'provázek'],
  },
  // === VNUF - Franc: Fyzika sportu ===
  {
    id: 'pohyb-fyzika-sportu',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Fyzika sportu – měření rychlosti míče',
    type: 'measurement',
    description: 'Žáci měří rychlost hozeného nebo kopaného míče pomocí videoanalýzy na mobilu. Porovnávají rychlosti při různých sportech. Ověřují, jak závisí dolet na úhlu a počáteční rychlosti.',
    materials: ['míč', 'mobil s kamerou', 'program pro videoanalýzu', 'pásmo'],
  },
  // === VNUF - Holubová: Fyzika hraček ===
  {
    id: 'sila-fyzika-hracek',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Fyzika hraček',
    type: 'qualitative',
    description: 'Fyzikální principy ukryté v hračkách: jojo (moment setrvačnosti), bumerang (gyroskopický efekt), Newtonova kolébka (zachování hybnosti), plechová žabka (pružnost). Každá hračka demonstruje jiný fyzikální princip.',
    materials: ['jojo', 'Newtonova kolébka', 'gyroskop', 'různé hračky'],
  },
  // === VNUF - Kéhar: Foucaultovo kyvadlo ===
  {
    id: 'astronomie-foucaultovo-kyvadlo-model',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Model Foucaultova kyvadla',
    type: 'qualitative',
    description: 'Jednoduchý model demonstrující princip Foucaultova kyvadla. Kyvadlo zavěšené nad otočnou deskou postupně mění rovinu kyvu – důkaz rotace Země. Žáci pozorují, jak se rovina kyvu stáčí.',
    materials: ['závěsné kyvadlo', 'otočná deska nebo gramofon', 'stojánek'],
  },
  // === VNUF - Hrdý: Pokusy s LED ===
  {
    id: 'eo-led-charakteristika',
    subtopicId: 'proud-a-napeti',
    topicId: 'elektricke-obvody',
    title: 'Voltampérová charakteristika LED',
    type: 'measurement',
    description: 'Žáci měří závislost proudu na napětí pro LED diody různých barev. Zjišťují, že červená LED se rozsvítí při nižším napětí než modrá. Porovnávají s charakteristikou žárovky a rezistoru.',
    materials: ['LED diody různých barev', 'zdroj napětí', 'voltmetr', 'ampérmetr', 'rezistor'],
  },
  // === VNUF - Hubáček: Archimedes ===
  {
    id: 'kapaliny-archimedes-overeni',
    subtopicId: 'vztlakova-sila',
    topicId: 'kapaliny-7',
    title: 'Archimédův zákon – přímé ověření',
    type: 'measurement',
    description: 'Žáci měří tíhu tělesa na vzduchu a ponořeného ve vodě. Rozdíl je vztlaková síla. Zvážením vytlačené vody ověřují, že vztlaková síla se rovná tíze vytlačené kapaliny – přímý důkaz Archimédova zákona.',
    materials: ['siloměr', 'závaží', 'nádoba s vodou', 'přepadová nádobka', 'odměrný válec'],
  },
  // === VNUF - Kielbusová: Jednoduché experimenty ===
  {
    id: 'sila-kladka-experimenty',
    subtopicId: 'jednoduche-stroje',
    topicId: 'sila',
    title: 'Experimenty s kladkami',
    type: 'measurement',
    description: 'Žáci staví systémy kladek (pevná, volná, kladkostroj) a měří sílu potřebnou ke zvedání závaží. Ověřují zlaté pravidlo mechaniky – co ušetříme na síle, musíme přidat na dráze.',
    materials: ['kladky', 'provázek', 'siloměr', 'závaží', 'stojánek'],
  },
  // === DH 2023 - Dovalová: Kryštalizácie ===
  {
    id: 'vlastnosti-krystalizace',
    subtopicId: 'pevne-latky',
    topicId: 'vlastnosti-latek',
    title: 'Krystalizace – růst krystalů',
    type: 'qualitative',
    description: 'Žáci připraví nasycený roztok skalice modré nebo kamence a pozorují růst krystalů na niti v průběhu dnů. Zkoumají krystalické tvary pod polarizačním mikroskopem. Praktická ukázka uspořádání částic v pevných látkách.',
    materials: ['skalice modrá nebo kamenec', 'voda', 'sklenice', 'nit'],
  },
  // === Elixír 5 - Síla ===
  {
    id: 'sila-treni-experimenty',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Experimenty s třecí silou',
    type: 'measurement',
    description: 'Žáci měří třecí sílu pomocí siloměru při tažení kvádru po různých površích (dřevo, papír, sklo). Zkoumají závislost třecí síly na přítlačné síle a druhu povrchu. Porovnávají smykové a valivé tření.',
    materials: ['siloměr', 'dřevěný kvádr', 'různé povrchy', 'závaží'],
  },
  // === Elixír 5 - Kapaliny a Archimédův zákon ===
  {
    id: 'kapaliny-pascaluv-zakon-strikacky',
    subtopicId: 'pascaluv-zakon',
    topicId: 'kapaliny-7',
    title: 'Pascalův zákon s injekčními stříkačkami',
    type: 'qualitative',
    description: 'Dvě injekční stříkačky různých průměrů propojené hadičkou naplněnou vodou. Stlačením malé stříkačky se velká vysune – model hydraulického lisu. Žáci ověřují, jak se liší síly a dráhy pístů.',
    materials: ['dvě injekční stříkačky různých průměrů', 'hadička', 'voda'],
  },
  // === VNUF - Kácovský: Pokusy s teplotou ===
  {
    id: 'energie-paradoxy-teploty',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Paradoxy tepla a teploty',
    type: 'qualitative',
    description: 'Překvapivé pokusy s teplem: hliníková fólie z trouby nepálí (malá tepelná kapacita), zmrzlina v novinách taje pomaleji (izolace), horká a studená voda se jinak barví (konvekce). Experimenty vyvrací běžné mýty.',
    materials: ['hliníková fólie', 'noviny', 'potravinářské barvivo', 'teplá a studená voda'],
  },
  // === VNUF - Dostálová: Fyzika ve vodě ===
  {
    id: 'kapaliny-tlak-hloubka',
    subtopicId: 'hydrostaticky-tlak',
    topicId: 'kapaliny-7',
    title: 'Měření hydrostatického tlaku v různých hloubkách',
    type: 'measurement',
    description: 'Žáci měří tlak v různých hloubkách vody pomocí manometru nebo senzoru. Ověřují lineární závislost tlaku na hloubce. Zkouší, zda záleží na tvaru nádoby – tlak závisí jen na hloubce, ne na objemu.',
    materials: ['manometr nebo tlakový senzor', 'nádoby různých tvarů', 'voda', 'pravítko'],
  },
  // === Elixír 2 - Překvapivá fyzika ===
  {
    id: 'sila-setrvacnost-mince',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Setrvačnost mince – překvapivá fyzika',
    type: 'qualitative',
    description: 'Mince na kartičce položené na sklenici. Rychlým švihnutím kartičky mince spadne do sklenice – setrvačnost ji udrží na místě. Další variace: vytrhnutí ubrusu, vyražení spodní kostky z věže.',
    materials: ['mince', 'kartička', 'sklenice', 'ubrus'],
  },
];

// ============ NEW ACTIVITIES ============

const activities: Activity[] = [
  // === DH 2011 - Lipertová: Brouci a hejblata ===
  {
    id: 'energie-vibrujici-roboti',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Brouci a hejblata – výroba vibrujících robotů',
    type: 'other',
    description: 'Žáci vyrábějí vibrující roboty z CD, DC motorků s excentrickou zátěží a baterií. Roboti umí tančit, běhat a kreslit. Princip je stejný jako u vibrace mobilního telefonu.',
  },
  // === DH 2013 - Jirman: Vozítka ===
  {
    id: 'pohyb-vozitka-ruzne-pohony',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Vozítka s různými pohony',
    type: 'other',
    description: 'Žáci staví modely aut z odpadních materiálů poháněná třemi způsoby: plachtou (síla větru), magnetem (magnetická síla) nebo nabitou tyčí (elektrostatická síla). Kreativní propojení mechaniky s dalšími tématy.',
  },
  // === DH 2017 - Jílek: Jaderné procesy hravě ===
  {
    id: 'mikrosvet-jaderne-procesy-hrave',
    subtopicId: 'jaderna-energie',
    topicId: 'mikrosvet',
    title: 'Jaderné procesy hravě',
    type: 'game',
    description: 'Desková hra a simulace jaderných procesů: žáci modelují rozpad jader pomocí kostek, řetězovou reakci pomocí dominových kostek nebo myších pastí s míčky. Pochopení principu jaderné elektrárny hrou.',
  },
  // === DH 2017 - Jirman: Házení vajíček ===
  {
    id: 'sila-hazeni-vajicek',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Házení vajíček z okna – ochrana před nárazem',
    type: 'game',
    description: 'Soutěž: žáci staví ochrannou konstrukci pro syrové vejce, které se hází z výšky. Kdo postaví nejlehčí konstrukci, která ochrání vejce? Princip: prodloužení doby brzdění snižuje sílu nárazu (impulz síly).',
  },
  // === DH 2017 - Lipertová: Fyzikální blbinky ===
  {
    id: 'sila-fyzikalni-blbinky',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Fyzikální blbinky pro malé i větší',
    type: 'game',
    description: 'Sbírka krátkých fyzikálních výzev a triků: udrž rovnováhu, zvedni závaží jedním prstem, projdi papírem. Každá „blbinka" skrývá fyzikální princip – rovnováha, páka, topologie.',
  },
  // === DH 2018 - Pazdera: Lampička ===
  {
    id: 'eo-vyroba-lampicky',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Výroba lampičky „zapal–sfoukni"',
    type: 'other',
    description: 'Žáci si vyrábějí LED lampičku, která se „zapálí" přiblížením zápalky (fotorezistor) a „sfouká" fouknutím (termistor). Praktické využití senzorů v jednoduchém obvodu.',
  },
  // === DH 2018 - Pejčochová: RETRO hračky ===
  {
    id: 'sila-retro-hracky',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'RETRO – fyzikální a matematické hračky',
    type: 'other',
    description: 'Výroba retro fyzikálních hraček: tanečnice na drátě (těžiště), hadí prkno (nakloněná rovina), kuličkový labyrint (gravitace). Žáci se učí fyziku prostřednictvím výroby a hraní.',
  },
  // === DH 2019 - Fejt: Fyzikální jednotky ===
  {
    id: 'mereni-fyzikalni-jednotky-hra',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Fyzikální jednotky včera a dnes',
    type: 'game',
    description: 'Hra a aktivity kolem soustav fyzikálních jednotek: měření v palcích, stopách, loktech. Žáci si uvědomí, proč bylo nutné zavést mezinárodní soustavu SI. Včetně nové definice kilogramu z roku 2019.',
  },
  // === DH 2019 - Kéhar: Astronomický koutek ===
  {
    id: 'astronomie-fyzikalni-koutek',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Astronomicky-fyzikální koutek',
    type: 'method',
    description: 'Sada aktivit propojující fyziku a astronomii: model Sluneční soustavy v měřítku, výpočet gravitačního zrychlení na různých planetách, pozorování Slunce přes hranol. Vhodné pro projektovou výuku.',
  },
  // === DH 2019 - Kolářová: Pohádka ve fyzice ===
  {
    id: 'sila-pohadka-ve-fyzice',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Pohádka ve fyzice – příběhy s pokusy',
    type: 'method',
    description: 'Fyzikální pokusy zasazené do příběhu pohádky. Žáci řeší problémy pohádkových postav pomocí fyziky: princezna potřebuje zvednout těžký kámen (páka), drak fouká oheň (proudění vzduchu).',
  },
  // === DH 2019 - Mikulecká: Analogová fotografie ===
  {
    id: 'optika-analogova-fotografie',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Analogová fotografie – camera obscura a fotogramy',
    type: 'other',
    description: 'Žáci si vyrobí dírkovou kameru (camera obscura) z krabice a exponují fotopapír. Vytvářejí fotogramy přikládáním předmětů na fotopapír a osvětlením. Praktické pochopení principu fotografie.',
  },
  // === DH 2021 - Doležalová: Pokusy s příběhem ===
  {
    id: 'sila-pokusy-s-pribehem',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Pokusy s příběhem',
    type: 'method',
    description: 'Fyzikální pokusy zasazené do dějové linie příběhu. Žáci nevědí, co bude následovat – příběh motivuje a pokusy jsou jeho součástí. Metoda zvyšující zapojení žáků do výuky.',
  },
  // === DH 2021 - Kolářová: Čtvero ročních období ===
  {
    id: 'astronomie-ctvero-rocnich-obdobi',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Čtvero ročních období – proč se střídají',
    type: 'method',
    description: 'Aktivity vysvětlující střídání ročních období: modelování náklonu zemské osy, měření výšky Slunce nad obzorem v různých měsících, výpočet délky dne. Vyvrací mýtus, že léto je kvůli blízkosti Slunce.',
  },
  // === DH 2021 - Pazdera: Kyklop ===
  {
    id: 'elektrostatika-detektor-naboje',
    subtopicId: 'elektricky-naboj',
    topicId: 'elektrostatika',
    title: 'Kyklop – detektor náboje a EM pole',
    type: 'other',
    description: 'Žáci si vyrábějí jednoduchý detektor elektrického náboje a elektromagnetického pole z MOSFET tranzistoru a LED. Detektor reaguje blikáním na nabité předměty i na elektromagnetické vlny z mobilů.',
  },
  // === DH 2021 - Piskačová: Přání s LED ===
  {
    id: 'eo-prani-s-led',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'Přání s LED – papírové obvody',
    type: 'other',
    description: 'Žáci vytvářejí blahopřání nebo obrázky s integrovanými LED diodami a vodivou páskou. Učí se základy elektrických obvodů kreativním způsobem – zapojení LED, rezistor, spínač z papíru.',
  },
  // === DH 2021 - Soukupová: S žabákem v kuchyni ===
  {
    id: 'vlastnosti-fyzika-v-kuchyni-zabak',
    subtopicId: 'latky-a-telesa',
    topicId: 'vlastnosti-latek',
    title: 'S žabákem Beppem v kuchyni – fyzika vaření',
    type: 'method',
    description: 'Fyzikální pokusy s kuchyňskými surovinami: proč mléko vykypí jinak než voda, jak funguje tlakový hrnec, proč solení zvyšuje bod varu. Každý pokus je uveden příběhem žabáka Beppa.',
  },
  // === DH 2022 - Mošna: Žonglovací míčky ===
  {
    id: 'pohyb-vyroba-zonglovacich-micku',
    subtopicId: 'druhy-pohybu',
    topicId: 'pohyb',
    title: 'Výroba žonglovacích míčků a fyzika žonglování',
    type: 'other',
    description: 'Žáci si vyrábějí žonglovací míčky z balónků a rýže. Učí se žonglovat a zkoumají fyziku: parabola hodu, optimální úhel, vliv hmotnosti míčku na dráhu letu. Propojení pohybu s praxí.',
  },
  // === DH 2022 - Rakušan: Dřevěná fyzika ===
  {
    id: 'sila-drevena-fyzika',
    subtopicId: 'jednoduche-stroje',
    topicId: 'sila',
    title: 'Dřevěná fyzika – stavby z dřívek',
    type: 'other',
    description: 'Stavby z dřívek (špejlí, páráttek) demonstrující fyzikální principy: Da Vinciho samonosný most (rozklad sil), katapult (páka), jeřáb (kladka). Žáci pracují ve skupinách a staví funkční modely.',
  },
  // === DH 2022 - Koupilová: Různé? Stejné! ===
  {
    id: 'pohyb-ruzne-reprezentace',
    subtopicId: 'grafy',
    topicId: 'pohyb',
    title: 'Různé? Stejné! – reprezentace fyzikálních pojmů',
    type: 'method',
    description: 'Žáci přiřazují k sobě různé reprezentace stejného fyzikálního děje: graf, slovní popis, obrázek, rovnici. Třídí kartičky do skupin a diskutují. Rozvíjí schopnost přecházet mezi různými formami vyjádření.',
  },
  // === DH 2023 - Kolářová: (Kinder)vajíčko ===
  {
    id: 'sila-kindervajicko-aktivity',
    subtopicId: 'gravitacni-a-tihova-sila',
    topicId: 'sila',
    title: '(Kinder)vajíčko – fyzikální aktivity',
    type: 'game',
    description: 'Fyzikální aktivity s Kinder vajíčky: hledání těžiště, koulení po nakloněné rovině (vliv rozložení hmoty), stavba padáku pro vejce. Překvapivě univerzální pomůcka pro demonstraci několika principů.',
  },
  // === DH 2023 - Krejčí: Špachtlová fyzika ===
  {
    id: 'sila-spachtlova-fyzika',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Špachtlová fyzika',
    type: 'other',
    description: 'Fyzikální experimenty a stavby z dřevěných špachtlí (lékařských): katapult, Da Vinciho most, pružný kobra had. Špachtle slouží jako pružné nosníky pro demonstraci síly, pružnosti a rovnováhy.',
  },
  // === DH 2023 - Mošna: Růstové grafy ===
  {
    id: 'mereni-rustove-grafy',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Růstové grafy v hodině fyziky',
    type: 'method',
    description: 'Žáci měří svou výšku a zaznamenávají ji do grafu během školního roku. Učí se pracovat s grafy, osami, měřítkem. Propojení fyzikálního měření s biologií a osobní zkušeností žáků.',
  },
  // === DH 2023 - Pejčochová: Pokusy a hračky ===
  {
    id: 'sila-hracky-ze-stare-krabice',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Pokusy a hračky s otazníkem ze staré krabice',
    type: 'other',
    description: 'Výroba fyzikálních hraček a pomůcek z vyřazených materiálů: rovnováha, těžiště, setrvačnost, pružnost. Ekologický přístup – žáci dávají starým věcem nový smysl a učí se přitom fyziku.',
  },
  // === DH 2023 - Sekaninová: Fyzika v Vernovi ===
  {
    id: 'pohyb-fyzika-jules-verne',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Fyzika v knihách Julese Verna',
    type: 'method',
    description: 'Žáci ověřují fyzikální fakta z knih J. Verna: Dá se doletět na Měsíc dělem? Jak hluboko se potápí Nautilus? Počítají a porovnávají s realitou. Motivační propojení fyziky a literatury.',
  },
  // === DH 2024 - Boček: Výroba IR kamery ===
  {
    id: 'optika-vyroba-ir-kamery',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Výroba IR kamery z webkamery',
    type: 'other',
    description: 'Žáci rozebírají levnou USB webkameru a odstraňují IR filtr. Upravená kamera pak „vidí" infračervené záření – IR LED, dálkové ovladače, teplo vařiče. Praktická aktivita s překvapivými výsledky.',
  },
  // === DH 2024 - Čáslavová: Senzory ===
  {
    id: 'mereni-senzory-pasco',
    subtopicId: 'teplota',
    topicId: 'mereni',
    title: 'Senzory napříč předměty – měření s Pasco',
    type: 'method',
    description: 'Ukázky měření s bezdrátovými senzory Pasco ve fyzice: měření teploty, pH, síly, zvuku. Žáci pracují s aplikací SPARKvue, sbírají data a vyhodnocují je. Metoda vhodná pro badatelsky orientovanou výuku.',
  },
  // === DH 2024 - Dovalová: Laboratórium farieb ===
  {
    id: 'optika-laboratorium-barev',
    subtopicId: 'barvy',
    topicId: 'optika',
    title: 'Laboratórium barev – experimenty s barvami',
    type: 'other',
    description: 'Aktivity s barvami: aditivní a subtraktivní míchání, chromatografie fixů, polarizační barvy krystalů pod mikroskopem. Žáci zkoumají, jak vznikají barvy a proč vidíme svět barevně.',
  },
  // === DH 2024 - Veselý: Základna na Měsíci ===
  {
    id: 'astronomie-zakladna-na-mesici',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Postav základnu na Měsíci',
    type: 'group-work',
    description: 'Skupinový projekt: žáci navrhují a staví model základny na Měsíci. Řeší fyzikální výzvy: nízká gravitace, vakuum, kosmické záření, teplota. Propojení astronomie, fyziky a inženýrství.',
  },
  // === DH 2024 - Pejčochová: Střípky z projektů ===
  {
    id: 'vlastnosti-stripky-z-projektu',
    subtopicId: 'latky-a-telesa',
    topicId: 'vlastnosti-latek',
    title: 'Střípky z projektů s tvořivou nadstavbou',
    type: 'other',
    description: 'Sada krátkých projektů propojujících fyziku s výtvarnou tvorbou: výroba kaleidoskopu, barvení textilu fyzikálními metodami, stavby z papíru využívající principy pružnosti a pevnosti.',
  },
  // === Elixír 1 - Hydraulika ===
  {
    id: 'kapaliny-hydraulika-model',
    subtopicId: 'pascaluv-zakon',
    topicId: 'kapaliny-7',
    title: 'Hydraulika a Pascalův zákon – model hydraulické ruky',
    type: 'other',
    description: 'Žáci staví model hydraulické ruky z injekčních stříkaček a kartónu. Ruka se ovládá stlačováním stříkaček – demonstrace přenosu síly kapalinou. Princip Pascalova zákona v praxi.',
  },
  // === Elixír 1 - Magnetismus ===
  {
    id: 'magnetismus-netradicne-elixir',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Magnetismus netradičně – experimenty z Elixíru',
    type: 'method',
    description: 'Sada experimentů s magnety: magnetická levitace, odpuzování magnetů na tyči, kompas z jehly na vodě, magnetické siločáry z pilin. Důraz na žákovské bádání a formulaci hypotéz.',
  },
  // === Elixír 1 - Reflektivní aktivity ===
  {
    id: 'mereni-reflektivni-aktivity',
    subtopicId: 'delka',
    topicId: 'mereni',
    title: 'Reflektivní aktivity ve výuce fyziky',
    type: 'method',
    description: 'Metody pro reflexi učení ve fyzice: exit tickets, myšlenkové mapy, „3-2-1" (3 věci jsem se naučil, 2 mě zaujaly, 1 otázku mám). Žáci hodnotí vlastní porozumění fyzikálním konceptům.',
  },
  // === Elixír 2 - Hrátky s magnetismem ===
  {
    id: 'magnetismus-hratky-elixir',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Hrátky s magnetismem – sada aktivit',
    type: 'game',
    description: 'Herní aktivity s magnety: magnetický závod (kdo nejrychleji provede magnet bludištěm), magnetická rybička (lov rybiček), magnetický kompas na vodě. Učení hrou pro mladší žáky.',
  },
  // === Elixír 2 - Grafy jinak ===
  {
    id: 'pohyb-grafy-jinak-elixir',
    subtopicId: 'grafy',
    topicId: 'pohyb',
    title: 'Grafy jinak – pohybové aktivity s grafy',
    type: 'method',
    description: 'Žáci vytváří grafy pohybu vlastním tělem: chodí před pohybovým senzorem a sledují, jak se kreslí graf na obrazovce. Učí se číst a interpretovat grafy závislosti dráhy a rychlosti na čase.',
  },
  // === Elixír 3 - Pastičkomobil ===
  {
    id: 'energie-pastickemobil-elixir',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Pastičkomobil a nejen to',
    type: 'other',
    description: 'Žáci staví vozítko poháněné pastičkou na myši – pružina pastičky se přeměňuje na pohyb. Další modely: autíčko na gumičku, solární vozítko. Přeměny energie v praxi.',
  },
  // === Elixír 4 - Cestovní lednička ===
  {
    id: 'energie-cestovni-lednicka',
    subtopicId: 'teplo-a-jeho-sireni',
    topicId: 'energie',
    title: 'Cestovní lednička – odpařování a chlazení',
    type: 'other',
    description: 'Žáci staví jednoduchou „cestovní ledničku" z květináčů a písku. Odpařování vody z mokrého písku odebírá teplo a chladí vnitřní květináč. Demonstrace skupenského tepla vypařování.',
  },
  // === Elixír 4 - S Micro:bitem za měřením ===
  {
    id: 'mereni-microbit',
    subtopicId: 'teplota',
    topicId: 'mereni',
    title: 'S Micro:bitem za měřením',
    type: 'method',
    description: 'Měření fyzikálních veličin pomocí mikropočítače Micro:bit: teplota, osvětlení, zrychlení, magnetické pole. Žáci programují jednoduchý kód a používají Micro:bit jako měřicí přístroj.',
  },
  // === Sborník dílen Elixíru 2019 - Boček: Perpetuum mobile ===
  {
    id: 'energie-perpetuum-mobile-diskuse',
    subtopicId: 'energie',
    topicId: 'energie',
    title: 'Perpetuum mobile tisíckrát jinak – proč nefunguje',
    type: 'method',
    description: 'Žáci analyzují různé návrhy „perpetuum mobile" z internetu a hledají, proč nemohou fungovat. Aplikují zákon zachování energie a poznávají, že každý stroj má ztráty třením a odporem.',
  },
  // === Sborník dílen Elixíru 2019 - Dvořák: Magneticky levitující tužka ===
  {
    id: 'magnetismus-levitujici-tuzka',
    subtopicId: 'magnety',
    topicId: 'magnetismus',
    title: 'Magneticky levitující tužka',
    type: 'other',
    description: 'Žáci konstruují zařízení, ve kterém tužka s magnety levituje ve vzduchu díky odpuzování magnetů a stabilizaci grafitovým jádrem. Demonstrace magnetické levitace a Earnshawova teorému.',
  },
  // === Sborník dílen Elixíru 2019 - Krajčová: LED zdroj ===
  {
    id: 'optika-led-zdroj-vyroba',
    subtopicId: 'svetlo',
    topicId: 'optika',
    title: 'Světelný zdroj z LED pásků',
    type: 'other',
    description: 'Žáci vyrábějí vlastní světelný zdroj z LED pásků pro optické pokusy. Zdroj lze použít pro demonstraci lomu, odrazu, stínů a míchání barev. Praktická elektronika spojená s optikou.',
  },
  // === Sborník dílen Elixíru 2019 - Michálek: Suchý led ===
  {
    id: 'skupenstvi-suchy-led',
    subtopicId: 'zmeny-skupenstvi-latek',
    topicId: 'skupenstvi-latek',
    title: 'Hrátky se suchým ledem',
    type: 'other',
    description: 'Experimenty se suchým ledem (pevný CO₂): sublimace přímo z pevného skupenství do plynného, bubliny z mýdlové vody plněné CO₂, „kouřový" efekt. Demonstrace sublimace a vlastností CO₂.',
  },
  // === VNUF - Různí: Formativní hodnocení ===
  {
    id: 'mereni-formativni-hodnoceni',
    subtopicId: 'hmotnost',
    topicId: 'mereni',
    title: 'Formativní přístup v hodinách fyziky',
    type: 'method',
    description: 'Metody formativního hodnocení ve fyzice: klíčové otázky na začátku hodiny, „palec nahoru/dolů", koncepční testy s hlasováním. Žáci dostávají průběžnou zpětnou vazbu o svém porozumění.',
  },
  // === VNUF - Koupilová: Konceptuální úlohy ===
  {
    id: 'sila-konceptualni-ulohy',
    subtopicId: 'newtonovy-zakony',
    topicId: 'sila',
    title: 'Konceptuální úlohy z mechaniky',
    type: 'method',
    description: 'Sada úloh testujících porozumění Newtonovým zákonům: „Je síla příčinou pohybu nebo změny pohybu?", „Působí Země na Měsíc stejnou silou jako Měsíc na Zemi?" Žáci diskutují ve dvojicích a hlasují.',
  },
  // === VNUF - Scholz: Fyzikum.cz ===
  {
    id: 'pohyb-fyzikum-videa',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Fyzikum.cz – videoučebnice ve výuce',
    type: 'method',
    description: 'Využití krátkých výukových videí z Fyzikum.cz v hodinách fyziky. Žáci sledují video s pokusem, formulují hypotézu a diskutují. Metoda převrácené třídy (flipped classroom) ve fyzice.',
  },
  // === Paper Science ===
  {
    id: 'paper-papirove-mosty',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Papírové mosty – pevnost konstrukcí',
    type: 'group-work',
    description: 'Skupinová soutěž: žáci staví mosty pouze z papíru a lepidla. Most musí unést co největší závaží. Zkoumají, jak tvar profilu (U, T, trubka) ovlivňuje pevnost. Aplikace rozkladu sil.',
  },
  {
    id: 'paper-papirove-rakety',
    subtopicId: 'rychlost',
    topicId: 'pohyb',
    title: 'Papírové rakety – soutěž v doletu',
    type: 'game',
    description: 'Žáci skládají papírové rakety různých tvarů a vystřelují je z brčka fouknutím. Soutěží o největší dolet. Zkoumají vliv tvaru, hmotnosti a úhlu vypuštění na dráhu letu.',
  },
  // === VNUF - Wegenkittlová: Novinky iQLANDIE ===
  {
    id: 'sila-science-centrum-aktivity',
    subtopicId: 'sila-a-jeji-znazorneni',
    topicId: 'sila',
    title: 'Aktivity ze science center pro školní třídu',
    type: 'method',
    description: 'Adaptace interaktivních exponátů ze science center pro školní prostředí: kladkový mechanismus, Bernoulliho levitace míčku, Edisonova žárovka. Hands-on aktivity, které lze realizovat i bez drahého vybavení.',
  },
  // === VNUF - Eret: SPINTRONICS stavebnice ===
  {
    id: 'eo-spintronics-stavebnice',
    subtopicId: 'elektricky-obvod',
    topicId: 'elektricke-obvody',
    title: 'SPINTRONICS – mechanická stavebnice pro elektrické obvody',
    type: 'other',
    description: 'Mechanická stavebnice SPINTRONICS modeluje elektrické obvody pomocí řetízků a ozubených kol. Odpor, napětí a proud mají fyzické analogie – žáci „vidí" a „cítí" elektrické veličiny.',
  },
  // === VNUF - Hejsková: Fyzikální maličkosti ===
  {
    id: 'vlastnosti-fyzikalni-malickosti',
    subtopicId: 'latky-a-telesa',
    topicId: 'vlastnosti-latek',
    title: 'Fyzikální maličkosti – krátké pokusy',
    type: 'other',
    description: 'Sbírka krátkých pokusů (1–3 minuty) vhodných na zahájení hodiny: proč se lžička v čaji otáčí, proč „zpívá" mokrý prst na sklenici, jak funguje „magický" písek. Motivační „koření" do výuky.',
  },
  // === Elixír 5 - Nanotechnologie ===
  {
    id: 'mikrosvet-nanotechnologie-zs',
    subtopicId: 'skaly-v-mikrosvete',
    topicId: 'mikrosvet',
    title: 'Nanotechnologie pro ZŠ',
    type: 'method',
    description: 'Aktivity přibližující nanotechnologie žákům ZŠ: modelování atomů, porovnání velikostí (atom vs. tenisák vs. Země), experimenty s hydrofobními povrchy. Úvod do světa částic menších než buňka.',
  },
  // === Elixír 3 - Geogebra v optice ===
  {
    id: 'optika-geogebra-simulace',
    subtopicId: 'cocky-zakon-lomu',
    topicId: 'optika',
    title: 'Geogebra v geometrické optice – simulace',
    type: 'method',
    description: 'Žáci vytvářejí simulace optických jevů v programu GeoGebra: odraz od zrcadla, lom světla, zobrazení čočkou. Mohou měnit parametry a okamžitě vidí výsledek. Propojení fyziky a IT.',
  },
  // === Elixír 3 - Solarografie ===
  {
    id: 'astronomie-solarografie-lumen',
    subtopicId: 'slunecni-soustava',
    topicId: 'astronomie',
    title: 'Solarografie a lumen print',
    type: 'other',
    description: 'Žáci vytvářejí solarografii: do plechovky s dírkou vloží fotopapír a exponují několik týdnů. Na papíru se zachytí dráha Slunce po obloze. Lumen print vzniká přímým vystavením fotopapíru slunci s předmětem.',
  },
];

// ============ WRITE FILES ============

async function main() {
  await mkdir(join(CONTENT_DIR, 'experiments'), { recursive: true });
  await mkdir(join(CONTENT_DIR, 'activities'), { recursive: true });

  let expCount = 0;
  let actCount = 0;

  for (const exp of experiments) {
    const { ...data } = exp;
    const filePath = join(CONTENT_DIR, 'experiments', `${exp.id}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    expCount++;
  }

  for (const act of activities) {
    const filePath = join(CONTENT_DIR, 'activities', `${act.id}.json`);
    await writeFile(filePath, JSON.stringify(act, null, 2) + '\n', 'utf-8');
    actCount++;
  }

  console.log(`Generated ${expCount} new experiments and ${actCount} new activities`);
  console.log(`Total experiments: 48 + ${expCount} = ${48 + expCount}`);
  console.log(`Total activities: 84 + ${actCount} = ${84 + actCount}`);
  console.log(`Grand total: ${48 + expCount + 84 + actCount}`);
}

main();
