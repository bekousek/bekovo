const R = String.raw;

export default [
  {
    title: '5. hodina – Měření multimetrem (napětí a odpor)',
    sourceLessonNo: 5,
    sourceUrl: 'https://drive.google.com/file/d/196CoU7NVQgVh6UHwo7BG8SV5eZo5wKLh/view',
    date: '19. 9. 2023',
    content: R`<p><em>Praktické seznámení s multimetrem a měřením napětí a odporu. Začínáme připomenutím domácího úkolu (Google Classroom) a Kahootem na opakování.</em></p>
<h3>Práce s multimetrem ve skupinách</h3>
<p>Rozdáme multimetry, prohlédneme si je a vyzkoušíme měření:</p>
<ul>
<li><strong>napětí U</strong> baterie (multimetr v režimu voltmetru),</li>
<li><strong>odpor R</strong> svazku klíčů,</li>
<li><strong>odpor R vlastního těla</strong> (mezi dlaněmi) — žáci uvidí, že odpor není jen vlastnost součástek.</li>
</ul>
<h3>Jak zapojit ampérmetr</h3>
<p>Porovnáme dvě zapojení a zdůvodníme, že <strong>ampérmetr (měřič proudu) patří do série</strong> s obvodem — proud jím musí protékat. (Voltmetr naopak připojujeme paralelně, viz další hodina.)</p>`,
  },
  {
    title: '7. hodina – Měření a výpočet U, I, R (Ohmův zákon)',
    sourceLessonNo: 7,
    sourceUrl: 'https://drive.google.com/file/d/1DW5mSOVUFwozOdety4a7zOeRFY3VNHL3/view',
    date: '3. 10. 2023',
    content: R`<p><em>Jak správně měřit proud a napětí a jak je přes Ohmův zákon propojit s odporem. Vychází z reálně zapojeného obvodu, vrcholí výpočty.</em></p>
<h3>Jak se měří proud I?</h3>
<p>Na několika obvodech rozhodneme, kam patří <strong>ampérmetr</strong>. Zapojuje se vždy <strong>do série</strong> — proud jím musí procházet. V sériovém obvodu je proud všude stejný, takže <strong>na poloze ampérmetru v sérii nezáleží</strong>. (Zapojit ampérmetr paralelně by znamenalo zkrat.)</p>
<h3>Jak se měří napětí U?</h3>
<p>Obdobně rozhodneme, kam patří <strong>voltmetr</strong>: zapojuje se <strong>paralelně</strong> k té součástce, na které měříme napětí (měří rozdíl mezi dvěma místy obvodu).</p>
<figure><img src="/lesson-prep/elektrina--elektricky-odpor/mereni-obvod.svg" alt="Schéma obvodu: ampérmetr (A) zapojený do série, voltmetr (V) paralelně k rezistoru" /><figcaption>Ampérmetr (A) zapojujeme do série, voltmetr (V) paralelně k součástce.</figcaption></figure>
<h3>Elektrický odpor a Ohmův zákon</h3>
<p><strong>Elektrický odpor R</strong> vyjadřuje, jak moc látka brání průchodu proudu; jeho jednotkou je <strong>ohm (Ω)</strong>. Napětí, proud a odpor spolu souvisí <strong>Ohmovým zákonem</strong>:</p>
<div class="formula">U = R · I</div>
<figure><img src="/lesson-prep/elektrina--elektricky-odpor/ohmuv-zakon-trojuhelnik.svg" alt="Trojúhelník Ohmova zákona: U nahoře, R a I dole" /><figcaption>Trojúhelník Ohmova zákona — zakrytím hledané veličiny získáme vzorec pro její výpočet.</figcaption></figure>
<p>Z trojúhelníku U / (R · I) snadno vyjádříme kteroukoli veličinu — <em>„mám dvě, třetí dopočítám"</em>:</p>
<div class="formula">R = U / I &nbsp;&nbsp;•&nbsp;&nbsp; I = U / R</div>
<p>Procvičíme na příkladech a zakončíme krátkou <strong>desetiminutovkou na tabletech</strong> (žáci si u toho mohou nechat sešity).</p>`,
  },
];
