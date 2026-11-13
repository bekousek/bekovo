import { useState, type ReactNode } from 'react';
import { ScreenHead } from '../ui';
import { Sprite } from '../pixel/Sprite';
import type { SpriteKey } from '../pixel/sprites';
import { PRICES_DATE } from '../data/parts';

interface Topic {
  id: string;
  title: string;
  body: () => ReactNode;
}

const PARTS_INFO: { sprite: SpriteKey; name: string; text: string }[] = [
  { sprite: 'cpu', name: 'Procesor (CPU)', text: 'Počítá všechno, co počítač dělá. Víc jader pomáhá při střihu videa, ve hrách víc záleží na grafice.' },
  { sprite: 'mb', name: 'Základní deska', text: 'Propojuje všechny díly. Určuje, jaký procesor (patice) a jaké paměti (DDR4/DDR5) do počítače dáš.' },
  { sprite: 'ram', name: 'Operační paměť (RAM)', text: 'Pracovní stůl počítače: drží rozdělanou práci. Po vypnutí se vymaže. 16 GB stačí na hry, na střih je lepší 32 GB.' },
  { sprite: 'ssd', name: 'Disk SSD', text: 'Ukládá systém, programy a soubory i po vypnutí. SSD M.2 se zasune přímo do desky a je mnohem rychlejší než pevný disk.' },
  { sprite: 'gpu', name: 'Grafická karta (GPU)', text: 'Počítá obraz. Na hry je nutná. Do školy stačí grafika v procesoru, pokud ji procesor má.' },
  { sprite: 'psu', name: 'Zdroj (PSU)', text: 'Mění 230 V ze zásuvky na nízké napětí pro díly. Musí mít dost wattů pro grafickou kartu.' },
  { sprite: 'cooler', name: 'Chladič', text: 'Odvádí teplo z procesoru. Některé procesory ho mají v krabici, jiné ne.' },
  { sprite: 'case', name: 'Skříň', text: 'Drží všechno pohromadě a fouká do ní vzduch. Musí se do ní vejít formát desky.' },
  { sprite: 'osWin', name: 'Operační systém', text: 'Windows (placený) nebo Linux (zdarma). Bez systému počítač po zapnutí nic neumí.' },
];

