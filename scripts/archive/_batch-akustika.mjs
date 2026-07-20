/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Akustika (8. ročník).
 * Spuštění: node scripts/_batch-akustika.mjs
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
  'akustika--zdroje-zvuku': String.raw`
{\LARGE \bfseries Zdroje zvuku} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Zvuk} vzniká \textbf{kmitáním} (chvěním) tělesa.
    \item Kmitání rozechvěje okolní vzduch a vznikne \textbf{zvuková vlna}.
    \item Zvuk se šíří jen \textbf{prostředím} (vzduch, voda, kov). \textbf{Ve vakuu se nešíří.}
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy zdrojů zvuku}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Zdroj & \bfseries Příklady \\
\hline
hlasivky člověka & řeč, zpěv, smích \\
struny & kytara, housle, klavír \\
sloupce vzduchu & flétna, trubka, varhany, píšťalka \\
membrány & buben, reproduktor, ušní bubínek \\
plech, dřevo & zvon, xylofon, dřevěné desky \\
přírodní & vítr, šumění lesa, hrom, déšť \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Šíření zvuku v různých prostředích}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[font=\bfseries] at (-3, 1.5) {Rychlost zvuku:};

    % Vzduch
    \fill[cyan!10] (0, 0) rectangle (2.5, 1);
    \draw[thick] (0, 0) rectangle (2.5, 1);
    \node[font=\bfseries\small] at (1.25, 0.5) {vzduch};
    \node[font=\small] at (1.25, -0.4) {340 m/s};

    % Voda
    \fill[cyan!50] (3, 0) rectangle (5.5, 1);
    \draw[thick] (3, 0) rectangle (5.5, 1);
    \node[font=\bfseries\small] at (4.25, 0.5) {voda};
    \node[font=\small] at (4.25, -0.4) {1\,500 m/s};

    % Ocel
    \fill[gray!60] (6, 0) rectangle (8.5, 1);
    \draw[thick] (6, 0) rectangle (8.5, 1);
    \node[font=\bfseries\small] at (7.25, 0.5) {ocel};
    \node[font=\small] at (7.25, -0.4) {5\,000 m/s};

    % Vakuum
    \fill[white] (9, 0) rectangle (11.5, 1);
    \draw[thick, dashed] (9, 0) rectangle (11.5, 1);
    \node[font=\bfseries\small] at (10.25, 0.5) {vakuum};
    \node[font=\small, color=zfred] at (10.25, -0.4) {0 (nešíří se)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Zvuk se šíří \textbf{rychleji v hustších látkách} (kov $>$ voda $>$ vzduch).
    \item Ve vesmíru je vakuum -- explozí v hollywoodských filmech \emph{ve skutečnosti} neslyšíme.
    \item Rychlost zvuku ve vzduchu závisí na teplotě (při 0\,\textdegree C je 331 m/s).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklad -- bouřka}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pravidlo 3 sekund:} Spočítej sekundy mezi bleskem a hřměním. Vydělíš 3 a víš, jak je bouřka daleko v km. \\
(Světlo letí okamžitě, zvuk za 3 s ujede asi 1 km.)
\end{tcolorbox}

\vspace{2mm}
\noindent
\textbf{Příklad:} Mezi bleskem a hřměním uplynulo 6 s. Jak daleko byla bouřka?

\smallskip
\noindent
\textbf{Zápis:}\\
$t = 6$ s\\
$v = 340$ m/s (rychlost zvuku)\\
$s = ?$ m

\smallskip
\noindent
\textbf{Vzorec:} \quad $s = v \cdot t$

\smallskip
\noindent
\textbf{Dosazení:} \quad $s = 340~\text{m/s} \cdot 6~\text{s} = 2\,040$ m $\approx 2$ km

\smallskip
\noindent
\textbf{Odpověď:} Bouřka byla zhruba 2 km daleko.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Ozvěna a dozvuk}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Ozvěna} -- zvuk se odrazí od překážky a vrátí se k nám.
    \item Aby vznikla samostatná ozvěna, musí být překážka aspoň 17 m daleko.
    \item \textbf{Dozvuk} -- v sálu se zvuk mnohonásobně odráží. Slyšíme \uv{doznívání}.
    \item \textbf{Sonar} a \textbf{ultrazvuk} využívají odraz zvuku k měření vzdálenosti.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pohlcování zvuku}
\vspace{2mm}

\begin{itemize}
    \item Měkké materiály (koberce, závěsy, polystyren, vlna) zvuk \textbf{pohlcují}.
    \item Tvrdé hladké povrchy (zdi, podlaha) zvuk \textbf{odrážejí}.
    \item Studia, divadla a kina mají speciální \textbf{akustické úpravy}.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'akustika--vlneni': String.raw`
{\LARGE \bfseries Zvukové vlnění} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Zvuk je \textbf{mechanické vlnění} -- střídání zhuštění a zředění částic vzduchu.
    \item Vlnění popisujeme \textbf{vlnovou délkou} a \textbf{frekvencí}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Sinusovka -- záznam zvuku}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Osy
    \draw[->, thick] (0, 0) -- (10, 0) node[right] {čas $t$};
    \draw[->, thick] (0, -1.7) -- (0, 1.7) node[above] {výchylka};

    % Sinusovka
    \draw[ultra thick, zfblue, samples=200, domain=0:9.5] plot (\x, {1.2*sin(deg(\x))});

    % Amplituda
    \draw[<->, thick, zfred] (1.57, 0) -- (1.57, 1.2);
    \node[font=\bfseries\small, color=zfred, anchor=west] at (1.65, 0.6) {amplituda $A$};

    % Vlnová délka (perioda)
    \draw[<->, thick, zfgreen] (1.57, 1.5) -- (7.85, 1.5);
    \node[font=\bfseries\small, color=zfgreen] at (4.7, 1.85) {perioda $T$ (vlnová délka $\lambda$)};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Důležité veličiny}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Veličina & \bfseries Značka, jednotka & \bfseries Co popisuje \\
