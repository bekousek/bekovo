const R = String.raw;

export default [
  {
    title: '15. hodina – Zdroje napětí (přehled)',
    sourceLessonNo: 15,
    sourceUrl: 'https://drive.google.com/file/d/139-C6IK1nMYPMl4dOQNLAIXjbUyd0T6e/view',
    date: '6. 11. 2023',
    content: R`<p><em>Přehled zdrojů elektrického napětí — od generátorů přes solární panel k bateriím. Na úvod zopakujeme indukci a pustíme video „Tesla vs. Edison – válka proudů" (~10 min).</em></p>
<h3>Generátory</h3>
<ul>
<li><strong>Alternátor</strong> vyrábí střídavý proud (<strong>AC</strong>),</li>
<li>přidáním <strong>usměrňovače</strong> získáme stejnosměrný proud (<strong>DC</strong>) — <strong>dynamo</strong>,</li>
<li>generátory pohánějí <strong>elektrárny</strong> (vodní, větrné, tepelné, jaderné…).</li>
</ul>
<h3>Další zdroje</h3>
<ul>
<li><strong>Solární panel</strong> — světlo vytvoří ve dvou vrstvách přebytek a nedostatek elektronů, vznikne napětí,</li>
<li><strong>baterie</strong> — dělíme na <strong>články</strong> (na jedno použití) a <strong>akumulátory</strong> (nabíjecí); ceny se liší (Zn-C „heavy duty" ~10 Kč, alkalické ~15–25 Kč, lithiové 50–80 Kč za kus).</li>
</ul>
<p>Pokus: sestavíme jednoduchý <strong>Voltův článek</strong> (elektrody v elektrolytu, napětí změříme voltmetrem). Pokud zbyde čas, nakousneme <strong>kapacitu (mAh)</strong>.</p>`,
  },
  {
    title: '16. hodina – Baterie',
    sourceLessonNo: 16,
    sourceUrl: 'https://drive.google.com/file/d/1TbIjfmoaXSHfKl63u8oykxX9T3ccfVho/view',
    date: '13. 11. 2023',
    content: R`<p><em>Druhy baterií, jak fungují a co znamená jejich kapacita. Na úvod Kahoot.</em></p>
<h3>Článek × akumulátor</h3>
<p><strong>Akumulátor</strong> se dá nabíjet, <strong>článek</strong> je na jedno použití. Princip ukážeme na <strong>Voltově článku</strong>: dvě elektrody (zinková <strong>anoda −</strong>, měděná <strong>katoda +</strong>) v elektrolytu (H<sub>2</sub>SO<sub>4</sub>), napětí měříme voltmetrem.</p>
<h3>Druhy a provedení</h3>
<ul>
<li>formáty: <strong>AA, AAA, plochá baterie, 9V, knoflíkové</strong>,</li>
<li>články: <strong>suché</strong> (do ~300 mAh) a <strong>alkalické</strong> (~3000 mAh); suchý článek tvoří oxid manganičitý, salmiak a zinková nádoba,</li>
<li>akumulátory: <strong>Ni-MH</strong> (~2000 mAh) a <strong>Li-ion</strong> (~3000 mAh).</li>
</ul>
<h3>Kapacita (mAh)</h3>
<p>Kapacita říká, jaký proud baterie dává, kdyby se vybila za 1 hodinu. Příklad: telefon má 5000 mAh, při hraní bere 1000 mA (= 1 A) → vydrží asi <strong>5 h</strong>. Obráceně: hodinky s baterií 750 mAh nabíjené jednou za 2 dny odebírají ≈ <strong>15,6 mA</strong>.</p>`,
  },
  {
    title: '32. hodina – Autobaterie a startování',
    sourceLessonNo: 32,
    sourceUrl: 'https://drive.google.com/file/d/1J0FQ20ZOZ91GrTMmUypTXRfYm7xWpdd1/view',
    date: '5. 3. 2024',
    content: R`<p><em>Praktická vsuvka o akumulátoru v autě — co dělat, když „chcípne baterka".</em></p>
<p><strong>Autobaterie</strong> je olověný akumulátor. Když je vybitá, auto nenastartuje. Ukážeme si, jak <strong>nastartovat ze startovacích kabelů</strong> od jiného auta (správné pořadí připojení + / −) a proč moderní auto <strong>neroztlačujeme</strong>.</p>`,
  },
];
