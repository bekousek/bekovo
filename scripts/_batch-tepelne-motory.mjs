/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Tepelné motory (8. ročník).
 * Spuštění: node scripts/_batch-tepelne-motory.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PREAMBLE = String.raw`\documentclass[10pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[czech]{babel}
\usepackage{geometry}
\usepackage[table]{xcolor}
\usepackage{tcolorbox}
\usepackage{amsmath,amssymb}
\usepackage{tikz}
\usetikzlibrary{calc,arrows.meta,decorations.pathmorphing,patterns}
\usepackage{enumitem}

\geometry{a4paper, margin=2cm}

\definecolor{zfblue}{HTML}{2A6DAB}
\definecolor{zfpurple}{HTML}{6A3AA0}
\definecolor{zfred}{HTML}{B54530}
\definecolor{zfgreen}{HTML}{2A8A4C}
\definecolor{zfgray}{HTML}{FAFAFA}

\setlist[itemize]{noitemsep, topsep=2pt, leftmargin=18pt}

\begin{document}
\pagestyle{empty}

\begin{flushleft}
`;

const POSTAMBLE = String.raw`
\end{flushleft}
\end{document}
`;

const entries = {
  // ─────────────────────────────────────────────────────────────────────
  'tepelne-motory--parni-stroj': String.raw`
{\LARGE \bfseries Parní stroj} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Tepelný motor} = stroj, který přeměňuje tepelnou energii na pohyb.
    \item \textbf{Parní stroj} byl prvním a nejdůležitějším tepelným motorem.
    \item Vynálezce: \textbf{James Watt} (Skotsko, 1769) -- vylepšil starší modely.
    \item Spustil \emph{průmyslovou revoluci} v 19. století.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Princip parního stroje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Kotel
    \draw[thick, fill=zfred!30] (0, 0) rectangle (3, 1.6);
    \node[font=\bfseries\small] at (1.5, 0.8) {kotel};
    \node[font=\scriptsize] at (1.5, 0.4) {(voda + oheň)};
    \fill[orange!70] (0.3, -0.2) -- (1.5, -0.6) -- (2.7, -0.2) -- cycle;
    \node[font=\scriptsize] at (1.5, -0.85) {topeniště};

    % Pára do válce
    \draw[thick] (3, 1.2) -- (4.5, 1.2);
    \draw[thick, decoration={coil, segment length=1.5mm, amplitude=1mm}, decorate, gray] (3.7, 1.5) -- (3.7, 1.9);

    % Válec s pístem
    \draw[thick, fill=gray!30] (4.5, 0.5) rectangle (7, 1.5);
    \draw[thick, fill=gray!60] (5.5, 0.6) rectangle (5.7, 1.4);
    \draw[thick] (5.7, 1) -- (8, 1);
    \node[font=\scriptsize] at (5.75, 1.85) {válec};
    \node[font=\scriptsize] at (5.4, 0.3) {píst};

    % Setrvačník
    \draw[thick, fill=gray!50] (8.5, 1) circle (0.7);
    \draw[thick] (8.5, 1) -- (8.5, 0.3);
    \fill[zfred] (8.5, 0.3) circle (0.1);
    \node[font=\scriptsize] at (8.5, 2) {setrvačník};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item V \textbf{kotli} se ohřívá voda -- vzniká \textbf{vodní pára} pod tlakem.
    \item Pára se vede do \textbf{válce}, kde tlačí na \textbf{píst}.
    \item Píst se pohybuje a přes ojnici roztáčí \textbf{setrvačník}.
    \item Pohyb se přenáší na kola (vlak), čerpadlo, mlýn, generátor.
\end{enumerate}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy parních motorů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Použití \\
\hline
parní stroj (s pístem) & lokomotivy, parníky, mlýny (19. století) \\
parní turbína & elektrárny -- pára roztáčí lopatky turbíny \\
parní lokomotiva & železnice (pamětihodnost) \\
parní válec & válcování silnic \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Parní turbína v elektrárně}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=zfred!20, thick, rounded corners=4pt, minimum width=2.2cm, minimum height=0.9cm] (palivo) at (0, 0) {palivo};
    \node[draw, fill=orange!30, thick, rounded corners=4pt, minimum width=2.2cm, minimum height=0.9cm] (kotel) at (3.2, 0) {kotel};
    \node[draw, fill=cyan!20, thick, rounded corners=4pt, minimum width=2.2cm, minimum height=0.9cm] (turbina) at (6.4, 0) {turbína};
    \node[draw, fill=zfblue!20, thick, rounded corners=4pt, minimum width=2.2cm, minimum height=0.9cm] (gen) at (9.6, 0) {generátor};
    \node[draw, fill=yellow!30, thick, rounded corners=4pt, minimum width=2.2cm, minimum height=0.9cm] (sit) at (12.8, 0) {síť};

    \draw[->, thick] (palivo.east) -- (kotel.west);
    \draw[->, thick] (kotel.east) -- (turbina.west);
    \draw[->, thick] (turbina.east) -- (gen.west);
    \draw[->, thick] (gen.east) -- (sit.west);

    \node[font=\scriptsize] at (1.6, -0.8) {teplo};
    \node[font=\scriptsize] at (4.8, -0.8) {pára};
    \node[font=\scriptsize] at (8, -0.8) {pohyb};
    \node[font=\scriptsize] at (11.2, -0.8) {elektřina};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Palivo (uhlí, plyn, jaderné palivo) ohřívá vodu na páru.
    \item Pára roztočí lopatky \textbf{turbíny}.
    \item Turbína roztáčí \textbf{generátor}, ten vyrobí elektřinu.
    \item Tak fungují \emph{tepelné, jaderné a sluneční koncentrátorové elektrárny}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Účinnost a nevýhody}
\vspace{2mm}

\begin{itemize}
    \item Účinnost parního stroje: \textbf{5--15 \%}. Větší část tepla se ztrácí.
    \item Vyžaduje velký prostor (kotel, kouřovod, voda na chlazení).
    \item Při spalování fosilních paliv vznikají \textbf{emise CO$_2$}.
    \item Dnes nahrazují účinnější spalovací motory a elektromotory.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'tepelne-motory--spalovaci-motory': String.raw`
{\LARGE \bfseries Spalovací motory} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Spalovací motor} -- palivo hoří \textbf{přímo uvnitř válce}.
    \item Energie z hoření se mění na pohyb pístu.
    \item Vynalezeny v 19. století, dnes pohánějí auta, motorky, traktory, lodě, letadla.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy spalovacích motorů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Motor & \bfseries Charakteristika \\
