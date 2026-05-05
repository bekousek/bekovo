/**
 * Vloží LaTeX zápisy pro 12 podkapitol tématu Elektřina (9. ročník).
 * Spuštění: node scripts/_batch-elektrina.mjs
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
  'elektrina--elektromagnetismus-a-indukce': String.raw`
{\LARGE \bfseries Elektromagnetismus a indukce} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Mezi \textbf{elektřinou} a \textbf{magnetismem} je úzká souvislost.
    \item Pohybující se náboj vytváří magnetické pole. Pohybující se magnet vytváří elektrický proud.
    \item Tento jev objevil \textbf{Michael Faraday} (1831) -- \emph{elektromagnetická indukce}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Faradayův pokus}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Cívka
    \draw[thick] (0, 0) rectangle (3, 1.2);
    \foreach \x in {0.4, 0.8, 1.2, 1.6, 2, 2.4, 2.8} {
        \draw[thick, zfred] (\x, 0.6) ellipse (0.1 and 0.6);
    }

    % Magnet
    \fill[zfred!70] (-2.5, 0.4) rectangle (-1.5, 0.8);
    \fill[zfblue!70] (-1.5, 0.4) rectangle (-0.5, 0.8);
    \draw[thick] (-2.5, 0.4) rectangle (-0.5, 0.8);
    \node[font=\bfseries\scriptsize, color=white] at (-2, 0.6) {N};
    \node[font=\bfseries\scriptsize, color=white] at (-1, 0.6) {S};
    \draw[->, ultra thick, zfred] (-1, 1.4) -- (-0.2, 1.4);
    \node[font=\scriptsize, color=zfred] at (-0.6, 1.7) {pohyb};

    % Vodiče k voltmetru
    \draw[thick] (3, 0.9) -- (4, 0.9) -- (4, 0);
    \draw[thick] (3, 0.3) -- (3.7, 0.3) -- (3.7, -0.4);
    \draw[thick] (4, 0) circle (0.3);
    \node[font=\bfseries] at (4, 0) {V};

    \node[font=\scriptsize] at (1.5, -0.4) {cívka};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Pohyb magnetu cívkou \textbf{indukuje} (vytváří) napětí.
    \item Při zastavení magnetu napětí zmizí -- musí být \emph{pohyb}.
    \item Čím rychlejší pohyb, větší magnet a více závitů, tím větší napětí.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Princip generátoru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Magnety
    \fill[zfred!70] (-2.5, -1) rectangle (-1.5, 1);
    \fill[zfblue!70] (1.5, -1) rectangle (2.5, 1);
    \draw[thick] (-2.5, -1) rectangle (-1.5, 1);
    \draw[thick] (1.5, -1) rectangle (2.5, 1);
    \node[font=\bfseries\small, color=white] at (-2, 0) {N};
    \node[font=\bfseries\small, color=white] at (2, 0) {S};

    % Cívka uprostřed (otáčí se)
    \draw[thick, fill=orange!50] (-0.7, -0.8) rectangle (0.7, 0.8);
    \draw[thick] (-0.7, 0.8) -- (0.7, 0.8) (-0.7, -0.8) -- (0.7, -0.8);

    % Šipka rotace
    \draw[->, thick] (0.5, 1.1) arc (0:200:0.5);
    \node[font=\scriptsize] at (0.5, 1.6) {otáčí se};

    % Výstup
    \draw[thick] (-0.7, -0.8) -- (-0.7, -1.5) -- (-2, -1.5);
    \draw[thick] (0.7, -0.8) -- (0.7, -1.5) -- (2, -1.5);
    \draw[thick] (-2, -1.7) -- (-2, -1.3);
    \draw[thick] (-1.8, -1.9) -- (-1.8, -1.1);
    \node[font=\scriptsize] at (-2, -2.2) {napětí};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Generátor: \textbf{cívka se otáčí} v magnetickém poli.
    \item V cívce se indukuje \textbf{střídavé napětí}.
    \item Tak vyrábí elektřinu \emph{všechny elektrárny} (parní, vodní, větrné, jaderné).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Použití elektromagnetické indukce}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Generátory} a \textbf{alternátory} (v elektrárnách, autě, kole -- dynamo).
    \item \textbf{Transformátory} -- mění napětí.
    \item \textbf{Indukční vařiče} -- v dolu se ohřeje hrnec.
    \item \textbf{Bezkontaktní nabíjení} mobilů.
    \item \textbf{Mikrofony, reproduktory}.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--stridavy-proud': String.raw`
{\LARGE \bfseries Střídavý proud} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Střídavý proud (AC)} pravidelně mění \textbf{směr i velikost}.
    \item Vychází z generátoru -- točící se cívky v magnetickém poli.
    \item V ČR síťové napětí: \textbf{230 V}, frekvence \textbf{50 Hz} (50 změn za sekundu).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stejnosměrný vs střídavý proud}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % DC graf
    \draw[->, thick] (0, 0) -- (4, 0) node[right] {$t$};
    \draw[->, thick] (0, -1) -- (0, 1.5) node[above] {$U$};
    \draw[ultra thick, zfblue] (0, 0.8) -- (3.5, 0.8);
    \node[font=\bfseries\small] at (2, -1.4) {stejnosměrný (DC)};
    \node[font=\scriptsize] at (2, -1.8) {např. baterie};

    % AC graf
    \begin{scope}[shift={(7,0)}]
        \draw[->, thick] (0, 0) -- (4, 0) node[right] {$t$};
        \draw[->, thick] (0, -1.2) -- (0, 1.5) node[above] {$U$};
        \draw[ultra thick, zfred, samples=200, domain=0:3.5] plot (\x, {sin(deg(\x*3.5))});
        \node[font=\bfseries\small] at (2, -1.4) {střídavý (AC)};
        \node[font=\scriptsize] at (2, -1.8) {např. zásuvka};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Charakteristiky střídavého proudu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Veličina & \bfseries Značka & \bfseries Pozn. \\
\hline
frekvence & $f$ (Hz) & v ČR 50 Hz, v USA 60 Hz \\
perioda & $T$ (s) & $T = 1/f$. Pro 50 Hz: $T = 0{,}02$ s \\
maximální napětí & $U_m$ & vrcholová hodnota \\
efektivní napětí & $U$ & to, co měří voltmetr (230 V) \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pamatuj:} V zásuvce je \textbf{efektivně 230 V} (peak je $\sqrt{2}$$\times$ víc, asi 325 V).
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Proč střídavý proud?}
\vspace{2mm}

\begin{itemize}
    \item Snadno se mění \textbf{transformátorem} (zvyšuje/snižuje napětí).
    \item Při přenosu na velké vzdálenosti se používá \textbf{vysoké napětí} (menší ztráty).
    \item Generátory ho přirozeně vyrábějí.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Stejnosměrný proud (DC)}
\vspace{2mm}

\begin{itemize}
    \item Teče stále \textbf{jedním směrem}.
    \item Zdroje: baterie, akumulátor, fotovoltaický panel, dynamo.
    \item Používá se v elektronice (mobil, počítač). Síťový adaptér mění AC na DC.
    \item Symbol na zařízeních: \textbf{=} (DC) nebo \textbf{$\sim$} (AC).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--elektrarny': String.raw`
{\LARGE \bfseries Elektrárny} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektrárna} = zařízení, které mění různé druhy energie na \textbf{elektrickou}.
    \item Většina využívá \textbf{generátor} -- točící se cívku v magnetickém poli.
    \item Liší se v tom, \emph{co} točí turbínou.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Společné schéma}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=orange!30, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=0.9cm] (e) at (0, 0) {zdroj energie};
    \node[draw, fill=cyan!30, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=0.9cm] (t) at (4, 0) {turbína};
    \node[draw, fill=zfblue!30, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=0.9cm] (g) at (8, 0) {generátor};
    \node[draw, fill=yellow!30, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=0.9cm] (s) at (12, 0) {síť};

    \draw[->, thick] (e.east) -- (t.west);
    \draw[->, thick] (t.east) -- (g.west);
    \draw[->, thick] (g.east) -- (s.west);
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy elektráren}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.4}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Co točí turbínou & \bfseries Příklad \\
\hline
\textbf{tepelná} & pára z hořícího uhlí/plynu & Mělník, Počerady \\
\textbf{jaderná} & pára z jaderného reaktoru & Temelín, Dukovany \\
\textbf{vodní} & padající voda & Lipno, Orlík, Slapy \\
\textbf{přečerpávací} & voda mezi 2 nádržemi & Dlouhé Stráně \\
\textbf{větrná} & vítr & Krušné hory, Vysočina \\
\textbf{solární (FVE)} & ne -- panely přímo na elektřinu & střechy, pole \\
\textbf{geotermální} & pára z horké země & Island \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Obnovitelné vs. neobnovitelné}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|p{6.5cm}|p{6.5cm}|}
\hline
\rowcolor{zfgreen!25}
\bfseries Obnovitelné & \bfseries \\
\hline
voda, vítr, slunce, biomasa, geotermální & nevyčerpávají se, čisté \\
ale: závisí na počasí, denní době & potřebují akumulaci \\
\hline
\rowcolor{zfred!25}
\bfseries Neobnovitelné & \bfseries \\
\hline
uhlí, ropa, plyn, jaderné palivo & zásoby docházejí \\
ale: stabilní, velký výkon & emise CO$_2$ (kromě jaderné) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kde se elektřina v ČR vyrábí}
\vspace{2mm}

\begin{itemize}
    \item Asi \textbf{40 \%} jaderná energie (Temelín, Dukovany).
    \item Asi \textbf{40 \%} uhelné elektrárny (postupně se snižuje).
    \item \textbf{15--20 \%} obnovitelné (slunce, voda, biomasa, vítr).
    \item Zbytek: zemní plyn, dovoz.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Účinnost a ekologie}
\vspace{2mm}

\begin{itemize}
    \item Tepelná elektrárna: 35--40 \% účinnost, vysoké emise.
    \item Jaderná: 30--35 \%, žádné CO$_2$, ale radioaktivní odpad.
    \item Vodní: až 90 \% účinnost, ale závislé na vodě.
    \item Solární: 15--22 \% účinnost panelů.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--elektricke-clanky': String.raw`
{\LARGE \bfseries Elektrické články} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektrický článek} = zdroj stejnosměrného napětí.
    \item Mění \textbf{chemickou energii} na elektrickou.
    \item Každý článek má dva \textbf{póly} -- kladný (+) a záporný ($-$).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Princip galvanického článku}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádobka s elektrolytem
    \draw[thick] (0, 0) -- (0, 3) (4, 0) -- (4, 3) (0, 0) -- (4, 0);
    \fill[cyan!30] (0.05, 0.02) rectangle (3.95, 2.4);

    % Elektroda Zn (záporná)
    \draw[thick, fill=gray!60] (1, 0.3) rectangle (1.3, 3.3);
    \node[font=\scriptsize, anchor=south] at (1.15, 3.4) {Zn};
    \node[font=\bfseries\small, color=zfblue] at (0.5, 1.5) {$-$};

    % Elektroda Cu (kladná)
    \draw[thick, fill=orange!60] (2.7, 0.3) rectangle (3, 3.3);
    \node[font=\scriptsize, anchor=south] at (2.85, 3.4) {Cu};
    \node[font=\bfseries\small, color=zfred] at (3.5, 1.5) {$+$};

    % Žárovka externě
    \draw[thick] (1.15, 3.7) -- (1.15, 4.2) -- (2, 4.2);
    \draw[thick] (2.85, 3.7) -- (2.85, 4.2) -- (2.4, 4.2);
    \draw[thick] (2.2, 4.2) circle (0.25);
    \draw[thick] (2.05, 4.05) -- (2.35, 4.35);
    \draw[thick] (2.05, 4.35) -- (2.35, 4.05);

    \node[font=\scriptsize] at (2, -0.4) {elektrolyt};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Dvě \emph{různé} kovové elektrody ponořené v \textbf{elektrolytu} (kapalina vedoucí proud).
    \item Probíhá chemická reakce: ionty se uvolňují, kov se rozpouští.
    \item Mezi elektrodami vzniká napětí $\to$ teče proud.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy článků}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Napětí & \bfseries Použití \\
\hline
zinko-uhlíkový (suchý článek) & 1,5 V & dálkové ovladače, hodinky \\
alkalický & 1,5 V & běžné spotřebiče (AA, AAA) \\
lithiový (knoflíkový) & 3 V & kalkulačky, hodinky \\
NiMH (akumulátor) & 1,2 V & nabíjecí baterie \\
Li-ion (akumulátor) & 3,7 V & mobil, notebook, elektromobil \\
olověný akumulátor & 2 V/článek (12 V auto) & autobaterie \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Článek vs. baterie vs. akumulátor}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Článek} -- jeden zdroj napětí (jedna \uv{baterka} 1,5 V).
    \item \textbf{Baterie} = více článků spojených dohromady (9V baterie = 6$\times$1,5 V).
    \item \textbf{Akumulátor} -- článek/baterie, kterou lze \textbf{znovu nabít}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Spojování článků}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Sériově
    \draw[thick] (0, 0.2) -- (0, -0.2);
    \draw[thick] (0.2, 0.4) -- (0.2, -0.4);
    \draw[thick] (0.7, 0.2) -- (0.7, -0.2);
    \draw[thick] (0.9, 0.4) -- (0.9, -0.4);
    \draw[thick] (1.4, 0.2) -- (1.4, -0.2);
    \draw[thick] (1.6, 0.4) -- (1.6, -0.4);
    \draw[thick] (-0.4, 0) -- (0, 0);
    \draw[thick] (0.2, 0) -- (0.7, 0);
    \draw[thick] (0.9, 0) -- (1.4, 0);
    \draw[thick] (1.6, 0) -- (2, 0);
    \node[font=\scriptsize, anchor=east] at (-0.5, 0) {1,5+1,5+1,5};
    \node[font=\bfseries] at (2.4, 0) {= 4,5 V};
    \node[font=\bfseries\small] at (0.8, -0.9) {sériově};

    % Paralelně
    \begin{scope}[shift={(8,0)}]
        \draw[thick] (-0.5, 0.5) -- (-0.5, -0.5);
        \foreach \x in {-0.7, 0, 0.7} {
            \draw[thick] (\x, 0.7) -- (\x, 0.3);
            \draw[thick] (\x+0.2, 0.9) -- (\x+0.2, 0.1);
            \draw[thick] (-0.5, 0.5) -- (\x, 0.5);
            \draw[thick] (\x+0.2, 0.5) -- (1.4, 0.5);
        }
        \draw[thick] (1.4, 0.5) -- (1.4, -0.5);
        \draw[thick] (-0.5, -0.5) -- (1.4, -0.5);
        \node[font=\bfseries] at (2, 0) {= 1,5 V};
        \node[font=\scriptsize] at (0.5, -1) {(větší kapacita)};
        \node[font=\bfseries\small] at (0.5, -1.4) {paralelně};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Sériově} (za sebou): napětí se \textbf{sčítá}.
    \item \textbf{Paralelně} (vedle sebe): napětí stejné, ale větší \emph{kapacita} (delší výdrž).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--civky-a-kondenzatory': String.raw`
{\LARGE \bfseries Cívky a kondenzátory} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Dvě základní součástky elektroniky -- obě \emph{ukládají energii}, ale různě.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Cívka (induktor)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (-1, 0) -- (-0.2, 0);
    \draw[thick, decoration={coil, segment length=2.5mm, amplitude=2mm}, decorate, zfblue]
        (-0.2, 0) -- (3, 0);
    \draw[thick] (3, 0) -- (3.8, 0);
    \node[font=\bfseries\small] at (1.4, 0.7) {cívka};
    \node[font=\scriptsize] at (1.4, -0.7) {drát navinutý do závitů};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Drát \textbf{navinutý do závitů} (často kolem železného jádra).
    \item Když protéká proud, vytváří \textbf{magnetické pole} (jako elektromagnet).
    \item Ukládá energii v \textbf{magnetickém poli}.
    \item Brání rychlým změnám proudu.
    \item Použití: tlumivka, transformátor, elektromotor, reproduktor.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Kondenzátor (kapacitor)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (-1, 0) -- (1.4, 0);
    \draw[thick, ultra thick] (1.4, 0.4) -- (1.4, -0.4);
    \draw[thick, ultra thick] (1.7, 0.4) -- (1.7, -0.4);
    \draw[thick] (1.7, 0) -- (4, 0);

    % Náboj
    \node[font=\bfseries, color=zfred] at (1, 0.6) {+};
    \node[font=\bfseries, color=zfblue] at (2.1, 0.6) {$-$};

    \node[font=\bfseries\small] at (1.55, 1.3) {kondenzátor};
    \node[font=\scriptsize] at (1.55, -0.9) {dvě desky s izolantem};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Dvě vodivé desky} oddělené izolantem (vzduch, papír, plast).
    \item Po připojení napětí se na deskách hromadí náboj (+ na jedné, $-$ na druhé).
    \item Ukládá energii v \textbf{elektrickém poli} mezi deskami.
    \item Brání rychlým změnám napětí.
    \item Použití: filtry napětí, časovače, blesk fotoaparátu, klávesnice.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Veličiny}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Součástka & \bfseries Veličina & \bfseries Jednotka \\
\hline
cívka & indukčnost $L$ & henry (H) \\
kondenzátor & kapacita $C$ & farad (F) \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Srovnání}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
& \bfseries Cívka & \bfseries Kondenzátor \\
\hline
ukládá energii v & magnetickém poli & elektrickém poli \\
brání změnám & proudu & napětí \\
DC chování & projde (po ustálení) & blokuje \\
AC chování & blokuje (vysoké f) & propouští \\
značka & spirála & dvě svislé čáry \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Praktické využití}
\vspace{2mm}

\begin{itemize}
    \item Spojení cívky a kondenzátoru tvoří \textbf{rezonanční obvod} -- ladí rádia a televize.
    \item Spínání kondenzátoru poháněč obvody hodin a procesorů (CPU má miliardy).
    \item Cívky mění napětí v transformátoru, indukují proud v elektromotoru.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--transformator': String.raw`
{\LARGE \bfseries Transformátor} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Transformátor} mění velikost \textbf{střídavého} napětí (zvyšuje/snižuje).
    \item Funguje na principu \textbf{elektromagnetické indukce}.
    \item Pracuje jen se střídavým proudem (DC nefunguje).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Jádro
    \draw[thick, fill=gray!40] (0, -1.5) rectangle (5, 1.5);
    \fill[white] (0.6, -1.0) rectangle (4.4, 1.0);
    \draw[thick] (0.6, -1.0) rectangle (4.4, 1.0);

    % Primární cívka
    \foreach \y in {-0.7, -0.3, 0.1, 0.5} {
        \draw[thick, zfred] (1.2, \y) ellipse (0.15 and 0.2);
    }
    \draw[thick, zfred] (1.2, -1.2) -- (-0.5, -1.2);
    \draw[thick, zfred] (1.2, 0.9) -- (-0.5, 0.9);
    \node[font=\bfseries\scriptsize, color=zfred] at (1.2, -1.7) {primární};
    \node[font=\scriptsize, color=zfred] at (1.2, -2.0) {$N_1$ závitů};

    % Sekundární cívka (víc závitů — zvyšovací)
    \foreach \y in {-0.85, -0.55, -0.25, 0.05, 0.35, 0.65, 0.95} {
        \draw[thick, zfblue] (3.8, \y) ellipse (0.15 and 0.15);
    }
    \draw[thick, zfblue] (3.8, -1.2) -- (5.5, -1.2);
    \draw[thick, zfblue] (3.8, 1.2) -- (5.5, 1.2);
    \node[font=\bfseries\scriptsize, color=zfblue] at (3.8, -1.7) {sekundární};
    \node[font=\scriptsize, color=zfblue] at (3.8, -2.0) {$N_2$ závitů};

    % Vstup, výstup
    \node[font=\bfseries\small, color=zfred, anchor=east] at (-0.6, 0) {$U_1$};
    \node[font=\bfseries\small, color=zfblue, anchor=west] at (5.6, 0) {$U_2$};

    % Anotace jádra
    \node[font=\scriptsize] at (2.5, 1.3) {železné jádro};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Železné jádro} ve tvaru rámu.
    \item \textbf{Primární cívka} ($N_1$ závitů) -- vstup.
    \item \textbf{Sekundární cívka} ($N_2$ závitů) -- výstup.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec transformátoru}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $\dfrac{U_1}{U_2} = \dfrac{N_1}{N_2}$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item Poměr napětí = poměr počtu závitů.
    \item $N_2 > N_1$ \quad $\Rightarrow$ \quad \textbf{zvyšovací} (transformuje napětí nahoru).
    \item $N_2 < N_1$ \quad $\Rightarrow$ \quad \textbf{snižovací} (transformuje dolů).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklad}
\vspace{2mm}

\noindent
\textbf{Příklad:} Transformátor má primární cívku 1\,000 závitů, sekundární 50 závitů. Připojíme 230 V. Jaké napětí bude na výstupu?

\smallskip
\noindent
\textbf{Zápis:}\\
$N_1 = 1\,000$ závitů\\
$N_2 = 50$ závitů\\
$U_1 = 230$ V\\
$U_2 = ?$ V

\smallskip
\noindent
\textbf{Vzorec:} \quad $\dfrac{U_1}{U_2} = \dfrac{N_1}{N_2} \quad\Rightarrow\quad U_2 = U_1 \cdot \dfrac{N_2}{N_1}$

\smallskip
\noindent
\textbf{Dosazení:} \quad $U_2 = 230~\text{V} \cdot \dfrac{50}{1\,000} = 11{,}5$ V

\smallskip
\noindent
\textbf{Odpověď:} Na výstupu je 11,5 V (snižovací transformátor).

\vspace{4mm}
{\Large \bfseries \color{zfblue} Použití transformátorů}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Rozvodná síť} -- elektrárna 22 kV $\to$ vedení 400 kV $\to$ město 22 kV $\to$ dům 230 V.
    \item \textbf{Nabíječky} -- snižují 230 V na 5 V (USB), 12 V apod.
    \item \textbf{Svářecí transformátor} -- velký proud (až 100 A), nízké napětí.
    \item \textbf{Indukční vařiče, halogenové žárovky} (12 V).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Proč se na dálku přenáší vysoké napětí?}
\vspace{2mm}

\begin{itemize}
    \item Při přenosu vznikají \textbf{ztráty} -- vodič se zahřívá ($P_{ztráta} = I^2 \cdot R$).
    \item Větší napětí = menší proud (při stejném výkonu) = menší ztráty.
    \item Proto: vysoké napětí na dálku (až 400 kV), pak transformovat dolů.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--trojfazova-soustava': String.raw`
{\LARGE \bfseries Trojfázová soustava} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Místo \emph{jedné} fáze (jeden vodič + nulový) má \textbf{tři fáze}.
    \item Tři proudy jsou posunuté o \textbf{120\,\textdegree} -- maximum jednoho přijde, když je u druhého nula.
    \item Vyrábí ji generátor s třemi cívkami (každá pootočená o 120\,\textdegree).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tři posunuté sinusovky}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[->, thick] (0, 0) -- (10, 0) node[right] {$t$};
    \draw[->, thick] (0, -1.5) -- (0, 1.5) node[above] {$U$};

    \draw[ultra thick, zfred, samples=300, domain=0:9] plot (\x, {sin(deg(\x*1.4))});
    \draw[ultra thick, zfgreen, samples=300, domain=0:9] plot (\x, {sin(deg(\x*1.4 - 120))});
    \draw[ultra thick, zfblue, samples=300, domain=0:9] plot (\x, {sin(deg(\x*1.4 - 240))});

    \node[font=\bfseries\scriptsize, color=zfred, anchor=west] at (9.1, 0.6) {L1};
    \node[font=\bfseries\scriptsize, color=zfgreen, anchor=west] at (9.1, 0.2) {L2};
    \node[font=\bfseries\scriptsize, color=zfblue, anchor=west] at (9.1, -0.2) {L3};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vodiče v trojfázové soustavě}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Vodič & \bfseries Barva & \bfseries Funkce \\
\hline
L1 & černá / hnědá & 1. fáze \\
L2 & černá / hnědá & 2. fáze \\
L3 & černá / hnědá & 3. fáze \\
N (nulový) & modrá & \uv{zpáteční} cesta \\
PE (ochranný) & zeleno-žlutá & uzemnění -- bezpečnost \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Napětí}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Mezi fází a nulou:} \textbf{230 V} (běžná zásuvka).
    \item \textbf{Mezi dvěma fázemi:} \textbf{400 V} ($\sqrt{3} \cdot 230$).
    \item Trojfázové zásuvky (5 vodičů): pro silné spotřebiče.
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Označení:} \quad \textbf{1$\sim$/N/PE 230 V} (jednofázová) \quad $|$ \quad \textbf{3$\sim$/N/PE 400 V} (trojfázová)
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Výhody trojfázového proudu}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Plynulý výkon} -- při kombinaci 3 fází je výkon konstantní (ne kolísá k nule).
    \item Spouští \textbf{trojfázové motory} bez startovací cívky -- silné a jednoduché.
    \item \textbf{Účinný přenos} energie -- při stejném výkonu menší ztráty.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Použití}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Průmysl} -- frézky, soustruhy, kompresory, pily.
    \item \textbf{Domácnosti} -- vařiče, sporáky, akumulační kotle, nabíjení elektromobilu.
    \item \textbf{Doprava} -- elektrické tramvaje, vlaky.
    \item \textbf{Distribuce} -- celá rozvodná síť ČR funguje trojfázově.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--elektromotor': String.raw`
{\LARGE \bfseries Elektromotor} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektromotor} mění \textbf{elektrickou} energii na \textbf{pohybovou} (otáčivý pohyb).
    \item Funguje na principu \textbf{síly magnetického pole na vodič s proudem}.
    \item Opak generátoru -- generátor mění pohyb na elektřinu, motor naopak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Princip}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Magnety
    \fill[zfred!70] (-2.5, -1) rectangle (-1.5, 1);
    \fill[zfblue!70] (1.5, -1) rectangle (2.5, 1);
    \draw[thick] (-2.5, -1) rectangle (-1.5, 1);
    \draw[thick] (1.5, -1) rectangle (2.5, 1);
    \node[font=\bfseries\small, color=white] at (-2, 0) {N};
    \node[font=\bfseries\small, color=white] at (2, 0) {S};

    % Cívka
    \draw[thick, fill=orange!50] (-0.7, -0.6) rectangle (0.7, 0.6);

    % Šipky proudu (bod nahoře, kříž dole)
    \draw[thick] (-0.4, 0.3) circle (0.1);
    \fill[black] (-0.4, 0.3) circle (0.03);
    \draw[thick] (0.4, -0.3) circle (0.1);
    \draw[thick] (-0.07, -0.27) -- (0.07, -0.13) (-0.07, -0.13) -- (0.07, -0.27);

    % Šipka rotace
    \draw[->, ultra thick, zfgreen] (0.7, 0.7) arc (0:170:0.45);
    \draw[->, ultra thick, zfgreen] (-0.7, -0.7) arc (180:350:0.45);

    \node[font=\scriptsize] at (0, -1.5) {cívka se otáčí mezi magnety};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Cívkou s proudem prochází mezi magnety. Magnetické pole na ni působí silou.
    \item Cívka se začne otáčet -- vzniká \textbf{otáčivý pohyb}.
    \item \textbf{Komutátor} (přepínač) zajistí, že proud vždy teče správným směrem.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba elektromotoru}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=gray!30] (0, 0) circle (2);
    \draw[thick, fill=zfblue!30] (0, 0) circle (1.2);
    \draw[thick, fill=orange!50] (0, 0) circle (0.4);

    \draw[->, thick] (3, 1.5) -- (1.6, 0.6);
    \node[font=\small, anchor=west] at (3, 1.5) {stator (cívka v krytu)};

    \draw[->, thick] (3, 0) -- (0.5, 0);
    \node[font=\small, anchor=west] at (3, 0) {rotor (otáčející se část)};

    \draw[->, thick] (3, -1.5) -- (0.2, -0.2);
    \node[font=\small, anchor=west] at (3, -1.5) {hřídel (výstup pohybu)};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Stator} -- nepohyblivá vnější část (cívky nebo magnety).
    \item \textbf{Rotor} -- pohyblivá vnitřní část, která se otáčí.
    \item \textbf{Hřídel} -- vychází z rotoru, předává otáčivý pohyb na zařízení.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy elektromotorů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Použití \\
\hline
stejnosměrný (DC) & hračky, ventilátory PC, autodoplňky \\
střídavý (AC) -- asynchronní & průmysl, čerpadla, kompresory, výtahy \\
krokový (stepper) & 3D tiskárny, robotika, CNC \\
servomotor & RC modely, automatizace \\
synchronní s permanentními magnety & elektromobily (Tesla, BMW iX) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Účinnost a vlastnosti}
\vspace{2mm}

\begin{itemize}
    \item Účinnost: \textbf{90--95 \%} -- mnohem víc než spalovací motor (25 \%).
    \item Tichý chod, žádné výfukové plyny.
    \item Velký točivý moment hned od nuly otáček.
    \item Snadná regulace otáček (frekvenčním měničem).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kde najdeme elektromotory}
\vspace{2mm}

\begin{itemize}
    \item Doma: pračka, lednice, kuchyňský robot, vysavač, mixér, fén, ventilátor.
    \item Doprava: elektromobil, tramvaj, vlak, elektrokolo, eskalátor.
    \item Průmysl: dopravníky, jeřáby, lisy, pily, frézky.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--elektromagneticke-vlneni': String.raw`
{\LARGE \bfseries Elektromagnetické vlnění} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektromagnetické vlnění} = vlnění \textbf{elektrického a magnetického pole}.
    \item Šíří se i \textbf{ve vakuu} rychlostí \textbf{$c \approx 300\,000$ km/s} (rychlost světla).
    \item Pojí spektrum od rádiových vln po gama záření.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlna -- elektrické a magnetické pole}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[->, thick] (0, 0) -- (8, 0) node[right] {směr šíření};

    % Elektrické pole (svislé)
    \draw[thick, zfred, samples=200, domain=0:7] plot (\x, {sin(deg(\x))});
    \node[font=\bfseries\small, color=zfred, anchor=west] at (7.2, 1) {E (elektrické)};

    % Magnetické pole (vodorovné jako přerušované do strany — zde nakreslíme tenkou křivkou)
    \draw[thick, zfblue, samples=200, domain=0:7, dashed] plot (\x, {0.5*sin(deg(\x))});
    \node[font=\bfseries\small, color=zfblue, anchor=west] at (7.2, -0.5) {B (magnetické)};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Pole \textbf{E} a \textbf{B} jsou na sebe \textbf{kolmé}, oba kolmé na směr šíření.
    \item Mění se \emph{periodicky} -- vlna má vlnovou délku $\lambda$ a frekvenci $f$.
    \item Platí: \textbf{$c = \lambda \cdot f$}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Spektrum elektromagnetického vlnění}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[zfred!30] (0, 0) rectangle (2, 0.6);
    \fill[orange!50] (2, 0) rectangle (3.5, 0.6);
    \fill[yellow!60] (3.5, 0) rectangle (4.5, 0.6);
    \fill[red] (4.5, 0) rectangle (5, 0.6);
    \fill[orange!80] (5, 0) rectangle (5.5, 0.6);
    \fill[yellow] (5.5, 0) rectangle (6, 0.6);
    \fill[green!70] (6, 0) rectangle (6.5, 0.6);
    \fill[blue!70] (6.5, 0) rectangle (7, 0.6);
    \fill[purple!70] (7, 0) rectangle (7.5, 0.6);
    \fill[zfpurple] (7.5, 0) rectangle (9, 0.6);
    \fill[gray!60] (9, 0) rectangle (10.5, 0.6);
    \fill[gray!90] (10.5, 0) rectangle (12, 0.6);

    \draw[thick] (0, 0) rectangle (12, 0.6);

    % Popisky
    \node[font=\scriptsize, anchor=north] at (1, -0.1) {rádio};
    \node[font=\scriptsize, anchor=north] at (2.75, -0.1) {mikrov.};
    \node[font=\scriptsize, anchor=north] at (4, -0.1) {IR};
    \node[font=\bfseries\scriptsize, anchor=north] at (5.5, -0.1) {viditelné};
    \node[font=\scriptsize, anchor=north] at (8.25, -0.1) {UV};
    \node[font=\scriptsize, anchor=north] at (9.75, -0.1) {RTG};
    \node[font=\scriptsize, anchor=north] at (11.25, -0.1) {gama};

    % Vlnová délka
    \node[font=\scriptsize, anchor=south] at (0, 0.7) {km};
    \node[font=\scriptsize, anchor=south] at (4, 0.7) {mm};
    \node[font=\scriptsize, anchor=south] at (5.5, 0.7) {nm};
    \node[font=\scriptsize, anchor=south] at (8.5, 0.7) {0,1 nm};
    \node[font=\scriptsize, anchor=south] at (12, 0.7) {fm};

    \node[font=\bfseries] at (-0.5, 1.5) {$\lambda$:};
    \node[font=\bfseries] at (-0.5, -0.5) {Druh:};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Použití různých vln}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Vlnová délka & \bfseries Použití \\
\hline
rádiové vlny & km -- m & rádio, TV, mobil, Wi-Fi \\
mikrovlny & cm & mikrovlnka, radar, GPS \\
infračervené (IR) & mm -- $\mu$m & topení, dálkové ovladače, termovize \\
viditelné světlo & 380--780 nm & to, co vidíme okem \\
ultrafialové (UV) & 10--380 nm & opalování, dezinfekce, žloutky \\
rentgenové (RTG) & 0,01--10 nm & medicína (RTG snímky) \\
gama záření & $< 0{,}01$ nm & jaderný rozpad, vesmír \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Důležité fakty}
\vspace{2mm}

\begin{itemize}
    \item Všechny tyto vlny jsou v jádru \textbf{stejné} -- liší se jen vlnovou délkou.
    \item Krátká vlna = velká frekvence = velká energie (RTG, gama -- nebezpečné).
    \item Dlouhá vlna = malá energie (rádio -- bezpečné).
    \item Atmosféra propouští: viditelné světlo, část rádiových vln, část IR.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--silnoproud': String.raw`
{\LARGE \bfseries Silnoproud} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Silnoproud} = elektrické rozvody pro \textbf{přenos energie}.
    \item Velká napětí (až stovky tisíc voltů) a velké proudy.
    \item Opak: \emph{slaboproud} = signály a data (telefony, počítačové sítě).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Cesta elektřiny od elektrárny ke spotřebiteli}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, fill=orange!30, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.9cm] (e) at (0, 0) {elektrárna};
    \node[draw, fill=zfblue!20, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.9cm] (t1) at (3, 0) {trafo};
    \node[draw, fill=zfred!20, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=0.9cm] (vn) at (6.5, 0) {vedení VVN};
    \node[draw, fill=zfblue!20, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.9cm] (t2) at (10, 0) {trafo};
    \node[draw, fill=zfgreen!20, thick, rounded corners=4pt, minimum width=2cm, minimum height=0.9cm] (d) at (13, 0) {dům};

    \draw[->, thick] (e.east) -- (t1.west);
    \draw[->, thick] (t1.east) -- (vn.west);
    \draw[->, thick] (vn.east) -- (t2.west);
    \draw[->, thick] (t2.east) -- (d.west);

    \node[font=\scriptsize] at (1.5, -0.7) {22 kV};
    \node[font=\scriptsize] at (4.75, -0.7) {$\to$};
    \node[font=\scriptsize\bfseries] at (6.5, -0.7) {400 kV};
    \node[font=\scriptsize] at (8.25, -0.7) {$\to$};
    \node[font=\scriptsize] at (10, -0.7) {22 kV};
    \node[font=\scriptsize] at (11.5, -0.7) {$\to$};
    \node[font=\scriptsize] at (13, -0.7) {230 V};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Hladiny napětí}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Označení & \bfseries Napětí & \bfseries Použití \\
\hline
NN -- nízké napětí & do 1 kV & domácnosti (230 V), sídliště \\
VN -- vysoké napětí & 1--52 kV & město, vesnice (22 kV) \\
VVN -- velmi vysoké napětí & 52--300 kV & rozvod krajem (110, 220 kV) \\
ZVN -- zvlášť vysoké napětí & 300--800 kV & dálkový přenos (400 kV) \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Proč na dálku VVN?}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
Při stejném výkonu $P = U \cdot I$: \textbf{vyšší napětí} $\Rightarrow$ \textbf{menší proud} $\Rightarrow$ \textbf{menší ztráty} ve vodiči ($P_z = R \cdot I^2$).
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item Vysoké napětí = méně tepelných ztrát při přenosu.
    \item Trafostanice mění napětí podle potřeby.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vedení VN a VVN}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Venkovní vedení} -- \emph{neizolované} hliníkové dráty na stožárech.
    \item Izolaci tvoří \textbf{vzduch} a porcelánové izolátory.
    \item \textbf{Kabelová} vedení (v zemi) -- ve městech, dražší.
    \item \textbf{Stožáry} jsou vysoké 30--60 m, dráhy oddělené min. 7 m.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Bezpečnost u silnoproudu}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pozor!} Vysoké napětí může zabít i bez přímého dotyku -- proud \emph{přeskočí} přes vzduch (oblouk). U VVN je nebezpečná zóna i 5 metrů.
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Nikdy} nelez na sloup, do trafostanice ani k drátům.
    \item Při bouřce se nepřibližuj k venkovnímu vedení.
    \item Pokud spadne drát na zem -- vzdal se a nahlas ČEZ (linka 800 850 860).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--pojistky-a-jistice': String.raw`
{\LARGE \bfseries Pojistky a jističe} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Ochranné prvky} v elektrickém obvodu, které zabraňují požáru a úrazu.
    \item Při \textbf{přetížení} nebo \textbf{zkratu} obvod přeruší.
    \item Najdeš je v každé \emph{rozvodné skříni} domu nebo bytu.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pojistka (tavná)}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=zfgray] (0, 0) rectangle (3, 0.7);
    \draw[thick] (-0.4, 0.35) -- (0, 0.35);
    \draw[thick] (3, 0.35) -- (3.4, 0.35);
    \draw[thick] (0.3, 0.35) -- (0.8, 0.35);
    \draw[thick, decoration={coil, segment length=1mm}, decorate, zfred] (0.8, 0.35) -- (2.2, 0.35);
    \draw[thick] (2.2, 0.35) -- (2.7, 0.35);
    \node[font=\bfseries\small] at (1.5, 1) {pojistka};
    \node[font=\scriptsize] at (1.5, -0.3) {tenký drátek};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Uvnitř je \textbf{tenký drátek} z pájecí slitiny.
    \item Při velkém proudu se drátek přepálí $\to$ obvod se přeruší.
    \item Po přepálení se musí \textbf{vyměnit za novou}.
    \item Označení: 6 A, 10 A, 16 A, 25 A...
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jistič}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick, fill=zfgray] (0, 0) rectangle (1.4, 1.6);
    \draw[thick, fill=white] (0.4, 0.6) rectangle (1, 1.2);
    \draw[thick] (0.7, 0.6) -- (0.7, 0.3);
    \draw[thick, fill=zfred] (0.5, 0.05) rectangle (0.9, 0.3);
    \node[font=\scriptsize] at (0.7, 1.45) {ON};
    \node[font=\scriptsize] at (0.7, 0.4) {OFF};
    \node[font=\bfseries\small] at (0.7, 1.9) {jistič};
    \node[font=\scriptsize] at (0.7, -0.3) {páčka -- vrátíš zpět};

    % Více jističů vedle sebe
    \begin{scope}[shift={(2.5, 0)}]
        \foreach \i in {0, 1, 2, 3} {
            \draw[thick, fill=zfgray] ({\i*0.6}, 0) rectangle ({\i*0.6+0.5}, 1.6);
            \draw[thick, fill=white] ({\i*0.6+0.05}, 0.7) rectangle ({\i*0.6+0.45}, 1.1);
            \draw[thick, fill=zfred] ({\i*0.6+0.15}, 0.05) rectangle ({\i*0.6+0.35}, 0.3);
            \node[font=\tiny] at ({\i*0.6+0.25}, 0.9) {C16};
        }
        \node[font=\scriptsize] at (1, 1.95) {rozvodná skříň};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Funguje jako \textbf{automatický spínač}.
    \item Při zkratu nebo přetížení se sám \emph{vypne} -- páčka spadne dolů.
    \item Stačí ji \textbf{vrátit zpět} -- nemusíš nic vyměňovat.
    \item Označení: \textbf{B16, C16, B10}... (písmeno = charakteristika, číslo = jmenovitý proud).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Proudový chránič}
\vspace{2mm}

\begin{itemize}
    \item Speciální jistič, který chrání \textbf{lidský život}.
    \item Měří, jestli proud, který vchází, je stejný jako proud, který vychází.
    \item Když proud někudy \uv{uniká} (např. tělem člověka) -- okamžitě vypne.
    \item Reaguje za \textbf{30 ms}, prahová hodnota \textbf{30 mA}.
    \item Najdeš ho hlavně v \emph{koupelně, kuchyni, venkovních zásuvkách}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Když \uv{vyhodí jistič}}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Vypni přebytečné spotřebiče (varná konvice, fén, sporák, žehlička).
    \item Najdi vypnutý jistič (páčka dolů).
    \item Vrať ho \textbf{nahoru} (do polohy ON).
    \item Pokud se znovu vypne, je závada -- volej elektrikáře.
\end{enumerate}
\end{tcolorbox}

\vspace{2mm}
{\Large \bfseries \color{zfblue} Klady a zápory}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
& \bfseries Pojistka & \bfseries Jistič \\
\hline
cena & levná & dražší \\
po vybavení & výměna & vrátit páčku \\
přesnost & nižší & vyšší \\
životnost & jednorázová & tisíce sepnutí \\
dnes se používá & méně & většinou \\
\hline
\end{tabular}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrina--polovodice': String.raw`
{\LARGE \bfseries Polovodiče} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Polovodič} vede proud \emph{lépe než izolant, ale hůř než kov}.
    \item Vodivost závisí na \textbf{teplotě, světle, příměsích}.
    \item Nejdůležitější polovodiče: \textbf{křemík (Si)} a germanium (Ge).
    \item Stojí za fungováním celé moderní elektroniky.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vodič, polovodič, izolant}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[zfblue!50] (0, 0) rectangle (3, 0.8);
    \fill[zfgreen!50] (3, 0) rectangle (6, 0.8);
    \fill[zfred!50] (6, 0) rectangle (9, 0.8);
    \draw[thick] (0, 0) rectangle (9, 0.8);
    \draw[thick] (3, 0) -- (3, 0.8);
    \draw[thick] (6, 0) -- (6, 0.8);

    \node[font=\bfseries\small] at (1.5, 0.4) {vodič};
    \node[font=\bfseries\small] at (4.5, 0.4) {polovodič};
    \node[font=\bfseries\small] at (7.5, 0.4) {izolant};

    \node[font=\scriptsize] at (1.5, -0.4) {Cu, Al, Fe};
    \node[font=\scriptsize] at (4.5, -0.4) {Si, Ge};
    \node[font=\scriptsize] at (7.5, -0.4) {sklo, plast};

    \node[font=\scriptsize] at (1.5, -0.85) {nízký odpor};
    \node[font=\scriptsize] at (4.5, -0.85) {střední};
    \node[font=\scriptsize] at (7.5, -0.85) {vysoký};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Polovodič typu N a P}
\vspace{2mm}

\noindent
Čistý polovodič vede proud špatně. \textbf{Příměsi} (\emph{dopování}) zvyšují vodivost.

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Typ & \bfseries Proud nesou & \bfseries Příměs (do Si) \\
\hline
\textbf{N} (negative) & elektrony ($-$) & fosfor (P), arsen \\
\textbf{P} (positive) & \uv{díry} (+) & bór (B), galium \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Dioda -- spojení P a N}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Polopropustná
    \draw[thick] (-1, 0) -- (0, 0);
    \draw[thick, fill=black] (0, 0.3) -- (0, -0.3) -- (0.5, 0) -- cycle;
    \draw[thick] (0.5, 0.3) -- (0.5, -0.3);
    \draw[thick] (0.5, 0) -- (1.5, 0);
    \node[font=\bfseries\scriptsize, anchor=north] at (0.25, -0.4) {dioda};
    \node[font=\bfseries] at (-0.7, 0.25) {+};
    \node[font=\bfseries] at (1.2, 0.25) {$-$};

    % Šipka — proud teče
    \draw[->, thick, zfgreen] (-0.7, 0.5) -- (1.2, 0.5);
    \node[font=\scriptsize, color=zfgreen] at (0.25, 0.8) {proud teče};

    % Opačně
    \begin{scope}[shift={(5, 0)}]
        \draw[thick] (-1, 0) -- (0, 0);
        \draw[thick, fill=black] (0, 0.3) -- (0, -0.3) -- (0.5, 0) -- cycle;
        \draw[thick] (0.5, 0.3) -- (0.5, -0.3);
        \draw[thick] (0.5, 0) -- (1.5, 0);
        \node[font=\bfseries] at (-0.7, 0.25) {$-$};
        \node[font=\bfseries] at (1.2, 0.25) {+};

        \draw[ultra thick, zfred] (-0.5, 0.5) -- (1, 0.5);
        \draw[ultra thick, zfred] (-0.5, 0.7) -- (-0.4, 0.3);
        \draw[ultra thick, zfred] (-0.4, 0.7) -- (-0.5, 0.3);
        \node[font=\scriptsize, color=zfred] at (0.25, 0.9) {neteče};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Dioda} = polovodič složený z části P a N.
    \item Proud propustí \textbf{pouze jedním směrem}.
    \item Druhým směrem se chová jako izolant.
    \item Použití: \emph{usměrňovač} (mění AC na DC), ochrana obvodů.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} LED -- světelná dioda}
\vspace{2mm}

\begin{itemize}
    \item Speciální dioda, která při průchodu proudu \textbf{svítí}.
    \item Vysoká účinnost (až 40 \%), dlouhá životnost (50\,000 hodin).
    \item Barvy: červená, zelená, modrá, žlutá, bílá, IR.
    \item Použití: žárovky, baterky, displeje, dálkové ovladače, semafory.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tranzistor}
\vspace{2mm}

\begin{itemize}
    \item Polovodič se \textbf{třemi vrstvami} (NPN nebo PNP).
    \item Funguje jako \textbf{spínač} nebo \textbf{zesilovač}.
    \item Malý vstupní proud řídí velký výstupní proud.
    \item Je \textbf{základní stavební prvek} elektroniky -- mobil má miliardy tranzistorů.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Další polovodičové součástky}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Součástka & \bfseries Co dělá \\
\hline
\textbf{LED} & světelná dioda \\
\textbf{fotodioda, fototranzistor} & reaguje na světlo \\
\textbf{solární článek} & ze světla vyrábí elektřinu \\
\textbf{termistor} & odpor mění s teplotou (čidlo) \\
\textbf{integrovaný obvod (čip)} & miliony tranzistorů na 1 cm$^2$ \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Význam polovodičů dnes}
\vspace{2mm}

\begin{itemize}
    \item Bez polovodičů by neexistovaly mobily, počítače, internet, auta s elektronikou.
    \item Největší výrobci: Taiwan (TSMC), Korea (Samsung), USA (Intel).
    \item Vývoj: stále menší tranzistory (dnes 3 nm), víc výkonu na čip.
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
