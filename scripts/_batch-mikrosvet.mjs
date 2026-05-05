/**
 * Vloží LaTeX zápisy pro 4 podkapitoly tématu Mikrosvět (9. ročník).
 * Spuštění: node scripts/_batch-mikrosvet.mjs
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
  'mikrosvet--skaly-v-mikrosvete': String.raw`
{\LARGE \bfseries Škály v mikrosvětě} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Mikrosvět} = svět věcí, které jsou \emph{příliš malé} na to, abychom je viděli pouhým okem.
    \item Velikosti se vyjadřují v \textbf{mocninách deseti} -- mění se o mnoho řádů.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hierarchie velikostí}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Objekt & \bfseries Velikost & \bfseries Pozn. \\
\hline
buňka (lidská) & $10^{-5}$ m = 10 $\mu$m & vidíme mikroskopem \\
bakterie & $10^{-6}$ m = 1 $\mu$m & velikost čárky tužkou \\
virus & $10^{-7}$ m = 100 nm & jen elektronový mikroskop \\
\textbf{molekula DNA} (šířka) & $10^{-9}$ m = 1 nm & nm = nanometr \\
atom & $10^{-10}$ m = 0,1 nm & velikost není ostrá \\
jádro atomu & $10^{-15}$ m = 1 fm & 100\,000$\times$ menší než atom \\
proton, neutron & $10^{-15}$ m & nukleony \\
kvark, elektron & $< 10^{-18}$ m & "bodové" částice \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Atom -- prázdný prostor}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Atom
    \draw[thick, dashed, zfblue] (0, 0) circle (3);
    \fill[zfred] (0, 0) circle (0.05);
    \node[font=\small, color=zfred, anchor=west] at (0.15, 0) {jádro};
    \node[font=\small, color=zfblue, anchor=west] at (3.1, 1.5) {obal (elektrony)};
    \draw[->, gray] (3, 1.5) -- (2.5, 1.7);

    % Měřítko
    \draw[<->, thick] (-3, -3.5) -- (3, -3.5);
    \node[font=\small] at (0, -3.9) {atom $\sim 10^{-10}$ m};

    % Nárůst měřítka
    \draw[<->, thick, zfred] (-0.05, -2.6) -- (0.05, -2.6);
    \node[font=\small, color=zfred] at (0, -2.95) {jádro $\sim 10^{-15}$ m (100 000$\times$ menší)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Atom je z velké části prázdný.} Pokud by jádro mělo velikost meruňky, elektrony by létaly ve vzdálenosti 1 km od ní.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba hmoty -- od velkých k malým}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=zfblue!15, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.8cm] (latka) at (0, 0) {látka};
    \node[draw, fill=zfblue!20, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.8cm] (mol) at (3, 0) {molekula};
    \node[draw, fill=zfblue!30, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.8cm] (atom) at (6, 0) {atom};
    \node[draw, fill=zfred!30, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.8cm] (jadro) at (9, 0) {jádro};
    \node[draw, fill=zfred!50, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.8cm] (nukleon) at (12, 0) {p$^+$, n};

    \draw[->, thick] (latka.east) -- (mol.west);
    \draw[->, thick] (mol.east) -- (atom.west);
    \draw[->, thick] (atom.east) -- (jadro.west);
    \draw[->, thick] (jadro.east) -- (nukleon.west);

    \node[font=\scriptsize] at (1.5, -0.6) {se skládá};
    \node[font=\scriptsize] at (4.5, -0.6) {se skládá};
    \node[font=\scriptsize] at (7.5, -0.6) {jádro};
    \node[font=\scriptsize] at (10.5, -0.6) {nukleony};

    % Pod nukleony — kvarky
    \node[draw, fill=zfpurple!30, thick, rounded corners=4pt, minimum width=1.5cm, minimum height=0.7cm] (kvark) at (12, -1.5) {kvarky};
    \draw[->, thick] (nukleon.south) -- (kvark.north);
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Jak vidíme to, co je menší než světlo?}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Optický mikroskop} -- atomy jsou menší než vlnová délka světla, neuvidí je.
    \item \textbf{Elektronový mikroskop} -- místo světla \emph{elektrony}, lepší rozlišení.
    \item \textbf{Tunelovací mikroskop (STM)} -- "ohmatá" povrch atomu po atomu.
    \item \textbf{Urychlovače částic} (CERN) -- srážky vysokoenergetických částic odhalují kvarky.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mikrosvet--atom-a-jeho-modely': String.raw`
{\LARGE \bfseries Atom a jeho modely} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Představa o stavbě atomu se v historii \textbf{vyvíjela}. Každý nový model lépe vysvětloval pokusy.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Démokritos (~400 př. n. l.)}
\vspace{2mm}

\begin{itemize}
    \item Řecký filozof. Podle něj se vše skládá z \textbf{nedělitelných částic} -- \emph{atomos}.
    \item Žádný experiment, jen úvaha. Pravda byla potvrzena až po 2\,000 letech.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Daltonův model (1803)}
\vspace{2mm}

\begin{itemize}
    \item Atomy jsou \textbf{kuličky}. Každý prvek má svůj druh atomu.
    \item Atomy se nedělí, jen kombinují do molekul.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Thomsonův "pudinkový" model (1897)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=zfred!20] (0, 0) circle (1.2);
    \foreach \x/\y in {-0.6/0.5, 0.5/0.6, -0.4/-0.5, 0.6/-0.3, 0/0.8, 0.2/0, -0.8/0, 0.7/0.2} {
        \fill[zfblue] (\x, \y) circle (0.07);
    }
    \node[font=\small, anchor=west] at (1.4, 0) {Thomson: kladné "těsto"};
    \node[font=\small, anchor=west] at (1.4, -0.4) {s rozesetými elektrony ($-$)};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Thomson objevil \textbf{elektron} (záporná částice).
    \item Atom je kladně nabitá kapka, do níž jsou \emph{rozseté} záporné elektrony.
    \item Vyvráceno Rutherfordovým pokusem.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Rutherfordův planetární model (1911)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, dashed] (0, 0) circle (2);
    \fill[zfred] (0, 0) circle (0.18);
    \node[font=\small, color=zfred, anchor=west] at (0.25, 0) {jádro (+)};
    \fill[zfblue] (2, 0) circle (0.1);
    \fill[zfblue] (-1.4, 1.4) circle (0.1);
    \fill[zfblue] (-1.4, -1.4) circle (0.1);
    \node[font=\small, color=zfblue, anchor=west] at (2.2, 0) {elektron};

    % Trajektorie alfa částice (rozptyl)
    \draw[thick, zfgreen, ->] (-3, 1.2) -- (-1, 0.8) .. controls (-0.5, 0.5) .. (-0.3, 0) .. controls (-0.5, -0.5) .. (-1, -0.8) -- (-2.5, -1.2);
    \draw[thick, zfgreen, ->] (-3, 0.5) -- (3, 0.5);
    \draw[thick, zfgreen, ->] (-3, -0.5) -- (3, -0.5);
    \node[font=\scriptsize, color=zfgreen, anchor=east] at (-3, 1.2) {alfa};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Pokus: alfa částice prolétávají tenkou zlatou fólií. Většina projde rovně, \textbf{některé se odrazí}.
    \item Závěr: \textbf{kladný náboj a hmotnost je soustředěna v malém jádře}.
    \item Atom je z velké části prázdný; elektrony obíhají jako planety.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Bohrův model (1913)}
\vspace{2mm}

\begin{itemize}
    \item Elektrony obíhají po \textbf{určitých drahách (slupkách)}, ne libovolně.
    \item Při přechodu mezi slupkami atom \emph{vyzařuje nebo pohlcuje} foton (světlo).
    \item Vysvětlil spektrální čáry vodíku.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kvantový model (dnes)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \shade[ball color=zfblue!30, opacity=0.5] (0, 0) circle (1.8);
    \shade[ball color=zfblue!50, opacity=0.6] (0, 0) circle (1.2);
    \fill[zfred] (0, 0) circle (0.1);
    \node[font=\small, anchor=west] at (2, 0) {jádro + "oblak" pravděpodobnosti};
    \node[font=\small, anchor=west] at (2, -0.4) {kde se může elektron nacházet};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Místo přesné dráhy popisujeme \textbf{pravděpodobnost} výskytu elektronu.
    \item Elektrony tvoří \emph{orbital} -- 3D mrak okolo jádra.
    \item Tento model platí dodnes a je velmi přesný.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Shrnutí vývoje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, ->] (0, 0) -- (12, 0);
    \foreach \x/\rok/\autor in {1/-400/Démokritos, 3.5/1803/Dalton, 5.5/1897/Thomson, 7.5/1911/Rutherford, 9.5/1913/Bohr, 11.5/1925/Kvantový} {
        \fill[zfblue] (\x, 0) circle (0.08);
        \node[font=\scriptsize, anchor=south] at (\x, 0.15) {\autor};
        \node[font=\scriptsize, anchor=north] at (\x, -0.15) {\rok};
    }
\end{tikzpicture}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mikrosvet--radioaktivita': String.raw`
{\LARGE \bfseries Radioaktivita} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Radioaktivita} = samovolný rozpad nestabilních atomových jader.
    \item Při rozpadu vzniká \textbf{záření} a často nové prvky.
    \item Objevil ji \textbf{Henri Becquerel} (1896), prozkoumali \textbf{manželé Curieovi}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy záření}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Zdroj
    \draw[thick, fill=zfred!30] (0, 0) rectangle (0.7, 1.5);
    \node[font=\scriptsize] at (0.35, -0.4) {zdroj};

    % Alpha
    \draw[->, ultra thick, zfred] (0.7, 1.2) -- (3, 1.2);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (3.1, 1.2) {$\alpha$ -- 2p$^+$ + 2n};
    \draw[thick, gray] (3.7, 1) rectangle (4, 1.4);
    \node[font=\scriptsize] at (3.85, 0.7) {papír};

    % Beta
    \draw[->, ultra thick, zfblue] (0.7, 0.75) -- (5.7, 0.75);
    \node[font=\bfseries\small, color=zfblue, anchor=west] at (5.8, 0.75) {$\beta$ -- elektron e$^-$};
    \draw[thick, gray] (5.4, 0.55) rectangle (5.7, 0.95);
    \node[font=\scriptsize] at (5.55, 0.3) {hliník};

    % Gamma
    \draw[->, ultra thick, zfgreen, decorate, decoration={snake, segment length=2mm, amplitude=1mm}] (0.7, 0.3) -- (8.5, 0.3);
    \node[font=\bfseries\small, color=zfgreen, anchor=west] at (8.6, 0.3) {$\gamma$ -- foton};
    \draw[thick, gray, fill=gray!40] (8.0, 0.1) rectangle (8.5, 0.5);
    \node[font=\scriptsize] at (8.25, -0.15) {olovo};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Záření & \bfseries Co je & \bfseries Pronikavost & \bfseries Stínění \\
\hline
$\alpha$ (alfa) & 2 protony + 2 neutrony (jádro He) & nejmenší & list papíru \\
$\beta$ (beta) & elektron (rychlý) & střední & 1 mm hliníku \\
$\gamma$ (gama) & foton (EM vlna) & největší & olověná deska \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklad: rozpad uranu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=1.4cm, font=\bfseries] (u) at (0, 0) {U};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=1.2cm, font=\bfseries] (th) at (4, 0) {Th};
    \node[draw=zfgreen, fill=zfgreen!20, thick, circle, minimum size=0.7cm, font=\bfseries\scriptsize] (a) at (4, -1.5) {$\alpha$};

    \draw[->, thick] (u.east) -- (th.west);
    \draw[->, thick, zfgreen] (u.south east) -- (a.west);

    \node[font=\scriptsize] at (0, 1) {uran-238};
    \node[font=\scriptsize] at (4, 1) {thorium-234};
    \node[font=\scriptsize] at (5, -1.5) {alfa částice};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Uran (238 nukleonů) se rozpadne na thorium (234) + alfa částici (4).
    \item \textbf{Hmotnostní číslo zůstává zachováno}: $238 = 234 + 4$.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Poločas rozpadu}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Poločas rozpadu $T_{1/2}$} = doba, za kterou se rozpadne \emph{polovina} atomů.
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Izotop & \bfseries $T_{1/2}$ & \bfseries Poznámka \\
\hline
uran-238 & 4,5 mld. let & vzácný v přírodě \\
uhlík-14 & 5\,730 let & datace archeologických nálezů \\
jód-131 & 8 dní & medicína (štítná žláza) \\
radon-222 & 3,8 dne & v podloží, riziko v domech \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Použití a rizika}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Medicína} -- léčba rakoviny, RTG snímky, scintigrafie, sterilizace.
    \item \textbf{Datace} -- uhlíková metoda určuje stáří organických nálezů.
    \item \textbf{Energetika} -- jaderné elektrárny.
    \item \textbf{Rizika} -- velké dávky ničí buňky, způsobují rakovinu, mutace.
    \item \textbf{Měření} -- Geigerovým-Müllerovým počítačem.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'mikrosvet--jaderna-energie': String.raw`
{\LARGE \bfseries Jaderná energie} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Při \textbf{změnách atomového jádra} se uvolňuje obrovské množství energie.
    \item Vychází z Einsteinova vzorce: $E = m \cdot c^2$ (i malá hmotnost = obrovská energie).
    \item Dva hlavní procesy: \textbf{štěpení} a \textbf{fúze}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Štěpení jader (fission)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Neutron na vstupu
    \draw[->, thick, gray] (-2.5, 0) -- (-0.7, 0);
    \fill[gray] (-2.6, 0) circle (0.1);
    \node[font=\scriptsize] at (-2.6, 0.3) {n};

    % Velký atom (uran)
    \draw[thick, fill=zfred!30] (0, 0) circle (0.5);
    \node[font=\bfseries\small] at (0, 0) {U};

    % Šipka rozpadu
    \draw[->, thick] (0.6, 0) -- (1.5, 0);

    % 2 fragmenty + neutrony
    \draw[thick, fill=zfblue!30] (2.5, 0.5) circle (0.3);
    \node[font=\scriptsize] at (2.5, 0.5) {Ba};
    \draw[thick, fill=zfblue!30] (2.5, -0.5) circle (0.3);
    \node[font=\scriptsize] at (2.5, -0.5) {Kr};

    % Volné neutrony
    \fill[gray] (3.7, 0.7) circle (0.1);
    \fill[gray] (3.7, -0.1) circle (0.1);
    \fill[gray] (3.7, -0.7) circle (0.1);
    \draw[->, thick, gray] (2.85, 0.5) -- (3.6, 0.7);
    \draw[->, thick, gray] (2.85, 0) -- (3.6, -0.1);
    \draw[->, thick, gray] (2.85, -0.5) -- (3.6, -0.7);

    % Energie
    \draw[->, ultra thick, zfred, decorate, decoration={snake, segment length=2mm, amplitude=1mm}] (0.6, 0.6) -- (1.7, 1.4);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (1.8, 1.4) {energie};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Pomalý neutron narazí do jádra \textbf{uranu-235}.
    \item Jádro se rozpadne na 2 menší (např. baryum + krypton) a vzniknou 2--3 \emph{nové neutrony}.
    \item Nové neutrony spustí další štěpení -- \textbf{řetězová reakce}.
    \item Uvolňuje se \textbf{ohromné teplo}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jaderný reaktor a jaderná elektrárna}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=zfred!30, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=1cm] (r) at (0, 0) {reaktor};
    \node[draw, fill=orange!40, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=1cm] (k) at (3.5, 0) {voda $\to$ pára};
    \node[draw, fill=cyan!30, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=1cm] (t) at (7, 0) {turbína};
    \node[draw, fill=zfblue!30, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=1cm] (g) at (10.5, 0) {generátor};

    \draw[->, thick] (r.east) -- (k.west);
    \draw[->, thick] (k.east) -- (t.west);
    \draw[->, thick] (t.east) -- (g.west);

    \node[font=\scriptsize] at (1.75, -0.7) {teplo};
    \node[font=\scriptsize] at (5.25, -0.7) {pára};
    \node[font=\scriptsize] at (8.75, -0.7) {pohyb};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Štěpení v reaktoru se reguluje \textbf{řídicími tyčemi} (z bóru, kadmia) -- ty pohlcují neutrony.
    \item Teplo ohřívá vodu, ze které vzniká pára. Ta roztáčí turbínu a generátor.
    \item ČR: \textbf{Temelín} (2$\times$1000 MW) a \textbf{Dukovany} (4$\times$510 MW).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jaderná fúze (fusion)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=zfblue!30] (0, 0.5) circle (0.3);
    \node[font=\scriptsize] at (0, 0.5) {D};
    \draw[thick, fill=zfblue!30] (0, -0.5) circle (0.3);
    \node[font=\scriptsize] at (0, -0.5) {T};
    \draw[->, thick] (0.5, 0.4) -- (1.5, 0.1);
    \draw[->, thick] (0.5, -0.4) -- (1.5, -0.1);
    \draw[thick, fill=zfgreen!40] (2.5, 0) circle (0.4);
    \node[font=\scriptsize\bfseries] at (2.5, 0) {He};
    \fill[gray] (3.5, 0.5) circle (0.1);
    \node[font=\scriptsize, anchor=west] at (3.7, 0.5) {neutron};

    \draw[->, ultra thick, zfred, decorate, decoration={snake, segment length=2mm, amplitude=1mm}] (3, 0.6) -- (4.5, 1.4);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (4.6, 1.4) {energie};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Spojení malých jader (\textbf{deuterium} + \textbf{tritium} -- těžký vodík) na helium.
    \item Probíhá ve \textbf{Slunci a hvězdách} při teplotách \emph{milionů stupňů}.
    \item Uvolňuje ještě více energie než štěpení.
    \item Lidstvo se ji snaží napodobit (projekt \textbf{ITER} ve Francii) -- zatím nedokončeno.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Klady a zápory jaderné energetiky}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|p{6cm}|p{8cm}|}
\hline
\rowcolor{zfgreen!25}
\bfseries Klady & \bfseries \\
\hline
neprodukuje CO$_2$ & velký výkon na malé ploše \\
stabilní zdroj (24/7) & malá spotřeba paliva \\
\hline
\rowcolor{zfred!25}
\bfseries Zápory & \bfseries \\
\hline
radioaktivní odpad & riziko havárie (Černobyl, Fukušima) \\
vysoké náklady na stavbu & dlouhý čas výstavby \\
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
