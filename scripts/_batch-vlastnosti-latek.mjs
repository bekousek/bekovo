/**
 * Vloží LaTeX zápisy pro všech 5 podkapitol tématu Vlastnosti látek.
 * Spuštění: node scripts/_batch-vlastnosti-latek.mjs
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
\usetikzlibrary{shapes.symbols}
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
  'vlastnosti-latek--latky-a-telesa': String.raw`
{\LARGE \bfseries Látky a tělesa} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Látka} -- to, z čeho je těleso vyrobeno (např. dřevo, železo, sklo, voda).
    \item \textbf{Těleso} -- konkrétní předmět tvořený jednou nebo více látkami (např. stůl, hřebík, sklenice).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jedno těleso = několik látek}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|}
\hline
\rowcolor{zfblue!25}
\bfseries Židle & \bfseries Tužka & \bfseries Kolo & \bfseries Kniha & \bfseries Hrnek \\
\hline
dřevo & dřevo & kov & papír & keramika \\
kov & grafit & guma & lepidlo & glazura \\
plast & guma & plast & barva & \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{center}
\textcolor{gray!60}{\rule{0.7\textwidth}{0.4pt}}
\end{center}
\vspace{2mm}

{\Large \bfseries \color{zfblue} Jedna látka = mnoho těles}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{6pt}
\begin{tabular}{|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|>{\centering\arraybackslash}p{2.4cm}|}
\hline
\rowcolor{zfpurple!25}
\bfseries Dřevo & \bfseries Sklo & \bfseries Železo & \bfseries Plast & \bfseries Papír \\
\hline
stůl & sklenice & hřebík & láhev & kniha \\
tužka & okno & kladivo & hračka & sešit \\
police & brýle & kolejnice & kbelík & ubrousek \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenství látek}
\vspace{2mm}

\noindent
Látky se vyskytují ve třech základních skupenstvích:

\vspace{1mm}
\begin{itemize}
    \item \textbf{Pevné} -- mají stálý tvar i objem (kámen, kov, dřevo, led, sůl, písek).
    \item \textbf{Kapalné} -- mají stálý objem, nemají stálý tvar (voda, olej, mléko, líh, rtuť).
    \item \textbf{Plynné} -- nemají stálý tvar ani objem (vzduch, kyslík, vodík, vodní pára).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--pevne-latky': String.raw`
{\LARGE \bfseries Pevné látky} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Označujeme je písmenem \textbf{s} (z anglického \emph{solid}).
    \item Mají stálý tvar i stálý objem -- bez vnějšího zásahu se nemění.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Krystalické a amorfní pevné látky}
\vspace{2mm}

\noindent
\begin{minipage}[t]{0.48\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue, title=Krystalické, fonttitle=\bfseries, boxrule=0.5pt, leftrule=0pt, rightrule=0pt, bottomrule=0pt, toprule=3pt, arc=2pt, coltitle=black, left=4pt, right=4pt, top=3pt, bottom=3pt, attach title to upper]
    \begin{itemize}
        \item Vnitřní stavba je pravidelná
        \item Mají přesný bod tání
        \item Příklady: sůl, cukr, led, kovy, drahokamy
    \end{itemize}
\end{tcolorbox}
\end{minipage}\hfill
\begin{minipage}[t]{0.48\textwidth}
\begin{tcolorbox}[colback=zfgray, colframe=zfpurple, title=Amorfní, fonttitle=\bfseries, boxrule=0.5pt, leftrule=0pt, rightrule=0pt, bottomrule=0pt, toprule=3pt, arc=2pt, coltitle=black, left=4pt, right=4pt, top=3pt, bottom=3pt, attach title to upper]
    \begin{itemize}
        \item Vnitřní stavba je nepravidelná
        \item Měknou postupně, nemají přesný bod tání
        \item Příklady: sklo, vosk, asfalt, plasty
    \end{itemize}
\end{tcolorbox}
\end{minipage}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti pevných látek}
\vspace{2mm}

\begin{itemize}
    \item Mají stálý tvar.
    \item Mají stálý objem.
    \item Nedají se nabrat do stříkačky.
    \item Dají se přesypávat.
    \item Mohou být \textbf{křehké}, \textbf{pružné}, nebo \textbf{tvrdé}.
    \item Některé mají lesk (kovy), jiné jsou matné (dřevo).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--kapaliny': String.raw`
{\LARGE \bfseries Kapaliny} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Označujeme je písmenem \textbf{l} (z anglického \emph{liquid}).
    \item Mají stálý objem, ale přizpůsobí se tvaru nádoby.
    \item V klidu tvoří vodorovnou hladinu.
    \item Společně s plyny patří mezi \textbf{tekutiny}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stejný objem -- různé tvary}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % --- Vysoká úzká kádinka ---
    \draw[thick] (0,0) -- (0,3) (1,0) -- (1,3) (0,0) -- (1,0);
    \fill[cyan!30] (0.05, 0.02) rectangle (0.95, 1.6);
    \draw[cyan!70!black, thick] (0.05, 1.6) -- (0.95, 1.6);
    \node[font=\bfseries\small] at (0.5, -0.5) {V = 200 ml};

    % --- Široká nízká kádinka ---
    \begin{scope}[shift={(2.5,0)}]
        \draw[thick] (0,0) -- (0,2) (3,0) -- (3,2) (0,0) -- (3,0);
        \fill[cyan!30] (0.05, 0.02) rectangle (2.95, 0.55);
        \draw[cyan!70!black, thick] (0.05, 0.55) -- (2.95, 0.55);
        \node[font=\bfseries\small] at (1.5, -0.5) {V = 200 ml};
    \end{scope}

    % --- Kulová baňka — naplněna do cca 3/4 ---
    \begin{scope}[shift={(7,0)}]
        % Vodu (clipped na sféru) — chord at y=1.25 odpovídá ~3/4 obsahu sféry
        \begin{scope}
            \clip (0.9, 0.95) circle (0.85);
            \fill[cyan!30] (0, 0) rectangle (1.8, 1.25);
        \end{scope}
        % Sférický obrys
        \draw[thick] (0.9, 0.95) circle (0.85);
        % Krk
        \draw[thick] (0.65, 1.7) -- (0.65, 2.7);
        \draw[thick] (1.15, 1.7) -- (1.15, 2.7);
        % Hladina (chord ve sféře)
        \draw[cyan!70!black, thick] (0.105, 1.25) -- (1.695, 1.25);
        \node[font=\bfseries\small] at (0.9, -0.5) {V = 200 ml};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti kapalin}
\vspace{2mm}

\begin{itemize}
    \item Nemají vlastní tvar -- přizpůsobí se nádobě.
    \item Mají stálý objem.
    \item Nedají se stlačit.
    \item Jsou tekuté -- dají se přelévat.
    \item Dají se nabrat do stříkačky.
    \item Mají vodorovnou hladinu (v klidu).
    \item Jsou snadno rozdělitelné.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--plyny': String.raw`
{\LARGE \bfseries Plyny} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Označujeme je písmenem \textbf{g} (z anglického \emph{gas}).
    \item Nemají stálý tvar ani stálý objem.
    \item Vždy vyplní celý prostor, který mají k dispozici.
    \item Společně s kapalinami patří mezi \textbf{tekutiny}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Plyn vyplní celou nádobu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0,0) rectangle (4.8, 2.8);

    % "Obláček" plynu — TikZ shape "cloud" z shapes.symbols (vypadá jako mrak)
    \node[cloud, draw=zfred, fill=zfred!25, line width=0.9pt, cloud puffs=11, cloud puff arc=120, minimum width=2.4cm, minimum height=1.3cm, aspect=1.7] (oblak) at (2.4, 1.4) {};

    % Šipky roztahování — z okrajů obláčku ven
    \draw[->, very thick, zfred!85] (1.15, 1.4) -- (0.3, 1.4);
    \draw[->, very thick, zfred!85] (3.65, 1.4) -- (4.5, 1.4);
    \draw[->, very thick, zfred!85] (2.4, 0.85) -- (2.4, 0.2);
    \draw[->, very thick, zfred!85] (2.4, 1.95) -- (2.4, 2.6);
    \draw[->, very thick, zfred!85] (1.45, 1.0) -- (0.55, 0.4);
    \draw[->, very thick, zfred!85] (3.35, 1.0) -- (4.25, 0.4);
    \draw[->, very thick, zfred!85] (1.45, 1.8) -- (0.55, 2.4);
    \draw[->, very thick, zfred!85] (3.35, 1.8) -- (4.25, 2.4);
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vlastnosti plynů}
\vspace{2mm}

\begin{itemize}
    \item Nemají vlastní tvar.
    \item Nemají stálý objem -- vyplní každý dostupný prostor.
    \item Jsou stlačitelné (na rozdíl od kapalin).
    \item Jsou tekuté -- dají se přelévat.
    \item Dají se nabrat do stříkačky.
    \item Dají se rozdělit -- na libovolně malé množství.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzduch -- směs plynů}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1]
    \draw[thick] (0,0) rectangle (12, 0.7);
    \fill[zfblue!50] (0.02,0.02) rectangle (9.34, 0.68);
    \fill[zfred!40] (9.38,0.02) rectangle (11.88, 0.68);
    \fill[gray!50] (11.92,0.02) rectangle (11.98, 0.68);
    \node[font=\bfseries\small, color=white] at (4.68, 0.35) {Dusík (78~\%)};
    \node[font=\bfseries\scriptsize, color=white] at (10.63, 0.35) {Kyslík (21~\%)};
    \node[font=\scriptsize] at (12.5, 0.35) {ostatní};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item \textbf{Kyslík} ($\text{O}_2$) -- nutný pro dýchání a hoření
    \item \textbf{Dusík} ($\text{N}_2$) -- nereaktivní, výplň atmosféry
    \item \textbf{Vodík} ($\text{H}_2$) -- nejlehčí plyn, hořlavý
    \item \textbf{Oxid uhličitý} ($\text{CO}_2$) -- vydechujeme jej, sycené nápoje
    \item \textbf{Vodní pára} ($\text{H}_2\text{O}$) -- plynná voda
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'vlastnosti-latek--skupenske-prechody': String.raw`
{\LARGE \bfseries Skupenské přechody} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Skupenský přechod} = změna skupenství látky (pevné $\leftrightarrow$ kapalné $\leftrightarrow$ plynné).
    \item Probíhá při \textbf{změně teploty} (případně tlaku).
    \item Přechody probíhají \textbf{oběma směry}: jeden vyžaduje teplo (ohřev), opačný teplo uvolňuje.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Přehled přechodů}
\vspace{3mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw, thick, fill=zfblue!10, draw=zfblue, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (s) at (0,0) {Pevné};
    \node[draw, thick, fill=zfpurple!10, draw=zfpurple, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (l) at (5,0) {Kapalné};
    \node[draw, thick, fill=zfred!10, draw=zfred, minimum width=2.5cm, minimum height=1cm, rounded corners=4pt, font=\bfseries] (g) at (10,0) {Plynné};

    % Tání / tuhnutí
    \draw[->, thick, zfred] (s.east) to[bend left=18] node[midway, above, font=\small] {tání} (l.west);
    \draw[->, thick, zfblue] (l.west) to[bend left=18] node[midway, below, font=\small] {tuhnutí} (s.east);

    % Vypařování / kapalnění
    \draw[->, thick, zfred] (l.east) to[bend left=18] node[midway, above, font=\small] {vypařování} (g.west);
    \draw[->, thick, zfblue] (g.west) to[bend left=18] node[midway, below, font=\small] {kapalnění} (l.east);

    % Sublimace / desublimace (široké oblouky)
    \draw[->, thick, zfred] (s.north) to[bend left=40] node[midway, above, font=\small] {sublimace} (g.north);
    \draw[->, thick, zfblue] (g.south) to[bend left=40] node[midway, below, font=\small] {desublimace} (s.south);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\noindent
\textcolor{zfred}{\rule{10pt}{2pt}} \textbf{přijímá teplo} (ohřev) \quad
\textcolor{zfblue}{\rule{10pt}{2pt}} \textbf{odevzdává teplo} (chlazení)

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vypařování a var}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Vypařování} -- probíhá z \textbf{povrchu} kapaliny při \textbf{libovolné teplotě} (kaluže schnou, prádlo schne).
    \item \textbf{Var} -- probíhá v \textbf{celém objemu} kapaliny při \textbf{teplotě varu} (bublinky páry vznikají uvnitř).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Důležité teploty}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.4pt, arc=2pt, left=5pt, right=5pt, top=3pt, bottom=3pt]
\begin{itemize}
    \item \textbf{Teplota tání} -- teplota, při níž se látka mění z pevné na kapalnou (voda: 0\,$^\circ$C).
    \item \textbf{Teplota tuhnutí} -- shodná s teplotou tání, jen směr je opačný.
    \item \textbf{Teplota varu} -- teplota, při níž se kapalina mění na plyn v celém objemu (voda: 100\,$^\circ$C).
\end{itemize}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady z reálu}
\vspace{2mm}

\noindent
\textbf{Led v hrnku:} pevný led (nízká teplota) postavíme do tepla. Teplo z okolí ho ohřívá $\to$ \textbf{taje} na vodu. Voda se postupně \textbf{vypařuje} z hladiny do vzduchu. Při zahřátí na 100\,$^\circ$C nastává \textbf{var} -- vzniká vodní pára.

\vspace{2mm}
\noindent
\textbf{Hořící svíčka:} pevný vosk je zahříván plamenem $\to$ \textbf{taje} na tekutý vosk. Knot ho nasává nahoru, kde plamen vosk dál zahřívá $\to$ \textbf{vypařování} na voskové páry, které teprve hoří v plameni.
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
