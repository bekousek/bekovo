/**
 * Vloží LaTeX zápisy pro 6 podkapitol tématu Měření (6. ročník).
 * Spuštění: node scripts/_batch-mereni.mjs
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
  'mereni--delka': String.raw`
{\LARGE \bfseries Délka} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Délka} udává vzdálenost mezi dvěma body nebo rozměr tělesa.
    \item Značka: \textbf{l} (někdy \emph{s}, \emph{d}, \emph{h}).
    \item Hlavní jednotka: \textbf{metr (m)}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jednotky délky}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah k metru \\
\hline
milimetr & mm & 1 mm = 0,001 m \\
centimetr & cm & 1 cm = 0,01 m \\
decimetr & dm & 1 dm = 0,1 m \\
\textbf{metr} & \textbf{m} & 1 m \\
kilometr & km & 1 km = 1000 m \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pravítko -- nejjednodušší měřidlo}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[yellow!20] (0,0) rectangle (12,1);
    \draw[thick] (0,0) rectangle (12,1);
    \foreach \i in {0,1,...,12} {
        \draw[thick] (\i, 0.6) -- (\i, 1);
        \node[font=\small] at (\i, 0.3) {\i};
    }
    \foreach \i in {0.5,1.5,...,11.5} {
        \draw[thick] (\i, 0.75) -- (\i, 1);
    }
    \node[font=\small\bfseries] at (12.7, 0.5) {cm};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měřidla délky}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Měřidlo & \bfseries Použití \\
\hline
pravítko & krátké délky (do 30 cm), papír, sešit \\
skládací metr & délky kolem 1--2 m, řemeslnické práce \\
svinovací metr & délky až 10 m, stavby, místnosti \\
krejčovský metr & ohebné měření postavy, oblečení \\
posuvné měřítko & velmi přesné měření malých rozměrů (mm) \\
laserový dálkoměr & vzdálenosti místností, staveb \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Postup měření}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Vyber vhodné měřidlo (podle velikosti tělesa).
    \item Polož měřidlo \textbf{rovně} k tělesu, začni od nuly.
    \item Odečti hodnotu \textbf{kolmo shora}.
    \item Vždy uveď \textbf{číslo i jednotku} (např. $l = 12{,}5$ cm).
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady velikostí}
\vspace{2mm}

\begin{itemize}
    \item Tloušťka vlasu: $\sim$ 0,1 mm. Délka mravence: $\sim$ 5 mm.
    \item Délka tužky: 15 cm. Výška dveří: 2 m.
    \item Délka fotbalového hřiště: 100 m. Vzdálenost Praha--Brno: 200 km.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mereni--objem': String.raw`
{\LARGE \bfseries Objem} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Objem} udává, kolik místa těleso zaujímá v prostoru.
    \item Značka: \textbf{V} (z anglického \emph{volume}).
    \item Hlavní jednotka: \textbf{krychlový metr (m$^3$)}, často také \textbf{litr (l)}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jednotky objemu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah \\
\hline
mililitr & ml & 1 ml = 1 cm$^3$ \\
\textbf{litr} & \textbf{l} & 1 l = 1 dm$^3$ = 1000 ml \\
hektolitr & hl & 1 hl = 100 l \\
krychlový metr & m$^3$ & 1 m$^3$ = 1000 l \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pamatuj:} \quad 1 dm$^3$ = 1 litr \quad $|$ \quad 1 cm$^3$ = 1 ml \quad $|$ \quad 1 m$^3$ = 1000 l
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měření objemu kapaliny}
\vspace{2mm}

\noindent
Kapalinu naléváme do \textbf{odměrného válce}. Hladinu odečítáme \textbf{kolmo zboku}.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Odměrný válec
    \draw[thick] (0,0) -- (0,5) (1.5,0) -- (1.5,5) (0,0) -- (1.5,0);
    \fill[cyan!30] (0.05, 0.02) rectangle (1.45, 3);
    \draw[cyan!70!black, thick] (0.05, 3) -- (1.45, 3);

    % Stupnice
    \foreach \y/\v in {0.5/50, 1/100, 1.5/150, 2/200, 2.5/250, 3/300, 3.5/350, 4/400, 4.5/450} {
        \draw[thick] (1.4, \y) -- (1.5, \y);
        \node[font=\scriptsize, anchor=west] at (1.55, \y) {\v};
    }
    \node[font=\small, anchor=west] at (1.55, 5) {ml};

    % Šipka
    \draw[->, very thick, zfred] (-1.5, 3) -- (-0.1, 3);
    \node[font=\bfseries, color=zfred, anchor=east] at (-1.5, 3) {300 ml};

    % Popis
    \node[font=\small] at (0.75, -0.5) {odměrný válec};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měření objemu pevného tělesa}
\vspace{2mm}

\begin{itemize}
    \item Pravidelné těleso (krychle, kvádr) -- spočítáme ze vzorce ($V = a \cdot b \cdot c$).
    \item Nepravidelné těleso -- ponoříme ho do vody v odměrném válci.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Před ponořením
    \draw[thick] (0,0) -- (0,4) (1.3,0) -- (1.3,4) (0,0) -- (1.3,0);
    \fill[cyan!30] (0.05, 0.02) rectangle (1.25, 2);
    \draw[cyan!70!black, thick] (0.05, 2) -- (1.25, 2);
    \node[font=\bfseries\small] at (0.65, -0.5) {V$_1$ = 200 ml};

    % Šipka
    \draw[->, very thick] (1.8, 2) -- (3.2, 2);
    \node[font=\small] at (2.5, 2.4) {ponoříme};

    % Po ponoření
    \begin{scope}[shift={(3.7,0)}]
        \draw[thick] (0,0) -- (0,4) (1.3,0) -- (1.3,4) (0,0) -- (1.3,0);
        \fill[cyan!30] (0.05, 0.02) rectangle (1.25, 2.6);
        \draw[cyan!70!black, thick] (0.05, 2.6) -- (1.25, 2.6);
        \fill[gray!60] (0.4, 0.5) rectangle (0.9, 1.2);
        \draw[thick] (0.4, 0.5) rectangle (0.9, 1.2);
        \node[font=\bfseries\small] at (0.65, -0.5) {V$_2$ = 260 ml};
    \end{scope}

    \node[font=\bfseries, color=zfred, anchor=west] at (5.7, 2) {V$_{tělesa}$ = V$_2$ -- V$_1$};
    \node[font=\bfseries, color=zfred, anchor=west] at (5.7, 1.4) {= 60 ml = 60 cm$^3$};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady objemů}
\vspace{2mm}

\begin{itemize}
    \item Lžička: 5 ml. Sklenice: 250 ml. Litrová láhev: 1 l = 1000 ml.
    \item Kbelík: 10 l. Vana: 200 l. Bazén ($5 \times 2 \times 1$ m): 10 m$^3$ = 10 000 l.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mereni--hmotnost': String.raw`
{\LARGE \bfseries Hmotnost} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Hmotnost} udává, kolik látky těleso obsahuje.
    \item Značka: \textbf{m}. Hlavní jednotka: \textbf{kilogram (kg)}.
    \item Hmotnost \textbf{není totéž co váha} -- váha je síla, kterou těleso působí na podložku.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jednotky hmotnosti}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah \\
\hline
miligram & mg & 1 mg = 0,001 g \\
gram & g & 1 g = 0,001 kg \\
dekagram & dkg & 1 dkg = 10 g \\
\textbf{kilogram} & \textbf{kg} & 1 kg = 1000 g \\
tuna & t & 1 t = 1000 kg \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měřidla hmotnosti -- váhy}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Rovnoramenná váha
    \draw[thick] (-2, 0) -- (2, 0);
    \draw[thick] (0, 0) -- (0, 1.2);
    \draw[thick] (-0.3, 1.2) -- (0.3, 1.2) -- (0, 1.5) -- cycle;
    \fill[gray!30] (-2.4, -0.3) -- (-1.6, -0.3) -- (-1.7, 0) -- (-2.3, 0) -- cycle;
    \fill[gray!30] (1.6, -0.3) -- (2.4, -0.3) -- (2.3, 0) -- (1.7, 0) -- cycle;
    \draw[thick] (-2.4, -0.3) -- (-1.6, -0.3) -- (-1.7, 0) -- (-2.3, 0) -- cycle;
    \draw[thick] (1.6, -0.3) -- (2.4, -0.3) -- (2.3, 0) -- (1.7, 0) -- cycle;
    \draw[thick] (-2, 0) -- (-2.3, 0) (-2, 0) -- (-1.7, 0);
    \draw[thick] (2, 0) -- (2.3, 0) (2, 0) -- (1.7, 0);
    \draw[thick] (-0.5, -0.5) -- (0.5, -0.5);
    \draw[thick] (-0.4, -0.5) -- (-0.4, -0.7) (0.4, -0.5) -- (0.4, -0.7);
    \node[font=\bfseries\small] at (-2, -0.7) {těleso};
    \node[font=\bfseries\small] at (2, -0.7) {závaží};
    \node[font=\small] at (3.5, 0) {rovnoramenná};

    % Digitální váha
    \begin{scope}[shift={(7,0)}]
        \draw[thick, fill=gray!20] (-1.2, -0.4) rectangle (1.2, 0.4);
        \draw[thick, fill=zfgreen!30] (-0.7, -0.2) rectangle (0.7, 0.2);
        \node[font=\bfseries] at (0, 0) {1{,}235 kg};
        \draw[thick, fill=gray!10] (-1.5, 0.4) rectangle (1.5, 0.7);
        \node[font=\small] at (0, -0.7) {digitální};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Druhy vah}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Použití \\
\hline
rovnoramenná váha & laboratoř, přesné měření, závaží \\
kuchyňská váha & vážení potravin, doma \\
osobní váha & vážení člověka \\
laboratorní (digitální) & velmi přesné, na desetiny gramu \\
mostní váha & nákladní auta, vagóny \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Postup vážení}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Postav váhu na rovnou plochu.
    \item Vynuluj váhu (digitální: tlačítko \textbf{TARE}).
    \item Polož těleso na váhu.
    \item Odečti hodnotu, zapiš číslo i jednotku ($m = 1{,}2$ kg).
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady hmotností}
\vspace{2mm}

\begin{itemize}
    \item Pero: 5 g. Tabulka čokolády: 100 g. Mléko v krabici: 1 kg.
    \item Žák ZŠ: 30--50 kg. Dospělý: 60--90 kg. Auto: 1--2 t. Slon: 5 t.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mereni--hustota': String.raw`
{\LARGE \bfseries Hustota} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Hustota} udává, jak je látka \uv{natěsno}. Říká, kolik váží 1 m$^3$ (nebo 1 cm$^3$) látky.
    \item Značka: \textbf{$\rho$} (řecké písmeno \emph{ró}).
    \item Hlavní jednotka: \textbf{kg/m$^3$}, často také \textbf{g/cm$^3$}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec pro hustotu}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $\rho = \dfrac{m}{V}$ \quad\quad m \,=\, hmotnost (kg),\quad V \,=\, objem (m$^3$)
\end{center}
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item Spočítáme ji jako \textbf{hmotnost dělenou objemem}.
    \item Hustota je \textbf{vlastnost látky} -- nemění se s velikostí tělesa.
    \item 1 cm$^3$ železa a 100 cm$^3$ železa mají \textbf{stejnou hustotu}, ale jiné hmotnosti.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Hustoty běžných látek}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Látka & \bfseries kg/m$^3$ & \bfseries g/cm$^3$ \\
\hline
vzduch & 1{,}3 & 0{,}0013 \\
korek & 240 & 0{,}24 \\
led & 920 & 0{,}92 \\
\textbf{voda} & \textbf{1000} & \textbf{1{,}0} \\
hliník & 2700 & 2{,}7 \\
železo & 7800 & 7{,}8 \\
měď & 8900 & 8{,}9 \\
zlato & 19\,300 & 19{,}3 \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Co plave a co klesne?}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Plave:} látka s \textbf{menší} hustotou než voda. \\
\textbf{Klesne:} látka s \textbf{větší} hustotou než voda.
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádrž s vodou
    \draw[thick] (0,0) -- (0,3) (6,0) -- (6,3) (0,0) -- (6,0);
    \fill[cyan!30] (0.05, 0.02) rectangle (5.95, 2.2);
    \draw[cyan!70!black, thick] (0.05, 2.2) -- (5.95, 2.2);

    % Korek (plave)
    \fill[orange!70] (0.5, 1.95) rectangle (1.3, 2.3);
    \draw[thick] (0.5, 1.95) rectangle (1.3, 2.3);
    \node[font=\scriptsize] at (0.9, 2.55) {korek};

    % Led (z větší části pod hladinou)
    \fill[white] (2, 1.7) rectangle (2.8, 2.35);
    \draw[thick] (2, 1.7) rectangle (2.8, 2.35);
    \node[font=\scriptsize] at (2.4, 2.55) {led};

    % Železo (kleslo)
    \fill[gray!60] (4.5, 0.1) rectangle (5.3, 0.6);
    \draw[thick] (4.5, 0.1) rectangle (5.3, 0.6);
    \node[font=\scriptsize] at (4.9, 0.8) {železo};

    \node[font=\bfseries, color=cyan!50!black] at (3, -0.4) {voda ($\rho$ = 1000 kg/m$^3$)};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad výpočtu}
\vspace{2mm}

\noindent
\textbf{Zadání:} Kostka železa má objem 100 cm$^3$ a hmotnost 780 g. Jaká je hustota?

\vspace{1mm}
\noindent
\textbf{Řešení:} \quad $\rho = \dfrac{m}{V} = \dfrac{780~\text{g}}{100~\text{cm}^3} = 7{,}8~\text{g/cm}^3$
\vspace{1mm}

\noindent
\textbf{Odpověď:} Hustota železa je 7,8 g/cm$^3$ (= 7800 kg/m$^3$).
`,

  // ─────────────────────────────────────────────────────────────────────
  'mereni--cas': String.raw`
{\LARGE \bfseries Čas} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Čas} udává trvání děje nebo okamžik, kdy se něco stalo.
    \item Značka: \textbf{t}. Hlavní jednotka: \textbf{sekunda (s)}.
    \item Čas \textbf{plyne stále stejně} -- nedá se zastavit ani vrátit.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jednotky času}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Značka & \bfseries Vztah \\
\hline
\textbf{sekunda} & \textbf{s} & základní jednotka \\
minuta & min & 1 min = 60 s \\
hodina & h & 1 h = 60 min = 3600 s \\
den & d & 1 d = 24 h = 86\,400 s \\
rok & r & 1 r $\approx$ 365 d \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pamatuj převody:} \quad 1 min = 60 s \quad $|$ \quad 1 h = 60 min \quad $|$ \quad 1 h = 3600 s
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měřidla času}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Hodiny analogové
    \draw[thick] (0,0) circle (1.2);
    \foreach \i in {1,...,12} {
        \node[font=\scriptsize] at ({90-\i*30}:1) {\i};
    }
    \draw[thick, zfblue] (0,0) -- (0.4, 0.6); % hodinová
    \draw[thick, zfred] (0,0) -- (-0.7, 0.5); % minutová
    \fill[black] (0,0) circle (0.07);
    \node[font=\small] at (0, -1.6) {analogové hodiny};

    % Digitální hodiny
    \begin{scope}[shift={(4.5,0)}]
        \draw[thick, fill=black!85] (-1.2, -0.5) rectangle (1.2, 0.5);
        \node[font=\bfseries\Large, color=zfgreen!50!white] at (0, 0) {12:34};
        \node[font=\small] at (0, -1.1) {digitální hodiny};
    \end{scope}

    % Stopky
    \begin{scope}[shift={(9,0)}]
        \draw[thick, fill=zfgray] (0,0) circle (1);
        \draw[thick] (0,0) circle (0.95);
        \draw[thick, fill=black!90] (-0.15, 0.95) rectangle (0.15, 1.15);
        \node[font=\bfseries\small] at (0, 0) {0:15{,}3};
        \node[font=\small] at (0, -1.4) {stopky};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Druhy hodin v historii}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Hodiny & \bfseries Princip \\
\hline
sluneční & stín ukazuje hodinu, jen ve dne \\
přesýpací & sypání písku za daný čas \\
vodní & vytékání vody z nádoby \\
mechanické & pohyb ozubených kol \\
křemenné (quartz) & kmitání krystalu křemene \\
atomové & nejpřesnější dnešní hodiny \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady časových úseků}
\vspace{2mm}

\begin{itemize}
    \item Mrknutí oka: 0,3 s. Stisk klávesy: 0,1 s.
    \item Vyučovací hodina: 45 min. Spánek: 8 h. Jeden školní den: 6 h.
    \item Den: 24 h = 86\,400 s. Rok: $\sim$ 365 dní. Lidský život: 70--90 let.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad převodu}
\vspace{2mm}

\noindent
\textbf{Kolik sekund je 2 h 15 min?}
\vspace{1mm}

\noindent
$2$ h $= 2 \cdot 3600 = 7200$ s,\quad $15$ min $= 15 \cdot 60 = 900$ s
\vspace{1mm}

\noindent
\textbf{Celkem:} $7200 + 900 = 8100$ s.
`,

  // ─────────────────────────────────────────────────────────────────────
  'mereni--teplota': String.raw`
{\LARGE \bfseries Teplota} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Teplota} udává, jak je něco teplé nebo studené.
    \item Značka: \textbf{t}. Hlavní jednotka u nás: \textbf{stupeň Celsia ($^\circ$C)}.
    \item Vědecká jednotka: \textbf{kelvin (K)}. V USA se používá Fahrenheit ($^\circ$F).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stupeň Celsia ($^\circ$C)}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item \textbf{0\,$^\circ$C} -- voda mrzne (taje led).
    \item \textbf{100\,$^\circ$C} -- voda vře (mění se na páru) -- za normálního tlaku.
\end{itemize}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Teploměr -- jak vypadá}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tělo teploměru
    \draw[thick, fill=zfgray] (0, 0) circle (0.4);
    \draw[thick, fill=zfgray] (-0.15, 0.2) -- (-0.15, 5) -- (0.15, 5) -- (0.15, 0.2) -- cycle;

    % Sloupec rtuti
    \fill[zfred] (0,0) circle (0.35);
    \fill[zfred] (-0.1, 0.2) rectangle (0.1, 3);
    \draw[thick] (-0.15, 5) arc (-180:0:0.15);

    % Stupnice
    \foreach \y/\v in {0.5/-30, 1/-20, 1.5/-10, 2/0, 2.5/10, 3/20, 3.5/30, 4/40, 4.5/50} {
        \draw[thick] (0.18, \y) -- (0.32, \y);
        \node[font=\scriptsize, anchor=west] at (0.4, \y) {\v};
    }
    \node[font=\small\bfseries, anchor=west] at (0.4, 5) {$^\circ$C};

    % Šipka aktuální teplota
    \draw[->, thick, zfblue] (-1.5, 3) -- (-0.2, 3);
    \node[font=\bfseries, color=zfblue, anchor=east] at (-1.5, 3) {20\,$^\circ$C};

    % Anotace
    \node[font=\small, anchor=west] at (1.6, 4) {kapalný sloupec};
    \node[font=\small, anchor=west] at (1.6, 3.5) {(rtuť, líh, alkohol)};
    \node[font=\small, anchor=west] at (1.6, 0.4) {nádržka};
    \node[font=\small, anchor=west] at (1.6, -0.1) {s teploměrnou kapalinou};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Druhy teploměrů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Teploměr & \bfseries Použití \\
\hline
lihový & venkovní teploty, pokoj, $-30$ až $80\,^\circ$C \\
lékařský & teplota těla (35--42\,$^\circ$C) \\
digitální & rychlé a přesné měření, displej \\
bimetalový & trouby, spotřebiče \\
infračervený (bezdotykový) & na dálku, povrchová teplota \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Postup měření}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Teploměr ponoř do látky tak, aby se nedotýkal stěn nádoby.
    \item Počkej, než se sloupec ustálí (cca 1--2 minuty).
    \item Odečti hodnotu \textbf{kolmo}, ve výšce hladiny kapaliny.
    \item Zapiš číslo i jednotku ($t = 23\,^\circ$C).
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady teplot}
\vspace{2mm}

\begin{itemize}
    \item Mrazák: $-18\,^\circ$C. Lednička: $5\,^\circ$C. Chladná voda z kohoutku: $10\,^\circ$C.
    \item Pokojová teplota: $20$--$22\,^\circ$C. Tělesná teplota: $36{,}5\,^\circ$C. Horečka: nad $38\,^\circ$C.
    \item Voda v lázni: $37\,^\circ$C. Var vody: $100\,^\circ$C. Plamen svíčky: $\sim$ $1000\,^\circ$C.
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
  console.log(`✓ ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zápisů vloženo.`);
