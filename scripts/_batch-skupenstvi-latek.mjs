/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Skupenství látek (8. ročník).
 * Spuštění: node scripts/_batch-skupenstvi-latek.mjs
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
\usetikzlibrary{calc,arrows.meta,patterns}
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
  'skupenstvi-latek--zmeny-skupenstvi-latek': String.raw`
{\LARGE \bfseries Změny skupenství látek} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Látka může existovat ve třech \textbf{skupenstvích}: pevné, kapalné, plynné.
    \item Při \textbf{změně teploty} (nebo tlaku) látka přechází z jednoho skupenství do druhého.
    \item Některé přechody \textbf{teplo přijímají} (ohřev), opačné teplo \textbf{odevzdávají}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Šest přechodů}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, thick, fill=zfblue!10, draw=zfblue, minimum width=2.4cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (s) at (0,0) {Pevné};
    \node[draw, thick, fill=zfpurple!10, draw=zfpurple, minimum width=2.4cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (l) at (5,0) {Kapalné};
    \node[draw, thick, fill=zfred!10, draw=zfred, minimum width=2.4cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (g) at (10,0) {Plynné};

    \draw[->, thick, zfred] (s.east) to[bend left=18] node[midway, above, font=\small] {tání} (l.west);
    \draw[->, thick, zfblue] (l.west) to[bend left=18] node[midway, below, font=\small] {tuhnutí} (s.east);

    \draw[->, thick, zfred] (l.east) to[bend left=18] node[midway, above, font=\small] {vypařování / var} (g.west);
    \draw[->, thick, zfblue] (g.west) to[bend left=18] node[midway, below, font=\small] {kapalnění} (l.east);

    \draw[->, thick, zfred] (s.north) to[bend left=40] node[midway, above, font=\small] {sublimace} (g.north);
    \draw[->, thick, zfblue] (g.south) to[bend left=40] node[midway, below, font=\small] {desublimace} (s.south);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\noindent
\textcolor{zfred}{\rule{10pt}{2pt}} \textbf{přijímá teplo} (ohřev) \quad
\textcolor{zfblue}{\rule{10pt}{2pt}} \textbf{odevzdává teplo} (chlazení)

\vspace{4mm}
{\Large \bfseries \color{zfblue} Přehled přechodů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Přechod & \bfseries Co se děje & \bfseries Příklad \\
\hline
\textbf{tání} & pevné $\to$ kapalné & led $\to$ voda \\
\textbf{tuhnutí} & kapalné $\to$ pevné & voda $\to$ led \\
\textbf{vypařování} & kapalné $\to$ plynné, z povrchu & schnutí prádla \\
\textbf{var} & kapalné $\to$ plynné, v celém objemu & vařící voda \\
\textbf{kapalnění} & plynné $\to$ kapalné & rosa, mlha, pára na zrcadle \\
\textbf{sublimace} & pevné $\to$ plynné & sníh schne, naftalín, suchý led \\
\textbf{desublimace} & plynné $\to$ pevné & jíní, námraza, sněhové vločky \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Teplota tání a tuhnutí}
\vspace{2mm}

\begin{itemize}
    \item Pro \emph{krystalické} látky (sůl, kov, led) je to \textbf{přesně daná hodnota}.
    \item Při tání i tuhnutí se teplota nemění -- teplo "spotřebuje" změna skupenství.
    \item Pro \emph{amorfní} látky (sklo, vosk, plasty) přechod není ostrý -- látka postupně měkne.
\end{itemize}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Látka & \bfseries Teplota tání ($^\circ$C) & \bfseries Teplota varu ($^\circ$C) \\
\hline
voda (led) & 0 & 100 \\
ethanol & $-114$ & 78 \\
rtuť & $-39$ & 357 \\
hliník & 660 & 2467 \\
železo & 1538 & 2862 \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vypařování a var}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Vypařování} -- z povrchu kapaliny, při \emph{libovolné} teplotě (kaluže schnou, prádlo).
    \item \textbf{Var} -- v celém objemu kapaliny, vznikají bublinky páry, jen při \textbf{teplotě varu}.
    \item Rychlejší vypařování: vyšší teplota, větší plocha, vítr, suchý vzduch.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'skupenstvi-latek--skupenske-teplo': String.raw`
{\LARGE \bfseries Skupenské teplo} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Při změně skupenství \textbf{teplota se nemění}, ale látka teplo \textbf{přijímá nebo odevzdává}.
    \item Toto teplo se nazývá \textbf{skupenské teplo}.
    \item \emph{"Skryté"} -- nevidíme změnu teploty, ale energie přechází.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenské teplo tání}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $Q = m \cdot l_t$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{Q} -- teplo potřebné k roztátí (J).
    \item \textbf{m} -- hmotnost (kg).
    \item \textbf{$l_t$} -- měrné skupenské teplo tání (J/kg).
    \item Pro vodu (led): $l_t = 334\,000$ J/kg = \textbf{334 kJ/kg}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenské teplo varu}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $Q = m \cdot l_v$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{$l_v$} -- měrné skupenské teplo varu (J/kg).
    \item Pro vodu: $l_v = 2\,260\,000$ J/kg = \textbf{2\,260 kJ/kg}.
    \item Pozor: var \textbf{spotřebuje} mnohem více tepla než tání.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Křivka ohřívání ledu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[->, thick] (0, 0) -- (8, 0) node[right] {teplo $Q$};
    \draw[->, thick] (0, -1.5) -- (0, 4) node[above] {teplota $t$ (\textdegree C)};

    % Křivka
    \draw[ultra thick, zfblue] (0, -1) -- (1, 0); % led -10 do 0
    \draw[ultra thick, zfblue] (1, 0) -- (2.8, 0); % tání
    \draw[ultra thick, zfblue] (2.8, 0) -- (4, 3.3); % voda 0 do 100
    \draw[ultra thick, zfblue] (4, 3.3) -- (6.5, 3.3); % var
    \draw[ultra thick, zfblue] (6.5, 3.3) -- (7.5, 3.7); % pára

    % Anotace
    \node[font=\scriptsize, anchor=west] at (0.1, -0.7) {led};
    \node[font=\scriptsize, anchor=south] at (1.9, 0.05) {tání (0\,\textdegree C)};
    \node[font=\scriptsize, anchor=west] at (3.4, 1.7) {voda};
    \node[font=\scriptsize, anchor=south] at (5.25, 3.35) {var (100\,\textdegree C)};
    \node[font=\scriptsize, anchor=west] at (7, 3.85) {pára};

    % Osa popisky
    \draw[thick, dashed] (0, 3.3) -- (4, 3.3);
    \node[font=\scriptsize, anchor=east] at (-0.05, 3.3) {100};
    \draw[thick, dashed] (0, 0) -- (1, 0);
    \node[font=\scriptsize, anchor=east] at (-0.05, 0) {0};
    \node[font=\scriptsize, anchor=east] at (-0.05, -1) {$-10$};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Šikmé úseky -- látka mění teplotu (ohřev / chlazení).
    \item Vodorovné úseky -- látka mění \textbf{skupenství}, teplota se nemění.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenská tepla různých látek}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Látka & \bfseries $l_t$ (kJ/kg) & \bfseries $l_v$ (kJ/kg) \\
