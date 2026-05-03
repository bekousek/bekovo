/**
 * Vloží LaTeX zápisy pro všech 5 podkapitol tématu Vlastnosti látek.
 * Spuštění: node scripts/_batch-vlastnosti-latek.mjs
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
\usepackage{xcolor}
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
  'vlastnosti-latek--latky-a-telesa': String.raw`
{\LARGE \bfseries Látky a tělesa} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Látka} -- to, z čeho je těleso vyrobeno (např. dřevo, železo, sklo, voda).
    \item \textbf{Těleso} -- konkrétní předmět tvořený jednou nebo více látkami (např. stůl, hřebík, sklenice).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Z jedné látky -- mnoho těles}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, rounded corners=3pt, fill=zfblue!15, draw=zfblue, thick, minimum width=2.4cm, minimum height=0.8cm, font=\bfseries] (latka) at (0,0) {Dřevo};
    \node[draw, rounded corners=3pt, fill=zfgray, draw=gray!60, minimum width=1.8cm, minimum height=0.7cm] (t1) at (-4.2,-2) {Stůl};
    \node[draw, rounded corners=3pt, fill=zfgray, draw=gray!60, minimum width=1.8cm, minimum height=0.7cm] (t2) at (-1.4,-2) {Tužka};
    \node[draw, rounded corners=3pt, fill=zfgray, draw=gray!60, minimum width=1.8cm, minimum height=0.7cm] (t3) at (1.4,-2) {Židle};
    \node[draw, rounded corners=3pt, fill=zfgray, draw=gray!60, minimum width=1.8cm, minimum height=0.7cm] (t4) at (4.2,-2) {Police};
    \draw[->, thick, zfblue] (latka) -- (t1);
    \draw[->, thick, zfblue] (latka) -- (t2);
    \draw[->, thick, zfblue] (latka) -- (t3);
    \draw[->, thick, zfblue] (latka) -- (t4);
\end{tikzpicture}
\end{center}

\vspace{2mm}
{\Large \bfseries \color{zfblue} Skupenství látek}
\vspace{2mm}

\noindent
Látky se vyskytují ve třech základních skupenstvích podle uspořádání částic:

\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Pevné
    \draw[thick, draw=zfblue, fill=zfblue!5] (-5,-1) rectangle (-2.5,1);
    \foreach \x in {-4.7, -4.2, -3.7, -3.2, -2.7} {
        \foreach \y in {-0.8, -0.3, 0.2, 0.7} {
            \fill[zfblue] (\x, \y) circle (0.08);
        }
    }
    \node[font=\bfseries\small, color=zfblue] at (-3.75,-1.5) {Pevné};

    % Kapalné
    \draw[thick, draw=zfpurple, fill=zfpurple!5] (-1.5,-1) rectangle (1,1);
    \foreach \x/\y in {-1.2/-0.8, -0.7/-0.5, -0.2/-0.7, 0.3/-0.4, 0.7/-0.8, -1/-0.2, -0.4/0, 0.2/-0.1, 0.7/0.2, -0.8/0.5, 0.4/0.6} {
        \fill[zfpurple] (\x, \y) circle (0.08);
    }
    \node[font=\bfseries\small, color=zfpurple] at (-0.25,-1.5) {Kapalné};

    % Plynné
    \draw[thick, draw=zfred, fill=zfred!5] (2,-1) rectangle (4.5,1);
    \foreach \x/\y in {2.3/-0.7, 2.8/0.2, 3.4/-0.3, 3.9/0.6, 4.2/-0.8, 2.5/0.6, 3.1/-0.6, 3.7/0.5, 4.3/0.1} {
        \fill[zfred] (\x, \y) circle (0.08);
    }
    \node[font=\bfseries\small, color=zfred] at (3.25,-1.5) {Plynné};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti látek}
\vspace{2mm}

\noindent
Každá látka má své charakteristické vlastnosti, podle kterých ji rozeznáváme:

\begin{itemize}
    \item \textbf{Smyslové vlastnosti} -- barva, vůně, chuť, lesk
    \item \textbf{Skupenství} při běžné teplotě
    \item \textbf{Hustota} -- jak je látka „těžká'' v daném objemu
    \item \textbf{Teplota tání a varu}
    \item \textbf{Tepelná a elektrická vodivost}
    \item \textbf{Magnetické vlastnosti}
    \item \textbf{Rozpustnost} ve vodě či jiných látkách
    \item \textbf{Hořlavost}
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--pevne-latky': String.raw`
{\LARGE \bfseries Pevné látky} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Mají \textbf{stálý tvar} i \textbf{stálý objem}.
    \item Částice (atomy, molekuly, ionty) jsou \textbf{těsně vedle sebe} a kmitají kolem rovnovážných poloh.
    \item Mezi částicemi působí silné přitažlivé síly.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Krystalické a amorfní látky}
\vspace{2mm}

\noindent
\begin{minipage}[t]{0.48\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue, title=Krystalické, fonttitle=\bfseries, boxrule=0.5pt, leftrule=0pt, rightrule=0pt, bottomrule=0pt, toprule=3pt, arc=2pt, coltitle=black, left=4pt, right=4pt, top=2pt, bottom=2pt]
    \begin{itemize}
        \item Pravidelné uspořádání částic do \textbf{krystalické mřížky}
        \item Mají \textbf{ostrý bod tání}
        \item Příklady: sůl, cukr, led, kovy, drahokamy
    \end{itemize}
\end{tcolorbox}
\end{minipage}\hfill
\begin{minipage}[t]{0.48\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfpurple, title=Amorfní, fonttitle=\bfseries, boxrule=0.5pt, leftrule=0pt, rightrule=0pt, bottomrule=0pt, toprule=3pt, arc=2pt, coltitle=black, left=4pt, right=4pt, top=2pt, bottom=2pt]
    \begin{itemize}
        \item Nepravidelné uspořádání částic
        \item \textbf{Měknou postupně}, nemají ostrý bod tání
        \item Příklady: sklo, vosk, asfalt, plasty
    \end{itemize}
\end{tcolorbox}
\end{minipage}

\vspace{3mm}
\begin{center}
\begin{tikzpicture}[scale=0.55]
    % Krystalická
    \foreach \x in {0,1,2,3,4} {
        \foreach \y in {0,1,2,3} {
            \fill[zfblue] (\x, \y) circle (0.18);
        }
    }
    \foreach \x in {0,1,2,3} {
        \draw[zfblue!50, thin] (\x,0) -- (\x+1, 0);
        \draw[zfblue!50, thin] (\x,1) -- (\x+1, 1);
        \draw[zfblue!50, thin] (\x,2) -- (\x+1, 2);
        \draw[zfblue!50, thin] (\x,3) -- (\x+1, 3);
    }
    \foreach \x in {0,1,2,3,4} {
        \draw[zfblue!50, thin] (\x,0) -- (\x, 3);
    }
    \node[font=\bfseries] at (2, -0.9) {Krystalická};

    % Amorfní
    \begin{scope}[shift={(8,0)}]
        \foreach \x/\y in {0/0.1, 0.9/0.4, 2.1/0.2, 3/0.5, 4/0, 0.5/1.3, 1.7/1, 2.6/1.4, 3.7/1.1, 0.2/2.4, 1.3/2, 2.3/2.6, 3.5/2.2, 0.8/3, 2/3.2, 3.2/3, 4/3.3} {
            \fill[zfpurple] (\x, \y) circle (0.18);
        }
        \node[font=\bfseries] at (2, -0.9) {Amorfní};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vlastnosti pevných látek}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Pevnost} -- odolnost proti přetržení nebo zlomení (ocel)
    \item \textbf{Pružnost} -- po zatížení se vrátí do původního tvaru (guma, ocel)
    \item \textbf{Tvrdost} -- odolnost proti vrypu (diamant je nejtvrdší)
    \item \textbf{Křehkost} -- snadno se rozbije nárazem (sklo, porcelán)
    \item \textbf{Tažnost} -- lze ji vytáhnout v drát (měď, hliník, zlato)
    \item \textbf{Kujnost} -- lze ji tvarovat tlakem nebo úderem (kovy)
    \item \textbf{Štěpnost} -- láme se podle určitých rovin (slída, sůl, grafit)
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--kapaliny': String.raw`
{\LARGE \bfseries Kapaliny} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Mají \textbf{stálý objem}, ale \textbf{nemají stálý tvar} -- přizpůsobí se tvaru nádoby.
    \item Částice se mohou volně pohybovat, jsou ale stále v těsné blízkosti.
    \item V klidu tvoří \textbf{vodorovnou hladinu}.
    \item Společně s plyny patří mezi \textbf{tekutiny}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stejný objem -- různé tvary}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Vysoká úzká kádinka
    \draw[thick] (0,0) -- (0,3) (1,0) -- (1,3) (0,0) -- (1,0);
    \fill[cyan!30] (0.05,0.02) rectangle (0.95,1.6);
    \draw[cyan!70!black, thick] (0.05,1.6) -- (0.95,1.6);

    % Široká nízká kádinka
    \begin{scope}[shift={(2.5,0)}]
        \draw[thick] (0,0) -- (0,2) (3,0) -- (3,2) (0,0) -- (3,0);
        \fill[cyan!30] (0.05,0.02) rectangle (2.95,0.55);
        \draw[cyan!70!black, thick] (0.05,0.55) -- (2.95,0.55);
    \end{scope}

    % Erlenmeyerova baňka
    \begin{scope}[shift={(7,0)}]
        \draw[thick] (0,0) -- (0,1.4) -- (-0.4, 2.3) -- (-0.4, 3) (1.5,0) -- (1.5,1.4) -- (1.9, 2.3) -- (1.9, 3) (0,0) -- (1.5,0);
        \fill[cyan!30] (0.05,0.02) rectangle (1.45, 1.1);
        \draw[cyan!70!black, thick] (0.05, 1.1) -- (1.45, 1.1);
    \end{scope}

    \node[font=\bfseries\small] at (0.5, -0.5) {V = 200 ml};
    \node[font=\bfseries\small] at (4, -0.5) {V = 200 ml};
    \node[font=\bfseries\small] at (7.75, -0.5) {V = 200 ml};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti kapalin}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Tekutost} -- kapaliny tečou, protože se jejich částice mohou navzájem posunovat.
    \item \textbf{Stlačitelnost} -- kapaliny jsou \textbf{téměř nestlačitelné}.
    \item \textbf{Dělitelnost} -- můžeme je rozdělit na libovolně malé množství.
    \item \textbf{Vodorovná hladina} -- v klidu je vždy vodorovná (vlivem gravitace).
    \item \textbf{Povrchové napětí} -- kapky se snaží mít kulový tvar (rosa, kapka rtuti).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady kapalin a jejich využití}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Voda} -- nejrozšířenější kapalina, základ života
    \item \textbf{Líh (etanol)} -- v lékařství, kosmetice, jako palivo
    \item \textbf{Olej} -- v kuchyni, jako mazivo i palivo
    \item \textbf{Rtuť} -- jediný kapalný kov při běžné teplotě (teploměry, jedovatá!)
    \item \textbf{Benzín, nafta} -- pohonné hmoty
    \item \textbf{Mléko, ocet, kyselina} -- v domácnosti i průmyslu
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--plyny': String.raw`
{\LARGE \bfseries Plyny} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Nemají stálý tvar} ani \textbf{stálý objem}.
    \item Vždy \textbf{vyplní celý prostor}, který mají k dispozici.
    \item Částice se pohybují rychle a chaoticky, jsou daleko od sebe.
    \item Společně s kapalinami patří mezi \textbf{tekutiny}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Plyn vyplní celou nádobu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0,0) rectangle (4,2.5);
    \foreach \x/\y/\dx/\dy in {
        0.4/0.4/0.3/0.4,
        1.0/1.6/-0.3/0.3,
        1.5/0.7/0.4/-0.2,
        2.1/2.0/-0.2/-0.4,
        2.5/1.2/0.3/0.3,
        3.0/0.4/-0.3/0.4,
        3.4/1.7/0.2/-0.3,
        0.7/2.1/0.3/-0.2,
        1.8/0.2/-0.3/0.4,
        2.8/2.2/0.2/-0.4,
        3.6/0.9/-0.3/0.3,
        0.5/1.2/0.4/0.2
    } {
        \fill[zfred] (\x, \y) circle (0.08);
        \draw[->, thick, zfred!70] (\x, \y) -- ++(\dx, \dy);
    }
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti plynů}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Stlačitelnost} -- plyny jsou \textbf{velmi dobře stlačitelné} (tlakem zmenšíme objem).
    \item \textbf{Rozpínavost} -- vyplní každý prostor, do kterého se dostanou.
    \item \textbf{Difuze} -- plyny se samovolně promíchávají (vůně se rozšíří po místnosti).
    \item \textbf{Tlak} -- nárazy částic na stěny nádoby vytvářejí tlak plynu.
    \item \textbf{Hmotnost} -- plyny mají hmotnost, ale jsou velmi lehké.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzduch -- směs plynů}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1]
    \draw[thick] (0,0) rectangle (10,0.7);
    \fill[zfblue!50] (0.02,0.02) rectangle (7.78,0.68);
    \fill[zfred!40] (7.82,0.02) rectangle (9.92,0.68);
    \fill[gray!50] (9.96,0.02) rectangle (9.98,0.68);
    \node[font=\bfseries\small, color=white] at (3.9, 0.35) {Dusík (78~\%)};
    \node[font=\bfseries\small, color=white] at (8.85, 0.35) {Kyslík (21~\%)};
    \node[font=\scriptsize] at (10.6, 0.35) {ostatní};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Kyslík} ($\text{O}_2$) -- nutný pro dýchání a hoření
    \item \textbf{Dusík} ($\text{N}_2$) -- nereaktivní, výplň atmosféry
    \item \textbf{Vodík} ($\text{H}_2$) -- nejlehčí plyn, hořlavý
    \item \textbf{Oxid uhličitý} ($\text{CO}_2$) -- vydechujeme jej, sycené nápoje
    \item \textbf{Vodní pára} ($\text{H}_2\text{O}$) -- plynná voda
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--skupenske-prechody': String.raw`
{\LARGE \bfseries Skupenské přechody} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Skupenský přechod} = změna skupenství látky (pevné $\leftrightarrow$ kapalné $\leftrightarrow$ plynné).
    \item Probíhá při \textbf{změně teploty} (případně tlaku).
    \item Přechody probíhají \textbf{oběma směry}: jeden vyžaduje teplo (ohřev), opačný teplo uvolňuje.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Přehled přechodů}
\vspace{3mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, thick, fill=zfblue!10, draw=zfblue, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (s) at (0,0) {Pevné};
    \node[draw, thick, fill=zfpurple!10, draw=zfpurple, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (l) at (5,0) {Kapalné};
    \node[draw, thick, fill=zfred!10, draw=zfred, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (g) at (10,0) {Plynné};

    % Tání / tuhnutí
    \draw[->, thick, zfred] (s.east) to[bend left=18] node[midway, above, font=\small] {tání} (l.west);
    \draw[->, thick, zfblue] (l.west) to[bend left=18] node[midway, below, font=\small] {tuhnutí} (s.east);

    % Vypařování / kapalnění
    \draw[->, thick, zfred] (l.east) to[bend left=18] node[midway, above, font=\small] {vypařování} (g.west);
    \draw[->, thick, zfblue] (g.west) to[bend left=18] node[midway, below, font=\small] {kapalnění} (l.east);

    % Sublimace / desublimace (široké oblouky nahoře a dole)
    \draw[->, thick, zfred] (s.north) to[bend left=40] node[midway, above, font=\small] {sublimace} (g.north);
    \draw[->, thick, zfblue] (g.south) to[bend left=40] node[midway, below, font=\small] {desublimace} (s.south);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\noindent
\textcolor{zfred}{\rule{10pt}{2pt}} \textbf{přijímá teplo} (ohřev) \quad
\textcolor{zfblue}{\rule{10pt}{2pt}} \textbf{odevzdává teplo} (chlazení)

\vspace{4mm}
{\Large \bfseries \color{zfblue} Charakteristika přechodů}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfpurple!50, boxrule=0.4pt, arc=2pt, left=4pt, right=4pt, top=3pt, bottom=3pt]
\begin{itemize}
    \item \textbf{Tání} -- pevné $\to$ kapalné. Probíhá při \textbf{teplotě tání} (led $\to$ voda při 0\,$^\circ$C).
    \item \textbf{Tuhnutí} -- kapalné $\to$ pevné. Probíhá při teplotě tuhnutí (rovna teplotě tání).
    \item \textbf{Vypařování} -- kapalné $\to$ plynné. Probíhá z povrchu kapaliny při \textbf{libovolné teplotě}.
    \item \textbf{Var} -- vypařování v celém objemu kapaliny při \textbf{teplotě varu} (voda 100\,$^\circ$C).
    \item \textbf{Kapalnění (kondenzace)} -- plynné $\to$ kapalné (mlha, rosa, pára na okně).
    \item \textbf{Sublimace} -- pevné $\to$ plynné, bez tání (suchý led, naftalín, sníh za mrazu).
    \item \textbf{Desublimace} -- plynné $\to$ pevné (jinovatka, námraza).
\end{itemize}
\end{tcolorbox}
`,
};

// ─────────────────────────────────────────────────────────────────────────
let updated = 0;
for (const [id, body] of Object.entries(entries)) {
  const path = join(root, 'src', 'content', 'subtopics', `${id}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!data.notebookEntry) data.notebookEntry = {};
  data.notebookEntry.latex = PREAMBLE + body + POSTAMBLE;
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zápisů vloženo.`);