\hline
zážehový (Otto) & spalování benzinu, zapálené \textbf{svíčkou} \\
vznětový (Diesel) & spalování nafty, zapálené \textbf{stlačením} \\
2-taktní & jednodušší, lehčí (motorky, sekačky) \\
4-taktní & dnešní auta (4 doby) \\
Wankelův & rotační, místo pístu trojúhelník \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Čtyřtaktní motor -- 4 doby}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=0.85, every node/.style={font=\small}]
    % Doba 1: SÁNÍ — píst dole, sací ventil otevřený
    \begin{scope}[shift={(0, 0)}]
        \draw[thick, fill=gray!30] (0, 0) rectangle (2.2, 3);
        \draw[thick, fill=gray!60] (0.1, 0.4) rectangle (2.1, 0.8);
        \draw[thick] (1.1, 0.4) -- (1.1, -0.6);
        \draw[thick, fill=zfred] (1.1, -0.7) circle (0.08);
        \fill[zfgreen] (0.3, 3) -- (0.6, 3) -- (0.45, 2.7) -- cycle;
        \fill[gray!70] (1.6, 3) -- (1.9, 3) -- (1.75, 2.7) -- cycle;
        \draw[thick, fill=zfblue!50] (1.0, 3.05) rectangle (1.2, 3.4);
        \node[font=\bfseries\small] at (1.1, -1) {1) sání};
        \node[font=\scriptsize] at (1.1, -1.4) {směs vzduch+palivo};
    \end{scope}

    % Doba 2: KOMPRESE — píst nahoře, ventily zavřené
    \begin{scope}[shift={(4, 0)}]
        \draw[thick, fill=gray!30] (0, 0) rectangle (2.2, 3);
        \draw[thick, fill=gray!60] (0.1, 1.8) rectangle (2.1, 2.2);
        \draw[thick] (1.1, 1.8) -- (1.1, -0.6);
        \draw[thick, fill=zfred] (1.1, -0.7) circle (0.08);
        \fill[gray!70] (0.3, 3) -- (0.6, 3) -- (0.45, 2.7) -- cycle;
        \fill[gray!70] (1.6, 3) -- (1.9, 3) -- (1.75, 2.7) -- cycle;
        \draw[thick, fill=zfblue!50] (1.0, 3.05) rectangle (1.2, 3.4);
        \node[font=\bfseries\small] at (1.1, -1) {2) komprese};
        \node[font=\scriptsize] at (1.1, -1.4) {stlačování směsi};
    \end{scope}

    % Doba 3: EXPLOZE — píst nahoře, jiskra svíčky, plameny
    \begin{scope}[shift={(8, 0)}]
        \draw[thick, fill=gray!30] (0, 0) rectangle (2.2, 3);
        \draw[thick, fill=gray!60] (0.1, 2.0) rectangle (2.1, 2.4);
        \draw[thick] (1.1, 2.0) -- (1.1, -0.6);
        \draw[thick, fill=zfred] (1.1, -0.7) circle (0.08);
        \fill[gray!70] (0.3, 3) -- (0.6, 3) -- (0.45, 2.7) -- cycle;
        \fill[gray!70] (1.6, 3) -- (1.9, 3) -- (1.75, 2.7) -- cycle;
        \draw[thick, fill=zfred!80] (1.0, 3.05) rectangle (1.2, 3.4);
        \fill[orange!80] (0.6, 2.5) -- (0.85, 2.85) -- (1.1, 2.55) -- (1.35, 2.85) -- (1.6, 2.5) -- cycle;
        \node[font=\bfseries\small] at (1.1, -1) {3) exploze};
        \node[font=\scriptsize] at (1.1, -1.4) {zapálení svíčkou};
    \end{scope}

    % Doba 4: VÝFUK — píst stoupá, výfukový ventil otevřený
    \begin{scope}[shift={(12, 0)}]
        \draw[thick, fill=gray!30] (0, 0) rectangle (2.2, 3);
        \draw[thick, fill=gray!60] (0.1, 0.8) rectangle (2.1, 1.2);
        \draw[thick] (1.1, 0.8) -- (1.1, -0.6);
        \draw[thick, fill=zfred] (1.1, -0.7) circle (0.08);
        \fill[gray!70] (0.3, 3) -- (0.6, 3) -- (0.45, 2.7) -- cycle;
        \fill[zfred] (1.6, 3) -- (1.9, 3) -- (1.75, 2.7) -- cycle;
        \draw[thick, fill=zfblue!50] (1.0, 3.05) rectangle (1.2, 3.4);
        \node[font=\bfseries\small] at (1.1, -1) {4) výfuk};
        \node[font=\scriptsize] at (1.1, -1.4) {odvod plynů};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item \textbf{Sání} -- píst klesá, otevřený sací ventil, do válce vchází směs paliva a vzduchu.
    \item \textbf{Komprese} -- píst stoupá, oba ventily zavřené, směs se silně stlačí.
    \item \textbf{Exploze} (zážeh) -- svíčka zapálí směs. Plyny tlačí píst dolů. \emph{Pracovní doba.}
    \item \textbf{Výfuk} -- píst stoupá, výfukový ventil otevřený, plyny opouští válec.
