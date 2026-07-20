/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Pohyb (7. ročník).
 * Spuštění: node scripts/_batch-pohyb.mjs
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
\usetikzlibrary{calc,arrows.meta}
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
  'pohyb--druhy-pohybu': String.raw`
{\LARGE \bfseries Druhy pohybu} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Pohyb} = těleso mění svou polohu vůči jinému tělesu (vztažnému tělesu).
    \item Když poloha zůstává stejná, těleso je v \textbf{klidu}.
    \item Klid i pohyb jsou \textbf{relativní} -- záleží, vůči čemu je pozorujeme.
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Příklad:} Cestující v rozjetém autě je v klidu \emph{vůči autu}, ale v pohybu \emph{vůči zemi}.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rozdělení podle tvaru dráhy}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Přímočarý
    \draw[->, very thick, zfblue] (0, 0) -- (4, 0);
    \draw[thick, fill=zfred] (0.3, 0) circle (0.15);
    \node[font=\bfseries\small] at (2, 0.5) {přímočarý};
    \node[font=\small] at (2, -0.5) {dráha = přímka};

    % Křivočarý
    \begin{scope}[shift={(6, 0)}]
        \draw[->, very thick, zfblue] (0,0) .. controls (1.5, 1.5) and (3, -1) .. (4.2, 0.5);
        \draw[thick, fill=zfred] (0, 0) circle (0.15);
        \node[font=\bfseries\small] at (2, 1.4) {křivočarý};
        \node[font=\small] at (2, -0.7) {dráha = křivka};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Přímočarý} -- dráha je přímka (jablko padá svisle dolů, vlak na rovné koleji).
    \item \textbf{Křivočarý} -- dráha je křivka. Speciální případ: \textbf{kruhový} pohyb (kolotoč, ručička hodin).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rozdělení podle rychlosti}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Rovnoměrný — body ve stejných vzdálenostech
    \draw[thick] (0, 0) -- (5, 0);
    \foreach \x in {0.5, 1.5, 2.5, 3.5, 4.5} {
        \draw[thick, fill=zfgreen!70] (\x, 0) circle (0.15);
    }
    \node[font=\bfseries\small] at (2.5, 0.6) {rovnoměrný};
    \node[font=\small] at (2.5, -0.55) {stejné vzdálenosti};

    % Nerovnoměrný — body v rostoucích vzdálenostech
    \begin{scope}[shift={(7, 0)}]
        \draw[thick] (0, 0) -- (5, 0);
        \foreach \x in {0.3, 0.7, 1.3, 2.1, 3.2, 4.7} {
            \draw[thick, fill=zfred!70] (\x, 0) circle (0.15);
        }
        \node[font=\bfseries\small] at (2.5, 0.6) {nerovnoměrný};
        \node[font=\small] at (2.5, -0.55) {různé vzdálenosti};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Rovnoměrný} -- těleso ujede za stejné časy stejné dráhy. Rychlost se nemění.
    \item \textbf{Nerovnoměrný} -- za stejné časy ujede různé dráhy. Rychlost se mění (zrychluje, zpomaluje).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady druhů pohybu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Pohyb & \bfseries Tvar dráhy & \bfseries Rychlost \\
\hline
chůze po chodníku & přímočarý & nerovnoměrný \\
ručička hodin & křivočarý (kruh) & rovnoměrný \\
auto na dálnici (tempomat) & přímočarý & rovnoměrný \\
volný pád & přímočarý & nerovnoměrný (zrychluje) \\
kolotoč & křivočarý (kruh) & rovnoměrný \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vztažné těleso (vztažná soustava)}
\vspace{2mm}

\begin{itemize}
    \item Pohyb vždy popisujeme \textbf{vůči něčemu} -- to je \emph{vztažné těleso}.
    \item Nejčastěji bereme jako vztažné těleso \textbf{Zemi}.
    \item Bez určení vztažného tělesa nelze říct, jestli se těleso pohybuje.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'pohyb--rychlost': String.raw`
{\LARGE \bfseries Rychlost} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Rychlost} udává, jakou dráhu těleso ujede za jednotku času.
    \item Značka: \textbf{v} (z anglického \emph{velocity}).
    \item Hlavní jednotka: \textbf{metr za sekundu (m/s)}, často také \textbf{km/h}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec pro rychlost}
\vspace{2mm}

