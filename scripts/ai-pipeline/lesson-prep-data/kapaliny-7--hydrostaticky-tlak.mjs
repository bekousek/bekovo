const R = String.raw;

export default [
  {
    title: '33. hodina – Hydrostatický tlak',
    sourceLessonNo: 33,
    sourceUrl: 'https://drive.google.com/file/d/1JE9V82bDD_JMvrbP12sMSznqpj_TAkIC/view',
    date: '13. 2. 2023',
    content: R`<p><em>Opakování tlaku a zavedení hydrostatického tlaku.</em></p>
<h3>Opakování</h3>
<p>Co je tlak (p = F/S)? Porovnání <strong>podpatek vs. slon</strong>: štíhlý podpatek (1 cm², 50 kg → 500 N) vyvolá tlak <strong>5 MPa</strong>, zatímco slon (1 dm², 4000 kg → 40 000 N) jen <strong>4 MPa</strong>. Malá plocha = velký tlak (na témže principu funguje „fakírské lůžko" — váha se rozloží na mnoho hřebíků). Zopakujeme i hydraulická zařízení a Pascalův zákon.</p>
<h3>Hydrostatický tlak</h3>
<p>Čím jsem hlouběji, tím víc na mě shora tlačí voda svou tíhou (proto při potápění zalehnou uši). Tlak v hloubce <em>h</em> odvodíme:</p>
<div class="formula">$$p_h = \frac{F}{S} = \frac{m \cdot g}{S} = \frac{V \cdot \rho \cdot g}{S} = \frac{S \cdot h \cdot \rho \cdot g}{S}$$</div>
<div class="formula">$$p_h = h \cdot \rho \cdot g$$</div>
<p>Hydrostatický tlak tedy závisí jen na <strong>hloubce</strong> <em>h</em>, <strong>hustotě kapaliny</strong> <em>ρ</em> a na <em>g</em> — ne na tvaru nádoby.</p>
<figure><img src="/lesson-prep/kapaliny-7--hydrostaticky-tlak/hydrostaticky-tlak.svg" alt="Voda stříká z otvorů v nádobě — z nižšího otvoru dál, protože tam je větší tlak" /><figcaption>Z nižšího otvoru voda stříká dál — hydrostatický tlak roste s hloubkou.</figcaption></figure>`,
  },
  {
    title: '36. hodina – Hydrostatický tlak v těle (aplikace)',
    sourceLessonNo: 36,
    sourceUrl: 'https://drive.google.com/file/d/1JLB-7khRXB_Bxhg2OYlV0snGvtszSndp/view',
    date: '28. 2. 2023',
    content: R`<p><em>Aplikace hydrostatického tlaku na krevní tlak v lidském (a zvířecím) těle.</em></p>
<p>Krev je kapalina, takže i v cévách platí hydrostatický tlak — čím níž, tím větší. Probereme na příkladech:</p>
<ul>
<li><strong>Křečové žíly</strong> — v nohách (nejníže) je tlak krve největší, žíly se proto nejvíc namáhají; příklad se starší paní.</li>
<li><strong>Žirafa</strong> — má velmi vysoký krevní tlak, aby dostala krev až do hlavy vysoko nad srdcem.</li>
<li><strong>Stoj na hlavě</strong> — když se postavíme na hlavu, tlak krve v hlavě vzroste (nával krve).</li>
</ul>`,
  },
];
