const R = String.raw;

// 8.A (2023) — prohloubení proudu a napětí v 8. ročníku.
// Připojuje se ZA hodiny ze 6.B (2022).
export default [
  {
    title: '37. hodina – Co je elektrický proud (8. roč.)',
    sourceLessonNo: 37,
    sourceUrl: 'https://drive.google.com/file/d/1GfMvO8_nSCctDcQS8VR_kh5jVCHO25TG/view',
    date: '20. 2. 2023',
    content: R`<p><em>Modelujeme, co se děje uvnitř vodiče, a zavádíme veličinu elektrický proud. Opakování přes zapojení obvodu (sériové × paralelní) a pojem uzel u součástky.</em></p>
<h3>Model elektrického proudu</h3>
<p>Porovnáme dva modely a hlasujeme, který je lepší:</p>
<ul>
<li><strong>vodní model</strong> — čerpadlo žene vodu potrubím dokola,</li>
<li><strong>svářečkový model</strong> — láhve s kyslíkem a acetylenem.</li>
</ul>
<p>Který sedí? Ověříme pokusy: (a) obě žárovky svítí, i když nepotřebují „oba dráty"; (b) obvod nesvítí (skrytý spínač) — ukážeme s baterkou. Závěr: <strong>vodní model je lepší</strong> (proud teče dokola jako voda).</p>
<h3>Elektrický proud</h3>
<p>Co vlastně vodičem „proudí"? <strong>Elektrony.</strong> Ampérmetr si představíme jako <strong>počítadlo elektronů</strong>, které projdou daným místem.</p>
<p><strong>Elektrický proud</strong> značíme <strong>I</strong>, jeho jednotka je <strong>ampér (A)</strong>.</p>`,
  },
  {
    title: '38. hodina – Elektrické napětí (8. roč.)',
    sourceLessonNo: 38,
    sourceUrl: 'https://drive.google.com/file/d/1Ggvd3A6qOFdbDw0Rq5tCJVjbhnqw0gi3/view',
    date: '2. 3. 2023',
    content: R`<p><em>Zavádíme napětí a měření voltmetrem. Procvičujeme zapojování podle popisu i podle netradičního schématu.</em></p>
<h3>Zapojování na rozcvičení</h3>
<p>Zapojit podle popisu: dvě žárovky <strong>sériově</strong>, spínač u kladného pólu a ampérmetr mezi žárovkami. Pak zapojit i jedno <strong>nestandardně nakreslené schéma</strong> (trénink čtení schémat).</p>
<h3>Elektrické napětí</h3>
<p><strong>Napětí</strong> udává, „jak moc se chce elektronům běžet" z jednoho místa do druhého. Značíme <strong>U</strong>, jednotka je <strong>volt (V)</strong>.</p>
<p><strong>Voltmetr</strong> měří napětí <strong>mezi dvěma místy</strong> obvodu, a proto se zapojuje <strong>paralelně</strong> (vedle součástky). Vyzkoušíme změřit napětí nad jednou žárovkou, nad dvěma najednou i nad každou zvlášť v sérii.</p>`,
  },
  {
    title: '39. hodina – Další měření voltmetrem (8. roč.)',
    sourceLessonNo: 39,
    sourceUrl: 'https://drive.google.com/file/d/1GjdVHYq1oMrjJeYEQw2an_hYJu7W5N30/view',
    date: '8. 3. 2023',
    content: R`<p><em>Měřením objevujeme, jak se napětí rozdělí v sériovém a v paralelním zapojení.</em></p>
<h3>Napětí v sériovém zapojení</h3>
<p>Voltmetrem změříme napětí přes obě žárovky (U<sub>1</sub>) i přes každou zvlášť (U<sub>2</sub>, U<sub>3</sub>). Vyjde:</p>
<div class="formula">U<sub>1</sub> = U<sub>2</sub> + U<sub>3</sub></div>
<p>Slovy: „jak moc se elektronům chce přes obě žárovky" = součet toho, „jak moc se jim chce přes každou zvlášť". <strong>V sérii se napětí sčítají.</strong></p>
<h3>Napětí v paralelním zapojení</h3>
<p>U dvou paralelních větví naměříme stejné napětí:</p>
<div class="formula">U<sub>1</sub> = U<sub>2</sub></div>
<p>Když zbyde čas, nakousneme cívku.</p>`,
  },
];