\noindent
\begin{minipage}[c]{0.5\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $v = \dfrac{s}{t}$
\end{center}
\end{tcolorbox}
\begin{itemize}
    \item \textbf{s} -- dráha (m, km)
    \item \textbf{t} -- doba pohybu (s, h)
    \item \textbf{v} -- rychlost (m/s, km/h)
\end{itemize}
\end{minipage}\hfill
\begin{minipage}[c]{0.45\textwidth}
\begin{center}
\begin{tikzpicture}[scale=0.8]
    \draw[thick] (0,0) -- (4,0) -- (2, 3.4) -- cycle;
    \draw[thick] (1.05, 1.7) -- (2.95, 1.7);
    \draw[thick] (2, 0) -- (2, 1.7);
    \node[font=\Large\bfseries, color=zfblue] at (2, 2.4) {$s$};
    \node[font=\Large\bfseries, color=zfred] at (1.5, 0.85) {$v$};
    \node[font=\Large\bfseries, color=zfgreen] at (2.5, 0.85) {$t$};
\end{tikzpicture}\\[1mm]
{\scriptsize zakryj veličinu, kterou hledáš}
\end{center}
\end{minipage}

\vspace{2mm}
\noindent
\textbf{Pozn.:} Vzorec platí pro \emph{rovnoměrný pohyb}. U nerovnoměrného počítáme \emph{průměrnou rychlost}.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Převod jednotek}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfblue, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=1.2cm, font=\bfseries\large] (ms) at (0, 0) {m/s};
    \node[draw=zfblue, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=1.2cm, font=\bfseries\large] (kmh) at (6, 0) {km/h};
    \draw[->, very thick, zfred] (1.55, 0.2) -- (4.45, 0.2) node[midway, above, font=\small\bfseries, color=zfred] {$\cdot\, 3{,}6$};
    \draw[->, very thick, zfgreen] (4.45, -0.2) -- (1.55, -0.2) node[midway, below, font=\small\bfseries, color=zfgreen] {$:\, 3{,}6$};
\end{tikzpicture}
\end{center}

\vspace{1mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pamatuj:} \quad 1 m/s = 3,6 km/h \quad $|$ \quad 36 km/h = 10 m/s
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady rychlostí}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Pohyb & \bfseries m/s & \bfseries km/h \\
\hline
chodec & 1,5 & 5 \\
cyklista & 5 & 18 \\
auto ve městě & 14 & 50 \\
auto na dálnici & 36 & 130 \\
zvuk ve vzduchu & 340 & 1\,224 \\
letadlo & 250 & 900 \\
světlo ve vakuu & 300\,000\,000 & 1\,080\,000\,000 \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady výpočtu}
\vspace{2mm}

\noindent
\textbf{Příklad 1:} Cyklista ujel 36 km za 2 hodiny. Jaká je jeho rychlost?

\smallskip
\noindent
\textbf{Zápis:}\\
$s = 36$ km $= 36\,000$ m\\
$t = 2$ h $= 7\,200$ s\\
$v = ?$ m/s

\smallskip
\noindent
\textbf{Vzorec:} \quad $v = \dfrac{s}{t}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $v = \dfrac{36\,000~\text{m}}{7\,200~\text{s}} = 5$ m/s

\smallskip
\noindent
\textbf{Odpověď:} Cyklista jede rychlostí 5 m/s ($= 18$ km/h).

\vspace{4mm}
\noindent
\textbf{Příklad 2:} Auto jede stálou rychlostí 90 km/h. Kolik ujede za 3 hodiny?

\smallskip
\noindent
\textbf{Zápis:}\\
$v = 90$ km/h\\
$t = 3$ h\\
$s = ?$ km

\smallskip
\noindent
\textbf{Vzorec:} \quad $s = v \cdot t$

\smallskip
\noindent
\textbf{Dosazení:} \quad $s = 90~\text{km/h} \cdot 3~\text{h} = 270$ km

\smallskip
\noindent
\textbf{Odpověď:} Auto ujede za 3 hodiny 270 km.

\vspace{4mm}
\noindent
\textbf{Příklad 3:} Vlak jede z Prahy do Brna (200 km) rychlostí 100 km/h. Jak dlouho cesta trvá?

\smallskip
\noindent
\textbf{Zápis:}\\
$s = 200$ km\\
$v = 100$ km/h\\
$t = ?$ h

\smallskip
\noindent
\textbf{Vzorec:} \quad $t = \dfrac{s}{v}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $t = \dfrac{200~\text{km}}{100~\text{km/h}} = 2$ h

\smallskip
\noindent
\textbf{Odpověď:} Cesta trvá 2 hodiny.

\vspace{3mm}
{\Large \bfseries \color{zfblue} Průměrná rychlost}
\vspace{2mm}