\hline
frekvence (kmitočet) & $f$, Hz (hertz) & počet kmitů za sekundu \\
perioda & $T$, s & doba jednoho kmitu \\
vlnová délka & $\lambda$, m & vzdálenost mezi dvěma vrcholy \\
amplituda & $A$ & největší výchylka \\
rychlost vlnění & $c$, m/s & rychlost šíření \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $c = \lambda \cdot f$ \quad\quad
$T = \dfrac{1}{f}$
\end{center}
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Výška a hlasitost zvuku}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Výška tónu} = závisí na \textbf{frekvenci}.
    \begin{itemize}
        \item Vysoká frekvence (mnoho kmitů) $\to$ vysoký tón (zvuk pikolky, písknutí).
        \item Nízká frekvence $\to$ hluboký tón (basa, hrom).
    \end{itemize}
    \item \textbf{Hlasitost} = závisí na \textbf{amplitudě}.
    \begin{itemize}
        \item Velká amplituda $\to$ hlasitý zvuk.
        \item Malá amplituda $\to$ tichý zvuk.
    \end{itemize}
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Slyšitelný rozsah}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0, 0) -- (12, 0);

    % Infrazvuk
    \fill[zfred!30] (0, -0.3) rectangle (2.5, 0.3);
    \node[font=\small] at (1.25, 0) {infrazvuk};
    \node[font=\scriptsize] at (1.25, -0.6) {pod 20 Hz};

    % Slyšitelný
    \fill[zfgreen!30] (2.5, -0.3) rectangle (8.5, 0.3);
    \node[font=\bfseries\small] at (5.5, 0) {slyšitelný zvuk};
    \node[font=\scriptsize] at (5.5, -0.6) {20 Hz -- 20\,000 Hz};

    % Ultrazvuk
    \fill[zfblue!30] (8.5, -0.3) rectangle (12, 0.3);
    \node[font=\small] at (10.25, 0) {ultrazvuk};
    \node[font=\scriptsize] at (10.25, -0.6) {nad 20 kHz};

    \draw[thick] (2.5, -0.3) -- (2.5, 0.3);
    \draw[thick] (8.5, -0.3) -- (8.5, 0.3);

    \node[font=\scriptsize] at (2.5, 0.55) {20 Hz};
    \node[font=\scriptsize] at (8.5, 0.55) {20 kHz};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Lidé slyší} cca 20 Hz až 20 000 Hz (mladí lidé, s věkem horní hranice klesá).
    \item \textbf{Pod 20 Hz} = \emph{infrazvuk} (slon, velryba, sopky, zemětřesení).
    \item \textbf{Nad 20 kHz} = \emph{ultrazvuk} (netopýr, delfín, sonografie, mytí součástek).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Hlasitost v decibelech}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries dB & \bfseries Příklad \\
