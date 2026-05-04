/**
 * Vloží LaTeX zápisy pro 2 podkapitoly tématu Elektrostatika (6. ročník).
 * Spuštění: node scripts/_batch-elektrostatika.mjs
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
\usetikzlibrary{calc,arrows.meta}
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
  'elektrostatika--elektricky-naboj': String.raw`
{\LARGE \bfseries Elektrický náboj} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektrický náboj} je vlastnost některých částic.
    \item Existují \textbf{dva druhy} náboje: \textbf{kladný (+)} a \textbf{záporný ($-$)}.
    \item Značka: \textbf{Q}, jednotka: \textbf{coulomb (C)}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Náboje v atomu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Jádro
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=1.4cm] (jadro) at (0,0) {};
    \node[font=\small\bfseries, color=zfred] at (-0.3, 0.2) {p$^+$};
    \node[font=\small\bfseries, color=zfred] at (0.3, 0.2) {p$^+$};
    \node[font=\small\bfseries, color=gray!70] at (0, -0.3) {n$^0$};

    % Obal
    \draw[zfblue, thick, dashed] (0,0) circle (1.8);

    % Elektrony
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (1.8, 0) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.27, 1.27) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.27, -1.27) {e$^-$};

    % Anotace
    \node[font=\small, color=zfred, anchor=west] at (3, 0.6) {\textbf{proton} -- kladný (+)};
    \node[font=\small, color=gray!50!black, anchor=west] at (3, 0) {\textbf{neutron} -- bez náboje};
    \node[font=\small, color=zfblue, anchor=west] at (3, -0.6) {\textbf{elektron} -- záporný ($-$)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Atom má stejný počet protonů a elektronů $\to$ je \textbf{elektricky neutrální} (nemá náboj).
    \item Pokud atom \textbf{ztratí} elektron, převáží protony $\to$ je \textbf{kladně nabitý}.
    \item Pokud atom \textbf{získá} elektron, převáží elektrony $\to$ je \textbf{záporně nabitý}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pravidlo přitahování a odpuzování}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item \textbf{Stejné} náboje (+ a +, nebo $-$ a $-$) se \textbf{odpuzují}.
    \item \textbf{Opačné} náboje (+ a $-$) se \textbf{přitahují}.
\end{itemize}
\end{tcolorbox}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.95, every node/.style={font=\small}]
    % Přitahování
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (0, 0) {+};
    \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (1.8, 0) {$-$};
    \draw[->, very thick, zfgreen] (0.45, 0) -- (0.85, 0);
    \draw[<-, very thick, zfgreen] (0.95, 0) -- (1.35, 0);
    \node[font=\bfseries\small, color=zfgreen] at (0.9, -0.7) {přitahují se};

    % Odpuzování (+/+)
    \begin{scope}[shift={(5,0)}]
        \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (0, 0) {+};
        \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (1.8, 0) {+};
        \draw[<-, very thick, zfred] (0.45, 0) -- (0.85, 0);
        \draw[->, very thick, zfred] (0.95, 0) -- (1.35, 0);
        \node[font=\bfseries\small, color=zfred] at (0.9, -0.7) {odpuzují se};
    \end{scope}

    % Odpuzování (-/-)
    \begin{scope}[shift={(10,0)}]
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (0, 0) {$-$};
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.8cm, font=\bfseries] at (1.8, 0) {$-$};
        \draw[<-, very thick, zfred] (0.45, 0) -- (0.85, 0);
        \draw[->, very thick, zfred] (0.95, 0) -- (1.35, 0);
        \node[font=\bfseries\small, color=zfred] at (0.9, -0.7) {odpuzují se};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Elektrování třením}
\vspace{2mm}

\begin{itemize}
    \item Při tření dvou různých látek o sebe přechází \textbf{elektrony} z jedné látky na druhou.
    \item Jedna látka se nabije \textbf{záporně} (přibrala elektrony), druhá \textbf{kladně} (ztratila elektrony).
    \item Tomuto jevu říkáme \textbf{zelektrování} tělesa.
\end{itemize}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Třeme & \bfseries Co se stane \\
\hline
balónek o vlasy & balónek se nabije, přitahuje vlasy a kousky papíru \\
plastové pravítko o vlnu & pravítko přitahuje malé útržky papíru \\
svetr přes hlavu & vlasy se postaví, "lechtá" \\
chození po koberci & při dotyku kovu může cvaknout jiskra \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vodiče a izolanty}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Vodiče} -- náboj jimi snadno prochází (kovy, voda s rozpuštěnou solí).
    \item \textbf{Izolanty} (nevodiče) -- náboj jimi neprochází (plast, sklo, guma, suché dřevo).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektrostatika--ionty': String.raw`
{\LARGE \bfseries Ionty} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Iont} je atom (nebo skupina atomů), který \textbf{ztratil} nebo \textbf{přibral} elektron.
    \item Iont má vždy elektrický náboj -- není elektricky neutrální.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vznik iontů}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Atom (neutrální)
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=0.8cm, font=\small\bfseries] at (0,0) {p$^+$};
    \draw[zfblue, thick, dashed] (0,0) circle (1.2);
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (1.2, 0) {e$^-$};
    \node[font=\small\bfseries] at (0, -1.7) {Atom};
    \node[font=\small] at (0, -2.1) {(neutrální, 0)};

    % Šipka 1 → kation
    \draw[->, very thick, zfred] (1.6, 0.3) -- (3.4, 0.8) node[midway, above, font=\small, color=zfred] {ztrácí e$^-$};

    % Kation
    \begin{scope}[shift={(4.5,1)}]
        \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=0.8cm, font=\small\bfseries] at (0,0) {p$^+$};
        \node[font=\bfseries, color=zfred] at (1.2, 0) {+};
        \draw[zfblue, thick, dashed] (0,0) circle (1.2);
        \node[font=\small\bfseries, color=zfred] at (0, -1.7) {Kation};
        \node[font=\small] at (0, -2.1) {(kladný iont, +)};
    \end{scope}

    % Šipka 2 → anion
    \draw[->, very thick, zfblue] (1.6, -0.3) -- (3.4, -0.8) node[midway, below, font=\small, color=zfblue] {získává e$^-$};

    % Anion
    \begin{scope}[shift={(4.5,-1)}]
        \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=0.8cm, font=\small\bfseries] at (0,0) {p$^+$};
        \draw[zfblue, thick, dashed] (0,0) circle (1.2);
        \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (1.2, 0) {e$^-$};
        \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.2, 0) {e$^-$};
        \node[font=\small\bfseries, color=zfblue] at (0, -1.7) {Anion};
        \node[font=\small] at (0, -2.1) {(záporný iont, $-$)};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Druhy iontů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh & \bfseries Náboj & \bfseries Vznik \\
\hline
\textbf{Kation} & kladný (+) & atom \textbf{ztratil} elektron(y) \\
\textbf{Anion} & záporný ($-$) & atom \textbf{získal} elektron(y) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady iontů}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Sodný kation} Na$^+$ -- atom sodíku, který ztratil 1 elektron.
    \item \textbf{Chloridový anion} Cl$^-$ -- atom chloru, který získal 1 elektron.
    \item \textbf{Vápenatý kation} Ca$^{2+}$ -- ztratil 2 elektrony.
    \item \textbf{Vodíkový kation} H$^+$ -- ztratil jediný elektron.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Kuchyňská sůl -- ionty v praxi}
\vspace{2mm}

\noindent
Kuchyňská sůl (NaCl) je tvořena dvěma druhy iontů:

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=1cm, font=\bfseries] (na) at (0,0) {Na$^+$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=1cm, font=\bfseries] (cl) at (2.5,0) {Cl$^-$};
    \draw[<->, very thick, zfgreen] (0.55, 0) -- (1.95, 0);
    \node[font=\small, color=zfgreen] at (1.25, 0.4) {přitahují se};
    \node[font=\bfseries\small] at (1.25, -0.9) {NaCl -- chlorid sodný};
\end{tikzpicture}
\end{center}

\begin{itemize}
    \item Atom \textbf{sodíku} odevzdá svůj elektron $\to$ vznikne kation Na$^+$.
    \item Atom \textbf{chloru} ten elektron přijme $\to$ vznikne anion Cl$^-$.
    \item Opačné náboje se přitahují $\to$ ionty drží pevně pohromadě v krystalu soli.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kde se s ionty setkáme?}
\vspace{2mm}

\begin{itemize}
    \item Ve vodě s rozpuštěnou solí -- ionty Na$^+$ a Cl$^-$ se rozejdou do vody.
    \item Ve vašem těle -- ionty (např. K$^+$, Ca$^{2+}$) jsou nutné pro funkci svalů a nervů.
    \item V baterii a akumulátoru -- pohyb iontů vytváří elektrický proud.
    \item Při bouřce -- vzduch se ionizuje (vznikají ionty), tím vzniká blesk.
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
