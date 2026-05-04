/**
 * Vloží LaTeX zápisy pro 2 podkapitoly tématu Magnetismus (6. ročník).
 * Spuštění: node scripts/_batch-magnetismus.mjs
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
\usetikzlibrary{calc,decorations.markings,arrows.meta}
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
  'magnetismus--magnety': String.raw`
{\LARGE \bfseries Magnety} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Magnet} je těleso, které přitahuje předměty z některých kovů.
    \item Síla, kterou magnet působí, se nazývá \textbf{magnetická síla}.
    \item Kolem každého magnetu je \textbf{magnetické pole} -- neviditelný prostor, kde magnet působí.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Póly magnetu}
\vspace{2mm}

\begin{itemize}
    \item Každý magnet má dva \textbf{póly}: severní \textbf{N} (z anglického \emph{north}) a jižní \textbf{S} (z anglického \emph{south}).
    \item Póly jsou na koncích magnetu. Tam je magnetická síla \textbf{nejsilnější}.
    \item Když magnet rozlomíme, každý kousek bude mít opět oba póly.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tyčový magnet
    \fill[zfred!70] (0,0) rectangle (2,0.8);
    \fill[zfblue!70] (2,0) rectangle (4,0.8);
    \draw[thick] (0,0) rectangle (4,0.8);
    \node[font=\bfseries\large, color=white] at (1, 0.4) {N};
    \node[font=\bfseries\large, color=white] at (3, 0.4) {S};
    \node[font=\small] at (2, -0.4) {tyčový magnet};

    % Indukční čáry
    \begin{scope}[shift={(7,0.4)}]
        \fill[zfred!70] (-1.4,-0.4) rectangle (0,0.4);
        \fill[zfblue!70] (0,-0.4) rectangle (1.4,0.4);
        \draw[thick] (-1.4,-0.4) rectangle (1.4,0.4);
        \node[font=\bfseries, color=white] at (-0.7, 0) {N};
        \node[font=\bfseries, color=white] at (0.7, 0) {S};

        \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
            (-1.4,0.4) .. controls (-1.4,1.5) and (1.4,1.5) .. (1.4,0.4);
        \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
            (-1.4,0.4) .. controls (-1.7,2.2) and (1.7,2.2) .. (1.4,0.4);
        \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
            (-1.4,-0.4) .. controls (-1.4,-1.5) and (1.4,-1.5) .. (1.4,-0.4);
        \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
            (-1.4,-0.4) .. controls (-1.7,-2.2) and (1.7,-2.2) .. (1.4,-0.4);
        \node[font=\small, color=zfgreen] at (0, 2.5) {magnetické indukční čáry};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pravidlo přitahování a odpuzování}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item \textbf{Opačné póly} (N a S) se \textbf{přitahují}.
    \item \textbf{Stejné póly} (N a N, nebo S a S) se \textbf{odpuzují}.
\end{itemize}
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Přitahování
    \fill[zfred!70] (0,0) rectangle (1,0.6);
    \fill[zfblue!70] (1,0) rectangle (2,0.6);
    \draw[thick] (0,0) rectangle (2,0.6);
    \node[font=\bfseries, color=white] at (0.5, 0.3) {N};
    \node[font=\bfseries, color=white] at (1.5, 0.3) {S};
    \fill[zfred!70] (2.6,0) rectangle (3.6,0.6);
    \fill[zfblue!70] (3.6,0) rectangle (4.6,0.6);
    \draw[thick] (2.6,0) rectangle (4.6,0.6);
    \node[font=\bfseries, color=white] at (3.1, 0.3) {N};
    \node[font=\bfseries, color=white] at (4.1, 0.3) {S};
    \draw[->, very thick, zfgreen] (2.05, 0.3) -- (2.55, 0.3);
    \draw[<-, very thick, zfgreen] (2.05, 0.3) -- (1.55, 0.3);
    \node[font=\bfseries\small, color=zfgreen] at (2.3, -0.5) {přitahují se};

    % Odpuzování
    \begin{scope}[shift={(7,0)}]
        \fill[zfred!70] (0,0) rectangle (1,0.6);
        \fill[zfblue!70] (1,0) rectangle (2,0.6);
        \draw[thick] (0,0) rectangle (2,0.6);
        \node[font=\bfseries, color=white] at (0.5, 0.3) {N};
        \node[font=\bfseries, color=white] at (1.5, 0.3) {S};
        \fill[zfblue!70] (2.6,0) rectangle (3.6,0.6);
        \fill[zfred!70] (3.6,0) rectangle (4.6,0.6);
        \draw[thick] (2.6,0) rectangle (4.6,0.6);
        \node[font=\bfseries, color=white] at (3.1, 0.3) {S};
        \node[font=\bfseries, color=white] at (4.1, 0.3) {N};
        \draw[<-, very thick, zfred] (2.05, 0.3) -- (2.55, 0.3);
        \draw[->, very thick, zfred] (2.05, 0.3) -- (1.55, 0.3);
        \node[font=\bfseries\small, color=zfred] at (2.3, -0.5) {odpuzují se};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co magnet přitahuje?}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Magnet přitahuje & \bfseries Magnet nepřitahuje \\
\hline
železo, ocel & dřevo, papír, plast \\
nikl, kobalt & sklo, guma, voda \\
hřebíky, kancelářské sponky & hliník, měď, zlato, stříbro \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Látky, které magnet přitahuje, nazýváme \textbf{feromagnetické}.
    \item Magnet působí i přes papír, sklo nebo dřevo -- magnetická síla prochází i jinými látkami.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Druhy magnetů}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Přírodní} -- magnetovec (kámen, který je sám magnetem).
    \item \textbf{Umělé} -- vyrobené z oceli nebo speciálních slitin (tyčové, podkovovité, kruhové).
    \item \textbf{Elektromagnet} -- vzniká, když cívkou prochází elektrický proud.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'magnetismus--magneticke-pole-zeme': String.raw`
{\LARGE \bfseries Magnetické pole Země} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Země se chová jako obrovský \textbf{magnet}.
    \item Kolem Země je \textbf{magnetické pole}, které sahá daleko do vesmíru.
    \item Toto pole nás chrání před nebezpečnými částicemi ze Slunce.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Magnetické a zeměpisné póly}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Země
    \draw[thick, fill=zfblue!15] (0,0) circle (2);
    \node[font=\small] at (0, 0) {Země};

    % Osa rotace (zeměpisné póly)
    \draw[dashed, thick, gray] (0,-2.6) -- (0,2.6);
    \node[font=\bfseries\small] at (0, 2.85) {S (sever)};
    \node[font=\bfseries\small] at (0, -2.85) {J (jih)};

    % Magnetická osa (mírně skloněná)
    \draw[thick, zfred] (-0.6,-2.5) -- (0.6,2.5);
    \node[font=\bfseries\small, color=zfred] at (0.95, 2.55) {S};
    \node[font=\bfseries\small, color=zfred] at (-0.95, -2.55) {N};

    % Indukční čáry
    \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
        (0.6,2.5) .. controls (4,2) and (4,-2) .. (-0.6,-2.5);
    \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
        (0.6,2.5) .. controls (-4,2) and (-4,-2) .. (-0.6,-2.5);
    \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
        (0.6,2.5) .. controls (5.5,1.5) and (5.5,-1.5) .. (-0.6,-2.5);
    \draw[->, thick, zfgreen, decoration={markings,mark=at position 0.55 with {\arrow{Stealth}}}, postaction={decorate}]
        (0.6,2.5) .. controls (-5.5,1.5) and (-5.5,-1.5) .. (-0.6,-2.5);

    \node[font=\small, color=zfgreen] at (5.7, 0) {magnetické};
    \node[font=\small, color=zfgreen] at (5.7, -0.4) {pole};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pozor!} V blízkosti severního zeměpisného pólu je \textbf{jižní magnetický pól} a naopak. Proto severní pól kompasu (značený \textbf{N}) ukazuje na sever -- protože ho přitahuje opačný (jižní) magnetický pól Země.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Kompas}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Kompas} je přístroj na určování světových stran.
    \item Uvnitř má \textbf{magnetku} -- malou tyčovou magnetku otáčející se na hrotu.
    \item Magnetka se sama natočí ve směru sever-jih.
    \item Severní pól magnetky (\textbf{N}, často červený) ukazuje vždy k severu.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Tělo kompasu
    \draw[thick, fill=zfgray] (0,0) circle (1.6);
    \draw[thick] (0,0) circle (1.45);

    % Světové strany
    \node[font=\bfseries] at (0, 1.25) {S};
    \node[font=\bfseries] at (0, -1.25) {J};
    \node[font=\bfseries] at (1.25, 0) {V};
    \node[font=\bfseries] at (-1.25, 0) {Z};

    % Magnetka
    \fill[zfred!80] (-0.05, 0) -- (0, 1) -- (0.05, 0) -- cycle;
    \fill[white] (-0.05, 0) -- (0, -1) -- (0.05, 0) -- cycle;
    \draw[thick] (-0.05, 0) -- (0, 1) -- (0.05, 0) -- (0, -1) -- cycle;
    \fill[black] (0,0) circle (0.07);
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} K čemu se hodí magnetické pole Země?}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Orientace v terénu} -- kompas, navigace lodí a letadel (před GPS jediná možnost).
    \item \textbf{Stěhovaví ptáci} a někteří živočichové se magnetickým polem řídí při migraci.
    \item \textbf{Polární záře} -- vznikají, když částice ze Slunce narazí do magnetického pole Země nad póly.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zajímavosti}
\vspace{2mm}

\begin{itemize}
    \item Magnetické póly Země se \textbf{pomalu pohybují} (asi 50 km za rok).
    \item Za miliony let dochází k \textbf{přepólování} -- sever a jih si vymění místa. Je to přirozený jev.
    \item Magnetické pole Země je \textbf{slabé}, ale pokrývá celou planetu.
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
