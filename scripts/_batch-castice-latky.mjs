/**
 * Vloží LaTeX zápisy pro 4 podkapitoly tématu Částice látky.
 * Spuštění: node scripts/_batch-castice-latky.mjs
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
  'castice-latky--atom': String.raw`
{\LARGE \bfseries Atom} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

{\Large \bfseries \color{zfblue} Z čeho se skládají látky?}
\vspace{2mm}

\begin{itemize}
    \item Asi \textbf{500 let př. n. l.} si lidé mysleli, že vše se skládá ze čtyř živlů: voda, oheň, vzduch a země.
    \item Asi \textbf{400 let př. n. l.} přišel řecký filozof \textbf{Démokritos} s teorií, že látky se skládají z velmi malých částic, které už nejde dále rozdělit. Pojmenoval je \textbf{atomy} (řecky \emph{atomos} = nedělitelný).
    \item Dnes víme, že Démokritos měl pravdu -- všechny látky se skládají z atomů.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co je atom?}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Atom} je nejmenší částice, ze které se skládají všechny látky.
    \item Je tak malý, že ho \textbf{nelze vidět} ani nejlepším mikroskopem.
    \item Atom se skládá z ještě menších částic: \textbf{protonů}, \textbf{neutronů} a \textbf{elektronů}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Stavba atomu}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Jádro
    \node[draw=zfred, fill=zfred!20, thick, circle, minimum size=1.4cm] (jadro) at (0,0) {};
    \node[font=\small\bfseries, color=zfred] at (-0.27, 0.22) {p$^+$};
    \node[font=\small\bfseries, color=zfred] at (0.27, 0.22) {p$^+$};
    \node[font=\small\bfseries, color=gray!70] at (-0.27, -0.22) {n$^0$};
    \node[font=\small\bfseries, color=gray!70] at (0.27, -0.22) {n$^0$};

    % Obal
    \draw[zfblue, thick, dashed] (0,0) circle (2.0);

    % Elektrony
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (2.0, 0) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.4, 1.4) {e$^-$};
    \node[draw=zfblue, fill=zfblue!20, thick, circle, minimum size=0.45cm, font=\bfseries\scriptsize] at (-1.4, -1.4) {e$^-$};

    % Annotace — jádro hned u jádra
    \node[font=\small, color=zfred] at (0, -0.95) {jádro};
    \node[font=\small, color=zfblue] at (3.0, 1.5) {obal (elektrony)};
    \draw[->, thin, zfblue] (3.0, 1.3) -- (1.65, 1.15);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Částice & \bfseries Značka & \bfseries Náboj & \bfseries Umístění \\
\hline
Proton & p$^+$ & kladný (+) & jádro \\
Neutron & n$^0$ & bez náboje (0) & jádro \\
Elektron & e$^-$ & záporný ($-$) & obal \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Důležitá fakta}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Atom nemá náboj} (je elektricky neutrální) -- počet protonů se rovná počtu elektronů.
    \item Jádro obsahuje téměř celou hmotnost atomu, ale je velmi malé.
    \item Druh atomu určuje \textbf{počet protonů} v jádře (1 p = vodík, 6 p = uhlík, 8 p = kyslík).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Molekuly}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Molekula} je částice složená ze \textbf{dvou nebo více atomů} spojených dohromady.
    \item Atomy v molekule mohou být \textbf{stejné} (např. molekula kyslíku $\text{O}_2$ -- dva atomy kyslíku) nebo \textbf{různé} (např. voda $\text{H}_2\text{O}$ -- dva atomy vodíku a jeden atom kyslíku).
    \item Většina látek kolem nás je tvořena právě molekulami.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.9, every node/.style={font=\small}]
    % Voda H2O
    \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=1.0cm, font=\bfseries] (O) at (0, 0) {O};
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.7cm, font=\bfseries] (H1) at (-1.0, -0.7) {H};
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.7cm, font=\bfseries] (H2) at (1.0, -0.7) {H};
    \draw[thick] (O) -- (H1); \draw[thick] (O) -- (H2);
    \node[font=\small] at (0, -1.5) {voda ($\text{H}_2\text{O}$)};

    % Kyslík O2
    \begin{scope}[shift={(5, -0.3)}]
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=1.0cm, font=\bfseries] (O1) at (-0.55, 0) {O};
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=1.0cm, font=\bfseries] (O2x) at (0.55, 0) {O};
        \draw[thick] (O1) -- (O2x);
        \node[font=\small] at (0, -1.2) {kyslík ($\text{O}_2$)};
    \end{scope}

    % Oxid uhličitý CO2
    \begin{scope}[shift={(10, -0.3)}]
        \node[draw=gray!50!black, fill=gray!30, thick, circle, minimum size=1.0cm, font=\bfseries] (C) at (0, 0) {C};
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=1.0cm, font=\bfseries] (Oa) at (-1.2, 0) {O};
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=1.0cm, font=\bfseries] (Ob) at (1.2, 0) {O};
        \draw[thick] (C) -- (Oa); \draw[thick] (C) -- (Ob);
        \node[font=\small] at (0, -1.2) {oxid uhličitý ($\text{CO}_2$)};
    \end{scope}
\end{tikzpicture}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--skaly-castic': String.raw`
{\LARGE \bfseries Škály částic} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\noindent
Svět kolem nás se skládá z věcí různě velkých -- od neuvěřitelně malých částic, které nevidíme, až po velké objekty, jako jsme my.

\vspace{4mm}
{\Large \bfseries \color{zfblue} Od malých k větším -- po krocích 10$\times$}
\vspace{4mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \tikzset{
      stupen/.style={draw, thick, rounded corners=3pt, fill=zfblue!10, draw=zfblue, minimum width=1.7cm, minimum height=0.9cm, font=\bfseries\small}
    }

    \node[stupen] (b) at (0, 0) {buňka};
    \node[stupen] (v) at (2.5, 0) {vlas};
    \node[stupen] (z) at (5.0, 0) {zrnko písku};
    \node[stupen] (h) at (7.5, 0) {hrách};
    \node[stupen] (j) at (10.0, 0) {jablko};
    \node[stupen] (d) at (12.5, 0) {dítě};

    \foreach \src/\dst in {b/v, v/z, z/h, h/j, j/d} {
        \draw[->, thick, zfred] (\src.east) -- (\dst.west) node[midway, above, font=\scriptsize, color=zfred] {10$\times$ větší};
    }
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Velikosti známých objektů}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Objekt & \bfseries Velikost (v metrech) \\
\hline
Atom & 0,000\,000\,000\,1 m \\
Molekula vody & 0,000\,000\,000\,3 m \\
Buňka & 0,000\,01 m \\
Lidský vlas (tloušťka) & 0,000\,1 m \\
Zrnko písku & 0,001 m \\
Hrách & 0,01 m \\
Jablko & 0,1 m \\
Dítě (výška) & 1 m \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pro představu}
\vspace{2mm}

\begin{itemize}
    \item Atomy jsou tak malé, že do tečky na konci věty se jich vedle sebe vejde \textbf{miliarda}.
    \item Lidský vlas je asi \textbf{milionkrát} silnější než atom.
    \item Atom je z větší části \textbf{prázdný}. Kdyby byl atom velký jako fotbalové hřiště, jádro by bylo uprostřed velké jako hrách.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--casticove-slozeni-latek': String.raw`
{\LARGE \bfseries Částicové složení látek} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Všechny látky se skládají z \textbf{částic} -- atomů nebo molekul.
    \item Mezi částicemi je \textbf{prázdný prostor}.
    \item Částice jsou v \textbf{neustálém pohybu}.
    \item Mezi částicemi působí \textbf{přitažlivé síly}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Skupenství z hlediska částic}
\vspace{3mm}

\begin{center}
\begin{tikzpicture}[scale=1]
    % Pevné — pravidelná hustá mřížka
    \draw[thick, draw=zfblue, fill=zfblue!5] (0, 0) rectangle (3, 2.5);
    \foreach \x in {0.5, 1.0, 1.5, 2.0, 2.5} {
        \foreach \y in {0.5, 1.0, 1.5, 2.0} {
            \fill[zfblue] (\x, \y) circle (0.1);
        }
    }
    \node[font=\bfseries, color=zfblue] at (1.5, -0.4) {Pevné};

    % Kapalné — blízko, neuspořádaně, asi 15 tečka
    \begin{scope}[shift={(4.5, 0)}]
        \draw[thick, draw=zfpurple, fill=zfpurple!5] (0, 0) rectangle (3, 2.5);
        \foreach \x/\y in {
            0.5/0.45, 1.2/0.65, 2.0/0.5, 2.7/0.7,
            0.4/1.2, 1.3/1.3, 2.1/1.1, 2.7/1.4,
            0.6/1.85, 1.5/1.7, 2.4/1.9,
            0.5/2.3, 1.6/2.25, 2.5/2.3, 1.0/0.95
        } {
            \fill[zfpurple] (\x, \y) circle (0.1);
        }
        \node[font=\bfseries, color=zfpurple] at (1.5, -0.4) {Kapalné};
    \end{scope}

    % Plynné — jen 5 teček, daleko od sebe
    \begin{scope}[shift={(9, 0)}]
        \draw[thick, draw=zfred, fill=zfred!5] (0, 0) rectangle (3, 2.5);
        \foreach \x/\y in {
            0.6/0.6, 2.4/0.5, 1.5/1.4, 0.5/2.0, 2.5/2.0
        } {
            \fill[zfred] (\x, \y) circle (0.1);
        }
        \node[font=\bfseries, color=zfred] at (1.5, -0.4) {Plynné};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{6mm}
{\Large \bfseries \color{zfblue} Důsledky pro vlastnosti látek}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Pevné} -- částice jsou \textbf{těsně u sebe} a kmitají kolem \textbf{pevné polohy}. Drží pohromadě silnými přitažlivými silami a nejdou jen tak oddělit -- proto pevné látky drží svůj tvar.
    \item \textbf{Kapalné} -- částice už spolu pevně nedrží, mohou se posouvat (proto kapalina teče). Jsou ale stále blízko sebe, takže \textbf{nejdou stlačit} (přiblížit více k sobě).
    \item \textbf{Plynné} -- částice jsou \textbf{daleko od sebe} a chaoticky se pohybují. Plyn proto \textbf{můžeme stlačit} (přiblížit částice k sobě) a sám se rozpíná, aby vyplnil celý prostor.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Krystaly}
\vspace{2mm}

\begin{itemize}
    \item V mnoha pevných látkách jsou částice srovnané do \textbf{krystalické mřížky} -- pravidelného uspořádání.
    \item Tyto látky tvoří \textbf{krystaly}, které mají různé tvary podle toho, jak vypadá mřížka.
    \item Příklady: krychlové krystaly soli, šestiboké krystaly ledu (sněhové vločky), pravidelné krystaly drahokamů.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Krychlový (sůl)
    \draw[thick, fill=zfblue!15] (0, 0) -- (1, 0) -- (1.4, 0.4) -- (0.4, 0.4) -- cycle;
    \draw[thick, fill=zfblue!10] (0, 0) -- (0, 1) -- (0.4, 1.4) -- (0.4, 0.4) -- cycle;
    \draw[thick, fill=zfblue!5] (1, 0) -- (1, 1) -- (1.4, 1.4) -- (1.4, 0.4) -- cycle;
    \draw[thick, fill=zfblue!10] (0, 1) -- (1, 1) -- (1.4, 1.4) -- (0.4, 1.4) -- cycle;
    \node[font=\small] at (0.7, -0.4) {sůl (krychle)};

    % Šestiboký (led / sněhová vločka)
    \begin{scope}[shift={(4, 0.0)}]
        \draw[thick, fill=cyan!20] (0,0.4) -- (1,0.4) -- (1.5, 1.07) -- (1, 1.74) -- (0, 1.74) -- (-0.5, 1.07) -- cycle;
        \node[font=\small] at (0.5, -0.4) {led (šestiboký)};
    \end{scope}

    % Krystal jehličkovitého tvaru (drahokam)
    \begin{scope}[shift={(8, 0)}]
        \draw[thick, fill=zfpurple!20] (0.5, 0.2) -- (1.0, 0.7) -- (1.0, 1.6) -- (0.5, 2.0) -- (0, 1.6) -- (0, 0.7) -- cycle;
        \node[font=\small] at (0.5, -0.4) {křemen};
    \end{scope}
\end{tikzpicture}
\end{center}
`,

  // ─────────────────────────────────────────────────────────────────────
  'castice-latky--brownuv-pohyb-difuze': String.raw`
{\LARGE \bfseries Brownův pohyb a difuze} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

{\Large \bfseries \color{zfblue} Brownův pohyb}
\vspace{2mm}

\begin{itemize}
    \item Neuspořádaný, neustálý pohyb drobných částeček (např. pylu) v kapalině nebo plynu.
    \item Způsobují ho \textbf{nárazy molekul} okolní látky, které se neustále chaoticky pohybují.
    \item Při \textbf{vyšší teplotě} se molekuly pohybují rychleji -- Brownův pohyb je výraznější.
    \item Pozoroval ho roku 1827 botanik \textbf{Robert Brown} -- pylová zrnka ve vodě.
    \item Je to \textbf{důkaz}, že molekuly se neustále pohybují.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=0.95]
    \draw[thick, fill=zfgray] (0, 0) rectangle (5.5, 2.4);

    % Molekuly vody (drobné tečky se šipkami)
    \foreach \x/\y/\tx/\ty in {
        0.4/0.3/1.5/1.0,
        0.5/1.9/1.6/1.4,
        5.0/0.4/2.8/1.0,
        5.1/1.9/2.9/1.5,
        2.0/0.2/2.4/1.05,
        3.2/2.2/2.6/1.5
    } {
        \fill[zfblue!50] (\x, \y) circle (0.05);
        \draw[->, thick, zfblue!50] (\x, \y) -- (\tx, \ty);
    }

    % Pylové zrnko (velká částice)
    \fill[zfred] (2.7, 1.25) circle (0.18);

    % Klikatá dráha
    \draw[thick, zfred] (2.7, 1.25) -- (2.2, 1.45) -- (1.8, 1.15) -- (2.2, 0.85) -- (2.7, 1.0) -- (3.2, 0.8) -- (3.5, 1.1) -- (3.1, 1.5) -- (2.5, 1.7);

    \node[font=\scriptsize, color=zfred] at (2.7, -0.3) {dráha pylového zrnka};
    \node[font=\scriptsize, color=zfblue!70] at (6.6, 1.2) {molekuly};
    \node[font=\scriptsize, color=zfblue!70] at (6.6, 0.85) {vody};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Difuze}
\vspace{2mm}

\noindent
\textbf{Difuze} = samovolné pronikání částic jedné látky mezi částice druhé látky, dokud se obě látky nepromíchají rovnoměrně.

\vspace{2mm}
\begin{itemize}
    \item Funguje díky \textbf{Brownovu pohybu} -- molekuly se neustále chaoticky pohybují, narážejí do sebe, a tak se postupně promíchají s jinou látkou.
    \item Probíhá v \textbf{kapalinách i plynech} (v pevných látkách jen velmi pomalu).
    \item Při \textbf{vyšší teplotě} probíhá difuze rychleji (molekuly se pohybují rychleji).
    \item Příklady: rozšíření vůně po místnosti, inkoust ve vodě, čaj v horké vodě.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \draw[thick] (0, 0) rectangle (3.6, 2);
    \fill[blue!10] (0.05, 0.05) rectangle (3.55, 1.95);
    \fill[blue!75] (1.6, 0.85) ellipse (0.45 and 0.3);
    \node[font=\small] at (1.8, -0.35) {začátek};

    \draw[->, very thick] (4.0, 1) -- (5.0, 1);
    \node[above, font=\scriptsize] at (4.5, 1.1) {čas};

    \begin{scope}[shift={(5.4, 0)}]
        \draw[thick] (0, 0) rectangle (3.6, 2);
        \fill[blue!35] (0.05, 0.05) rectangle (3.55, 1.95);
        \node[font=\small] at (1.8, -0.35) {po čase};
    \end{scope}
\end{tikzpicture}
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
  console.log(`✓ ${id}`);
  updated++;
}
console.log(`\nHotovo: ${updated} zápisů vloženo.`);
