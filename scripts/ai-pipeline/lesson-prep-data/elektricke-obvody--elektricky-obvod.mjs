const R = String.raw;

export default [
  {
    title: '48. hodina – Rozsvítíme žárovku',
    sourceLessonNo: 48,
    sourceUrl: 'https://drive.google.com/file/d/1kljSiW7Jox1ggKqIx5SdvVhxLyyuCYZk/view',
    date: '12. 4. 2022',
    content: R`<p><em>První pokusy s obvodem (metodika Heuréka): rozsvítit žárovku baterií. Pomůcky: baterka, žárovka, vodiče.</em></p>
<p>Žáci hledají, jak <strong>rozsvítit žárovku</strong> pomocí baterky a vodičů; důraz na bezpečnost při práci s baterií. Nakreslit, jak byla žárovka připojená, když svítila.</p>`,
  },
  {
    title: '49. hodina – Podmínky svícení a schéma obvodu',
    sourceLessonNo: 49,
    sourceUrl: 'https://drive.google.com/file/d/1kmV41ID9satCwgsJYQp7yTmLF6IoFVyb/view',
    date: '19. 4. 2022',
    content: R`<p><em>Kdy žárovka svítí a jak obvod zakreslit schématem.</em></p>
<h3>Soutěž</h3>
<p>Přes kolik věcí dokážete žárovku rozsvítit? Nakreslit obvod vedoucí přes několik předmětů.</p>
<h3>Podmínky, aby žárovka svítila</h3>
<ul>
<li>obvod tvoří <strong>vodivé</strong> věci</li>
<li>všechno se musí <strong>dotýkat</strong> (nepřerušený obvod)</li>
<li>správně zapojená baterie i žárovka</li>
<li>nabitá baterie</li>
<li>funkční žárovka</li>
</ul>
<h3>Schéma obvodu</h3>
<p>Skutečný obrázek zjednodušíme na <strong>schéma</strong> se značkami: vodič (čára), žárovka (⊗), baterie (zdroj). Značky jsou jen domluva.</p>`,
  },
  {
    title: '50. hodina – Zapojujeme: vypínač a sériové zapojení',
    sourceLessonNo: 50,
    sourceUrl: 'https://drive.google.com/file/d/1kqdulOd0EbvIu2sIgsCd_mx3wZpLk87Z/view',
    date: '20. 4. 2022',
    content: R`<p><em>Praktické sestavování obvodu, polarita, vypínač a sériové zapojení.</em></p>
<h3>Postup zapojení</h3>
<p>Póly <strong>+</strong> a <strong>−</strong> (na zdroji bývají odlišeny barvou). Postupujeme od zdroje, klademe banánky a jdeme po vodičích; teprve nakonec připojíme — a svítí.</p>
<h3>Vypínač</h3>
<p>Doplníme do obvodu <strong>vypínač (přepínač)</strong> — žárovku můžeme vypnout a zapnout.</p>
<h3>Sériové zapojení</h3>
<p>Dvě žárovky <strong>za sebou</strong> = sériové zapojení.</p>`,
  },
  {
    title: '51. hodina – Sériové vs. paralelní zapojení',
    sourceLessonNo: 51,
    sourceUrl: 'https://drive.google.com/file/d/1ks2_Cb1kU9v05uwXkbtw0045R1ELPbnb/view',
    date: '26. 4. 2022',
    content: R`<p><em>Porovnání sériového a paralelního zapojení a chování s vypínači. Žáci zapojují a vyplňují tabulky stavů.</em></p>
<ul>
<li><strong>Sériové</strong> (žárovky za sebou): vypínač ovládá <strong>všechny</strong> žárovky najednou.</li>
<li><strong>Paralelní</strong> (žárovky ve větvích vedle sebe): větve mohou být <strong>nezávislé</strong> — vypínač v jedné větvi vypne jen tu jednu žárovku, druhá svítí dál.</li>
</ul>`,
  },
  {
    title: '52. hodina – Co když jedna žárovka praskne',
    sourceLessonNo: 52,
    sourceUrl: 'https://drive.google.com/file/d/1kscdtFonR-bKGepof83W7RaWZ8FXHQA-/view',
    date: '28. 4. 2022',
    content: R`<p><em>Chování sériového a paralelního zapojení při výpadku jedné žárovky.</em></p>
<ul>
<li><strong>Sériové zapojení:</strong> když jedna žárovka praskne, <strong>zhasnou všechny</strong> (obvod je přerušený).</li>
<li><strong>Paralelní zapojení:</strong> když jedna praskne, <strong>ostatní svítí dál</strong>.</li>
</ul>
<p>Zapsat <strong>vodiče × nevodiče (izolanty)</strong>. Úvod k tomu, co se děje uvnitř vodiče (elektrony) — navazuje další hodina.</p>`,
  },
];
