/**
 * Vloží LaTeX zápisy pro 4 podkapitoly tématu Částice látky.
 * Spuštění: node scripts/_batch-castice-latky.mjs
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
\usepackage{amsmath}
\usepackage{tikz}
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
  'castice-latky--atom': String.raw`
{\LARGE \bfseries Atom} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Atom} -- nejmenší částice chemického prvku, která si zachovává jeho vlastnosti.
    \item Je tak malý, že ho nelze vidět ani nejlepším optickým mikroskopem.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba atomu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Jádro
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=1.3cm] (jadro) at (0,0) {};
    \node[font=\small\bfseries, color=zfred] at (-0.22, 0.18) {p$^+$};
    \node[font=\small\bfseries, color=zfred] at (0.27, 0.18) {p$^+$};
    \node[font=\small\bfseries, color=gray!70] at (-0.22, -0.22) {n};
    \node[font=\small\bfseries, color=gray!70] at (0.27, -0.22) {n};

    % Obal — kruh
    \draw[zfblue, thick, dashed] (0,0) circle (2.1);

    % Elektrony
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (2.1, 0) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.5, 1.5) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.5, -1.5) {e$^-$};

    % Annotace
    \node[font=\small, color=zfred] at (0, -1.25) {jádro (p$^+$, n)};
    \node[font=\small, color=zfblue] at (3.0, 1.6) {obal (elektrony)};
    \draw[->, thin, zfblue] (3.0, 1.4) -- (1.7, 1.2);
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Části atomu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Částice & \bfseries Náboj & \bfseries Umístění \\
\hline
Proton (p$^+$) & kladný (+) & jádro \\
Neutron (n) & bez náboje (0) & jádro \\
Elektron (e$^-$) & záporný ($-$) & obal \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Důležitá fakta}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Jádro} obsahuje téměř celou hmotnost atomu, ale je velmi malé.
    \item \textbf{Atom je elektricky neutrální} -- počet protonů = počet elektronů.
    \item Druh atomu určuje \textbf{počet protonů} v jádře (1 p = vodík, 6 p = uhlík, 8 p = kyslík).
    \item Atomy se mohou spojovat do \textbf{molekul} (např. $\text{H}_2\text{O}$, $\text{O}_2$, $\text{CO}_2$).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--skaly-castic': String.raw`
{\LARGE \bfseries Škály částic} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Svět kolem nás se skládá z částic různých velikostí -- od subatomárních (uvnitř atomu) až po makroskopické (viditelné okem).

\vspace{4mm}
{\Large \bfseries \color{zfblue} Logaritmická škála velikostí}
\vspace{3mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Horizontální osa
    \draw[->, thick] (-0.5, 0) -- (15, 0);
    \node[right, font=\small] at (15, 0) {m};

    % Hlavní značky
    \foreach \x/\val in {0/$10^{-15}$, 2.5/$10^{-12}$, 5/$10^{-9}$, 7.5/$10^{-6}$, 10/$10^{-3}$, 12.5/$10^0$} {
        \draw[thick] (\x, 0) -- (\x, -0.15);
        \node[below, font=\scriptsize] at (\x, -0.2) {\val};
    }

    % Anotace s tečkou
    \foreach \x/\name/\dot in {
        0/jádro/0.05,
        1.65/proton/0.07,
        3.3/atom/0.11,
        4.5/molekula/0.14,
        6.5/virus/0.16,
        8.0/buňka/0.19,
        9.5/vlas/0.21,
        11.0/zrnko písku/0.24,
        13.0/člověk/0.27
    } {
        \fill[zfblue] (\x, 1.05) circle (\dot);
        \draw[thin, gray!60] (\x, 0.05) -- (\x, 0.85);
        \node[above, font=\scriptsize] at (\x, 1.2) {\name};
    }

    % Šipky popisné
    \node[font=\scriptsize, color=gray!70] at (1, -0.7) {$\leftarrow$ menší};
    \node[font=\scriptsize, color=gray!70] at (14, -0.7) {větší $\rightarrow$};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Velikosti známých objektů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Objekt & \bfseries Velikost & \bfseries Jednotka \\
\hline
Proton, neutron & $\approx 10^{-15}$ m & 1 fm (femtometr) \\
Atom & $\approx 10^{-10}$ m & 0,1 nm \\
Molekula vody & $\approx 3 \cdot 10^{-10}$ m & 0,3 nm \\
Virus & $\approx 10^{-7}$ m & 100 nm \\
Bakterie, buňka & $\approx 10^{-6}$--$10^{-5}$ m & 1--10 µm \\
Lidský vlas (tloušťka) & $\approx 10^{-4}$ m & 0,1 mm \\
Zrnko písku & $\approx 10^{-3}$ m & 1 mm \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pro představu}
\vspace{2mm}

\begin{itemize}
    \item Atom je asi \textbf{100\,000$\times$} menší než nejtenčí lidský vlas.
    \item Jádro atomu je \textbf{100\,000$\times$} menší než celý atom -- atom je z 99,99\,\% prázdný.
    \item Kdyby byl atom velký jako fotbalové hřiště, jádro by bylo velikosti hrachu uprostřed.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--casticove-slozeni-latek': String.raw`
{\LARGE \bfseries Částicové složení látek} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Všechny látky se skládají z \textbf{částic} -- atomů, molekul nebo iontů.
    \item Mezi částicemi je \textbf{prázdný prostor}.
    \item Částice jsou v \textbf{neustálém pohybu}.
    \item Mezi částicemi působí \textbf{přitažlivé síly}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenství z hlediska částic}
\vspace{3mm}

\begin{center}
\begin{tikzpicture}[scale=1]
    % Pevné — pravidelná mřížka
    \draw[thick, draw=zfblue, fill=zfblue!5] (0, 0) rectangle (3, 2.5);
    \foreach \x in {0.5, 1.0, 1.5, 2.0, 2.5} {
        \foreach \y in {0.5, 1.0, 1.5, 2.0} {
            \fill[zfblue] (\x, \y) circle (0.1);
        }
    }
    \node[font=\bfseries, color=zfblue] at (1.5, -0.4) {Pevné};

    % Kapalné — blízko, neuspořádaně
    \begin{scope}[shift={(4.5, 0)}]
        \draw[thick, draw=zfpurple, fill=zfpurple!5] (0, 0) rectangle (3, 2.5);
        \foreach \x/\y in {
            0.4/0.4, 0.95/0.65, 1.5/0.45, 2.1/0.7, 2.6/0.5,
            0.5/1.1, 1.1/1.3, 1.7/1.0, 2.3/1.3, 2.7/1.0,
            0.4/1.7, 1.0/1.9, 1.6/1.7, 2.2/1.95, 2.7/1.7,
            0.6/2.25, 1.4/2.2, 2.1/2.3
        } {
            \fill[zfpurple] (\x, \y) circle (0.1);
        }
        \node[font=\bfseries, color=zfpurple] at (1.5, -0.4) {Kapalné};
    \end{scope}

    % Plynné — daleko od sebe
    \begin{scope}[shift={(9, 0)}]
        \draw[thick, draw=zfred, fill=zfred!5] (0, 0) rectangle (3, 2.5);
        \foreach \x/\y in {
            0.4/0.6, 1.5/0.3, 2.5/0.8,
            0.7/1.4, 1.8/1.5, 2.6/1.2,
            0.3/2.1, 1.2/1.95, 2.0/2.2, 2.7/2.0
        } {
            \fill[zfred] (\x, \y) circle (0.1);
        }
        \node[font=\bfseries, color=zfred] at (1.5, -0.4) {Plynné};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{6mm}
{\Large \bfseries \color{zfblue} Srovnání skupenství}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Skupenství & \bfseries Uspořádání částic & \bfseries Pohyb částic \\
\hline
Pevné & těsně u sebe, pravidelně & kmitají kolem rovnov. poloh \\
Kapalné & blízko, nepravidelně & posouvají se a otáčejí \\
Plynné & daleko od sebe & chaoticky se pohybují \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Důsledky pro vlastnosti}
\vspace{2mm}

\begin{itemize}
    \item Pevné látky mají \textbf{stálý tvar i objem} -- silné přitažlivé síly, malé vzdálenosti.
    \item Kapaliny mají \textbf{stálý objem}, tvar se přizpůsobí -- částice se mohou posouvat.
    \item Plyny vyplní \textbf{celý dostupný prostor} -- slabé síly, velké vzdálenosti.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--brownuv-pohyb-difuze': String.raw`
{\LARGE \bfseries Brownův pohyb a difuze} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

{\Large \bfseries \color{zfblue} Brownův pohyb}
\vspace{2mm}

\begin{itemize}
    \item Neuspořádaný, neustálý pohyb drobných částeček (např. pylu) v kapalině nebo plynu.
    \item Způsobují ho \textbf{nárazy molekul} okolní látky.
    \item Pozoroval ho roku 1827 botanik \textbf{Robert Brown} -- pylová zrnka ve vodě.
    \item Je to důkaz, že molekuly se neustále pohybují.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.95]
    \draw[thick, fill=zfgray] (0, 0) rectangle (5.5, 2.4);

    % Molekuly vody (drobné tečky)
    \foreach \pos/\dir in {
        {(0.4, 0.3)}/{(1.5, 1.0)},
        {(0.5, 1.9)}/{(1.6, 1.4)},
        {(5.0, 0.4)}/{(2.8, 1.0)},
        {(5.1, 1.9)}/{(2.9, 1.5)},
        {(2.0, 0.2)}/{(2.4, 1.05)},
        {(3.2, 2.2)}/{(2.6, 1.5)}
    } {
        \fill[zfblue!50] \pos circle (0.05);
        \draw[->, thick, zfblue!50] \pos -- \dir;
    }

    % Pylové zrnko (velká částice)
    \fill[zfred] (2.7, 1.25) circle (0.18);

    % Klikatá dráha pylového zrnka
    \draw[thick, zfred] (2.7, 1.25) -- (2.2, 1.45) -- (1.8, 1.15) -- (2.2, 0.85) -- (2.7, 1.0) -- (3.2, 0.8) -- (3.5, 1.1) -- (3.1, 1.5) -- (2.5, 1.7);

    \node[font=\scriptsize, color=zfred] at (2.7, -0.3) {dráha pylového zrnka};
    \node[font=\scriptsize, color=zfblue!70] at (6.5, 1.2) {molekuly};
    \node[font=\scriptsize, color=zfblue!70] at (6.5, 0.85) {vody};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Difuze}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Difuze} = samovolné pronikání částic jedné látky mezi částice druhé látky.
    \item Probíhá díky neustálému pohybu částic.
    \item Je rychlejší při \textbf{vyšší teplotě} (částice se pohybují rychleji).
    \item Probíhá v \textbf{kapalinách i plynech} (v pevných látkách jen velmi pomalu).
    \item Příklady: rozšíření vůně po místnosti, inkoust ve vodě, čaj v horké vodě.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Začátek
    \draw[thick] (0, 0) rectangle (3.6, 2);
    \fill[blue!10] (0.05, 0.05) rectangle (3.55, 1.95);
    \fill[blue!75] (1.6, 0.85) ellipse (0.45 and 0.3);
    \node[font=\small] at (1.8, -0.35) {začátek};

    % Šipka času
    \draw[->, very thick] (4.0, 1) -- (5.0, 1);
    \node[above, font=\scriptsize] at (4.5, 1.1) {čas};

    % Po čase — rovnoměrné rozprostření
    \begin{scope}[shift={(5.4, 0)}]
        \draw[thick] (0, 0) rectangle (3.6, 2);
        \fill[blue!35] (0.05, 0.05) rectangle (3.55, 1.95);
        \node[font=\small] at (1.8, -0.35) {po čase};
    \end{scope}
\end{tikzpicture}
\end{center}
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
  console.log(`✓ ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zápisů vloženo.`);