\hline
voda (led) & 334 & 2\,260 \\
ethanol & 105 & 879 \\
hliník & 397 & 10\,500 \\
železo & 277 & 6\,300 \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady výpočtu}
\vspace{2mm}

\noindent
\textbf{1)} Kolik tepla je potřeba k roztátí 2 kg ledu (0\,\textdegree C)?

\vspace{1mm}
\noindent
$Q = m \cdot l_t = 2 \cdot 334\,000 = 668\,000$ J $\approx$ 668 kJ

\vspace{3mm}
\noindent
\textbf{2)} Kolik tepla je potřeba k vypaření 1 kg vody (100\,\textdegree C)?

\vspace{1mm}
\noindent
$Q = m \cdot l_v = 1 \cdot 2\,260\,000 = 2\,260\,000$ J = \textbf{2,26 MJ}

\vspace{3mm}
\noindent
\textbf{Vidíš:} Vypařit 1 kg vody potřebuje \emph{6,8$\times$ více} energie než roztát 1 kg ledu.

\vspace{3mm}
{\Large \bfseries \color{zfblue} Praktické důsledky}
\vspace{2mm}

\begin{itemize}
    \item Tání ledu na řece pohltí obrovské množství tepla -- jaro je proto chladné.
    \item Pocení ochlazuje tělo -- pot se vypařuje a odebírá teplo.
    \item Chladničky a klimatizace pracují díky vypařování chladiva.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'skupenstvi-latek--vztah-teploty-a-tlaku': String.raw`
{\LARGE \bfseries Vztah teploty a tlaku} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Teploty tání a varu \textbf{nejsou pevné} -- závisí na \textbf{tlaku} okolí.
    \item Vyšší tlak posunuje teploty směrem nahoru, nižší tlak směrem dolů.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Var vody na různých místech}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Místo / nadm. výška & \bfseries Tlak & \bfseries Teplota varu \\
\hline
hladina moře & 100 kPa & 100\,\textdegree C \\
Praha (300 m) & 96 kPa & 99\,\textdegree C \\
Sněžka (1602 m) & 83 kPa & 95\,\textdegree C \\
Mont Blanc (4810 m) & 55 kPa & 84\,\textdegree C \\
Mt. Everest (8848 m) & 33 kPa & 70\,\textdegree C \\
tlakový hrnec & 200 kPa & 120\,\textdegree C \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pravidlo:} Čím \textbf{nižší tlak}, tím \textbf{nižší} teplota varu. Čím \textbf{vyšší tlak}, tím \textbf{vyšší} teplota varu.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tlakový hrnec (Papinův hrnec)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Hrnec
    \draw[thick, fill=gray!40] (0, 0) -- (3, 0) -- (3, 2) -- (0, 2) -- cycle;
    % Voda
    \fill[cyan!40] (0.05, 0.05) rectangle (2.95, 1);
    % Pára
    \node[font=\bfseries] at (1.5, 1.5) {pára};

    % Víko
    \draw[thick, fill=gray!50] (-0.3, 2) rectangle (3.3, 2.3);
    % Ventil
    \draw[thick, fill=zfred] (1.4, 2.3) rectangle (1.6, 2.6);
    % Pára vychází
    \draw[thick, decoration={coil, segment length=1.5mm, amplitude=1mm}, decorate, gray!80!black] (1.5, 2.6) -- (1.5, 3.5);

    \node[font=\scriptsize, anchor=west] at (3.5, 2.45) {pojistný ventil};
    \node[font=\scriptsize, anchor=west] at (3.5, 2.0) {víko -- těsně};
    \node[font=\bfseries\small] at (1.5, -0.4) {tlak až 200 kPa};
    \node[font=\bfseries\small] at (1.5, -0.8) {teplota varu 120\,\textdegree C};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Hrnec se uzavře \textbf{těsným víkem} -- pára nemůže ven.
    \item Tlak uvnitř roste $\to$ voda začne vařit až při \textbf{vyšší teplotě} (až 120\,\textdegree C).
    \item Jídlo se vaří \textbf{rychleji} a měkne.
    \item Pojistný ventil zabrání nebezpečnému přetlaku.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} V horách se hůř vaří}
\vspace{2mm}

\begin{itemize}
    \item Na Sněžce vře voda už při 95\,\textdegree C -- jídlo se vaří \emph{déle}.
    \item Brambory by se musely vařit i hodinu, dokud by změkly.
    \item Horolezci proto nosí \textbf{tlakový hrnec} nebo směsi pro rychlou přípravu.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Tlak ovlivňuje i bod tání}
\vspace{2mm}

\begin{itemize}
    \item U \textbf{ledu} (vody) je to opačné: vyšší tlak \emph{snižuje} bod tání.
    \item Proto led pod tlakem brusle částečně taje a brusle klouže (drobný efekt).
    \item U většiny ostatních látek vyšší tlak bod tání zvyšuje.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Praktické příklady}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Děj / přístroj & \bfseries Co se děje \\
\hline
tlakový hrnec & vyšší tlak $\to$ vyšší $T$ varu $\to$ rychlejší vaření \\
parní turbína & vysoký tlak páry pohání turbínu \\
chladnička & nízký tlak v části okruhu $\to$ vypařování chladiva \\
varná konvice ve vesmíru & velmi nízký tlak $\to$ voda vře už při pokojové teplotě \\
\hline
\end{tabular}
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
  console.log(`OK: ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zapisu vlozeno.`);