\begin{itemize}
    \item U nerovnoměrného pohybu (zrychlujeme, zpomalujeme, stojíme) počítáme \textbf{průměrnou rychlost}.
    \item Vzorec je stejný: $v_p = \dfrac{\text{celá dráha}}{\text{celý čas}}$.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'pohyb--grafy': String.raw`
{\LARGE \bfseries Grafy pohybu} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Pohyb můžeme zobrazit \textbf{graficky}.
    \item Na osu \textbf{x} dáváme \textbf{čas (t)}, na osu \textbf{y} dráhu (s) nebo rychlost (v).
    \item Tvar grafu nám prozradí, o jaký pohyb jde.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Graf dráhy a času ($s$--$t$)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Osy
    \draw[->, thick] (0, 0) -- (6, 0) node[right] {$t$~(s)};
    \draw[->, thick] (0, 0) -- (0, 4) node[above] {$s$~(m)};

    % Mřížka
    \draw[gray!30] (0, 1) -- (5, 1);
    \draw[gray!30] (0, 2) -- (5, 2);
    \draw[gray!30] (0, 3) -- (5, 3);
    \draw[gray!30] (1, 0) -- (1, 3.5);
    \draw[gray!30] (2, 0) -- (2, 3.5);
    \draw[gray!30] (3, 0) -- (3, 3.5);
    \draw[gray!30] (4, 0) -- (4, 3.5);
    \draw[gray!30] (5, 0) -- (5, 3.5);

    % Popisky os
    \foreach \x/\v in {1/1, 2/2, 3/3, 4/4, 5/5} {
        \node[font=\scriptsize, below] at (\x, 0) {\v};
    }
    \foreach \y/\v in {1/2, 2/4, 3/6} {
        \node[font=\scriptsize, left] at (0, \y) {\v};
    }

    % Rovnoměrný — přímka
    \draw[very thick, zfblue] (0, 0) -- (5, 3.3);
    \node[font=\bfseries\small, color=zfblue, anchor=west] at (5, 3.3) {rovnoměrný};

    % Klid — vodorovná
    \draw[very thick, zfgreen] (0, 1.5) -- (5, 1.5);
    \node[font=\bfseries\small, color=zfgreen, anchor=west] at (5, 1.5) {klid};

    % Nerovnoměrný — křivka
    \draw[very thick, zfred] (0, 0) .. controls (2, 0.2) and (3.5, 1) .. (5, 3.5);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (5, 3.7) {zrychluje};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Přímka} (stoupá) -- rovnoměrný pohyb. Čím strmější, tím větší rychlost.
    \item \textbf{Vodorovná čára} -- těleso je v klidu (poloha se nemění).
    \item \textbf{Křivka} -- nerovnoměrný pohyb (těleso zrychluje nebo zpomaluje).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Graf rychlosti a času ($v$--$t$)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Osy
    \draw[->, thick] (0, 0) -- (6, 0) node[right] {$t$~(s)};
    \draw[->, thick] (0, 0) -- (0, 4) node[above] {$v$~(m/s)};

    % Mřížka
    \draw[gray!30] (0, 1) -- (5, 1);
    \draw[gray!30] (0, 2) -- (5, 2);
    \draw[gray!30] (0, 3) -- (5, 3);
    \foreach \x in {1, 2, 3, 4, 5} \draw[gray!30] (\x, 0) -- (\x, 3.5);

    \foreach \x/\v in {1/1, 2/2, 3/3, 4/4, 5/5} {
        \node[font=\scriptsize, below] at (\x, 0) {\v};
    }
    \foreach \y/\v in {1/2, 2/4, 3/6} {
        \node[font=\scriptsize, left] at (0, \y) {\v};
    }

    % Rovnoměrný — vodorovná
    \draw[very thick, zfblue] (0, 2) -- (5, 2);
    \node[font=\bfseries\small, color=zfblue, anchor=west] at (5, 2) {rovnoměrný};

    % Zrychluje — stoupá
    \draw[very thick, zfred] (0, 0) -- (5, 3.5);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (5, 3.5) {zrychluje};

    % Zpomaluje — klesá
    \draw[very thick, zfgreen] (0, 3) -- (5, 0.5);
    \node[font=\bfseries\small, color=zfgreen, anchor=west] at (5, 0.5) {zpomaluje};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Vodorovná čára} -- rovnoměrný pohyb (rychlost se nemění).
    \item \textbf{Stoupající přímka} -- těleso \emph{zrychluje}.
    \item \textbf{Klesající přímka} -- těleso \emph{zpomaluje} (např. brzdící auto).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Co z grafu poznáme}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item Z grafu \textbf{$s$--$t$} odečteme polohu v daném čase a vidíme, jestli se pohybuje rovnoměrně.
    \item Z grafu \textbf{$v$--$t$} odečteme rychlost v daném čase a vidíme, jestli zrychluje.
    \item Strmost přímky v $s$--$t$ grafu odpovídá rychlosti -- větší sklon = větší rychlost.
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
  delete data.notebookEntry.content;
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`OK: ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zapisu vlozeno.`);