\hline
0 & práh slyšení \\
30 & šepot, klidná knihovna \\
60 & běžný hovor \\
80 & rušná ulice, vysavač \\
100 & dělová střela, koncert \\
120 & odlétající letadlo (\textbf{práh bolesti}) \\
140 & start rakety -- nebezpečí poškození sluchu \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Dlouhodobý hluk \textbf{nad 85 dB} poškozuje sluch.
    \item Měříme \textbf{hladinu zvuku} v decibelech (dB) -- hlukoměrem.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'akustika--hudebni-nastroje': String.raw`
{\LARGE \bfseries Hudební nástroje} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Hudební nástroj je zdroj \textbf{tónu} -- pravidelného zvuku.
    \item Výška tónu závisí na \textbf{frekvenci kmitání}.
    \item Hudební nástroje dělíme podle \textbf{toho, co kmitá}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Strunné nástroje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0, 0.5) -- (5, 0.5);
    \draw[thick, decoration={snake, segment length=4mm, amplitude=2mm}, decorate] (0, 0) -- (5, 0);
    \draw[thick] (0, -0.5) -- (5, -0.5);
    \node[font=\bfseries\small] at (-0.7, 0) {strunný};
    \node[font=\scriptsize, anchor=west] at (5.2, 0.5) {tenká -- vysoký tón};
    \node[font=\scriptsize, anchor=west] at (5.2, 0) {střední};
    \node[font=\scriptsize, anchor=west] at (5.2, -0.5) {tlustá -- hluboký tón};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Kmitá \textbf{struna} -- napnuté vlákno (drát, nylon, střívko).
    \item Tón závisí na \textbf{délce, tloušťce a napnutí} struny.
    \item \textbf{Kratší / tenčí / napnutější} = \emph{vyšší} tón.
    \item Příklady: kytara, housle, klavír, harfa, kontrabas.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Dechové nástroje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0, 0) rectangle (5, 0.5);
    \draw[->, thick, zfblue] (-1, 0.25) -- (-0.1, 0.25);
    \node[font=\scriptsize, color=zfblue] at (-1.3, 0.25) {vzduch};
    \draw[->, decoration={snake, segment length=2mm, amplitude=1mm}, decorate, thick, zfred] (5.1, 0.25) -- (6.5, 0.25);
    \node[font=\scriptsize, color=zfred] at (6.7, 0.25) {tón};
    \foreach \x in {1.5, 2.5, 3.5} {
        \fill[black] (\x, 0.5) circle (0.1);
    }
    \node[font=\scriptsize] at (2.5, 1) {klapky / dírky};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Kmitá \textbf{sloupec vzduchu} v trubici.
    \item Délku sloupce měníme \emph{otvory} (flétna) nebo \emph{ventily} (trubka, klarinet).
    \item \textbf{Delší sloupec} = \emph{hlubší} tón.
    \item Druhy:
\end{itemize}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Skupina & \bfseries Příklady \\
\hline
dřevěné dechové & flétna, klarinet, hoboj, fagot, saxofon \\
žesťové dechové & trubka, lesní roh, pozoun, tuba \\
varhany & velký nástroj se stovkami píšťal \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Bicí nástroje}
\vspace{2mm}

\begin{itemize}
    \item Kmitá \textbf{membrána} (kůže, plast) nebo \textbf{plech, dřevo, kov}.
    \item Příklady: buben, tympány, talíře, xylofon, marimba, triangl, tamburína.
    \item Některé mají \emph{určitý} tón (xylofon), jiné jen \emph{rytmus} (rytmické bubny).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Klávesové nástroje}
\vspace{2mm}

\begin{itemize}
    \item Tón se vytváří úderem na klávesu, která rozkmitá strunu nebo elektronický prvek.
    \item Klavír (struny + kladívka), varhany (vzduch v píšťalách), syntezátor (elektronicky).
    \item Cembalo, akordeon, harmonium.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rezonance}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Rezonance} -- těleso \uv{rozkmitá} jiné, když mají stejnou vlastní frekvenci. Tak se zvuk struny zesílí ve dřevěné \emph{rezonanční skříni} kytary.
\end{tcolorbox}

\vspace{2mm}
\begin{itemize}
    \item Bez \textbf{rezonanční skříně} (kytara, housle) by struna zněla velmi tiše.
    \item Skříň přenese chvění na vzduch a zesílí ho.
    \item Známý jev: zpěvák může rozbít sklenici, když zazpívá její vlastní frekvenci.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Frekvence známých tónů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Tón & \bfseries Frekvence \\
\hline
nejhlubší tón klavíru (A0) & 27,5 Hz \\
komorní A (a$^1$) & \textbf{440 Hz} (ladí orchestr) \\
soprán -- nejvyšší C & 1\,046 Hz \\
nejvyšší tón klavíru (C8) & 4\,186 Hz \\
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