\end{enumerate}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Benzinový vs. naftový motor}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
& \bfseries Benzinový (Otto) & \bfseries Naftový (Diesel) \\
\hline
palivo & benzin & nafta \\
zápal & svíčkou & stlačením vzduchu (vyšší kompresí) \\
výkon & vyšší při stejném objemu & nižší výkon \\
spotřeba & vyšší & nižší (efektivnější) \\
účinnost & 25 \% & 35 \% \\
hluk & tišší & hlučnější \\
emise & více CO$_2$ & více pevných částic \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Použití}
\vspace{2mm}

\begin{itemize}
    \item Auta, motocykly, traktory, lodě, letadla, sekačky, generátory.
    \item Účinnost se postupně zvyšuje, ale stále se ztrácí 60--70 \% energie ve formě tepla.
    \item Trend: nahrazování \textbf{elektromotory} (méně emisí, vyšší účinnost).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'tepelne-motory--proudovy-raketovy-motor': String.raw`
{\LARGE \bfseries Proudový a raketový motor} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Oba motory pracují na principu \textbf{Newtonova 3. zákona} (akce a reakce).
    \item Plyny prudce vystřikují \textbf{dozadu}, motor (a stroj) se pohybuje \textbf{dopředu}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Proudový motor}
\vspace{2mm}

\noindent
Používá se v \textbf{letadlech}. Potřebuje vzduch (kyslík) z okolí.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tělo motoru
    \draw[thick, fill=gray!30] (0, 0) -- (8, 0) -- (8, 0.3) -- (8.7, 0.5) -- (8.7, 1) -- (8, 1.2) -- (8, 1.5) -- (0, 1.5) -- cycle;

    % Kompresor
    \draw[thick, fill=zfblue!30] (0.7, 0.2) rectangle (1.5, 1.3);
    \node[font=\scriptsize, rotate=90] at (1.1, 0.75) {kompresor};

    % Spalovací komora
    \draw[thick, fill=orange!50] (3, 0.2) rectangle (5, 1.3);
    \node[font=\scriptsize] at (4, 0.75) {spalování};

    % Turbína
    \draw[thick, fill=zfgreen!30] (5.7, 0.2) rectangle (6.5, 1.3);
    \node[font=\scriptsize, rotate=90] at (6.1, 0.75) {turbína};

    % Vstup vzduchu
    \draw[->, very thick, zfblue] (-1.5, 0.75) -- (-0.1, 0.75);
    \node[font=\scriptsize, color=zfblue] at (-1.5, 1.1) {vzduch};

    % Výstup plynů
    \draw[->, ultra thick, zfred] (8.7, 0.75) -- (10.5, 0.75);
    \node[font=\scriptsize, color=zfred] at (10, 1.1) {horké plyny};

    % Šipka pohybu motoru
    \draw[->, ultra thick, zfgreen] (-2, -0.7) -- (-0.5, -0.7);
    \node[font=\bfseries, color=zfgreen] at (-1.25, -1.1) {motor letí};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item \textbf{Vstup vzduchu} -- kompresor nasaje vzduch.
    \item \textbf{Kompresor} -- vzduch silně stlačí.
    \item \textbf{Spalovací komora} -- přidá se palivo (kerosen) a hoří.
    \item \textbf{Turbína} -- horké plyny ji roztočí (pohání kompresor).
    \item \textbf{Tryska} -- plyny vytrysknou velkou rychlostí ven.
\end{enumerate}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Raketový motor}
\vspace{2mm}

\noindent
Pohání \textbf{rakety} a kosmické lodě. Funguje i ve \textbf{vakuu vesmíru} -- nepotřebuje atmosféru.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Raketa
    \draw[thick, fill=gray!40] (0, 0) -- (0, 4) -- (0.5, 4.5) -- (1, 4) -- (1, 0) -- cycle;
    % Křídla
    \draw[thick, fill=zfred] (0, 0) -- (-0.5, -0.5) -- (0, 0.4) -- cycle;
    \draw[thick, fill=zfred] (1, 0) -- (1.5, -0.5) -- (1, 0.4) -- cycle;

    % Anotace nádrží
    \draw[thick, dashed] (0, 2) -- (1, 2);
    \node[font=\scriptsize] at (0.5, 3) {oxidovadlo};
    \node[font=\scriptsize, anchor=west] at (1.2, 3) {kapalný kyslík};
    \node[font=\scriptsize] at (0.5, 1) {palivo};
    \node[font=\scriptsize, anchor=west] at (1.2, 1) {kapalný vodík};

    % Tryska
    \draw[thick, fill=gray!60] (0, 0) -- (-0.3, -0.7) -- (1.3, -0.7) -- (1, 0) -- cycle;
    % Plameny
    \fill[orange!80] (-0.2, -0.7) -- (0.2, -1.6) -- (0.5, -1) -- (0.5, -1.6) -- (0.8, -1) -- (1.2, -1.6) -- (1.2, -0.7) -- cycle;

    % Šipka nahoru
    \draw[->, ultra thick, zfgreen] (2.5, -0.5) -- (2.5, 1.5);
    \node[font=\bfseries, color=zfgreen, anchor=west] at (2.6, 0.5) {raketa stoupá};

    % Šipka dolů (plyny)
    \draw[->, ultra thick, zfred] (-1.5, -0.5) -- (-1.5, -1.8);
    \node[font=\bfseries, color=zfred, anchor=east] at (-1.6, -1) {plyny};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Raketa nese \textbf{palivo i kyslík (oxidovadlo)} ve svých nádržích.
    \item Smícháním a zapálením vznikne velký tlak plynů.
    \item Plyny vystřelí dolů z trysky -- raketa se pohybuje nahoru.
    \item Funguje i ve vesmíru, kde není vzduch.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Srovnání}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
& \bfseries Proudový motor & \bfseries Raketový motor \\
\hline
potřebuje vzduch? & \textbf{ano} (kyslík z atmosféry) & \textbf{ne} (nese vlastní kyslík) \\
funguje ve vakuu? & ne & ano \\
hlavní použití & letadla & rakety, kosmické lodě \\
rychlost & až 1\,000 km/h (Mach 2--3) & desítky tisíc km/h \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zajímavosti}
\vspace{2mm}

\begin{itemize}
    \item Rakety potřebují obrovské množství paliva -- až \textbf{90 \% hmotnosti} startu.
    \item Saturn V (k Měsíci) měl 3 stupně, vážil 3\,000 t.
    \item SpaceX Falcon 9 -- první stupeň přistává zpět a znovu se použije.
    \item Sondážní balony, vzducholodi mají na pohon také proudové motory.
\end{itemize}
`,
};

// ─────────────────────────────────────────────────────────────────────────
let updated = 0;
for (const [id, body] of Object.entries(entries)) {
  const path = join(root, 'src', 'content', 'subtopics', `${id}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!data.notebookEntry) data.notebookEntry = {};
  data.notebookEntry.latex = PREAMBLE + body + POSTAMBLE;
  delete data.notebookEntry.content;
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`OK: ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zapisu vlozeno.`);
