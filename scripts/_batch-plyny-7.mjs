/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Plyny (7. ročník).
 * Spuštění: node scripts/_batch-plyny-7.mjs
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
  'plyny-7--atmosfera': String.raw`
{\LARGE \bfseries Atmosféra a atmosférický tlak} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Atmosféra} = vzdušný obal Země. Sahá zhruba 1000 km do vesmíru.
    \item Drží se Země díky \textbf{gravitační síle}.
    \item Vzduch má \textbf{hmotnost} -- proto na nás tlačí.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vrstvy atmosféry}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \fill[blue!10] (0, 0) rectangle (10, 1.2);
    \fill[blue!20] (0, 1.2) rectangle (10, 2.4);
    \fill[blue!35] (0, 2.4) rectangle (10, 3.6);
    \fill[blue!50] (0, 3.6) rectangle (10, 4.8);
    \fill[blue!70] (0, 4.8) rectangle (10, 5.6);
    \draw[thick] (0, 0) rectangle (10, 5.6);

    % Země
    \fill[zfgreen!50] (0, -0.2) rectangle (10, 0);

    \node[font=\bfseries] at (5, 0.6) {Troposféra (0--10 km) -- počasí, mraky};
    \node[font=\bfseries] at (5, 1.8) {Stratosféra (10--50 km) -- ozonová vrstva};
    \node[font=\bfseries] at (5, 3.0) {Mezosféra (50--80 km) -- meteory};
    \node[font=\bfseries] at (5, 4.2) {Termosféra (80--600 km) -- polární záře};
    \node[font=\bfseries, color=white] at (5, 5.2) {Exosféra (600+ km)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Žijeme v nejnižší vrstvě -- \textbf{troposféře}.
    \item S výškou klesá teplota i tlak.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Atmosférický tlak}
\vspace{2mm}

\begin{itemize}
    \item Vzduch nad námi nás \textbf{tlačí dolů} svou tíhou.
    \item Při hladině moře: $p_a \approx \textbf{100\,000 Pa = 100 kPa}$ (přesněji 1013 hPa).
    \item Tomuto tlaku odpovídá \textbf{1 atmosféra (atm)}.
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pamatuj:} Atmosféra na 1 m$^2$ tlačí silou 100\,000 N (= tíha asi 10 tun)! Necítíme to, protože tlak působí stejně i \emph{zevnitř} (z plic, krve...).
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Tlak klesá s výškou}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Výška & \bfseries Tlak & \bfseries Pozn. \\
\hline
0 m (hladina moře) & 100 kPa & běžný stav \\
1\,000 m & 90 kPa & turistika \\
3\,000 m (vysoké hory) & 70 kPa & hůře se dýchá \\
8\,848 m (Mt. Everest) & 33 kPa & potřebné kyslíkové masky \\
10\,000 m (letadlo) & 25 kPa & kabina je tlakována \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Měření atmosférického tlaku -- barometr}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Torricelliho pokus
    \draw[thick] (0, 0) -- (0, 4) (1.2, 0) -- (1.2, 4);
    \fill[gray!70] (0.05, 0.05) rectangle (1.15, 3.2);
    \draw[thick] (-0.5, 0) -- (-0.5, 0.6) -- (1.7, 0.6) -- (1.7, 0);
    \fill[gray!70] (-0.5, 0) rectangle (1.7, 0.6);

    % Stupnice
    \draw[thick, dashed] (1.2, 3.2) -- (2.5, 3.2);
    \draw[thick, dashed] (1.2, 0.6) -- (2.5, 0.6);
    \draw[<->, thick] (2.4, 0.6) -- (2.4, 3.2);
    \node[font=\bfseries\small, anchor=west] at (2.5, 1.9) {760 mm};
    \node[font=\small, anchor=west] at (2.5, 1.5) {(rtuť)};

    % Vakuum
    \fill[white] (0.05, 3.2) rectangle (1.15, 3.95);
    \node[font=\scriptsize] at (0.6, 3.6) {vakuum};

    % Šipky tlaku
    \draw[->, very thick, zfred] (-1.2, 0.3) -- (-0.55, 0.3);
    \node[font=\bfseries, color=zfred, anchor=east] at (-1.3, 0.3) {$p_a$};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Torricelliho pokus} -- trubice se rtutí, převrácená do nádobky.
    \item Atmosférický tlak udrží sloupec rtuti vysoký \textbf{760 mm}.
    \item Stará jednotka: 1 atm = 760 mm Hg = 1013 hPa.
    \item Dnešní barometry jsou většinou \textbf{kovové (aneroidní)}.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'plyny-7--vakuum': String.raw`
{\LARGE \bfseries Vakuum} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Vakuum} = prostor, ve kterém téměř \textbf{nejsou žádné částice}.
    \item Slovo pochází z latinského \emph{vacuus} = prázdný.
    \item Dokonalé vakuum nelze vytvořit -- vždy zbývá několik molekul.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy vakua}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Tlak & \bfseries Použití \\
