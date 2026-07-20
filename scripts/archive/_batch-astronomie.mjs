/**
 * Vloží LaTeX zápisy pro 5 podkapitol tématu Astronomie (9. ročník).
 * Spuštění: node scripts/_batch-astronomie.mjs
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
\usetikzlibrary{calc,arrows.meta,decorations.pathmorphing}
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
  'astronomie--slunecni-soustava': String.raw`
{\LARGE \bfseries Sluneční soustava} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Sluneční soustava} = Slunce + tělesa, která obíhají kolem něj.
    \item Tvořena: \textbf{8 planet}, jejich měsíce, trpasličí planety (Pluto), planetky, komety, prach.
    \item Vznikla před asi \textbf{4,6 miliardami let} z plynového oblaku.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Schéma -- pořadí planet}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Slunce
    \shade[ball color=yellow] (0, 0) circle (0.7);
    \node[font=\bfseries\small, anchor=north] at (0, -0.85) {Slunce};

    % Planety: Merkur, Venuše, Země, Mars, Jupiter, Saturn, Uran, Neptun
    \draw[thick, fill=gray!60] (1.4, 0) circle (0.1);
    \node[font=\scriptsize, anchor=north] at (1.4, -0.2) {Merkur};

    \draw[thick, fill=orange!50] (2, 0) circle (0.18);
    \node[font=\scriptsize, anchor=north] at (2, -0.3) {Venuše};

    \draw[thick, fill=zfblue!60] (2.7, 0) circle (0.18);
    \node[font=\scriptsize\bfseries, anchor=north] at (2.7, -0.3) {Země};

    \draw[thick, fill=zfred!60] (3.4, 0) circle (0.13);
    \node[font=\scriptsize, anchor=north] at (3.4, -0.25) {Mars};

    % Pás planetek
    \foreach \x in {3.9, 4.1, 4.3} {
        \fill[gray] (\x, 0) circle (0.04);
    }

    \draw[thick, fill=orange!70] (5, 0) circle (0.45);
    \node[font=\scriptsize, anchor=north] at (5, -0.55) {Jupiter};

    \draw[thick, fill=yellow!50] (6.6, 0) circle (0.4);
    \draw[thick, gray] (6.6, 0) ellipse (0.65 and 0.1);
    \node[font=\scriptsize, anchor=north] at (6.6, -0.5) {Saturn};

    \draw[thick, fill=cyan!60] (8, 0) circle (0.25);
    \node[font=\scriptsize, anchor=north] at (8, -0.35) {Uran};

    \draw[thick, fill=blue!60] (9, 0) circle (0.25);
    \node[font=\scriptsize, anchor=north] at (9, -0.35) {Neptun};

    \node[font=\scriptsize\bfseries, color=zfred] at (5, 1) {(velikosti i vzdálenosti nejsou v měřítku)};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pomůcka pro pořadí}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{M}áma \textbf{V}aří \textbf{Z}arostlá \textbf{M}akrónky -- \textbf{J}akub \textbf{S}etřásá \textbf{U}smívavé \textbf{N}etopýry. \\
(Merkur, Venuše, Země, Mars -- Jupiter, Saturn, Uran, Neptun)
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vlastnosti planet}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|c|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Planeta & \bfseries Vzdál. (mil. km) & \bfseries Průměr (km) & \bfseries Měsíce \\
\hline
Merkur & 58 & 4\,880 & 0 \\
Venuše & 108 & 12\,100 & 0 \\
\textbf{Země} & 150 & 12\,742 & 1 \\
Mars & 228 & 6\,790 & 2 \\
Jupiter & 778 & 142\,984 & 95+ \\
Saturn & 1\,430 & 120\,536 & 146+ \\
Uran & 2\,870 & 51\,118 & 27 \\
Neptun & 4\,500 & 49\,528 & 14 \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Vnitřní planety} (Merkur--Mars): malé, kamenné, mají pevný povrch.
    \item \textbf{Vnější planety} (Jupiter--Neptun): obří plynní obři, hluboká atmosféra.
    \item Mezi Marsem a Jupiterem je \textbf{pás planetek}.
    \item Za Neptunem je \textbf{Kuiperův pás} (kde je Pluto -- trpasličí planeta).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Slunce}
\vspace{2mm}

\begin{itemize}
    \item Hvězda v centru, drží soustavu \textbf{gravitací}.
    \item Hmotnost: \textbf{99,86 \%} celé soustavy.
    \item Průměr: 1\,392\,000 km (109$\times$ Země). Teplota povrchu: 5\,500\,\textdegree C.
    \item Energii vyrábí jadernou \textbf{fúzí} vodíku na helium.
    \item Vzdálenost Slunce--Země = 1 AU (astronomická jednotka).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'astronomie--vesmir': String.raw`
{\LARGE \bfseries Vesmír} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Vesmír} = vše, co existuje -- veškerý prostor, hmota, energie a čas.
    \item Vznikl při \textbf{velkém třesku} před asi \textbf{13,8 miliardy let}.
    \item Stále se \textbf{rozpíná} -- galaxie se od sebe vzdalují.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hierarchie ve vesmíru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (z) at (0, 0) {Země};
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (sl) at (3.5, 0) {Sluneční soustava};
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (ml) at (7, 0) {Mléčná dráha};
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (lg) at (10.5, 0) {Místní skupina};
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (vk) at (3.5, -1.5) {Kupy galaxií};
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (sk) at (7, -1.5) {Superkupy};
    \node[draw, fill=zfred!20, thick, rounded corners=4pt, minimum width=3cm, minimum height=0.9cm] (ve) at (10.5, -1.5) {VESMÍR};

    \draw[->, thick] (z.east) -- (sl.west);
    \draw[->, thick] (sl.east) -- (ml.west);
    \draw[->, thick] (ml.east) -- (lg.west);
    \draw[->, thick] (lg.south) -- ++(0, -0.4) -| (sk.north);
    \draw[->, thick] (sk.west) -- (vk.east);
    \draw[->, thick] (sk.east) -- (ve.west);
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzdálenosti ve vesmíru}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Jednotka & \bfseries Vztah \\
\hline
astronomická jednotka (AU) & 150 mil. km (Země--Slunce) \\
\textbf{světelný rok (ly)} & vzdálenost, kterou světlo urazí za 1 rok \\
& $\approx$ 9,5 bilionu km = 63\,000 AU \\
parsek (pc) & 3,26 ly \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Světlo letí rychlostí \textbf{300\,000 km/s}.
    \item Země--Slunce: \textbf{8 minut 20 sekund} světla.
    \item Nejbližší hvězda (Proxima Centauri): \textbf{4,2 ly}.
    \item Průměr Mléčné dráhy: \textbf{100\,000 ly}.
    \item Pozorovatelný vesmír: průměr asi \textbf{93 mld. ly}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Galaxie}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Spirální galaxie
    \shade[ball color=white] (0, 0) circle (0.4);
    \draw[thick, zfblue, domain=0:540, samples=200, smooth] plot ({0.05*\x*cos(\x)/100}, {0.05*\x*sin(\x)/100});
    \draw[thick, zfblue, domain=0:540, samples=200, smooth] plot ({0.05*\x*cos(\x+180)/100}, {0.05*\x*sin(\x+180)/100});
    \node[font=\bfseries\small] at (0, -2) {spirální (Mléčná dráha)};

    % Eliptická
    \begin{scope}[shift={(5, 0)}]
        \shade[ball color=yellow!30] (0, 0) ellipse (1.4 and 0.9);
        \node[font=\bfseries\small] at (0, -2) {eliptická};
    \end{scope}

    % Nepravidelná
    \begin{scope}[shift={(10, 0)}]
        \fill[zfblue!40] plot[smooth cycle, tension=0.7] coordinates {(-0.7, 0.3) (0, 0.6) (0.6, 0.4) (1, -0.1) (0.5, -0.5) (-0.3, -0.3) (-0.8, -0.1)};
        \node[font=\bfseries\small] at (0, -2) {nepravidelná};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Galaxie} = obří soustava miliard hvězd, plynů, prachu, planet.
    \item Naše galaxie se jmenuje \textbf{Mléčná dráha}, je spirální.
    \item Sluneční soustava je v jednom z jejích ramen, asi 26\,000 ly od středu.
    \item Nejbližší velká galaxie: \textbf{Andromeda (M31)} -- 2,5 mil. ly daleko.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Velký třesk a rozpínání}
\vspace{2mm}

\begin{itemize}
    \item Před 13,8 mld. let byl vesmír \textbf{velmi malý a horký}.
    \item Začal se rozpínat -- ochladil se, vznikly atomy, hvězdy, galaxie.
    \item Pozorujeme \textbf{reliktní záření} -- \uv{ozvěnu} velkého třesku v podobě mikrovln.
    \item Vesmír stále \textbf{zrychluje} svoje rozpínání (vlivem \emph{temné energie}).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'astronomie--vznik-a-zanik-hvezd': String.raw`
{\LARGE \bfseries Vznik a zánik hvězd} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Hvězda} = obří koule žhavého plynu (plazmy), v jejíž centru probíhá jaderná \textbf{fúze}.
    \item Hvězdy mají různě dlouhý život -- \textbf{miliony až biliony let}.
    \item Doba života závisí hlavně na \textbf{hmotnosti}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Životní cyklus hvězdy podobné Slunci}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Mlhovina
    \fill[zfblue!30, opacity=0.6] plot[smooth cycle] coordinates {(-0.5, 0.3) (0, 0.5) (0.5, 0.4) (0.6, -0.1) (0.3, -0.4) (-0.4, -0.3)};
    \node[font=\scriptsize, anchor=north] at (0, -0.6) {mlhovina};

    \draw[->, thick] (0.7, 0) -- (1.4, 0);

    % Hvězda hl. posloupnosti
    \shade[ball color=yellow] (2, 0) circle (0.35);
    \node[font=\scriptsize, anchor=north] at (2, -0.5) {hvězda};
    \node[font=\scriptsize, anchor=north] at (2, -0.85) {(jako Slunce)};

    \draw[->, thick] (2.4, 0) -- (3.1, 0);

    % Červený obr
    \shade[ball color=red] (4, 0) circle (0.7);
    \node[font=\scriptsize, anchor=north] at (4, -0.85) {červený obr};

    \draw[->, thick] (4.7, 0) -- (5.4, 0);

    % Planetární mlhovina + bílý trpaslík
    \draw[thick, dashed, zfgreen] (6.3, 0) circle (0.7);
    \shade[ball color=white] (6.3, 0) circle (0.15);
    \node[font=\scriptsize, anchor=north] at (6.3, -0.85) {planet. mlhovina};
    \node[font=\scriptsize, anchor=north] at (6.3, -1.2) {+ bílý trpaslík};

    \draw[->, thick] (7.1, 0) -- (7.8, 0);

    % Černý trpaslík
    \fill[black] (8.4, 0) circle (0.1);
    \node[font=\scriptsize, anchor=north] at (8.4, -0.5) {černý};
    \node[font=\scriptsize, anchor=north] at (8.4, -0.85) {trpaslík};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Životní cyklus těžké hvězdy}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[zfblue!30, opacity=0.6] plot[smooth cycle] coordinates {(-0.5, 0.3) (0, 0.5) (0.5, 0.4) (0.6, -0.1) (0.3, -0.4) (-0.4, -0.3)};
    \node[font=\scriptsize, anchor=north] at (0, -0.6) {mlhovina};

    \draw[->, thick] (0.7, 0) -- (1.4, 0);

    \shade[ball color=blue!60] (2, 0) circle (0.45);
    \node[font=\scriptsize, anchor=north] at (2, -0.65) {modrá hvězda};
    \node[font=\scriptsize, anchor=north] at (2, -1) {(velmi hmotná)};

    \draw[->, thick] (2.5, 0) -- (3.2, 0);

    \shade[ball color=red] (4, 0) circle (0.9);
    \node[font=\scriptsize, anchor=north] at (4, -1.05) {červený nadobr};

    \draw[->, thick] (5, 0) -- (5.7, 0);

    \shade[ball color=orange, opacity=0.6] (6.5, 0) circle (1);
    \fill[white] (6.5, 0) circle (0.05);
    \node[font=\bfseries\scriptsize, color=zfred] at (6.5, 0) {SUPERNOVA};

    \draw[->, thick] (7.6, 0.3) -- (8.3, 0.7);
    \draw[->, thick] (7.6, -0.3) -- (8.3, -0.7);

    % Neutronová hvězda
    \fill[gray!60] (9, 0.7) circle (0.15);
    \node[font=\scriptsize, anchor=west] at (9.2, 0.7) {neutronová hvězda};

    % Černá díra
    \fill[black] (9, -0.7) circle (0.2);
    \draw[thick, gray] (9, -0.7) circle (0.4);
    \node[font=\scriptsize, anchor=west] at (9.5, -0.7) {černá díra};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Hmotnější hvězdy končí \textbf{supernovou} -- výbuchem, který přechodně přezáří celou galaxii.
    \item Po supernově zůstane \textbf{neutronová hvězda} (nebo \textbf{černá díra}, pokud je hvězda velmi hmotná).
    \item Při supernově vznikají těžké prvky (zlato, uran) a rozšiřují se po vesmíru.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Třídění hvězd podle barvy a teploty}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Barva & \bfseries Teplota povrchu & \bfseries Příklad \\
\hline
modrá & 30\,000 \textdegree C & Rigel \\
bílá & 10\,000 \textdegree C & Sirius \\
\textbf{žlutá} & \textbf{5\,500 \textdegree C} & \textbf{Slunce} \\
oranžová & 4\,000 \textdegree C & Aldebaran \\
červená & 3\,000 \textdegree C & Betelgeuse \\
\hline
\end{tabular}
\end{center}

\begin{itemize}
    \item Žhavější hvězda = modřejší a kratší život.
    \item Chladnější hvězda = červenější, žije déle.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Konečná stádia podle hmotnosti}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Hmotnost & \bfseries Konec života \\
\hline
do 8 hmotností Slunce & bílý trpaslík $\to$ černý trpaslík \\
8--25 hmotností Slunce & supernova $\to$ neutronová hvězda \\
nad 25 hmotností Slunce & supernova $\to$ černá díra \\
\hline
\end{tabular}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'astronomie--nocni-obloha': String.raw`
{\LARGE \bfseries Noční obloha} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Pouhým okem vidíme za jasné noci asi \textbf{3\,000 hvězd}.
    \item Lidé je seskupili do \textbf{souhvězdí} -- pomáhalo k orientaci.
    \item Dnes je oficiálně uznáno \textbf{88 souhvězdí}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Orientace pomocí Polárky}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Velký vůz
    \node[font=\Large\bfseries, color=white] at (0, 0) {$\bullet$};
    \fill[white, draw=black] (0, 0) circle (0.1);
    \fill[white, draw=black] (1, 0.2) circle (0.1);
    \fill[white, draw=black] (1.8, 0.4) circle (0.1);
    \fill[white, draw=black] (2.5, 0.6) circle (0.1);
    \fill[white, draw=black] (3, 1.2) circle (0.1);
    \fill[white, draw=black] (3.5, 0.7) circle (0.1);
    \fill[white, draw=black] (3.6, 0.1) circle (0.1);
    \draw[thick] (0, 0) -- (1, 0.2) -- (1.8, 0.4) -- (2.5, 0.6) -- (3, 1.2) -- (3.5, 0.7) -- (3.6, 0.1) -- (2.5, 0.6);
    \node[font=\bfseries\small, anchor=north] at (1.8, -0.2) {Velký vůz};

    % Polárka
    \fill[yellow, draw=black] (-2, 3) circle (0.18);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (-1.7, 3) {Polárka (sever)};

    % Šipka 5 délek
    \draw[->, thick, dashed, zfred] (3.6, 0.1) -- (-2, 3);
    \node[font=\scriptsize, color=zfred] at (1.5, 2) {5$\times$ kraj vozu};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Spojnici mezi 2 zadními koly Velkého vozu \textbf{prodloužíme 5$\times$} -- najdeme \textbf{Polárku}.
    \item Polárka leží téměř přesně na \textbf{severu}.
    \item V průběhu noci se otáčí celá obloha kolem ní -- proto je důležitým bodem orientace.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Známá souhvězdí}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Souhvězdí & \bfseries Kdy je nejlépe vidět \\
\hline
Velký vůz (Velká medvědice) & celý rok \\
Malý vůz (Malá medvědice -- Polárka) & celý rok \\
Kasiopeja & celý rok (proti Vozu) \\
Orion & zima (s Páskem ze 3 hvězd) \\
Lyra (s hvězdou Vegou) & léto \\
Labuť & léto \\
Lev, Panna, Váhy, Štír & jaro/léto \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co všechno na obloze vidíme}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Hvězdy} -- statické, blikají (atmosféra je rozčísla).
    \item \textbf{Planety} -- nemenkat. svítí stálým světlem (např. Venuše, Mars, Jupiter).
    \item \textbf{Měsíc} -- největší a nejjasnější objekt.
    \item \textbf{Mléčná dráha} -- za tmy bílý pruh přes oblohu.
    \item \textbf{Družice} -- pohybují se rychle, neblikají (ISS).
    \item \textbf{Meteory (\uv{padající hvězdy})} -- krátké světelné stopy.
    \item \textbf{Komety} -- vzácné, mají ohon.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hvězda nebo planeta?}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
& \bfseries Hvězda & \bfseries Planeta \\
\hline
světlo & vlastní (fúze) & odráží Slunce \\
blikání & ano & ne \\
poloha & \emph{stálá} mezi sebou & putuje mezi hvězdami \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pomůcky pro pozorování}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Mapa hvězdné oblohy} (otáčivá nebo aplikace -- Stellarium, Sky Map).
    \item \textbf{Dalekohled} (binokulár, astronomický).
    \item \textbf{Tmavé místo} bez umělého světla -- daleko od měst.
    \item \textbf{Trpělivost} -- oči se přizpůsobují tmě 15--20 minut.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'astronomie--dalsi-vesmirna-telesa': String.raw`
{\LARGE \bfseries Další vesmírná tělesa} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Kromě Slunce, planet a měsíců krouží kolem Slunce další \emph{drobnější} tělesa.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Trpasličí planety}
\vspace{2mm}

\begin{itemize}
    \item Tělesa, která \textbf{obíhají Slunce} a mají \textbf{kulový tvar}, ale \emph{neuklidila} svůj prostor od jiných objektů.
    \item Příklady: \textbf{Pluto} (do roku 2006 řadané jako planeta), Eris, Haumea, Makemake, Ceres.
    \item Většina leží v \textbf{Kuiperově pásu} za Neptunem.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Planetky (asteroidy)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Slunce
    \shade[ball color=yellow] (0, 0) circle (0.4);
    \node[font=\scriptsize, anchor=north] at (0, -0.5) {Slunce};

    % Mars
    \draw[thick, fill=zfred!60] (2, 0) circle (0.15);
    \node[font=\scriptsize, anchor=north] at (2, -0.25) {Mars};

    % Pas planetek
    \draw[thick, dashed, gray] (0, 0) circle (3);
    \foreach \a/\r in {30/2.9, 50/3.1, 70/2.95, 90/3.05, 110/2.9, 130/3.1, 150/3, 170/2.95, 190/3.05, 210/3.1, 230/2.9, 250/3, 270/3.05, 290/2.95, 310/3.1, 330/2.9, 350/3, 10/2.95} {
        \fill[gray] ({\r*cos(\a)}, {\r*sin(\a)}) circle (0.05);
    }

    % Jupiter
    \draw[thick, fill=orange!70] (4.5, 0) circle (0.45);
    \node[font=\scriptsize, anchor=north] at (4.5, -0.55) {Jupiter};

    \node[font=\bfseries\small, color=gray] at (0, 3.5) {pás planetek};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Skalnatá tělesa, většinou nepravidelného tvaru.
    \item Hlavní pás: mezi Marsem a Jupiterem -- \textbf{statisíce planetek}.
    \item Největší: \emph{Ceres} (průměr 940 km, dnes trpasličí planeta).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Komety}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Slunce
    \shade[ball color=yellow] (0, 0) circle (0.5);
    \node[font=\scriptsize, anchor=north] at (0, -0.6) {Slunce};

    % Kometa
    \fill[white, draw=black] (4, 0.5) circle (0.15);
    % Ohon (od Slunce)
    \fill[zfblue!50, opacity=0.5] (4, 0.5) -- (5, 1) -- (6, 1.3) -- (5.5, 0.5) -- (6, -0.2) -- (5, 0.1) -- cycle;

    \node[font=\scriptsize, anchor=west] at (4.2, 0.5) {jádro};
    \node[font=\scriptsize, color=zfblue] at (5.5, 1.5) {ohon};

    % Šipka — ohon vždy od Slunce
    \draw[->, thick, gray] (0.6, 0) -- (3.7, 0.4);
    \node[font=\scriptsize, gray, anchor=north] at (2.2, 0) {sluneční vítr};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Tvořeny \textbf{ledem, prachem a kamením} -- \uv{špinavé sněhové koule}.
    \item Pohybují se po \textbf{velmi protáhlých drahách}.
    \item U Slunce led tají, vzniká \textbf{ohon} -- vždy směřuje pryč od Slunce (sluneční vítr).
    \item Známé komety: \textbf{Halleyova} (návrat každých 76 let), \textbf{Hale-Bopp}, \textbf{NEOWISE}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Meteoroidy, meteory, meteority}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfblue, fill=zfblue!15, thick, rounded corners=4pt, minimum width=2.5cm, minimum height=0.9cm] (m1) at (0, 0) {meteoroid};
    \node[draw=zfred, fill=zfred!15, thick, rounded corners=4pt, minimum width=2.5cm, minimum height=0.9cm] (m2) at (4, 0) {meteor};
    \node[draw=gray, fill=gray!20, thick, rounded corners=4pt, minimum width=2.5cm, minimum height=0.9cm] (m3) at (8, 0) {meteorit};

    \draw[->, thick] (m1.east) -- (m2.west);
    \draw[->, thick] (m2.east) -- (m3.west);

    \node[font=\scriptsize] at (0, -0.7) {ve vesmíru};
    \node[font=\scriptsize] at (4, -0.7) {v atmosféře, svítí};
    \node[font=\scriptsize] at (8, -0.7) {dopadl na zem};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Meteoroid} -- malé těleso letící vesmírem (zrnko prachu až balvan).
    \item \textbf{Meteor} -- to samé, ale když svítí v zemské atmosféře (\emph{padající hvězda}).
    \item \textbf{Meteorit} -- co dopadne na zemský povrch.
    \item Známý meteorit: \textbf{Tunguzský} (1908) -- mohutná exploze v Rusku.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Družice (umělé)}
\vspace{2mm}

\begin{itemize}
    \item Vyrobena lidmi, obíhají kolem Země.
    \item Počet: přes \textbf{10\,000 aktivních} (2024).
    \item Použití: GPS, telekomunikace, počasí, špionáž, věda.
    \item \textbf{ISS} -- Mezinárodní vesmírná stanice, oběh za 90 minut.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Černé díry}
\vspace{2mm}

\begin{itemize}
    \item Oblast s tak silnou gravitací, že z ní nemůže utéct \textbf{ani světlo}.
    \item Vznikají z velmi hmotných hvězd po supernově.
    \item V centru naší Mléčné dráhy je supermasivní černá díra \textbf{Sagittarius A*}.
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