const TOPICS: Topic[] = [
  {
    id: 'parts',
    title: 'Z čeho je počítač',
    body: () => (
      <>
        <h2>Z čeho je počítač</h2>
        <div className="lib-items">
          {PARTS_INFO.map((p) => (
            <div key={p.name} className="lib-item">
              <div className="lib-item__art"><Sprite name={p.sprite} fit={[128, 72]} /></div>
              <div><h3>{p.name}</h3><p>{p.text}</p></div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'compat',
    title: 'Tahák kompatibility',
    body: () => (
      <>
        <h2>Tahák kompatibility</h2>
        <p>Než díly koupíš, zkontroluj těchto šest věcí. V obchodě ti pomůže tlačítko „Zkontrolovat sestavu“.</p>
        <Rule title="Patice procesoru = patice desky">
          Procesory AMD Ryzen 7000/8000/9000 mají patici AM5. Intel Core 12.–14. generace má LGA1700, Intel Core Ultra má LGA1851. Procesor s jinou paticí do desky nevložíš.
        </Rule>
        <Rule title="Typ paměti = typ slotů na desce">
          Deska bere buď DDR4, nebo DDR5. Zářez na modulu je u každého typu jinde, takže špatná paměť nejde zasunout.
        </Rule>
        <Rule title="Deska se musí vejít do skříně">
          Velká deska ATX se nevejde do malé skříně, která umí jen mATX a mITX. Opačně to jde: malá deska se vejde do velké skříně.
        </Rule>
        <Rule title="Zdroj musí stačit grafické kartě">
          Výrobce karty uvádí doporučený zdroj, třeba 550 W nebo 650 W. Slabší zdroj by se při hraní vypínal.
        </Rule>
        <Rule title="Bez grafiky není obraz">
          Procesory Intel s písmenem F (např. i5-14400F) nemají grafiku v sobě. Potřebují grafickou kartu, jinak zůstane monitor černý.
        </Rule>
        <Rule title="Chladič: v krabici, nebo dokoupit">
          Procesory s chladičem v krabici (box) ho mají včetně pasty. Jinak chladič dokup a zkontroluj, že umí patici tvého procesoru.
        </Rule>
      </>
    ),
  },
  {
    id: 'choose',
    title: 'Jak vybírat podle zakázky',
    body: () => (
      <>
        <h2>Jak vybírat podle zakázky</h2>
        <h3>Herní PC</h3>
        <p>Nejvíc peněz patří do grafické karty, ta rozhoduje o FPS. Procesor stačí šestijádrový. Zdroj musí kartu utáhnout. 16 GB paměti ve dvou modulech stačí.</p>
        <h3>PC na střih videa</h3>
        <p>Pomůže procesor s hodně jádry a grafická karta, která umí video rychle exportovat. Paměti aspoň 32 GB a velký rychlý disk na videa.</p>
        <h3>Levné PC do školy</h3>
        <p>Stačí procesor s grafikou v sobě, 16 GB paměti a SSD. Grafická karta je zbytečná. Ušetříš i na systému: Linux Mint je zdarma.</p>
        <h3>Chytrý tip</h3>
        <p>Starší platforma s pamětmi DDR4 (Intel LGA1700) je letos mnohem levnější, protože DDR5 výrazně podražily. Výkon ve hrách je skoro stejný.</p>
      </>
    ),
  },
  {
    id: 'ram',
    title: 'Proč jsou paměti drahé',
    body: () => (
      <>
        <h2>Proč jsou paměti tak drahé</h2>
        <p>V polovině roku 2025 stála sada 32 GB DDR5 kolem 3 000 Kč. Teď ({PRICES_DATE}) stojí v obchodě přes 12 000 Kč.</p>
        <p>Velké firmy staví datová centra pro umělou inteligenci a skupují obrovské množství paměťových čipů. Výrobci pamětí proto vyrábějí hlavně pro servery a na běžné paměti do počítačů zbývá méně. Když je zboží málo a zájem velký, cena roste.</p>
        <p>Podobně podražila i SSD a grafické karty, které také potřebují paměťové čipy. Ceny ve hře jsou skutečné ceny z českého e-shopu.</p>
      </>
    ),
  },
  {
    id: 'safe',
    title: 'Bezpečně na internetu',
    body: () => (
      <>
        <h2>Bezpečně na internetu</h2>
        <ul>
          <li><b>Phishing</b> se tváří jako banka, škola nebo kamarád a chce heslo nebo kód. Na odkazy v podezřelých zprávách neklikej.</li>
          <li><b>Heslo</b> má být dlouhé a pro každý web jiné. Pomůže správce hesel.</li>
          <li><b>Dvoufázové ověření</b> chrání účet, i když někdo heslo zjistí.</li>
          <li><b>Programy</b> stahuj jen z oficiálního webu. Reklamní tlačítka „Stáhnout“ často vedou jinam.</li>
          <li>Při instalaci <b>čti, co je zaškrtnuté</b>. Instalátory rády přibalují lišty a „čističe“.</li>
          <li><b>Zálohuj</b> podle pravidla 3-2-1: 3 kopie, 2 různá média, 1 mimo domov.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'net',
    title: 'Sítě v kostce',
    body: () => (
      <>
        <h2>Sítě v kostce</h2>
        <ul>
          <li><b>IP adresa</b> je číselná adresa zařízení v síti, třeba 192.168.1.15.</li>
          <li><b>Router</b> propojuje domácí zařízení a připojuje je k internetu. Přiděluje adresy (DHCP).</li>
          <li><b>DNS</b> převádí jména webů na IP adresy, funguje jako telefonní seznam.</li>
          <li><b>HTTPS</b> a zámek znamenají šifrované spojení. Pravost webu ale ověř podle adresy.</li>
          <li><b>Ping</b> je doba odezvy v milisekundách. Pro online hry chceš co nejmenší.</li>
          <li><b>Kabel</b> bývá stabilnější než Wi-Fi. Wi-Fi 5 GHz je rychlejší, 2,4 GHz dosáhne dál.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'units',
    title: 'Data a jednotky',
    body: () => (
      <>
        <h2>Data a jednotky</h2>
        <ul>
          <li><b>Bit</b> je 0 nebo 1. <b>Bajt</b> = 8 bitů.</li>
          <li>1 kB ≈ 1 000 B, 1 MB ≈ 1 000 kB, 1 GB ≈ 1 000 MB, 1 TB ≈ 1 000 GB.</li>
          <li>Rychlost internetu se udává v <b>megabitech</b> (Mb/s). 80 Mb/s = 10 MB/s.</li>
          <li>Obrázek 1920 × 1080 má přes 2 miliony pixelů, každý pixel má barvu R, G, B.</li>
          <li>JPG a MP3 jsou ztrátová komprese (menší soubor), ZIP a PNG bezeztrátová.</li>
        </ul>
      </>
    ),
  },
];

export default function Library() {
  const [current, setCurrent] = useState(TOPICS[0].id);
  const topic = TOPICS.find((t) => t.id === current)!;
  return (
    <>
      <ScreenHead title="Knihovna" lead="Taháky k otázkám z brigád a ke skládání počítače." />
      <div className="lib">
        <nav className="lib-nav px-frame" aria-label="Témata knihovny">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="lib-nav__btn"
              aria-current={t.id === current}
              onClick={() => setCurrent(t.id)}
            >
              {t.title}
            </button>
          ))}
        </nav>
        <article className="lib-page px-frame">{topic.body()}</article>
      </div>
    </>
  );
}

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="lib-rule px-frame">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
