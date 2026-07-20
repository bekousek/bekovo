/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Mechanika (8. ročník).
 * Spuštění: node scripts/_batch-mechanika.mjs
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
  'mechanika--prace': String.raw`
{\LARGE \bfseries Mechanická práce} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Mechanická práce} se koná, když na těleso působí síla a těleso se po této síle pohne.
    \item Značka: \textbf{W} (z anglického \emph{work}). Jednotka: \textbf{joule (J)}.
    \item 1 J = práce vykonaná silou 1 N na dráze 1 m.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec pro práci}
\vspace{2mm}

\noindent
\begin{minipage}[c]{0.5\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $W = F \cdot s$
\end{center}
\end{tcolorbox}
\begin{itemize}
    \item \textbf{W} -- práce (J)
    \item \textbf{F} -- síla (N)
    \item \textbf{s} -- dráha ve směru síly (m)
\end{itemize}
\end{minipage}\hfill
\begin{minipage}[c]{0.45\textwidth}
\begin{center}
\begin{tikzpicture}[scale=0.8]
    \draw[thick] (0,0) -- (4,0) -- (2, 3.4) -- cycle;
    \draw[thick] (1.05, 1.7) -- (2.95, 1.7);
    \draw[thick] (2, 0) -- (2, 1.7);
    \node[font=\Large\bfseries, color=zfblue] at (2, 2.4) {$W$};
    \node[font=\Large\bfseries, color=zfred] at (1.5, 0.85) {$F$};
    \node[font=\Large\bfseries, color=zfgreen] at (2.5, 0.85) {$s$};
\end{tikzpicture}\\[1mm]
{\scriptsize zakryj veličinu, kterou hledáš}
\end{center}
\end{minipage}

\vspace{2mm}
\noindent
\textbf{Pozn.:} Vzorec platí, když síla \textbf{působí ve směru pohybu}.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Kdy se práce koná}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Zvedání knihy
    \draw[thick, fill=zfred!40] (0, 0) rectangle (0.6, 0.2);
    \draw[->, ultra thick, zfgreen] (0.3, 0.3) -- (0.3, 1.8);
    \node[font=\bfseries\small, color=zfgreen] at (0.9, 1) {$F$};
    \draw[<->, thick, dashed] (-0.3, 0) -- (-0.3, 2);
    \node[font=\small] at (-0.7, 1) {$s$};
    \node[font=\bfseries\small] at (0.3, -0.5) {koná práci};

    % Držení knihy (síla, ale dráha = 0)
    \begin{scope}[shift={(4, 0)}]
        \draw[thick, fill=zfred!40] (0, 0.8) rectangle (0.6, 1.0);
        \draw[->, ultra thick, zfgreen] (0.3, 0.3) -- (0.3, 0.75);
        \node[font=\bfseries\small, color=zfgreen] at (0.9, 0.5) {$F$};
        \node[font=\bfseries\small] at (0.3, -0.5) {nekoná práci};
        \node[font=\scriptsize] at (0.3, -0.85) {(s = 0)};
    \end{scope}

    % Tažení po vodorovné dráze
    \begin{scope}[shift={(8, 0)}]
        \draw[thick, fill=gray!40] (0, 0) rectangle (1.5, 0.8);
        \draw[->, ultra thick, zfgreen] (1.5, 0.4) -- (3, 0.4);
        \node[font=\bfseries\small, color=zfgreen] at (2.25, 0.7) {$F$};
        \draw[<->, thick, dashed] (0, -0.3) -- (3, -0.3);
        \node[font=\small] at (1.5, -0.6) {$s$};
        \node[font=\bfseries\small] at (1.5, -1) {koná práci};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Práci konáme, když \textbf{působíme silou} a těleso se \textbf{pohybuje} ve směru síly.
    \item Pokud je dráha nulová ($s = 0$) -- práce je \textbf{nulová}.
    \item Pokud je síla \textbf{kolmá} na pohyb (nesení tašky vodorovně) -- práce taky nulová.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Násobky a díly joulu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah \\
\hline
milijoule & mJ & 1 mJ = 0,001 J \\
\textbf{joule} & \textbf{J} & základní \\
kilojoule & kJ & 1 kJ = 1000 J \\
megajoule & MJ & 1 MJ = 1\,000\,000 J \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady}
\vspace{2mm}

\noindent
\textbf{Příklad 1:} Žák zvedne knihu (1 kg) o 2 m vzhůru. Jakou práci vykonal?

\smallskip
\noindent
\textbf{Zápis:}\\
$m = 1$ kg\\
$s = 2$ m\\
$g = 10$ N/kg\\
$W = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $F = m \cdot g$, \quad $W = F \cdot s$

\smallskip
\noindent
\textbf{Dosazení:}\\
$F = 1~\text{kg} \cdot 10~\text{N/kg} = 10$ N\\
$W = 10~\text{N} \cdot 2~\text{m} = 20$ J

\smallskip
\noindent
\textbf{Odpověď:} Žák vykonal práci 20 J.

\vspace{4mm}
\noindent
\textbf{Příklad 2:} Tažením vozíku silou 50 N po dráze 8 m. Jaká byla vykonaná práce?

\smallskip
\noindent
\textbf{Zápis:}\\
$F = 50$ N\\
$s = 8$ m\\
$W = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $W = F \cdot s$

\smallskip
\noindent
\textbf{Dosazení:} \quad $W = 50~\text{N} \cdot 8~\text{m} = 400$ J

\smallskip
\noindent
\textbf{Odpověď:} Práce vykonaná silou je 400 J.

\vspace{4mm}
\noindent
\textbf{Příklad 3:} Žák (40 kg) vyběhne do druhého patra (6 m). Jakou práci vykonal proti tíze?

\smallskip
\noindent
\textbf{Zápis:}\\
$m = 40$ kg\\
$s = 6$ m\\
$g = 10$ N/kg\\
$W = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $F = m \cdot g$, \quad $W = F \cdot s$

\smallskip
\noindent
\textbf{Dosazení:}\\
$F = 40~\text{kg} \cdot 10~\text{N/kg} = 400$ N\\
$W = 400~\text{N} \cdot 6~\text{m} = 2\,400$ J $= 2{,}4$ kJ

\smallskip
\noindent
\textbf{Odpověď:} Žák vykonal práci 2,4 kJ.
`,

  // ─────────────────────────────────────────────────────────────────────
  'mechanika--prace-na-jednoduchych-strojich': String.raw`
{\LARGE \bfseries Práce na jednoduchých strojích} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Jednoduchý stroj nám pomáhá konat práci s \textbf{menší silou}.
    \item Co ušetříme na síle, musíme přidat na \textbf{dráze} -- to je \textbf{zlaté pravidlo mechaniky}.
    \item Celková \textbf{práce zůstává stejná} (v ideálním případě).
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Zlaté pravidlo mechaniky:} \quad $F_1 \cdot s_1 = F_2 \cdot s_2$
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Páka}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[ultra thick] (0, 1.2) -- (6, 1.2);
    \draw[thick, fill=gray!40] (3.7, 0) -- (4.3, 0) -- (4, 1.2) -- cycle;
    \draw[thick, fill=gray!50] (4.3, 1.25) rectangle (5.7, 1.85);
    \draw[->, very thick, zfred] (5, 1.85) -- (5, 2.6);
    \node[font=\bfseries, color=zfred] at (5, 2.85) {$F_2$};
    \draw[->, very thick, zfgreen] (1, 1.85) -- (1, 0.6);
    \node[font=\bfseries, color=zfgreen] at (1, 2.15) {$F_1$};
    \draw[<->, thick, dashed] (0, -0.3) -- (4, -0.3);
    \node[font=\small] at (2, -0.6) {rameno $a_1$};
    \draw[<->, thick, dashed] (4, -0.3) -- (5.7, -0.3);
    \node[font=\small] at (4.85, -0.6) {rameno $a_2$};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Rovnováha páky:} \quad $F_1 \cdot a_1 = F_2 \cdot a_2$
    \item Příklady: nůžky, kladívko, dveře, kolíbka, lopata, otvírák.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pevná a volná kladka}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    \draw[thick] (0, 2) circle (0.5);
    \draw[thick] (-0.5, 2) -- (-0.5, 0);
    \draw[thick] (0.5, 2) -- (0.5, 0);
    \draw[thick, fill=gray!50] (-0.6, -0.6) rectangle (0.6, 0);
    \node[font=\scriptsize, color=white] at (0, -0.3) {1 kg};
    \draw[->, very thick, zfgreen] (0.5, 0) -- (0.5, -1.5);
    \node[font=\bfseries, color=zfgreen] at (0.95, -0.8) {$F = 10$ N};
    \node[font=\bfseries\small] at (0, 2.9) {pevná kladka};
    \node[font=\scriptsize] at (0, 3.4) {$F_1 = F_2$, jen mění směr};

    \begin{scope}[shift={(5, 0)}]
        \draw[thick] (-1, 3.5) -- (-1, 2);
        \draw[thick] (1, 3.5) -- (1, 2);
        \draw[thick] (0, 2) circle (0.5);
        \draw[thick, fill=gray!50] (-0.4, 1) rectangle (0.4, 1.6);
        \node[font=\scriptsize, color=white] at (0, 1.3) {1 kg};
        \draw[thick] (0, 1.6) -- (0, 2.5);
        \draw[->, very thick, zfgreen] (1, 3.5) -- (1, 4.5);
        \node[font=\bfseries, color=zfgreen] at (1.6, 4) {$F = 5$ N};
        \node[font=\bfseries\small] at (0, 5.1) {volná kladka};
        \node[font=\scriptsize] at (0, 4.7) {$F_1 = F_2 / 2$, ale 2$\times$ delší dráha};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Pevná kladka} -- síla stejná, jen \emph{mění směr}. Práce stejná.
    \item \textbf{Volná kladka} -- ušetří \emph{polovinu} síly. Provaz se však táhne \emph{dvakrát delší}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Nakloněná rovina}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=gray!20] (0, 0) -- (5, 0) -- (5, 1.5) -- cycle;
    \draw[thick, fill=zfblue!30, rotate around={16.7:(2.5,0.75)}] (2.2, 0.75) rectangle (2.9, 1.2);
    \draw[->, very thick, zfgreen] (4.5, 1.4) -- (3, 0.7);
    \node[font=\bfseries, color=zfgreen] at (4.7, 1.7) {$F_1$};
    \draw[->, very thick, zfred] (5.4, 1.5) -- (5.4, 0.4);
    \node[font=\bfseries, color=zfred] at (6, 1) {$F_g$};
    \draw[<->, thick, dashed] (0, -0.3) -- (5, -0.3);
    \node[font=\small] at (2.5, -0.6) {délka rampy $s_1$};
    \draw[<->, thick, dashed] (5.7, 0) -- (5.7, 1.5);
    \node[font=\small, anchor=west] at (5.85, 0.75) {výška $s_2$};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Místo zvedání kolmo vzhůru \textbf{taháme po šikmé ploše}.
    \item Pravidlo: $F_1 \cdot s_1 = F_g \cdot s_2$ (síla na rampě $\times$ délka rampy = tíha $\times$ výška).
    \item Příklady: rampa pro vozíčkáře, sjezdovka, šroub, klín, sekera.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad výpočtu}
\vspace{2mm}

\noindent
\textbf{Příklad:} Bednu o tíze 200 N vytáhneme po nakloněné rovině dlouhé 4 m do výšky 1 m. Jakou silou musíme táhnout?

\smallskip
\noindent
\textbf{Zápis:}\\
$F_g = 200$ N\\
$s_1 = 4$ m (délka rampy)\\
$s_2 = 1$ m (výška)\\
$F_1 = ?$ N

\smallskip
\noindent
\textbf{Vzorec:} \quad $F_1 \cdot s_1 = F_g \cdot s_2 \quad\Rightarrow\quad F_1 = \dfrac{F_g \cdot s_2}{s_1}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $F_1 = \dfrac{200~\text{N} \cdot 1~\text{m}}{4~\text{m}} = 50$ N

\smallskip
\noindent
\textbf{Odpověď:} Stačí síla 50 N (místo 200 N bez rampy).
`,

  // ─────────────────────────────────────────────────────────────────────
  'mechanika--vykon': String.raw`
{\LARGE \bfseries Výkon} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Výkon} udává, jak \textbf{rychle} se práce vykonává.
    \item Značka: \textbf{P} (z angl. \emph{power}). Jednotka: \textbf{watt (W)}.
    \item 1 W = výkon, kterým se za 1 sekundu vykoná 1 J práce.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec}
\vspace{2mm}

\noindent
\begin{minipage}[c]{0.5\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $P = \dfrac{W}{t}$
\end{center}
\end{tcolorbox}
\begin{itemize}
    \item \textbf{P} -- výkon (W)
    \item \textbf{W} -- vykonaná práce (J)
    \item \textbf{t} -- doba, za kterou se vykonala (s)
\end{itemize}
\end{minipage}\hfill
\begin{minipage}[c]{0.45\textwidth}
\begin{center}
\begin{tikzpicture}[scale=0.8]
    \draw[thick] (0,0) -- (4,0) -- (2, 3.4) -- cycle;
    \draw[thick] (1.05, 1.7) -- (2.95, 1.7);
    \draw[thick] (2, 0) -- (2, 1.7);
    \node[font=\Large\bfseries, color=zfblue] at (2, 2.4) {$W$};
    \node[font=\Large\bfseries, color=zfred] at (1.5, 0.85) {$P$};
    \node[font=\Large\bfseries, color=zfgreen] at (2.5, 0.85) {$t$};
\end{tikzpicture}\\[1mm]
{\scriptsize zakryj veličinu, kterou hledáš}
\end{center}
\end{minipage}

\vspace{2mm}
\noindent
\textbf{Pozn.:} 1 W = 1 J/s.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Násobky wattu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah \\
\hline
miliwatt & mW & 1 mW = 0,001 W \\
\textbf{watt} & \textbf{W} & základní \\
kilowatt & kW & 1 kW = 1000 W \\
megawatt & MW & 1 MW = 1\,000\,000 W \\
koňská síla (stará) & k & 1 k $\approx$ 736 W \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady výkonu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Zařízení & \bfseries Výkon \\
\hline
LED žárovka & 6--12 W \\
běžná žárovka & 60 W \\
počítač (stolní) & 200--500 W \\
mikrovlnka & 800--1\,000 W \\
varná konvice & 2\,000 W = 2 kW \\
fén na vlasy & 1\,500--2\,200 W \\
osobní auto (motor) & 80\,000 W = 80 kW (110 k) \\
malá elektrárna & 1\,000\,000 W = 1 MW \\
jaderná elektrárna Temelín & 2\,000 MW = 2 GW \\
Slunce & 380 ZW (zettawattů) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Lidský výkon}
\vspace{2mm}

\begin{itemize}
    \item Při klidné chůzi: asi \textbf{50--100 W}.
    \item Při běhu nebo jízdě na kole: \textbf{200--400 W}.
    \item Vrcholový sportovec krátkodobě: \textbf{až 1\,500 W}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady}
\vspace{2mm}

\noindent
\textbf{Příklad 1:} Žák vykonal práci 1\,200 J za 60 s. Jaký byl jeho výkon?

\smallskip
\noindent
\textbf{Zápis:}\\
$W = 1\,200$ J\\
$t = 60$ s\\
$P = ?$ W

\smallskip
\noindent
\textbf{Vzorec:} \quad $P = \dfrac{W}{t}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $P = \dfrac{1\,200~\text{J}}{60~\text{s}} = 20$ W

\smallskip
\noindent
\textbf{Odpověď:} Žák měl výkon 20 W.

\vspace{4mm}
\noindent
\textbf{Příklad 2:} Žárovka má výkon 60 W. Kolik práce vykoná za 1 hodinu?

\smallskip
\noindent
\textbf{Zápis:}\\
$P = 60$ W\\
$t = 1$ h $= 3\,600$ s\\
$W = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $W = P \cdot t$

\smallskip
\noindent
\textbf{Dosazení:} \quad $W = 60~\text{W} \cdot 3\,600~\text{s} = 216\,000$ J $= 216$ kJ

\smallskip
\noindent
\textbf{Odpověď:} Žárovka vykoná za hodinu práci 216 kJ.

\vspace{4mm}
\noindent
\textbf{Příklad 3:} Jeřáb má výkon 5 kW. Jak dlouho trvá zvednutí břemene s prací 100 kJ?

\smallskip
\noindent
\textbf{Zápis:}\\
$P = 5$ kW $= 5\,000$ W\\
$W = 100$ kJ $= 100\,000$ J\\
$t = ?$ s

\smallskip
\noindent
\textbf{Vzorec:} \quad $t = \dfrac{W}{P}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $t = \dfrac{100\,000~\text{J}}{5\,000~\text{W}} = 20$ s

\smallskip
\noindent
\textbf{Odpověď:} Jeřáb zvedne břemeno za 20 sekund.

\vspace{3mm}
{\Large \bfseries \color{zfblue} Energie a kilowatthodina}
\vspace{2mm}

\begin{itemize}
    \item Doma platíme za \textbf{spotřebovanou elektrickou energii}.
    \item Jednotka: \textbf{kilowatthodina (kWh)} = výkon 1 kW po dobu 1 hodiny.
    \item 1 kWh = 3\,600\,000 J = 3,6 MJ.
    \item Žárovka 100 W svítící 10 hodin spotřebuje 1 kWh.
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
