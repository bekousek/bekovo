const R = String.raw;

// 8.A (2023) — cívka, elektromagnet a elektromagnetická indukce v 8. ročníku.
// Připojuje se ZA hodiny ze 6.B (2022).
export default [
  {
    title: '40. hodina – Cívka v obvodu (8. roč.)',
    sourceLessonNo: 40,
    sourceUrl: 'https://drive.google.com/file/d/1GkGbswKNyb-Jogwz60hcpdMEP05DZkCB/view',
    date: '16. 3. 2023',
    content: R`<p><em>Procvičení stavby a měření obvodu (ampérmetr + voltmetr) a úvodní seznámení s cívkou jako elektromagnetem.</em></p>
<p>Žáci postaví a proměří obvod se žárovkou, <strong>ampérmetrem (A)</strong> a <strong>voltmetrem (V)</strong> a dvojicí spínačů. Na závěr otevřeme další téma: <strong>cívka, elektromagnet…</strong> — co dokáže cívka, kterou prochází proud.</p>`,
  },
  {
    title: '48. hodina – Elektromagnetismus (8. roč.)',
    sourceLessonNo: 48,
    sourceUrl: 'https://drive.google.com/file/d/1H8Uj6mVNlp-WfeziGPAPghPZcCv90SmZ/view',
    date: '26. 4. 2023',
    content: R`<p><em>Objevujeme dvě klíčové souvislosti mezi elektřinou a magnetismem: silové účinky proudu (princip motoru) a elektromagnetickou indukci (princip generátoru). Postupujeme přes řadu pokusů. Zkoušení, ostatní zatím zapojují náročnější obvody.</em></p>
<h3>Má vodič s proudem magnetické pole?</h3>
<p>Víme, že <strong>cívka</strong> tvoří elektromagnet. A samotný přímý vodič?</p>
<ul>
<li><strong>Pokus:</strong> volně zavěšený vodič vložíme mezi dva přitahující se magnety a zapneme proud → vodič se <strong>vychýlí</strong>.</li>
<li>Závěr: <strong>vodič s proudem má sám magnetické pole.</strong> Zesílíme ho smotáním vodiče (uděláme cívku).</li>
<li><strong>Pokus:</strong> totéž se smotaným vodičem → vychýlí se <strong>víc</strong>.</li>
</ul>
<div class="formula">proud + magnet → pohyb</div>
<p>To je princip <strong>elektromotoru</strong>.</p>
<h3>A když to obrátíme?</h3>
<p>Bude platit i opačně, že <strong>magnet + pohyb → proud</strong>?</p>
<ul>
<li><strong>Pokus:</strong> pohybujeme vodičem v magnetickém poli a sledujeme voltmetr (zatím se skoro nic neukáže).</li>
<li><strong>Pokus:</strong> zkusíme to s pořádnou cívkou → <strong>ANO!</strong> Při pohybu magnetu vůči cívce vzniká napětí.</li>
</ul>
<div class="formula">magnet + pohyb → proud</div>
<p>To je <strong>elektromagnetická indukce</strong> — princip generátoru (dynama). Doplníme ukázkami: magnet padající trubkou, baterkový („protřepávací") vláček, reproduktor.</p>`,
  },
];
