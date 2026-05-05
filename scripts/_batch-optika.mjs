/**
 * Vloží LaTeX zápisy pro 6 podkapitol tématu Optika (7. ročník).
 * svetlo už má svůj zápis a zde se vynechává.
 * Spuštění: node scripts/_batch-optika.mjs
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
\usetikzlibrary{calc,arrows.meta,decorations.markings,patterns}
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
  'optika--faze-mesice-zatmeni': String.raw`
{\LARGE \bfseries Fáze Měsíce a zatmění} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Měsíc \textbf{sám nesvítí} -- jen odráží světlo Slunce.
    \item Z toho, jak je k Zemi a Slunci natočen, vidíme \textbf{různé fáze}.
    \item Cyklus fází trvá zhruba \textbf{29,5 dne} -- jeden \emph{lunární měsíc}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hlavní fáze Měsíce}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nov
    \draw[thick, fill=black] (0, 0) circle (0.5);
    \node[font=\bfseries\small] at (0, -0.9) {Nov};
    \node[font=\scriptsize] at (0, -1.3) {neviditelný};

    % První čtvrť
    \draw[thick] (2.5, 0) circle (0.5);
    \fill[black] (2.5, 0) -- (2.5, 0.5) arc (90:270:0.5);
    \node[font=\bfseries\small] at (2.5, -0.9) {První čtvrť};
    \node[font=\scriptsize] at (2.5, -1.3) {pravá pol.};

    % Úplněk
    \draw[thick, fill=yellow!40] (5, 0) circle (0.5);
    \node[font=\bfseries\small] at (5, -0.9) {Úplněk};
    \node[font=\scriptsize] at (5, -1.3) {celý kruh};

    % Poslední čtvrť
    \draw[thick] (7.5, 0) circle (0.5);
    \fill[black] (7.5, 0) -- (7.5, 0.5) arc (90:-90:0.5);
    \node[font=\bfseries\small] at (7.5, -0.9) {Poslední čtvrť};
    \node[font=\scriptsize] at (7.5, -1.3) {levá pol.};

    % Šipky cyklu
    \draw[->, thick, gray] (0.55, 0.6) .. controls (1, 1) .. (1.95, 0.5);
    \draw[->, thick, gray] (3.05, 0.6) .. controls (3.5, 1) .. (4.45, 0.5);
    \draw[->, thick, gray] (5.55, 0.6) .. controls (6, 1) .. (6.95, 0.5);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Mezi nimi: \textbf{srpek dorůstá} (mezi novem a úplňkem) a \textbf{couvá} (mezi úplňkem a novem).
    \item Pomůcka: dorůstající Měsíc tvoří písmeno \textbf{D}, couvající písmeno \textbf{C}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Zatmění Slunce}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Slunce
    \draw[thick, fill=yellow!50] (0, 0) circle (0.7);
    \node[font=\scriptsize] at (0, -1) {Slunce};

    % Měsíc
    \draw[thick, fill=gray!60] (3.5, 0) circle (0.25);
    \node[font=\scriptsize] at (3.5, -0.5) {Měsíc};

    % Země
    \draw[thick, fill=zfblue!50] (6.5, 0) circle (0.5);
    \node[font=\scriptsize] at (6.5, -0.9) {Země};

    % Stín Měsíce na Zem
    \draw[thick, gray!50] (-0.5, 0.6) -- (3.5, 0.25);
    \draw[thick, gray!50] (-0.5, -0.6) -- (3.5, -0.25);
    \draw[thick, dashed, gray] (3.5, 0.25) -- (6.5, 0.05);
    \draw[thick, dashed, gray] (3.5, -0.25) -- (6.5, -0.05);

    \node[font=\scriptsize] at (5, 0.3) {stín};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Měsíc se postaví \textbf{mezi Slunce a Zemi}.
    \item V oblasti stínu Měsíce na Zemi vidíme zatmění Slunce.
    \item Probíhá vždy v době \textbf{novu}, ale ne každý měsíc.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zatmění Měsíce}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Slunce
    \draw[thick, fill=yellow!50] (0, 0) circle (0.7);
    \node[font=\scriptsize] at (0, -1) {Slunce};

    % Země
    \draw[thick, fill=zfblue!50] (3.5, 0) circle (0.5);
    \node[font=\scriptsize] at (3.5, -0.9) {Země};

    % Stín Země
    \draw[thick, gray!50] (-0.5, 0.6) -- (3.5, 0.5);
    \draw[thick, gray!50] (-0.5, -0.6) -- (3.5, -0.5);
    \draw[thick, dashed, gray] (3.5, 0.5) -- (7, 0.3);
    \draw[thick, dashed, gray] (3.5, -0.5) -- (7, -0.3);

    % Měsíc ve stínu
    \draw[thick, fill=gray!80] (6.5, 0) circle (0.25);
    \node[font=\scriptsize] at (6.5, -0.5) {Měsíc};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Země se postaví \textbf{mezi Slunce a Měsíc}.
    \item Měsíc je ve stínu Země, najednou \textbf{ztmavne}.
    \item Probíhá při \textbf{úplňku}. Měsíc často získá \emph{načervenalou} barvu (krvavý měsíc).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'optika--zrcadla-zakon-odrazu': String.raw`
{\LARGE \bfseries Zrcadla a zákon odrazu} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Zákon odrazu:} Úhel odrazu je vždy roven úhlu dopadu. \\
Dopadající paprsek, kolmice a odražený paprsek leží v jedné rovině.
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Zrcadlo
    \draw[ultra thick] (0, 0) -- (6, 0);
    \fill[pattern=north east lines, pattern color=gray] (0, 0) rectangle (6, -0.3);

    % Kolmice
    \draw[thick, dashed] (3, 0) -- (3, 3);

    % Dopadající paprsek
    \draw[->, very thick, zfred] (0.5, 2.6) -- (3, 0);
    % Odražený paprsek
    \draw[->, very thick, zfblue] (3, 0) -- (5.5, 2.6);

    % Úhly
    \draw[thick] (3, 1) arc (90:135:1) node[midway, above left, font=\small] {$\alpha$};
    \draw[thick] (3, 1) arc (90:45:1) node[midway, above right, font=\small] {$\alpha'$};

    \node[font=\bfseries\small, color=zfred] at (1.4, 2.2) {dopadající};
    \node[font=\bfseries\small, color=zfblue] at (4.7, 2.2) {odražený};
    \node[font=\small] at (3.3, 2.5) {kolmice};
    \node[font=\bfseries\small] at (3, -0.6) {zrcadlo};

    \node[font=\bfseries] at (7.5, 1.5) {$\alpha = \alpha'$};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy zrcadel}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Rovinné
    \draw[ultra thick, zfblue] (0, 0) -- (0, 2);
    \node[font=\bfseries\small] at (0, -0.4) {rovinné};
    \node[font=\scriptsize] at (0, 2.4) {(rovná plocha)};

    % Vyduté
    \draw[ultra thick, zfblue] (3.7, 0) arc (-30:30:2);
    \node[font=\bfseries\small] at (3, -0.4) {vyduté};
    \node[font=\scriptsize] at (3, 2.4) {(prohnuté dovnitř)};

    % Vypuklé
    \draw[ultra thick, zfblue] (5.3, 0) arc (210:150:2);
    \node[font=\bfseries\small] at (6, -0.4) {vypuklé};
    \node[font=\scriptsize] at (6, 2.4) {(prohnuté ven)};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rovinné zrcadlo}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Zrcadlo
    \draw[ultra thick, zfblue] (0, -1) -- (0, 2);

    % Předmět (šipka)
    \draw[->, very thick, zfred] (-2, 0) -- (-2, 1.3);
    \node[font=\small, color=zfred] at (-2.4, 0.6) {předmět};

    % Obraz (zrcadlený)
    \draw[->, very thick, gray, dashed] (2, 0) -- (2, 1.3);
    \node[font=\small, gray!50!black] at (2.5, 0.6) {obraz};

    % Paprsky
    \draw[->, very thick, zfgreen, opacity=0.6] (-2, 1.3) -- (0, 0.8) -- (-3, 0.5);
    \draw[thick, gray, dashed] (0, 0.8) -- (2, 1.3);
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Obraz je \textbf{stejně velký} jako předmět.
    \item Je \textbf{stejně vzdálený} za zrcadlem jako předmět před ním.
    \item Je \textbf{přímý}, ale stranově převrácený (pravé je vlevo).
    \item Je \textbf{neskutečný} (zdánlivý) -- nelze ho zachytit na stínítko.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vyduté a vypuklé zrcadlo}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Co dělá & \bfseries Použití \\
\hline
rovinné & věrný odraz & koupelna, šatna, periskop \\
vyduté & soustředí paprsky & holicí zrcátko, dalekohled, sluneční pec \\
vypuklé & rozptyluje paprsky & zpětné zrcátko aut, bezpečnostní zrcadla na křižovatkách \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Vyduté} -- použité jako reflektor (lampy, baterka). Vytvoří úzký svazek paprsků.
    \item \textbf{Vypuklé} -- ukazuje větší \emph{zorný úhel}, ale obraz je menší.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'optika--cocky-zakon-lomu': String.raw`
{\LARGE \bfseries Čočky a zákon lomu} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Když světlo přechází z jednoho prostředí do druhého (ze vzduchu do skla), \textbf{láme se}.
    \item \textbf{Lom světla} -- změna směru paprsku na rozhraní dvou prostředí.
    \item Důvod: světlo se v různých látkách pohybuje \emph{různě rychle}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Zákon lomu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Rozhraní
    \fill[cyan!10] (-3, -2.5) rectangle (3, 0);
    \fill[white] (-3, 0) rectangle (3, 2.5);
    \draw[ultra thick] (-3, 0) -- (3, 0);

    % Kolmice
    \draw[thick, dashed] (0, -2.5) -- (0, 2.5);

    % Dopadající
    \draw[->, very thick, zfred] (-2, 1.7) -- (0, 0);
    % Lomený (do hustšího prostředí — bližší ke kolmici)
    \draw[->, very thick, zfred] (0, 0) -- (1.2, -2.2);

    % Úhly
    \node[font=\small] at (-0.5, 0.7) {$\alpha$};
    \node[font=\small] at (0.4, -0.9) {$\beta$};

    \node[font=\small] at (-2.7, 1) {vzduch};
    \node[font=\small] at (2.7, -1) {sklo / voda};

    \node[font=\bfseries\small] at (4.3, 1) {hustší prostředí:};
    \node[font=\small] at (4.3, 0.5) {paprsek se};
    \node[font=\small] at (4.3, 0) {láme \textbf{ke kolmici}};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Z řidšího do hustějšího (vzduch $\to$ voda) -- láme se \textbf{ke kolmici} ($\beta < \alpha$).
    \item Z hustějšího do řidšího (voda $\to$ vzduch) -- láme se \textbf{od kolmice}.
    \item Příklad: tužka v sklenici vody se zdá zlomená.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy čoček}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Spojka
    \draw[thick, fill=zfblue!20] (0, 0) ellipse (0.4 and 1.2);
    \draw[->, thick] (-2, 0.5) -- (-0.4, 0.5);
    \draw[->, thick] (-2, 0) -- (-0.4, 0);
    \draw[->, thick] (-2, -0.5) -- (-0.4, -0.5);
    \draw[->, thick, zfgreen] (0.4, 0.4) -- (2, 0);
    \draw[->, thick, zfgreen] (0.4, 0) -- (2, 0);
    \draw[->, thick, zfgreen] (0.4, -0.4) -- (2, 0);
    \fill[zfred] (2, 0) circle (0.07);
    \node[font=\bfseries\small, color=zfred] at (2, -0.4) {F};
    \node[font=\bfseries] at (0, -1.7) {spojka};
    \node[font=\small] at (0, -2.1) {soustředí paprsky};

    % Rozptylka
    \begin{scope}[shift={(7, 0)}]
        \draw[thick, fill=zfblue!20] (-0.3, 1.2) -- (0, 0.95) -- (-0.3, -1.2) -- (0.3, -1.2) -- (0, -0.95) -- (0.3, 1.2) -- cycle;
        \draw[->, thick] (-2, 0.5) -- (0, 0.5);
        \draw[->, thick] (-2, 0) -- (0, 0);
        \draw[->, thick] (-2, -0.5) -- (0, -0.5);
        \draw[->, thick, zfgreen] (0, 0.5) -- (2, 1.2);
        \draw[->, thick, zfgreen] (0, 0) -- (2, 0);
        \draw[->, thick, zfgreen] (0, -0.5) -- (2, -1.2);
        % Pomyslný ohnisko (vlevo, virtuální)
        \draw[dashed, gray] (0, 0.5) -- (-1.5, -0.4);
        \draw[dashed, gray] (0, -0.5) -- (-1.5, 0.4);
        \fill[zfred] (-1.5, 0) circle (0.07);
        \node[font=\bfseries\small, color=zfred] at (-1.5, -0.4) {F};
        \node[font=\bfseries] at (0, -1.7) {rozptylka};
        \node[font=\small] at (0, -2.1) {rozbíhá paprsky};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Spojka} (vypuklá) -- uprostřed je \emph{tlustší} než na okrajích. Paprsky soustřeďuje do \textbf{ohniska F}.
    \item \textbf{Rozptylka} (vydutá) -- uprostřed je \emph{tenčí}. Paprsky rozptyluje, F je virtuální.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Zobrazení spojkou (lupa)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Optická osa
    \draw[thick] (-5, 0) -- (5, 0);
    % Čočka
    \draw[ultra thick, zfblue] (0, 1.5) -- (0, -1.5);
    \draw[ultra thick, zfblue, ->] (0, 1.5) -- (-0.2, 1.4);
    \draw[ultra thick, zfblue, ->] (0, 1.5) -- (0.2, 1.4);
    \draw[ultra thick, zfblue, ->] (0, -1.5) -- (-0.2, -1.4);
    \draw[ultra thick, zfblue, ->] (0, -1.5) -- (0.2, -1.4);

    % Ohniska
    \fill[zfred] (2, 0) circle (0.08);
    \fill[zfred] (-2, 0) circle (0.08);
    \node[font=\bfseries\small, color=zfred] at (2, -0.3) {F};
    \node[font=\bfseries\small, color=zfred] at (-2, -0.3) {F};

    % Předmět (před ohniskem - blízko)
    \draw[->, very thick, zfred] (-1, 0) -- (-1, 1);

    % Paprsek 1: rovnoběžný s osou — láme se přes F
    \draw[thick, zfgreen] (-1, 1) -- (0, 1);
    \draw[thick, zfgreen, ->] (0, 1) -- (3, -0.5);
    % Pokračuje virtuálně zpět
    \draw[dashed, zfgreen] (0, 1) -- (-3, 2.5);
    % Paprsek 2: středem čočky
    \draw[thick, zfblue!70] (-1, 1) -- (3, -3);
    \draw[dashed, zfblue!70] (-1, 1) -- (-3, 3);

    % Virtuální obraz
    \draw[->, very thick, zfred, dashed] (-3, 0) -- (-3, 2.7);
    \node[font=\small, color=zfred] at (-3.5, 1.4) {obraz};

    \node[font=\small] at (0, -2) {\bfseries\textcolor{zfblue}{spojka}};
    \node[font=\small] at (-1, -0.4) {předmět};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Když je předmět \textbf{blíže} než ohnisko (uvnitř $f$) -- vznikne \textbf{přímý, zvětšený, neskutečný} obraz. To je \textbf{lupa}.
    \item Když je předmět \textbf{dál} než ohnisko -- vznikne \textbf{převrácený skutečný} obraz (jako u fotoaparátu).
\end{itemize}

\newpage

\vspace{2mm}
{\Large \bfseries \color{zfblue} Důležité pojmy u čočky}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (-5, 0) -- (5, 0);
    \draw[ultra thick, zfblue] (0, 1.5) -- (0, -1.5);

    \fill[zfred] (2, 0) circle (0.08);
    \fill[zfred] (-2, 0) circle (0.08);
    \node[font=\bfseries, color=zfred, anchor=south] at (2, 0.05) {F};
    \node[font=\bfseries, color=zfred, anchor=south] at (-2, 0.05) {F};

    \draw[<->, thick] (0, -0.5) -- (2, -0.5);
    \node[font=\small] at (1, -0.85) {ohnisková vzdálenost $f$};

    \node[font=\bfseries] at (-4.5, 0.4) {optická osa};

    \fill[black] (0, 0) circle (0.08);
    \node[font=\small, anchor=south west] at (0, 0.1) {O (střed)};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Ohnisko F} -- bod, kde se sbíhají paprsky rovnoběžné s optickou osou.
    \item \textbf{Ohnisková vzdálenost f} -- vzdálenost ohniska od středu čočky.
    \item \textbf{Optická mohutnost} $\varphi = \frac{1}{f}$, jednotka \textbf{dioptrie (D)}. Spojka má kladnou, rozptylka zápornou.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Použití čoček}
\vspace{2mm}

\begin{itemize}
    \item Brýle (spojky / rozptylky), kontaktní čočky.
    \item Lupa, mikroskop, dalekohled, fotoaparát, projektor.
    \item Oko obsahuje vlastní spojku (oční čočka).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'optika--oko': String.raw`
{\LARGE \bfseries Oko a vidění} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Oko} je optický přístroj, který nám umožňuje vidět svět.
    \item Funguje jako \textbf{živý fotoaparát} -- na sítnici se promítá obraz, který mozek \uv{rozluští}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba oka}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1.2, every node/.style={font=\small}]
    % Bulva
    \draw[thick, fill=white] (0, 0) circle (1.5);

    % Rohovka (vlevo, vyklenutá ven)
    \draw[thick, fill=cyan!20] (-1.4, 0.5) arc (110:250:0.55);

    % Duhovka + zorničky
    \fill[zfblue!50] (-1.05, 0.4) -- (-1.3, 0) -- (-1.05, -0.4) -- (-0.85, -0.4) -- (-0.85, 0.4) -- cycle;
    \fill[black] (-0.85, -0.25) rectangle (-1.05, 0.25);

    % Čočka
    \draw[thick, fill=cyan!10] (-0.8, 0) ellipse (0.18 and 0.55);

    % Sítnice
    \draw[thick, zfred] (1.5, 0) arc (0:180:1.5);
    \draw[thick, zfred] (1.5, 0) arc (0:-180:1.5);

    % Žlutá skvrna
    \fill[yellow!70] (1.5, 0) circle (0.08);

    % Optický nerv
    \draw[thick, fill=gray!50] (1.5, -0.2) -- (1.5, 0.2) -- (2.4, 0.4) -- (2.4, -0.4) -- cycle;

    % Anotace
    \node[font=\scriptsize, anchor=east] at (-2, 0.4) {rohovka};
    \draw[->, thick, gray] (-2, 0.3) -- (-1.6, 0.2);

    \node[font=\scriptsize, anchor=east] at (-2, -0.5) {duhovka};
    \draw[->, thick, gray] (-2, -0.5) -- (-1.2, -0.3);

    \node[font=\scriptsize, anchor=east] at (-2, -1.2) {zornička};
    \draw[->, thick, gray] (-2, -1.1) -- (-1, -0.1);

    \node[font=\scriptsize, anchor=west] at (2.6, 0.7) {oční čočka};
    \draw[->, thick, gray] (2.6, 0.6) -- (-0.6, 0);

    \node[font=\scriptsize, anchor=west] at (2.6, -0.5) {sítnice};
    \draw[->, thick, gray] (2.6, -0.5) -- (1.2, -0.7);

    \node[font=\scriptsize, anchor=west] at (2.6, -1.2) {oční nerv};
    \draw[->, thick, gray] (2.6, -1.1) -- (2, -0.4);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Rohovka} -- průhledná přední strana oka.
    \item \textbf{Duhovka} -- barevná část (modrá, hnědá...). Reguluje množství světla.
    \item \textbf{Zornička} -- otvor uprostřed duhovky (na světle malá, ve tmě velká).
    \item \textbf{Oční čočka} -- pružná spojka, mění zaostření.
    \item \textbf{Sítnice} -- na ní vzniká obraz. Citlivé buňky převedou světlo na nervové signály.
    \item \textbf{Oční nerv} -- vede signály do mozku.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vady zraku}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Krátkozrakost
    \draw[thick, fill=white] (0, 0) circle (1);
    \draw[->, thick, zfgreen] (-2, 0.4) -- (-1, 0.4);
    \draw[->, thick, zfgreen] (-1, 0.4) -- (-0.3, 0);
    \draw[->, thick, zfgreen] (-2, -0.4) -- (-1, -0.4);
    \draw[->, thick, zfgreen] (-1, -0.4) -- (-0.3, 0);
    \fill[zfred] (-0.3, 0) circle (0.07);
    \node[font=\bfseries\small] at (0, -1.6) {Krátkozrakost};
    \node[font=\scriptsize] at (0, -2.1) {obraz vzniká před sítnicí};
    \node[font=\scriptsize] at (0, -2.5) {korekce: rozptylka ($-$)};

    % Dalekozrakost
    \begin{scope}[shift={(5, 0)}]
        \draw[thick, fill=white] (0, 0) circle (1);
        \draw[->, thick, zfgreen] (-2, 0.4) -- (-1, 0.4);
        \draw[->, thick, zfgreen] (-1, 0.4) -- (1.5, 0);
        \draw[->, thick, zfgreen] (-2, -0.4) -- (-1, -0.4);
        \draw[->, thick, zfgreen] (-1, -0.4) -- (1.5, 0);
        \fill[zfred] (1.5, 0) circle (0.07);
        \node[font=\bfseries\small] at (0, -1.6) {Dalekozrakost};
        \node[font=\scriptsize] at (0, -2.1) {obraz až za sítnicí};
        \node[font=\scriptsize] at (0, -2.5) {korekce: spojka ($+$)};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Krátkozrakost} -- špatně se vidí na dálku. Korekce \emph{rozptylkou} ($-$ dioptrie).
    \item \textbf{Dalekozrakost} -- špatně se vidí zblízka. Korekce \emph{spojkou} (+ dioptrie).
    \item \textbf{Astigmatismus} -- zakřivení rohovky není rovnoměrné.
    \item \textbf{Šedý zákal} -- oční čočka se zakaluje (operace).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zajímavosti}
\vspace{2mm}

\begin{itemize}
    \item Obraz na sítnici je \textbf{převrácený} -- mozek ho otáčí zpět.
    \item Oko vidí dobře asi v rozsahu 25 cm až do nekonečna.
    \item Lidské oko rozliší \textbf{miliony barev}.
    \item Oko se přizpůsobí tmě i světlu (čípky, tyčinky na sítnici).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'optika--opticke-pristroje': String.raw`
{\LARGE \bfseries Optické přístroje} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Přístroje, které pomocí čoček a zrcadel zlepšují naše vidění.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Lupa}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Lupa
    \draw[thick] (0, 0) circle (1);
    \draw[thick, fill=cyan!10] (0, 0) circle (0.95);
    \draw[thick] (-0.7, -0.7) -- (-1.6, -1.6);
    \draw[thick, fill=brown!50] (-1.6, -1.6) rectangle (-1.3, -1.3);

    % Zvětšený text
    \node[font=\bfseries\Large] at (0, 0) {A};

    \node[font=\small] at (3.5, 0) {jednoduchá spojka};
    \node[font=\small] at (3.5, -0.4) {se zvětšuje předmět};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Jednoduchá \textbf{spojka}.
    \item Předmět dáme blíže než ohnisko -- vidíme zvětšený přímý obraz.
    \item Zvětšení 2--10$\times$.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Mikroskop}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Stojan
    \draw[thick, fill=gray!40] (-0.3, -2) rectangle (0.3, -1.5);
    \draw[thick] (0, -1.5) -- (0, 0);
    % Stolek
    \draw[thick, fill=gray!50] (-1.3, 0) rectangle (1.3, 0.2);
    % Tubus
    \draw[thick] (-0.4, 0.5) rectangle (0.4, 3);
    % Objektiv
    \draw[thick, fill=zfblue!30] (-0.4, 0.4) -- (0.4, 0.4) -- (0.3, 0.5) -- (-0.3, 0.5) -- cycle;
    \node[font=\scriptsize, anchor=west] at (0.6, 0.5) {objektiv};
    % Okulár
    \draw[thick, fill=zfblue!30] (-0.4, 3) -- (0.4, 3) -- (0.3, 2.85) -- (-0.3, 2.85) -- cycle;
    \node[font=\scriptsize, anchor=west] at (0.6, 3) {okulár};

    % Vzorek
    \draw[thick, fill=zfred!30] (-0.4, 0.2) rectangle (0.4, 0.3);
    \node[font=\scriptsize, anchor=west] at (1.4, 0.25) {vzorek};

    \node[font=\bfseries\small] at (0, -2.5) {mikroskop};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Dvě spojky (čočky): \textbf{objektiv} (u vzorku) a \textbf{okulár} (u oka).
    \item Objektiv vytvoří první zvětšený obraz, okulár ho zvětší znovu.
    \item Zvětšení 100--1000$\times$.
    \item Pozorujeme bakterie, buňky, krystaly.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Dalekohled}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Trubice
    \draw[thick, fill=gray!30] (0, -0.4) rectangle (5, 0.4);

    % Objektiv (větší)
    \draw[thick, fill=zfblue!30] (-0.1, -0.5) -- (-0.1, 0.5) -- (0.1, 0.4) -- (0.1, -0.4) -- cycle;
    \node[font=\scriptsize] at (0, 0.85) {objektiv};

    % Okulár (menší)
    \draw[thick, fill=zfblue!30] (4.9, -0.3) -- (4.9, 0.3) -- (5.1, 0.2) -- (5.1, -0.2) -- cycle;
    \node[font=\scriptsize] at (5, 0.6) {okulár};

    % Vzdálený předmět vlevo
    \draw[->, thick, zfgreen] (-2, 0.6) -- (-0.2, 0.4);
    \draw[->, thick, zfgreen] (-2, -0.6) -- (-0.2, -0.4);
    \node[font=\scriptsize] at (-2.5, 0) {hvězda};

    % Oko vpravo
    \draw[thick, fill=cyan!20] (5.7, 0) circle (0.2);
    \node[font=\scriptsize, anchor=west] at (6, 0) {oko};

    \node[font=\bfseries\small] at (2.5, -1) {dalekohled};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Také dvě spojky (objektiv + okulár), ale objektiv je \textbf{velký} (sbírá hodně světla).
    \item Pro pozorování \textbf{vzdálených objektů} (hvězdy, ptáci, lodě).
    \item Druhy: \emph{čočkový} (refraktor), \emph{zrcadlový} (reflektor).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Fotoaparát}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tělo
    \draw[thick, fill=gray!40] (0, 0) rectangle (4, 2.2);
    % Objektiv
    \draw[thick, fill=zfblue!30] (4, 0.8) -- (5, 1.1) -- (5, -0.1) -- (4, 0.2) -- cycle;
    \draw[thick] (4, 0.5) ellipse (0.2 and 0.7);
    % Hledáček
    \draw[thick, fill=black] (0.3, 1.7) rectangle (0.9, 2);
    % Tlačítko
    \draw[thick, fill=zfred] (3, 2.2) circle (0.15);

    % Senzor uvnitř
    \draw[thick, dashed] (1, 0.4) -- (1, 1.6);
    \node[font=\scriptsize] at (1, 0.2) {senzor};

    \node[font=\bfseries\small] at (2.5, -0.5) {fotoaparát};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Spojka (objektiv) vytvoří \textbf{převrácený zmenšený} obraz na senzoru.
    \item Senzor (CCD nebo CMOS) převede světlo na digitální obraz.
    \item Clona řídí množství světla, závěrka určuje dobu osvitu.
    \item Princip stejný jako oko -- jen místo sítnice je senzor.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Další optické přístroje}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Projektor} -- vytváří velký skutečný obraz na plátně.
    \item \textbf{Diaprojektor, dataprojektor} -- promítá z malého filmu/displeje.
    \item \textbf{Periskop} -- dvě zrcadla nad sebou (ponorky, divadlo).
    \item \textbf{Endoskop} -- ohebná hadice s optikou (lékařství).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'optika--barvy': String.raw`
{\LARGE \bfseries Barvy} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Bílé světlo se skládá z \textbf{mnoha barev}.
    \item Když projde \textbf{hranolem}, barvy se rozdělí -- vznikne \textbf{spektrum}.
    \item Tomuto jevu říkáme \textbf{disperze} (rozklad světla).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rozklad bílého světla}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Hranol
    \draw[thick, fill=cyan!10] (0, 0) -- (2, 0) -- (1, 1.7) -- cycle;

    % Bílý paprsek
    \draw[ultra thick, white, draw=black, double=white, double distance=2pt] (-2, 1) -- (0.5, 0.85);

    % Spektrum (barevné paprsky)
    \draw[ultra thick, red] (1.5, 0.85) -- (4, 1.2);
    \draw[ultra thick, orange] (1.5, 0.85) -- (4, 1);
    \draw[ultra thick, yellow!80!orange] (1.5, 0.85) -- (4, 0.8);
    \draw[ultra thick, green!70!black] (1.5, 0.85) -- (4, 0.6);
    \draw[ultra thick, blue] (1.5, 0.85) -- (4, 0.4);
    \draw[ultra thick, purple] (1.5, 0.85) -- (4, 0.2);

    \node[font=\bfseries\small] at (-1.5, 1.3) {bílé};
    \node[font=\bfseries\small] at (-1.5, 0.9) {světlo};
    \node[font=\bfseries\small] at (1, 2) {hranol};
    \node[font=\bfseries\small] at (4.5, 1.2) {červená};
    \node[font=\bfseries\scriptsize] at (4.5, 0.95) {oranžová};
    \node[font=\bfseries\scriptsize] at (4.5, 0.75) {žlutá};
    \node[font=\bfseries\scriptsize] at (4.5, 0.55) {zelená};
    \node[font=\bfseries\scriptsize] at (4.5, 0.35) {modrá};
    \node[font=\bfseries\scriptsize] at (4.5, 0.15) {fialová};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Spektrum: \textbf{č}ervená, \textbf{o}ranžová, \textbf{ž}lutá, \textbf{z}elená, \textbf{m}odrá, \textbf{f}ialová.
    \item Stejný princip -- \textbf{duha} na obloze (kapky vody jako mini hranoly).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Aditivní míchání barev (RGB)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[red, opacity=0.7] (0, 0) circle (1);
    \fill[green, opacity=0.7] (1, 0) circle (1);
    \fill[blue, opacity=0.7] (0.5, -0.85) circle (1);

    \node[font=\bfseries\small, color=white] at (0, 0.6) {R};
    \node[font=\bfseries\small, color=white] at (1, 0.6) {G};
    \node[font=\bfseries\small, color=white] at (0.5, -1.4) {B};

    \node[font=\bfseries] at (4, 0) {R + G + B = bílá};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Sčítání \textbf{barevného světla} (na obrazovce, projekci).
    \item Základní barvy: \textbf{červená (R), zelená (G), modrá (B)}.
    \item Všechny tři dohromady = \textbf{bílá}.
    \item Použití: televize, displej telefonu, monitor PC.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Subtraktivní míchání (CMY/CMYK)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[cyan, opacity=0.6] (0, 0) circle (1);
    \fill[magenta, opacity=0.6] (1, 0) circle (1);
    \fill[yellow, opacity=0.6] (0.5, -0.85) circle (1);

    \node[font=\bfseries\small] at (0, 0.6) {C};
    \node[font=\bfseries\small] at (1, 0.6) {M};
    \node[font=\bfseries\small] at (0.5, -1.4) {Y};

    \node[font=\bfseries] at (4.5, 0) {C + M + Y = černá};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Míchání \textbf{barev (pigmentů)} -- na papíře, plátně, tiskárnách.
    \item Základní: \textbf{azurová (C), purpurová (M), žlutá (Y)}, plus \textbf{černá (K)}.
    \item Každá barva pohlcuje (odebírá) některé barvy světla, zbytek odráží.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Proč má těleso barvu?}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Barva tělesa & \bfseries Důvod \\
\hline
červená & odráží červené světlo, ostatní pohlcuje \\
zelená & odráží zelené, ostatní pohlcuje \\
černá & pohlcuje \emph{všechny} barvy \\
bílá & odráží \emph{všechny} barvy \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item V \textbf{tmavém pokoji} bez světla nevidíme žádné barvy.
    \item Pod \textbf{červeným} osvětlením vidíme jen ty předměty, které odrážejí červenou.
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
