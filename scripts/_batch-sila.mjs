/**
 * Vloží LaTeX zápisy pro 6 podkapitol tématu Síla (7. ročník).
 * Spuštění: node scripts/_batch-sila.mjs
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
  'sila--sila-a-jeji-znazorneni': String.raw`
{\LARGE \bfseries Síla a její znázornění} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Síla} popisuje, jak na sebe tělesa působí.
    \item Značka: \textbf{F} (z anglického \emph{force}). Jednotka: \textbf{newton (N)}.
    \item Síla může těleso \textbf{zrychlit, zpomalit, deformovat} nebo změnit směr pohybu.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Účinky síly}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Účinek & \bfseries Příklad \\
\hline
uvedení do pohybu & kopnutí do míče \\
zastavení & zachycení míče \\
změna směru & odraz míče od stěny \\
deformace (změna tvaru) & stlačení pružiny, pomačkání plastu \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Síla má tři vlastnosti}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item \textbf{Velikost} -- udává se v newtonech (N).
    \item \textbf{Směr} -- kam síla působí.
    \item \textbf{Působiště} -- bod, ve kterém na těleso působí.
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Znázornění síly orientovanou úsečkou}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Bedna
    \draw[thick, fill=gray!30] (0, 0) rectangle (2, 1.5);

    % Šipka síly
    \draw[->, ultra thick, zfred] (1, 0.75) -- (4.5, 0.75);
    \node[font=\bfseries, color=zfred] at (3, 1.1) {$F = 50$ N};

    % Působiště
    \fill[zfred] (1, 0.75) circle (0.1);
    \node[font=\small, anchor=east] at (1, 0.4) {působiště};

    % Šipka = směr
    \node[font=\small] at (5.5, 0.75) {směr};

    % Délka = velikost
    \draw[thick, dashed, gray] (1, -0.3) -- (4.5, -0.3);
    \node[font=\small, gray!50!black] at (2.75, -0.6) {délka šipky = velikost};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Sílu kreslíme jako \textbf{šipku}.
    \item \textbf{Začátek} šipky = působiště. \textbf{Směr} šipky = směr síly. \textbf{Délka} šipky = velikost síly (podle zvoleného měřítka).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy sil}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Tíhová síla} -- působí Země na každé těleso, směr svisle dolů.
    \item \textbf{Tlaková a tahová síla} -- tlačíme nebo táhneme předmět.
    \item \textbf{Třecí síla} -- brání pohybu po povrchu.
    \item \textbf{Pružná síla} -- pružina vrací svůj tvar.
    \item \textbf{Magnetická síla, elektrická síla} -- působí na dálku.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady velikostí sil}
\vspace{2mm}

\begin{itemize}
    \item Zvedne 100 g (jablko): asi 1 N.
    \item Zvedne 1 kg (knihu): asi 10 N.
    \item Zvedne žáka (40 kg): asi 400 N.
    \item Auto, které tlačíme po rovině: 200--500 N.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'sila--silomer': String.raw`
{\LARGE \bfseries Siloměr} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Siloměr} je přístroj na měření \textbf{síly}.
    \item Funguje na principu \textbf{prodloužení pružiny}.
    \item Hlavní jednotka: \textbf{newton (N)}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Princip pružinového siloměru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tělo
    \draw[thick] (0, 0) rectangle (1, 6);
    \draw[thick] (0.4, 6) -- (0.4, 6.4) -- (0.6, 6.4) -- (0.6, 6) -- cycle;
    \draw[thick] (0.5, 6.4) -- (0.5, 6.7);
    \draw[thick] (0.3, 6.7) -- (0.7, 6.7);

    % Pružina
    \draw[thick, decoration={coil, segment length=2.5mm, amplitude=2mm}, decorate, zfblue]
        (0.5, 6) -- (0.5, 3.5);

    % Háček
    \draw[thick] (0.5, 3.5) -- (0.5, 2.8);
    \draw[thick] (0.4, 2.8) .. controls (0.4, 2.5) and (0.7, 2.5) .. (0.7, 2.8);

    % Stupnice
    \foreach \y/\v in {5.5/0, 5/2, 4.5/4, 4/6, 3.5/8, 3/10} {
        \draw[thick] (1, \y) -- (1.2, \y);
        \node[font=\scriptsize, anchor=west] at (1.3, \y) {\v};
    }
    \node[font=\small\bfseries, anchor=west] at (1.3, 6) {N};

    % Závaží
    \draw[thick, fill=gray!50] (0, 1.5) rectangle (1, 2.4);
    \draw[thick] (0.5, 2.4) -- (0.5, 2.7);
    \node[font=\bfseries\small, color=white] at (0.5, 1.95) {1 kg};
    \node[font=\small, anchor=west] at (1.3, 1.95) {= 10 N};

    % Popis pružiny
    \node[font=\small, anchor=west] at (1.3, 4.7) {pružina};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Když pověsíme na háček těleso, pružina se \textbf{prodlouží}.
    \item Čím větší síla, tím větší prodloužení pružiny.
    \item Stupnice je \textbf{kalibrovaná v newtonech}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Měřicí rozsah a citlivost}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh siloměru & \bfseries Rozsah & \bfseries Použití \\
\hline
laboratorní & 1--10 N & školní pokusy \\
ruční pružinový & 10--100 N & vážení balíků, ryb \\
mincíř (vahadlový) & až 100 kg & tržiště, nákladní zboží \\
digitální (tenzometrický) & dle modelu & průmyslové vážení \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Postup měření}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Vyber siloměr s vhodným rozsahem (síla nesmí přesáhnout maximum).
    \item Pověs siloměr za horní oko, aby visel svisle.
    \item Nastav nulu (pokud má seřizovací šroub).
    \item Pověs na háček těleso a počkej, až se pružina ustálí.
    \item Odečti hodnotu \textbf{kolmo}, zapiš číslo i jednotku ($F = 4{,}5$ N).
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Hmotnost vs. tíhová síla}
\vspace{2mm}

\begin{itemize}
    \item Siloměr měří \textbf{sílu} (v N), ne hmotnost.
    \item Z tíhové síly můžeme spočítat hmotnost: $m = F : 10$.
    \item Příklad: siloměr ukazuje 25 N $\Rightarrow$ těleso má hmotnost asi 2,5 kg.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'sila--skladani-sil': String.raw`
{\LARGE \bfseries Skládání sil} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Na těleso často působí \textbf{více sil} najednou.
    \item Můžeme je nahradit \textbf{jednou silou} -- nazýváme ji \textbf{výslednice} (značka $F_v$).
    \item Postup nazýváme \textbf{skládání sil}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Síly stejného směru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=gray!30] (0, 0) rectangle (1.5, 1);
    \draw[->, ultra thick, zfblue] (0.7, 0.5) -- (3, 0.5);
    \draw[->, ultra thick, zfblue] (3, 0.5) -- (4.5, 0.5);
    \node[font=\bfseries, color=zfblue] at (1.85, 0.85) {$F_1 = 30$ N};
    \node[font=\bfseries, color=zfblue] at (3.75, 0.85) {$F_2 = 20$ N};

    % Výslednice
    \draw[->, ultra thick, zfred] (0.7, -0.5) -- (4.5, -0.5);
    \node[font=\bfseries, color=zfred] at (2.6, -0.85) {$F_v = 50$ N};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pravidlo:} Velikosti \textbf{sečteme}: $F_v = F_1 + F_2$. Směr je \textbf{stejný}.
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Síly opačného směru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=gray!30] (1.5, 0) rectangle (3, 1);
    \draw[<-, ultra thick, zfblue] (0, 0.5) -- (1.7, 0.5);
    \draw[->, ultra thick, zfblue] (3, 0.5) -- (4.5, 0.5);
    \node[font=\bfseries, color=zfblue] at (0.85, 0.85) {$F_1 = 30$ N};
    \node[font=\bfseries, color=zfblue] at (3.75, 0.85) {$F_2 = 20$ N};

    % Výslednice (rozdíl)
    \draw[<-, ultra thick, zfred] (1.7, -0.6) -- (2.4, -0.6);
    \node[font=\bfseries, color=zfred] at (1.05, -0.6) {$F_v = 10$ N};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pravidlo:} Velikosti \textbf{odečteme}: $F_v = F_1 - F_2$. Směr je stejný jako \emph{větší} síla.
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Stejně velké opačné síly -- rovnováha}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=gray!30] (1.5, 0) rectangle (3, 1);
    \draw[<-, ultra thick, zfblue] (0, 0.5) -- (1.7, 0.5);
    \draw[->, ultra thick, zfblue] (3, 0.5) -- (4.5, 0.5);
    \node[font=\bfseries, color=zfblue] at (0.85, 1) {$F_1 = 30$ N};
    \node[font=\bfseries, color=zfblue] at (3.75, 1) {$F_2 = 30$ N};
    \node[font=\bfseries, color=zfgreen] at (2.25, -0.4) {$F_v = 0$ -- rovnováha};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Když $F_v = 0$ N, těleso je v \textbf{rovnováze}.
    \item Buď je v klidu, nebo se pohybuje rovnoměrně přímočaře.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Síly různého směru (různoběžné)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[gray] (0, 0) circle (0.1);
    \draw[->, ultra thick, zfblue] (0, 0) -- (3, 0);
    \node[font=\bfseries, color=zfblue] at (1.5, -0.4) {$F_1$};

    \draw[->, ultra thick, zfblue] (0, 0) -- (0, 2);
    \node[font=\bfseries, color=zfblue] at (-0.4, 1) {$F_2$};

    % Doplnění obdélníku
    \draw[dashed, gray] (3, 0) -- (3, 2) -- (0, 2);

    % Úhlopříčka
    \draw[->, ultra thick, zfred] (0, 0) -- (3, 2);
    \node[font=\bfseries, color=zfred] at (1.8, 1.4) {$F_v$};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Síly s různým směrem skládáme \textbf{rovnoběžníkem}.
    \item Doplníme strany na rovnoběžník, výslednice je \textbf{úhlopříčka} z působiště.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'sila--gravitacni-a-tihova-sila': String.raw`
{\LARGE \bfseries Gravitační a tíhová síla} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Gravitační síla} -- síla, kterou se navzájem přitahují všechna tělesa s hmotností.
    \item Čím větší hmotnost, tím větší přitažlivost. Čím větší vzdálenost, tím menší.
    \item Velmi výrazná je u Země (a dalších planet).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Gravitační pole Země}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Země
    \draw[thick, fill=zfblue!20] (0, 0) circle (1.5);
    \node[font=\bfseries] at (0, 0) {Země};

    % Šipky gravitace dovnitř
    \foreach \a in {0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330} {
        \draw[->, thick, zfred] ({2.5*cos(\a)}, {2.5*sin(\a)}) -- ({1.65*cos(\a)}, {1.65*sin(\a)});
    }
    \node[font=\bfseries, color=zfred] at (3.5, 1.8) {gravitační síla};
    \node[font=\small, color=zfred] at (3.5, 1.4) {míří ke středu};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tíhová síla}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Tíhová síla} ($F_g$) je síla, kterou Země přitahuje těleso.
    \item Působí svisle \textbf{dolů}, do středu Země.
    \item Hmotnost \textbf{nezáleží} na místě, ale tíhová síla se s místem trochu mění.
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $F_g = m \cdot g$ \quad\quad
$g \approx 10$ N/kg \,(přesněji 9{,}81)
\end{center}
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item \textbf{m} -- hmotnost (kg), \textbf{g} -- tíhové zrychlení.
    \item \textbf{g} se nepatrně liší: na rovníku 9,78; na pólech 9,83 N/kg.
    \item Pro ZŠ počítáme \textbf{$g = 10$ N/kg} -- snadné počítání.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady tíhové síly}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Těleso & \bfseries Hmotnost & \bfseries Tíhová síla \\
\hline
jablko & 0,1 kg & 1 N \\
litr vody & 1 kg & 10 N \\
školní taška & 5 kg & 50 N \\
žák & 40 kg & 400 N \\
auto & 1000 kg & 10\,000 N \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Tíhová síla na jiných tělesech}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Těleso & \bfseries g (N/kg) & \bfseries Co to znamená \\
\hline
Měsíc & 1,6 & vážíš 6$\times$ méně \\
Mars & 3,7 & vážíš asi 3$\times$ méně \\
Země & 10 & běžné \\
Jupiter & 25 & vážíš 2,5$\times$ víc \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad}
\vspace{2mm}

\noindent
\textbf{Zadání:} Žák má hmotnost 50 kg. Jak velkou tíhovou silou na něj působí Země?

\vspace{1mm}
\noindent
\textbf{Řešení:} \quad $F_g = m \cdot g = 50 \cdot 10 = 500$ N.
`,

  // ─────────────────────────────────────────────────────────────────────
  'sila--newtonovy-zakony': String.raw`
{\LARGE \bfseries Newtonovy zákony} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Tři základní zákony, které popisují, jak síly ovlivňují pohyb. Objevil je \textbf{Isaac Newton} v 17. století.

\vspace{4mm}
{\Large \bfseries \color{zfblue} 1. zákon -- zákon setrvačnosti}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
Těleso \textbf{zůstává v klidu nebo v rovnoměrném přímočarém pohybu}, dokud na něj nepůsobí žádná síla (nebo je výslednice sil nulová).
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Auto bez síly
    \draw[thick, fill=zfblue!30] (0, 0) rectangle (2, 0.8);
    \draw[thick, fill=zfblue!30] (0.4, 0.8) rectangle (1.6, 1.3);
    \draw[thick, fill=black] (0.4, 0) circle (0.2);
    \draw[thick, fill=black] (1.6, 0) circle (0.2);
    \draw[->, very thick, zfgreen] (2.2, 0.5) -- (4.5, 0.5);
    \node[font=\bfseries\small, color=zfgreen] at (3.35, 0.85) {jede dál};
    \node[font=\small] at (1, -0.7) {bez sil};

    % Cestující při náhlém brzdění
    \begin{scope}[shift={(7, 0)}]
        \draw[thick, fill=zfblue!30] (0, 0) rectangle (2.5, 1);
        \draw[thick, fill=black] (0.5, 0) circle (0.2);
        \draw[thick, fill=black] (2, 0) circle (0.2);
        \draw[thick, fill=zfred!40] (0.6, 0.7) circle (0.18);
        \draw[thick, fill=zfred!40] (0.6, 0.4) -- (0.6, 0.1) -- (0.45, 0.1) -- (0.6, 0.4) -- (0.75, 0.1) -- (0.6, 0.1);
        \draw[->, very thick, zfred] (1.5, 1.4) -- (2.7, 1.4);
        \node[font=\bfseries\small, color=zfred] at (1.5, 1.7) {tělo letí dopředu};
        \node[font=\small] at (1.25, -0.4) {auto brzdí};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Těleso si "udržuje" svůj pohybový stav -- chce zůstat tak, jak je.
    \item \textbf{Setrvačnost} = vlastnost tělesa udržet si svůj stav.
    \item Příklad: pasažéři v autě se naklánějí dopředu při brzdění (chtějí letět dál).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} 2. zákon -- síla a zrychlení}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
Působí-li na těleso \textbf{síla}, těleso \textbf{zrychluje} (mění svou rychlost).
\begin{center} \Large $F = m \cdot a$ \end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{F} -- síla (N), \textbf{m} -- hmotnost (kg), \textbf{a} -- zrychlení (m/s$^2$).
    \item Větší síla $\Rightarrow$ větší zrychlení.
    \item Větší hmotnost $\Rightarrow$ menší zrychlení (stejnou silou).
    \item Příklad: stejnou silou snáze rozjedeš \textbf{kolo} než \textbf{auto}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} 3. zákon -- akce a reakce}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
Působí-li jedno těleso na druhé silou (\textbf{akce}), pak druhé těleso působí na první stejně velkou silou v opačném směru (\textbf{reakce}).
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Dvě tělesa
    \draw[thick, fill=zfblue!30] (0, 0) circle (0.7);
    \node at (0, 0) {A};
    \draw[thick, fill=zfred!30] (4, 0) circle (0.7);
    \node at (4, 0) {B};

    % Akce A->B
    \draw[->, ultra thick, zfblue] (0.8, 0.3) -- (3.1, 0.3);
    \node[font=\bfseries, color=zfblue] at (2, 0.7) {akce};

    % Reakce B->A
    \draw[->, ultra thick, zfred] (3.1, -0.3) -- (0.8, -0.3);
    \node[font=\bfseries, color=zfred] at (2, -0.7) {reakce};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Akce a reakce \textbf{vznikají současně}.
    \item Působí na \textbf{různá tělesa} -- proto se neruší.
    \item Příklady:
\end{itemize}

\vspace{1mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Akce & \bfseries Reakce \\
\hline
ruka tlačí na zeď & zeď tlačí na ruku \\
nohy odrážejí podlahu (chůze) & podlaha tlačí nohy dopředu \\
plyn vyletí z trysky rakety dolů & raketa vyletí nahoru \\
\hline
\end{tabular}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'sila--jednoduche-stroje': String.raw`
{\LARGE \bfseries Jednoduché stroje} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Jednoduchý stroj} pomáhá zmenšit potřebnou sílu.
    \item Sílu \emph{ušetříme}, ale za cenu \textbf{delší dráhy}.
    \item Patří mezi ně: \textbf{páka, kladka, nakloněná rovina}.
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Zlaté pravidlo mechaniky:} Co ušetříme na síle, to musíme přidat na dráze.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Páka}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tyč
    \draw[ultra thick] (0, 1.2) -- (6, 1.2);
    % Opěra
    \draw[thick, fill=gray!40] (3.7, 0) -- (4.3, 0) -- (4, 1.2) -- cycle;
    % Břemeno (vlevo, krátké rameno)
    \draw[thick, fill=gray!50] (4.3, 1.25) rectangle (5.7, 1.85);
    \node[font=\small, color=white, font=\bfseries] at (5, 1.55) {břemeno};
    \draw[->, very thick, zfred] (5, 1.85) -- (5, 2.6);
    \node[font=\bfseries, color=zfred] at (5, 2.85) {$F_2$};

    % Lidská síla (vpravo, dlouhé rameno)
    \draw[->, very thick, zfgreen] (1, 1.85) -- (1, 0.6);
    \node[font=\bfseries, color=zfgreen] at (1, 2.15) {$F_1$};

    % Ramena
    \draw[<->, thick, dashed] (0, -0.3) -- (4, -0.3);
    \node[font=\small] at (2, -0.6) {dlouhé rameno $a_1$};
    \draw[<->, thick, dashed] (4, -0.3) -- (5.7, -0.3);
    \node[font=\small] at (4.85, -0.6) {krátké rameno $a_2$};
\end{tikzpicture}
\end{center}

\vspace{1mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center} $F_1 \cdot a_1 = F_2 \cdot a_2$ \end{center}
\end{tcolorbox}

\begin{itemize}
    \item Čím \textbf{delší} je rameno, tím \textbf{menší} sílu potřebujeme.
    \item Příklady: nůžky, kladívko (vytahování hřebíku), lopata, kolíbka, dveře.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Kladka}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Pevná kladka
    \draw[thick] (0, 2) circle (0.5);
    \draw[thick] (-0.5, 2) -- (-0.5, 0);
    \draw[thick] (0.5, 2) -- (0.5, 0);
    \draw[thick, fill=gray!50] (-0.6, 0) rectangle (0.6, -0.6);
    \draw[->, very thick, zfgreen] (0.5, 0) -- (0.5, -1.5);
    \node[font=\bfseries, color=zfgreen] at (0.85, -1) {$F$};
    \node[font=\bfseries\small] at (0, 2.9) {pevná};
    \node[font=\small] at (0, -1.3) {jen mění směr};

    % Volná kladka
    \begin{scope}[shift={(5, 0)}]
        \draw[thick] (-1, 3) -- (-1, 2);
        \draw[thick] (1, 3) -- (1, 2);
        \draw[thick] (0, 2) circle (0.5);
        \draw[thick, fill=gray!50] (-0.4, 1) rectangle (0.4, 1.6);
        \draw[thick] (0, 1.6) -- (0, 2.5);
        \draw[->, very thick, zfgreen] (1, 3) -- (1, 4.2);
        \node[font=\bfseries, color=zfgreen] at (1.4, 3.6) {$F/2$};
        \node[font=\bfseries\small] at (0, 4.5) {volná};
        \node[font=\small] at (0, 0.6) {síla na polovinu};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Pevná kladka} -- jen mění \emph{směr} síly. Sílu nešetří.
    \item \textbf{Volná kladka} -- ušetří \emph{polovinu} síly. Provaz však táhneme \emph{dvakrát delší}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Nakloněná rovina}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Trojúhelník
    \draw[thick, fill=gray!20] (0, 0) -- (5, 0) -- (5, 2) -- cycle;
    % Bedna
    \draw[thick, fill=zfblue!30, rotate around={21.8:(2.5,1)}] (2.2, 1) rectangle (2.9, 1.5);
    % Šipka síly
    \draw[->, very thick, zfgreen] (4.8, 1.6) -- (3, 0.85);
    \node[font=\bfseries, color=zfgreen] at (4, 1.8) {$F$ (menší)};
    % Tíhová síla
    \draw[->, very thick, zfred] (3, 1.6) -- (3, 0.4);
    \node[font=\bfseries, color=zfred] at (3.5, 1) {$F_g$};
    % Délka
    \node[font=\small] at (2.5, -0.4) {délka rampy};
    \node[font=\small, anchor=west] at (5.05, 1) {výška};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Místo zvedání kolmo vzhůru \textbf{taháme po šikmé ploše}.
    \item Stačí \textbf{menší síla} -- ale překonáváme \textbf{delší dráhu}.
    \item Příklady: rampa pro vozíčkáře, šroub, klín, sjezdovka.
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