\hline
hrubé vakuum & 100 -- 0,1 Pa & vysavač, žárovky \\
jemné vakuum & 0,1 -- 10$^{-4}$ Pa & televizní obrazovky (staré CRT) \\
vysoké vakuum & 10$^{-4}$ -- 10$^{-7}$ Pa & vědecké přístroje \\
mezihvězdný prostor & $\sim$ 10$^{-15}$ Pa & téměř dokonalé vakuum \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Magdeburské polokoule (1654)}
\vspace{2mm}

\noindent
Slavný pokus Otto von Guericka -- ukázal sílu atmosférického tlaku.

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Levá polokoule
    \draw[thick, fill=gray!50] (2.2, 0) arc (0:180:1.5) -- cycle;
    % Pravá polokoule
    \draw[thick, fill=gray!50] (5, 0) arc (180:360:1.5) -- cycle;
    % Linka rozhraní
    \draw[thick, dashed, gray!50] (2.2, 0) -- (8, 0);

    % Šipky tlaku
    \foreach \a in {120, 150, 180, 210, 240} {
        \draw[->, thick, zfred] ({2.55+1.8*cos(\a)}, {1.8*sin(\a)}) -- ({2.55+1.0*cos(\a)}, {1.0*sin(\a)});
    }
    \foreach \a in {-60, -30, 0, 30, 60} {
        \draw[->, thick, zfred] ({7.55+1.8*cos(\a)}, {1.8*sin(\a)}) -- ({7.55+1.0*cos(\a)}, {1.0*sin(\a)});
    }

    % Šipky koně
    \draw[->, ultra thick, zfblue] (2.5, 0) -- (0.5, 0);
    \draw[->, ultra thick, zfblue] (7.55, 0) -- (9.55, 0);

    \node[font=\bfseries\small, color=zfblue] at (0.5, 0.5) {koně};
    \node[font=\bfseries\small, color=zfblue] at (9.55, 0.5) {koně};
    \node[font=\bfseries\small, color=zfred] at (5, -1.7) {atmosférický tlak drží polokoule k sobě};
    \node[font=\small] at (5, 1.5) {vakuum uvnitř};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Dvě kovové polokoule spojili a vyčerpali vzduch \textbf{dovnitř}.
    \item Polokoule \textbf{nešly oddělit} -- ani 16 koní (8 na každé straně) je nedokázalo roztrhnout.
    \item Důvod: \textbf{atmosférický tlak} tlačí na koule zvnějšku, uvnitř není proti čemu tlačit.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vakuum v každodenním životě}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Vysavač (jednoduchý)
    \draw[thick, fill=zfblue!30] (0, 0) rectangle (1.8, 1.2);
    \draw[thick, fill=gray!50] (0.3, 1.2) rectangle (0.6, 1.6);
    \draw[thick] (1.8, 0.5) -- (2.6, 0.5) (1.8, 0.7) -- (2.6, 0.7);
    \draw[->, thick, zfred] (3, 0.6) -- (2.6, 0.6);
    \node[font=\scriptsize] at (3.4, 0.6) {prach};
    \node[font=\bfseries\scriptsize] at (0.9, 0.6) {vysavač};

    % Termoska (řez)
    \begin{scope}[shift={(5.5,0)}]
        \draw[thick] (0, 0) rectangle (1.8, 2.2);
        \draw[thick] (0.3, 0) rectangle (1.5, 2.2);
        \fill[gray!20] (0, 0) rectangle (0.3, 2.2);
        \fill[gray!20] (1.5, 0) rectangle (1.8, 2.2);
        \draw[thick] (0.3, 2) rectangle (1.5, 2.2);
        \fill[orange!30] (0.3, 0) rectangle (1.5, 1.8);
        \node[font=\scriptsize] at (0.9, 1) {teplý};
        \node[font=\scriptsize] at (0.9, 0.6) {nápoj};
        \node[font=\bfseries\scriptsize] at (0.9, -0.4) {termoska};
        \node[font=\scriptsize, anchor=west] at (1.85, 1) {vakuum};
    \end{scope}

    % Žárovka
    \begin{scope}[shift={(10,0)}]
        \draw[thick] (0.5, 0) rectangle (1, 0.5);
        \draw[thick] (0.4, 0.5) -- (1.1, 0.5) -- (1.1, 0.9) -- (0.4, 0.9) -- cycle;
        \draw[thick] (0.4, 0.9) .. controls (0.0, 1) and (0.0, 1.5) .. (0.4, 2.0)
                            .. controls (0.7, 2.4) and (0.8, 2.4) .. (1.1, 2.0)
                            .. controls (1.5, 1.5) and (1.5, 1) .. (1.1, 0.9);
        \draw[thick] (0.65, 1.2) .. controls (0.65, 1.5) and (0.85, 1.5) .. (0.85, 1.2);
        \node[font=\bfseries\scriptsize] at (0.75, -0.4) {žárovka};
    \end{scope}
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Vysavač} -- ventilátor sníží tlak uvnitř, atmosférický tlak natlačí prach dovnitř.
    \item \textbf{Termoska} -- mezi stěnami je vakuum, neprochází jím teplo (vakuum nevede teplo).
    \item \textbf{Žárovka} -- bez vakua by se vlákno spálilo (kyslík by způsobil hoření).
    \item \textbf{Vesmír} -- skoro vakuum, kosmonauti potřebují skafandry.
    \item \textbf{Konzervování potravin} -- v sáčku bez vzduchu jídlo déle vydrží.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'plyny-7--vztlak-v-plynech': String.raw`
{\LARGE \bfseries Vztlaková síla v plynech} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Archimédův zákon} platí nejen pro kapaliny, ale i pro \textbf{plyny}.
    \item Na každé těleso ve vzduchu působí \textbf{vztlaková síla} směřující vzhůru.
    \item Velikost: $F_{vz} = V \cdot \rho_{vzd} \cdot g$ \quad ($V$ = objem tělesa).
\end{itemize}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Hustota vzduchu:} $\rho_{vzd} \approx 1{,}3$ kg/m$^3$ -- velmi malá. Proto je vztlak ve vzduchu \emph{slabý} a běžně ho nepozorujeme.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co stoupá vzhůru?}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Plyn & \bfseries Hustota (kg/m$^3$) & \bfseries Chování \\
\hline
\textbf{vodík} (H$_2$) & 0,09 & stoupá rychle (nejlehčí plyn) \\
\textbf{helium} (He) & 0,18 & stoupá (bezpečné, nehořlavé) \\
\textbf{teplý vzduch} & 1,0 & stoupá (méně hustý) \\
\textbf{vzduch} & 1,3 & referenční hodnota \\
oxid uhličitý (CO$_2$) & 2,0 & klesá ke dnu \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Pokud má plyn \textbf{menší hustotu} než vzduch -- balon stoupá.
    \item Pokud je \textbf{stejná} -- balon se vznáší na místě.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Heliový balonek}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Balonek
    \draw[thick, fill=zfred!50] (3, 2) ellipse (0.9 and 1.1);
    \draw[thick] (3, 0.9) -- (3.1, 0.6) -- (2.9, 0.6) -- cycle;
    \draw[thick] (3, 0.6) -- (3, -1);
    \node[font=\small, color=white] at (3, 2) {He};

    % Šipka vztlaku
    \draw[->, ultra thick, zfgreen] (3, -1.6) -- (3, 0.5);
    \node[font=\bfseries, color=zfgreen] at (4, -0.3) {$F_{vz}$};

    % Šipka tíhové síly
    \draw[->, ultra thick, zfred] (3, 3.5) -- (3, 2.4);
    \node[font=\bfseries, color=zfred] at (3.7, 3) {$F_g$};

    % Anotace
    \node[font=\small, anchor=west] at (5, 1.5) {$F_{vz} > F_g$};
    \node[font=\small, anchor=west] at (5, 1) {$\Rightarrow$ balonek stoupá};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Horkovzdušný balon}
\vspace{2mm}

\begin{itemize}
    \item Hořák zahřívá vzduch v balonu.
    \item \textbf{Teplý vzduch} má \emph{menší hustotu} než studený.
    \item Jakmile je celkové (balon + koš + lidé) lehčí než vytlačený vzduch, balon \textbf{stoupá}.
    \item Otočením do strany horší vyrovnává a klesá.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Balon
    \draw[thick, fill=zfred!40] (0, 0) .. controls (-1.3, 0.3) and (-1.5, 2.5) .. (0, 2.8)
                                       .. controls (1.5, 2.5) and (1.3, 0.3) .. (0, 0);
    \draw[thick] (-0.4, 0) -- (-0.5, -0.3);
    \draw[thick] (0.4, 0) -- (0.5, -0.3);
    \draw[thick, fill=brown!50] (-0.5, -0.8) rectangle (0.5, -0.3);
    \draw[thick] (-0.5, -0.3) -- (-0.4, 0);
    \draw[thick] (0.5, -0.3) -- (0.4, 0);
    \node[font=\scriptsize] at (0, -0.55) {koš};

    % Plamen
    \fill[orange!80] (-0.1, -0.05) -- (0.1, -0.05) -- (0, 0.3) -- cycle;

    % Stoupání
    \draw[->, ultra thick, zfgreen] (0, -1.5) -- (0, -0.9);
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vzducholoď}
\vspace{2mm}

\begin{itemize}
    \item Velký podlouhlý balon naplněný \textbf{heliem}.
    \item Je řízená -- má motory a kormidlo.
    \item Dříve se používala s vodíkem -- po havárii \textbf{Hindenburg} (1937) se přešlo na helium.
    \item Dnes hlavně pro reklamu, vzdušnou dopravu nákladu.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Co dalšího ovlivňuje vztlak ve vzduchu?}
\vspace{2mm}

\begin{itemize}
    \item Velikost \textbf{objemu} tělesa -- větší balon $\Rightarrow$ větší vztlak.
    \item \textbf{Hustota} okolního vzduchu -- v horách je menší $\Rightarrow$ menší vztlak.
    \item \textbf{Teplota} vzduchu -- teplý vzduch je řidší, takže vztlak je menší.
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
