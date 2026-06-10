const R = String.raw;

export default [
  {
    title: '37. hodina – Vztlaková síla (úvod)',
    sourceLessonNo: 37,
    sourceUrl: 'https://drive.google.com/file/d/1JNTMvexx3DSM6NP2sUx7GMksE3Dq_d45/view',
    date: '28. 2. 2023',
    content: R`<p><em>Procvičení hydrostatické síly na potápěče a úvod ke vztlakové síle.</em></p>
<h3>Příklad: tlak a síla na potápěče</h3>
<p>Vypočítejte hydrostatický tlak a sílu působící na potápěče v hloubce 0,2 km. Hustota vody 1000 kg/m³, plocha těla potápěče 40 dm².</p>
<ul>
<li>h = 0,2 km = 200 m, ρ = 1000 kg/m³, g = 10 N/kg, S = 40 dm² = 0,4 m²</li>
<li>tlak: p<sub>h</sub> = h·ρ·g = 200 · 1000 · 10 = 2 000 000 Pa = <strong>2 MPa</strong></li>
<li>síla: F<sub>h</sub> = p<sub>h</sub>·S = 2 000 000 · 0,4 = 800 000 N = <strong>800 kN = 0,8 MN</strong></li>
</ul>
<h3>Co je vztlaková síla?</h3>
<p>Když ponoříme těleso do vody, voda ho <strong>nadlehčuje</strong> — působí na něj vzhůru <strong>vztlaková síla</strong>. Příští hodinu ji popíšeme Archimédovým zákonem.</p>`,
  },
  {
    title: '38. hodina – Vztlaková síla a Archimédův zákon',
    sourceLessonNo: 38,
    sourceUrl: 'https://drive.google.com/file/d/1JVyZ6s2L4vvzZhSr585YoWerXkfctE38/view',
    date: '8. 3. 2023',
    content: R`<p><em>Definice vztlakové síly a Archimédův zákon. Motivace: ukázka z filmu o batyskafu.</em></p>
<h3>Archimédův zákon</h3>
<p>Na těleso ponořené do kapaliny působí <strong>vztlaková síla</strong> směrem vzhůru. Její velikost se rovná tíze kapaliny, kterou těleso svým objemem vytlačí:</p>
<div class="formula">$$F_{vz} = V_p \cdot \rho_k \cdot g$$</div>
<p>kde <strong>V<sub>p</sub></strong> je objem ponořené části tělesa a <strong>ρ<sub>k</sub></strong> je hustota kapaliny. Čím víc kapaliny těleso vytlačí, tím větší vztlaková síla.</p>`,
  },
  {
    title: '40. hodina – Výpočty vztlakové síly',
    sourceLessonNo: 40,
    sourceUrl: 'https://drive.google.com/file/d/1JjFZFtO51Jx7Ap4TOmBqA4o0DjMGVCZc/view',
    date: '15. 3. 2023',
    content: R`<p><em>Souhrnný příklad: hydrostatický tlak, vztlaková a hydrostatická síla.</em></p>
<p>Rejnok leží 0,6 km pod hladinou na mořském dně. Hustota mořské vody je 1020 kg/m³, objem rejnokova těla je 100 dm³. Vypočítejte:</p>
<ul>
<li><strong>a) hydrostatický tlak:</strong> p<sub>h</sub> = h·ρ·g = 600 · 1020 · 10 ≈ <strong>6,12 MPa</strong></li>
<li><strong>b) vztlakovou sílu:</strong> F<sub>vz</sub> = V·ρ·g = 0,1 · 1020 · 10 = <strong>1020 N = 1,02 kN</strong></li>
<li><strong>c) hydrostatickou sílu</strong> (rejnok vysoký 10 cm): S = V/a = 100 dm³ / 1 dm = 100 dm² = 1 m²; F<sub>h</sub> = p<sub>h</sub>·S ≈ <strong>6,12 MN</strong></li>
</ul>`,
  },
];
