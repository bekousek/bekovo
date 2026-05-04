/**
 * Vloží LaTeX zápisy pro 5 podkapitol tématu Kapaliny (7. ročník).
 * vztlakova-sila už má svůj zápis a zde se vynechává.
 * Spuštění: node scripts/_batch-kapaliny-7.mjs
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
\usetikzlibrary{calc,arrows.meta,patterns,decorations.pathmorphing}
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
  'kapaliny-7--tlak': String.raw`
{\LARGE \bfseries Tlak} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Tlak} udává, jakou silou se působí na 1 m$^2$ plochy.
    \item Značka: \textbf{p}. Jednotka: \textbf{pascal (Pa)}.
    \item 1 Pa = 1 N na 1 m$^2$ = velmi malý tlak. Často používáme \textbf{kPa, MPa, hPa}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec pro tlak}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $p = \dfrac{F}{S}$ \quad\quad
$F = p \cdot S$ \quad\quad
$S = \dfrac{F}{p}$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{F} -- tlaková síla (N), \textbf{S} -- plocha (m$^2$).
    \item Stejná síla na \textbf{menší ploše} = \textbf{větší} tlak.
    \item Stejná síla na \textbf{větší ploše} = \textbf{menší} tlak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Velký a malý tlak}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Hřebík
    \fill[gray!50] (0, 1.5) rectangle (0.6, 1.7);
    \fill[gray!60] (0.25, 0) -- (0.35, 0) -- (0.4, 1.5) -- (0.2, 1.5) -- cycle;
    \draw[thick] (0, 1.5) rectangle (0.6, 1.7);
    \draw[thick] (0.25, 0) -- (0.35, 0) -- (0.4, 1.5) -- (0.2, 1.5) -- cycle;
    \draw[->, ultra thick, zfred] (0.3, 2.4) -- (0.3, 1.8);
    \node[font=\bfseries, color=zfred] at (0.3, 2.7) {$F$};
    \node[font=\small] at (0.3, -0.4) {malá plocha};
    \node[font=\bfseries\small, color=zfred] at (0.3, -0.9) {velký tlak};

    % Bota
    \begin{scope}[shift={(4, 0)}]
        \draw[thick, fill=gray!30] (0, 0) .. controls (0, 0.4) and (0.5, 0.4) .. (1, 0.4) -- (3, 0.4) -- (3, 0) -- cycle;
        \draw[->, ultra thick, zfred] (1.5, 1.2) -- (1.5, 0.5);
        \node[font=\bfseries, color=zfred] at (1.5, 1.5) {$F$};
        \node[font=\small] at (1.5, -0.4) {velká plocha};
        \node[font=\bfseries\small, color=zfgreen] at (1.5, -0.9) {malý tlak};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Hřebík -- malá plocha hrotu $\Rightarrow$ velký tlak $\Rightarrow$ pronikne dřevem.
    \item Lyže/sněžnice -- velká plocha $\Rightarrow$ malý tlak $\Rightarrow$ neboří se do sněhu.
    \item Břitva, nože, jehly -- ostrá hrana = malá plocha = velký tlak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady tlaků}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Co & \bfseries Tlak \\
\hline
atmosférický tlak (Země) & 100\,000 Pa = 100 kPa \\
tlak v pneumatice auta & 200\,000 Pa = 200 kPa \\
tlak vody v hloubce 10 m & 100 kPa \\
tlak v hydraulickém lisu & až MPa (miliony Pa) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad}
\vspace{2mm}

\noindent
\textbf{Zadání:} Žák o hmotnosti 50 kg stojí na obou nohách. Plocha podrážek je 0,02 m$^2$. Jaký tlak působí na podlahu?

\vspace{1mm}
\noindent
\textbf{Tíhová síla:} \quad $F_g = m \cdot g = 50 \cdot 10 = 500$ N
\vspace{1mm}

\noindent
\textbf{Tlak:} \quad $p = \dfrac{F}{S} = \dfrac{500}{0{,}02} = 25\,000$ Pa = 25 kPa
`,

  // ─────────────────────────────────────────────────────────────────────
  'kapaliny-7--pascaluv-zakon': String.raw`
{\LARGE \bfseries Pascalův zákon} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pascalův zákon:} Tlak působící na uzavřenou kapalinu se přenáší \textbf{stejně do všech směrů}.
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item Objevil to francouzský vědec \textbf{Blaise Pascal} v 17. století.
    \item Platí jen pro kapaliny v \textbf{uzavřené} nádobě.
    \item Tlak působí kolmo na všechny stěny.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pokus -- děravá láhev}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Láhev
    \draw[thick] (0, 0) -- (0, 3) (3, 0) -- (3, 3) (0, 0) -- (3, 0);
    \fill[cyan!30] (0.05, 0.02) rectangle (2.95, 2.5);
    \draw[cyan!70!black, thick] (0.05, 2.5) -- (2.95, 2.5);

    % Píst
    \draw[thick, fill=gray!50] (0.05, 2.5) rectangle (2.95, 2.7);
    \draw[->, ultra thick, zfred] (1.5, 3.6) -- (1.5, 2.85);
    \node[font=\bfseries, color=zfred] at (1.5, 4) {$F$};

    % Trysky vody (rovnoměrně do stran a dolů)
    \draw[->, very thick, cyan!60!black] (3, 1.8) -- (4, 1.8);
    \draw[->, very thick, cyan!60!black] (0, 1.8) -- (-1, 1.8);
    \draw[->, very thick, cyan!60!black] (3, 1) -- (4, 1);
    \draw[->, very thick, cyan!60!black] (0, 1) -- (-1, 1);
    \draw[->, very thick, cyan!60!black] (1.5, 0) -- (1.5, -1);

    \node[font=\small, color=cyan!50!black] at (-1.4, 1.4) {voda};
    \node[font=\small, color=cyan!50!black] at (-1.4, 1) {vystřikuje};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Když na kapalinu zatlačíme pístem, voda začne vystřikovat ze všech otvorů \textbf{stejně silně}.
    \item Tlak se přenáší \textbf{všemi směry stejně}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hydraulický lis}
\vspace{2mm}

\noindent
Praktické využití Pascalova zákona. Slouží ke zvedání těžkých břemen pomocí malé síly.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Levý válec — malý
    \draw[thick] (0, 0) rectangle (1.2, 3);
    \fill[cyan!30] (0.05, 0.05) rectangle (1.15, 1.5);
    \draw[thick, fill=gray!50] (0.05, 1.5) rectangle (1.15, 1.7);
    \draw[->, ultra thick, zfred] (0.6, 2.7) -- (0.6, 1.8);
    \node[font=\bfseries, color=zfred] at (0.6, 3.2) {$F_1$};
    \node[font=\small] at (0.6, -0.4) {$S_1$ (malá)};

    % Spojovací trubice
    \draw[thick] (1.2, 0) -- (5.5, 0);
    \draw[thick] (1.2, 0.4) -- (5.5, 0.4);
    \fill[cyan!30] (1.2, 0.05) rectangle (5.5, 0.4);
    \fill[cyan!30] (1.2, 0.05) rectangle (5.5, 0.4);

    % Pravý válec — velký
    \draw[thick] (5.5, 0) rectangle (8.5, 4);
    \fill[cyan!30] (5.55, 0.05) rectangle (8.45, 1.5);
    \draw[thick, fill=gray!50] (5.55, 1.5) rectangle (8.45, 1.7);
    \draw[thick, fill=gray!60] (5.7, 1.7) rectangle (8.3, 2.3);
    \node[font=\bfseries\small, color=white] at (7, 2) {břemeno};
    \draw[->, ultra thick, zfgreen] (7, 1) -- (7, 2.6);
    \node[font=\bfseries, color=zfgreen] at (7, 3.5) {$F_2$ (velká)};
    \node[font=\small] at (7, -0.4) {$S_2$ (velká)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center} $\dfrac{F_1}{S_1} = \dfrac{F_2}{S_2}$ \quad nebo \quad $F_2 = F_1 \cdot \dfrac{S_2}{S_1}$ \end{center}
\end{tcolorbox}

\begin{itemize}
    \item Tlak v obou pístech je \textbf{stejný}.
    \item Když je pravá plocha 100$\times$ větší, lis zvětší sílu 100$\times$.
    \item Ale: levý píst musí ujet \textbf{100$\times$ delší dráhu}. Tedy v souladu se zlatým pravidlem.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady použití}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Hydraulický zvedák} v autoservisu.
    \item \textbf{Brzdy aut} -- malý tlak na pedál vyvolá velký tlak v brzdě.
    \item \textbf{Bagr, jeřáb, lis} -- pohyb ramene přes hydraulické válce.
    \item \textbf{Hydraulická hadice požárníků} -- tlak se přenáší.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'kapaliny-7--hydrostaticky-tlak': String.raw`
{\LARGE \bfseries Hydrostatický tlak} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Hydrostatický tlak} = tlak, který způsobuje samotná tíha kapaliny.
    \item Vzniká \textbf{v každé kapalině} v klidu.
    \item Čím \textbf{hlouběji}, tím \textbf{větší} tlak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $p_h = h \cdot \rho \cdot g$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{$p_h$} -- hydrostatický tlak (Pa).
    \item \textbf{h} -- hloubka pod hladinou (m).
    \item \textbf{$\rho$} -- hustota kapaliny (kg/m$^3$).
    \item \textbf{g} -- tíhové zrychlení $\approx 10$ N/kg.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tlak roste s hloubkou}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádrž
    \draw[thick] (0, 0) -- (0, 4) (5, 0) -- (5, 4) (0, 0) -- (5, 0);
    \fill[cyan!30] (0.05, 0.02) rectangle (4.95, 3.7);
    \draw[cyan!70!black, thick] (0.05, 3.7) -- (4.95, 3.7);

    % Hloubky
    \draw[thick, dashed, gray] (0, 3.7) -- (-0.4, 3.7);
    \draw[thick, dashed, gray] (0, 2.5) -- (-0.4, 2.5);
    \draw[thick, dashed, gray] (0, 1.2) -- (-0.4, 1.2);
    \draw[thick, dashed, gray] (0, 0.05) -- (-0.4, 0.05);

    \node[font=\bfseries\small, anchor=east] at (-0.5, 3.7) {h = 0};
    \node[font=\bfseries\small, anchor=east] at (-0.5, 2.5) {h = 1 m};
    \node[font=\bfseries\small, anchor=east] at (-0.5, 1.2) {h = 2 m};
    \node[font=\bfseries\small, anchor=east] at (-0.5, 0.05) {h = 3 m};

    % Tlak na různých hloubkách
    \draw[->, very thick, zfred] (5, 3.5) -- (5.6, 3.5);
    \draw[->, very thick, zfred] (5, 2.5) -- (5.9, 2.5);
    \draw[->, very thick, zfred] (5, 1.2) -- (6.4, 1.2);
    \draw[->, very thick, zfred] (5, 0.3) -- (7, 0.3);

    \node[font=\bfseries\small, color=zfred, anchor=west] at (5.7, 3.7) {0 Pa};
    \node[font=\bfseries\small, color=zfred, anchor=west] at (6, 2.5) {10 kPa};
    \node[font=\bfseries\small, color=zfred, anchor=west] at (6.5, 1.2) {20 kPa};
    \node[font=\bfseries\small, color=zfred, anchor=west] at (7.1, 0.3) {30 kPa};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Tlak \textbf{nezávisí} na tvaru ani objemu nádoby -- jen na hloubce a kapalině.
    \item V \textbf{rybníku, bazénu i úzké zkumavce} bude v hloubce 1 m stejný tlak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Místo & \bfseries Hloubka & \bfseries Tlak \\
\hline
povrch vody & 0 m & 0 Pa \\
dno bazénu & 2 m & 20 kPa \\
hluboký rybník & 10 m & 100 kPa (= 1 atm) \\
ponorka v moři & 100 m & 1\,000 kPa = 1 MPa \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kde se hydrostatický tlak projevuje}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Potápěči} -- ve velkých hloubkách obrovský tlak (musí mít speciální vybavení).
    \item \textbf{Vodárny} -- voda z výše položené nádrže teče sama dolů přes hydrostatický tlak.
    \item \textbf{Hráze a přehrady} -- u dna jsou \textbf{tlustší} (větší tlak).
    \item \textbf{Krevní tlak} -- také funguje na podobném principu.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad výpočtu}
\vspace{2mm}

\noindent
\textbf{Zadání:} Jaký je tlak na dně bazénu o hloubce 2 m?

\vspace{1mm}
\noindent
\textbf{Řešení:} \quad $p_h = h \cdot \rho \cdot g = 2 \cdot 1000 \cdot 10 = 20\,000$ Pa = 20 kPa
`,

  // ─────────────────────────────────────────────────────────────────────
  'kapaliny-7--spojene-nadoby': String.raw`
{\LARGE \bfseries Spojené nádoby} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Spojené nádoby} = dvě nebo více nádob propojených dole.
    \item Kapalina v nich má vždy \textbf{stejnou hladinu}, nezávisle na tvaru a objemu.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hladina ve stejné výšce}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádoba 1 (úzká)
    \draw[thick] (0, 0.5) -- (0, 3.5) (0.8, 0.5) -- (0.8, 3.5) (0, 0.5) -- (0.8, 0.5);
    \fill[cyan!30] (0.05, 0.55) rectangle (0.75, 2.5);
    \draw[cyan!70!black, thick] (0.05, 2.5) -- (0.75, 2.5);

    % Spojení
    \draw[thick] (0, 0.5) -- (0, 0) -- (5, 0) -- (5, 0.5);
    \draw[thick] (0.8, 0.5) -- (0.8, 0.4);
    \draw[thick] (4.2, 0.5) -- (4.2, 0.4);
    \draw[thick] (0.8, 0.4) -- (4.2, 0.4);
    \fill[cyan!30] (0.05, 0.05) rectangle (4.95, 0.5);
    \fill[cyan!30] (0.85, 0.4) rectangle (4.15, 0.5);

    % Nádoba 2 (široká)
    \draw[thick] (2, 0.5) -- (2, 3.5) (3.5, 0.5) -- (3.5, 3.5) (2, 0.5) -- (3.5, 0.5);
    \fill[cyan!30] (2.05, 0.55) rectangle (3.45, 2.5);
    \draw[cyan!70!black, thick] (2.05, 2.5) -- (3.45, 2.5);

    % Nádoba 3 (kuželová)
    \draw[thick] (4.4, 0.5) -- (5.5, 3.5) (5, 0.5) -- (6.3, 3.5);
    \fill[cyan!30] (4.43, 0.55) -- (5.4, 2.49) -- (5.85, 2.49) -- (4.95, 0.55) -- cycle;
    \draw[cyan!70!black, thick] (5.4, 2.5) -- (5.85, 2.5);

    % Hladina jako vodorovná čára
    \draw[dashed, very thick, zfred] (-0.5, 2.5) -- (6.5, 2.5);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (6.5, 2.5) {stejná výška};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pravidlo:} Hladina kapaliny je ve všech spojených nádobách \textbf{ve stejné výšce}.
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item Důvod: tlak musí být na dně všech nádob \textbf{stejný}.
    \item Stejný tlak $\Rightarrow$ stejná výška sloupce $\Rightarrow$ stejná hladina.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} U-trubice se dvěma kapalinami}
\vspace{2mm}

\noindent
Pokud má každé rameno \textbf{jinou kapalinu}, hladiny mohou být v \textbf{různých výškách}.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % U-trubice
    \draw[thick] (0, 0.5) -- (0, 3.5) (1, 0.5) -- (1, 3.5);
    \draw[thick] (3, 0.5) -- (3, 3.5) (4, 0.5) -- (4, 3.5);
    \draw[thick] (0, 0.5) arc (180:360:2);

    % Voda (hustší kapalina) — vlevo, vyšší sloupec není správný; pevně: voda více stačí
    % Jednoduší: levo voda do 2.5, pravo olej do 3.0
    \fill[cyan!50] (0.05, 0.5) rectangle (0.95, 2.4);
    \fill[orange!40] (3.05, 0.5) rectangle (3.95, 3.0);
    \fill[cyan!50] (0.05, -1.5) rectangle (3.95, 0.5);
    \fill[cyan!50] (0.95, 0.5) arc (180:360:1) -- (3.05, 0.5);

    % Hladiny
    \draw[cyan!70!black, thick] (0.05, 2.4) -- (0.95, 2.4);
    \draw[orange!70!black, thick] (3.05, 3.0) -- (3.95, 3.0);
    \draw[orange!70!black, thick] (3.05, 0.5) -- (3.95, 0.5);

    \node[font=\bfseries\small, anchor=east] at (-0.2, 2.4) {voda};
    \node[font=\bfseries\small, anchor=west] at (4.2, 3.0) {olej};
    \node[font=\scriptsize, anchor=west] at (4.2, 0.5) {(rozhraní)};

    \node[font=\small] at (2, -2) {hustota oleje $<$ hustota vody};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Lehčí kapalina (olej) má v jednom rameni \textbf{vyšší sloupec}.
    \item Tlak na dně je stejný: vyšší olej $\times$ menší hustota = nižší voda $\times$ větší hustota.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Praktické využití}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Vodovodní rozvody} -- voda v každém patře stoupá do stejné výšky.
    \item \textbf{Vodováha (libela)} -- vzduchová bublina se vždy postaví nahoru, když je vodorovně.
    \item \textbf{Plovákový splachovač} -- jakmile hladina v nádržce dosáhne plováku, voda se zastaví.
    \item \textbf{Konvička na čaj} -- výška vody v hubici je stejná jako uvnitř nádobky.
    \item \textbf{Hadicový stavební metr} -- hadice s vodou pomáhá najít stejnou výšku na velké stavbě.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'kapaliny-7--lode': String.raw`
{\LARGE \bfseries Lodě a plování těles} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Plování} se řídí podle \textbf{Archimédova zákona}.
    \item Na ponořené těleso působí \textbf{vztlaková síla} směřující vzhůru.
    \item Velikost: $F_{vz} = V_p \cdot \rho_k \cdot g$ \quad ($V_p$ = ponořený objem, $\rho_k$ = hustota kapaliny).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Plave / klesá / vznáší se}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádrž
    \draw[thick] (0, 0) -- (0, 3) (8, 0) -- (8, 3) (0, 0) -- (8, 0);
    \fill[cyan!30] (0.05, 0.02) rectangle (7.95, 2.4);
    \draw[cyan!70!black, thick] (0.05, 2.4) -- (7.95, 2.4);

    % Plave (částečně ponořená)
    \fill[orange!70] (0.5, 2) rectangle (1.8, 2.7);
    \draw[thick] (0.5, 2) rectangle (1.8, 2.7);
    \node[font=\scriptsize] at (1.15, 1.4) {plave};
    \node[font=\scriptsize] at (1.15, 1.05) {$\rho_t < \rho_k$};

    % Vznáší se (uvnitř, hustota stejná)
    \fill[gray!60] (3, 1.1) rectangle (4.3, 1.7);
    \draw[thick] (3, 1.1) rectangle (4.3, 1.7);
    \node[font=\scriptsize] at (3.65, 0.6) {vznáší se};
    \node[font=\scriptsize] at (3.65, 0.25) {$\rho_t = \rho_k$};

    % Klesá (na dně)
    \fill[gray!50!black] (5.5, 0.05) rectangle (6.8, 0.55);
    \draw[thick] (5.5, 0.05) rectangle (6.8, 0.55);
    \node[font=\scriptsize] at (6.15, -0.3) {klesá};
    \node[font=\scriptsize] at (6.15, -0.65) {$\rho_t > \rho_k$};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item Když $\rho_{tělesa} < \rho_{kapaliny}$ \quad $\Rightarrow$ \textbf{plave}.
    \item Když $\rho_{tělesa} = \rho_{kapaliny}$ \quad $\Rightarrow$ \textbf{vznáší se}.
    \item Když $\rho_{tělesa} > \rho_{kapaliny}$ \quad $\Rightarrow$ \textbf{klesá ke dnu}.
\end{itemize}
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jak může plavat ocelová loď?}
\vspace{2mm}

\noindent
Hustota oceli $\approx$ 7800 kg/m$^3$ -- mnohem větší než voda. Přesto loď plave!

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Voda
    \fill[cyan!30] (-1, 0) rectangle (8, 1.5);
    \draw[cyan!70!black, thick] (-1, 1.5) -- (8, 1.5);

    % Loď (skořápka)
    \draw[thick, fill=gray!60] (1, 1.7) -- (1.7, 0.5) -- (5.3, 0.5) -- (6, 1.7) -- cycle;
    \fill[gray!60] (1, 1.7) -- (6, 1.7) -- (6, 1.5) -- (1, 1.5) -- cycle;
    % Vnitřní vzduch
    \fill[zfgreen!10] (1.7, 1.7) -- (2.4, 0.7) -- (4.6, 0.7) -- (5.3, 1.7) -- cycle;
    \node[font=\bfseries\small] at (3.5, 1.3) {vzduch};

    % Šipka vztlaku
    \draw[->, ultra thick, zfgreen] (3.5, -0.3) -- (3.5, 0.5);
    \node[font=\bfseries, color=zfgreen] at (4.4, 0) {$F_{vz}$};

    % Šipka tíhy
    \draw[->, ultra thick, zfred] (3.5, 2.5) -- (3.5, 1.7);
    \node[font=\bfseries, color=zfred] at (4.2, 2.3) {$F_g$};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Loď je \textbf{dutá} -- uvnitř je velký objem \textbf{vzduchu}.
    \item Průměrná hustota celé lodi (kov + vzduch) je \emph{menší} než vody.
    \item Vyplývající velký objem ponořené části vyvolá dostatečnou vztlakovou sílu.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy plavidel}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Plavidlo & \bfseries Účel \\
\hline
loď, jachta & doprava osob \\
nákladní loď & doprava zboží, kontejnery \\
ponorka & může se potápět (mění svou hmotnost vodou v balastních nádržích) \\
plachetnice & pohon větrem \\
parník, motorová loď & pohon motorem \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Ponorka}
\vspace{2mm}

\begin{itemize}
    \item Má \textbf{balastní nádrže}.
    \item Pro \textbf{ponoření} -- nádrže napustí vodou (zvýší se hmotnost lodi).
    \item Pro \textbf{vynoření} -- vodu vytlačí stlačeným vzduchem (hmotnost klesne).
    \item Tak se mění průměrná hustota a tím i hloubka ponoření.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Plování v moři vs. v rybníku}
\vspace{2mm}

\begin{itemize}
    \item Mořská voda má \textbf{vyšší hustotu} (1025 kg/m$^3$) než sladká voda.
    \item V moři proto plaveme \textbf{snadněji} -- větší vztlak.
    \item V Mrtvém moři se nedá ani potopit (hustota až 1240 kg/m$^3$).
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
