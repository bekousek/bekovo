/**
 * Vloží LaTeX zápisy pro 7 podkapitol tématu Elektrické obvody (6. ročník).
 * Spuštění: node scripts/_batch-elektricke-obvody.mjs
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
  'elektricke-obvody--elektricky-obvod': String.raw`
{\LARGE \bfseries Elektrický obvod} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektrický obvod} je propojení částí, kterými může procházet elektrický proud.
    \item Aby proud tekl, obvod musí být \textbf{uzavřený} (vytváří kruh).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Části obvodu}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Část & \bfseries K čemu slouží & \bfseries Příklady \\
\hline
zdroj & dodává proud & baterie, zásuvka, akumulátor \\
vodič & spojuje části & měděný drát, kabel \\
spotřebič & spotřebovává energii & žárovka, motor, topení \\
vypínač (spínač) & otevírá/zavírá obvod & vypínač světla \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Schematické značky}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Zdroj
    \draw[thick] (0, 0.3) -- (0, -0.3);
    \draw[thick] (0.4, 0.5) -- (0.4, -0.5);
    \node[font=\small] at (0.2, -0.9) {zdroj};

    % Žárovka
    \begin{scope}[shift={(2.5,0)}]
        \draw[thick] (0,0) circle (0.4);
        \draw[thick] (-0.28, -0.28) -- (0.28, 0.28);
        \draw[thick] (-0.28, 0.28) -- (0.28, -0.28);
        \node[font=\small] at (0, -0.9) {žárovka};
    \end{scope}

    % Vypínač
    \begin{scope}[shift={(5,0)}]
        \draw[thick] (-0.5, 0) -- (-0.1, 0);
        \draw[thick] (0.5, 0) -- (0.1, 0);
        \draw[thick] (-0.1, 0) -- (0.4, 0.4);
        \fill (-0.1, 0) circle (0.05);
        \fill (0.1, 0) circle (0.05);
        \node[font=\small] at (0, -0.9) {vypínač};
    \end{scope}

    % Vodič
    \begin{scope}[shift={(7.5,0)}]
        \draw[thick] (-0.5, 0) -- (0.5, 0);
        \node[font=\small] at (0, -0.9) {vodič};
    \end{scope}

    % Rezistor
    \begin{scope}[shift={(10,0)}]
        \draw[thick] (-0.5, 0) -- (-0.4, 0) -- (-0.4, 0.2) -- (0.4, 0.2) -- (0.4, -0.2) -- (-0.4, -0.2) -- (-0.4, 0);
        \draw[thick] (0.4, 0) -- (0.5, 0);
        \node[font=\small] at (0, -0.9) {rezistor};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Jednoduchý obvod}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Rám
    \draw[thick] (0,0) -- (5,0);
    \draw[thick] (0,0) -- (0,2);
    \draw[thick] (5,0) -- (5,2);
    \draw[thick] (0,2) -- (1.8,2);
    \draw[thick] (3.2,2) -- (5,2);

    % Zdroj
    \draw[thick] (2.4, -0.2) -- (2.4, 0.2);
    \draw[thick] (2.6, -0.4) -- (2.6, 0.4);
    \node[font=\small] at (2.5, -0.7) {baterie};

    % Vypínač
    \fill (1.8, 2) circle (0.05);
    \fill (2.2, 2) circle (0.05);
    \draw[thick] (1.8, 2) -- (2.2, 2.4);
    \node[font=\small] at (2, 2.6) {vypínač};

    % Žárovka
    \draw[thick] (3.5, 2) circle (0.3);
    \draw[thick] (3.3, 1.8) -- (3.7, 2.2);
    \draw[thick] (3.3, 2.2) -- (3.7, 1.8);
    \draw[thick] (2.2, 2) -- (3.2, 2);
    \node[font=\small] at (3.5, 2.6) {žárovka};

    % Šipky proudu
    \draw[->, very thick, zfred] (1, -0.15) -- (0.5, -0.15);
    \draw[->, very thick, zfred] (4.5, 0.15) -- (5, 0.15);
    \node[font=\bfseries\small, color=zfred] at (4, -0.4) {směr proudu};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Otevřený a uzavřený obvod}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item \textbf{Uzavřený obvod} -- vypínač zapnutý $\to$ proud teče $\to$ žárovka svítí.
    \item \textbf{Otevřený obvod} -- vypínač vypnutý $\to$ proud neteče $\to$ žárovka nesvítí.
\end{itemize}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zapojení žárovek}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Sériové} (za sebou) -- proud teče přes všechny postupně. Když se jedna přeruší, ostatní zhasnou. Žárovky svítí slaběji.
    \item \textbf{Paralelní} (vedle sebe) -- každá žárovka má svou větev. Když se jedna přeruší, ostatní svítí dál. Každá svítí naplno.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--zkrat': String.raw`
{\LARGE \bfseries Zkrat} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Zkrat} = vodič přímo spojí oba póly zdroje \textbf{bez spotřebiče}.
    \item Obvodem teče \textbf{velmi velký proud}, který může způsobit požár.
    \item Vzniká hlavně při poškození izolace nebo špatném zapojení.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co se při zkratu děje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Normální obvod
    \draw[thick] (0,0) -- (3,0) -- (3,1.6) -- (1.5, 1.6);
    \draw[thick] (1.5, 1.6) circle (0.3);
    \draw[thick] (1.3, 1.4) -- (1.7, 1.8);
    \draw[thick] (1.3, 1.8) -- (1.7, 1.4);
    \draw[thick] (1.2, 1.6) -- (0, 1.6) -- (0, 0);
    \draw[thick] (1.4, -0.2) -- (1.4, 0.2);
    \draw[thick] (1.6, -0.4) -- (1.6, 0.4);
    \node[font=\bfseries\small, color=zfgreen] at (1.5, 2.4) {OK -- žárovka svítí};
    \node[font=\small] at (1.5, -0.7) {normální obvod};

    % Zkrat
    \begin{scope}[shift={(6, 0)}]
        \draw[thick] (0,0) -- (3,0);
        \draw[ultra thick, zfred] (3,0) -- (3,1.6) -- (0, 1.6) -- (0, 0);
        \draw[thick] (1.4, -0.2) -- (1.4, 0.2);
        \draw[thick] (1.6, -0.4) -- (1.6, 0.4);

        % Jiskra/oheň (zigzag blesku)
        \fill[yellow!80!orange, draw=zfred, thick] (1.5, 2.05) -- (1.7, 1.7) -- (1.55, 1.7) -- (1.75, 1.35) -- (1.55, 1.35) -- (1.4, 1.0) -- (1.4, 1.55) -- (1.25, 1.55) -- (1.45, 1.85) -- cycle;
        \node[font=\bfseries\small, color=zfred] at (1.5, 2.4) {ZKRAT! velký proud};
        \node[font=\small] at (1.5, -0.7) {chybí spotřebič};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Důsledky zkratu}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{itemize}
    \item Vodič se silně \textbf{zahřívá} -- může roztavit izolaci.
    \item Hrozí \textbf{požár}.
    \item Zdroj se může \textbf{poškodit} (baterie se vybije, akumulátor zničí).
    \item Při dotyku člověka -- riziko \textbf{úrazu elektřinou}.
\end{itemize}
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Časté příčiny zkratu}
\vspace{2mm}

\begin{itemize}
    \item Poškozená izolace kabelu (prasklá guma, nahnilý drát).
    \item Špatné zapojení -- holé dráty se dotýkají.
    \item Voda v zásuvce (voda vede proud).
    \item Nesprávně připojená žárovka nebo zástrčka.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Ochrana proti zkratu}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Pojistka
    \draw[thick, fill=zfgray] (0,0) rectangle (2, 0.8);
    \draw[thick] (-0.4, 0.4) -- (0, 0.4);
    \draw[thick] (2, 0.4) -- (2.4, 0.4);
    \draw[thick] (0.3, 0.4) -- (0.7, 0.4);
    \draw[thick, decoration={coil, segment length=1mm}, decorate, zfred] (0.7, 0.4) -- (1.3, 0.4);
    \draw[thick] (1.3, 0.4) -- (1.7, 0.4);
    \node[font=\bfseries\small] at (1, 1.1) {pojistka};
    \node[font=\scriptsize] at (1, -0.3) {tenký drátek se přepálí};

    % Jistič
    \begin{scope}[shift={(5, 0)}]
        \draw[thick, fill=zfgray] (0,0) rectangle (1.4, 1.6);
        \draw[thick, fill=white] (0.4, 0.6) rectangle (1, 1.2);
        \draw[thick] (0.7, 0.6) -- (0.7, 0.3);
        \draw[thick, fill=zfred] (0.5, 0.05) rectangle (0.9, 0.3);
        \node[font=\scriptsize] at (0.7, 1.45) {ON};
        \node[font=\scriptsize] at (0.7, 0.4) {OFF};
        \node[font=\bfseries\small] at (0.7, 1.9) {jistič};
        \node[font=\scriptsize] at (0.7, -0.3) {automaticky vypne};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Pojistka} -- obsahuje tenký drátek. Při zkratu se přepálí a obvod přeruší.
    \item \textbf{Jistič} -- moderní ochrana. Při zkratu sám vypne, dá se zase zapnout.
    \item Najdeš je v \textbf{rozvodné skříni} každého domu nebo bytu.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--proud-a-napeti': String.raw`
{\LARGE \bfseries Elektrický proud a napětí} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

{\Large \bfseries \color{zfblue} Elektrický proud}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Elektrický proud} = uspořádaný pohyb elektronů ve vodiči.
    \item Značka: \textbf{I}. Jednotka: \textbf{ampér (A)}.
    \item Měříme jím \textbf{ampérmetrem}.
\end{itemize}

\vspace{2mm}
\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Vodič
    \draw[thick] (0, 0) rectangle (8, 0.8);
    \node[font=\small\bfseries] at (4, 1.2) {vodič};

    % Elektrony
    \foreach \x in {0.7, 1.7, 2.7, 3.7, 4.7, 5.7, 6.7, 7.4} {
        \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.4cm, font=\bfseries\scriptsize] at (\x, 0.4) {$-$};
    }

    % Šipky pohybu
    \draw[->, very thick, zfred] (0.2, -0.4) -- (1.5, -0.4);
    \node[font=\bfseries\small, color=zfred] at (4, -0.4) {pohyb elektronů};
    \draw[->, very thick, zfred] (6.5, -0.4) -- (7.8, -0.4);
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Elektrické napětí}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Napětí} = \uv{tlak}, který nutí elektrony pohybovat se ve vodiči.
    \item Vzniká \textbf{ve zdroji} (baterie, zásuvka, akumulátor).
    \item Značka: \textbf{U}. Jednotka: \textbf{volt (V)}.
    \item Měříme ho \textbf{voltmetrem}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklady}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Zdroj & \bfseries Napětí & \bfseries Použití \\
\hline
tužková baterie (AA, AAA) & 1,5 V & dálkové ovládání, hračky \\
plochá baterie & 4,5 V & svítilny \\
9V baterie & 9 V & multimetry, alarmy \\
autobaterie & 12 V & auto, motocykl \\
zásuvka v ČR & 230 V & domácí spotřebiče \\
vysoké napětí & 22\,000 V a více & rozvod elektřiny \\
\hline
\end{tabular}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pozor!} Napětí 230 V v zásuvce je \textbf{životu nebezpečné}. Nikdy nestrkej do zásuvky předměty.
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Zapojení měřicích přístrojů}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Obvod
    \draw[thick] (0,0) -- (5,0);
    \draw[thick] (0,0) -- (0,2);
    \draw[thick] (5,0) -- (5,2);
    \draw[thick] (0,2) -- (1.8,2);
    \draw[thick] (3.2,2) -- (5,2);

    % Zdroj
    \draw[thick] (2.4, -0.2) -- (2.4, 0.2);
    \draw[thick] (2.6, -0.4) -- (2.6, 0.4);

    % Žárovka
    \draw[thick] (2.5, 2) circle (0.3);
    \draw[thick] (2.3, 1.8) -- (2.7, 2.2);
    \draw[thick] (2.3, 2.2) -- (2.7, 1.8);
    \draw[thick] (1.8, 2) -- (2.2, 2);
    \draw[thick] (2.8, 2) -- (3.2, 2);

    % Ampérmetr (sériově) — vlevo
    \draw[thick] (0, 1) circle (0.3);
    \node[font=\bfseries] at (0, 1) {A};
    \node[font=\scriptsize] at (-0.7, 1.4) {ampérmetr};
    \node[font=\scriptsize] at (-0.7, 1) {(sériově)};

    % Voltmetr (paralelně k žárovce)
    \draw[thick] (4, 3.2) circle (0.3);
    \node[font=\bfseries] at (4, 3.2) {V};
    \draw[thick] (2.5, 2.3) -- (2.5, 3.2) -- (3.7, 3.2);
    \draw[thick] (4.3, 3.2) -- (5, 3.2) -- (5, 2);
    \node[font=\scriptsize] at (5.5, 3.7) {voltmetr};
    \node[font=\scriptsize] at (5.5, 3.3) {(paralelně)};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Ampérmetr} se zapojuje \textbf{sériově} (do obvodu jako spotřebič).
    \item \textbf{Voltmetr} se zapojuje \textbf{paralelně} (vedle spotřebiče).
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--multimetr': String.raw`
{\LARGE \bfseries Multimetr} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Multimetr} je univerzální měřicí přístroj. Nahrazuje ampérmetr, voltmetr i ohmmetr.
    \item Umí měřit \textbf{proud} (A), \textbf{napětí} (V) i \textbf{elektrický odpor} ($\Omega$).
    \item Pomocí přepínače zvolíš, co chceš měřit.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jak vypadá}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1.0, every node/.style={font=\small}]
    % Tělo
    \draw[thick, fill=yellow!20] (0,0) rectangle (4.5, 6);

    % Displej
    \draw[thick, fill=black!85] (0.3, 4.7) rectangle (4.2, 5.7);
    \node[font=\bfseries\Large, color=zfgreen!50!white] at (2.25, 5.2) {12.34};
    \node[font=\scriptsize, color=zfgreen!50!white, anchor=east] at (4.1, 5.55) {V};

    % Otočný přepínač
    \draw[thick, fill=gray!40] (2.25, 2.7) circle (1.3);
    \draw[thick] (2.25, 2.7) -- (3.4, 2.7);

    % Pozice přepínače
    \node[font=\scriptsize] at (2.25, 4.2) {OFF};
    \node[font=\scriptsize] at (3.55, 3.8) {V$\sim$};
    \node[font=\scriptsize] at (3.95, 2.7) {V=};
    \node[font=\scriptsize] at (3.55, 1.6) {A};
    \node[font=\scriptsize] at (2.25, 1.2) {$\Omega$};
    \node[font=\scriptsize] at (0.95, 1.6) {mA};
    \node[font=\scriptsize] at (0.55, 2.7) {$\mu$A};
    \node[font=\scriptsize] at (0.95, 3.8) {Hz};

    % Vstupní zdířky
    \draw[thick, fill=black] (1, 0.5) circle (0.2);
    \draw[thick, fill=zfred] (2.25, 0.5) circle (0.2);
    \draw[thick, fill=black] (3.5, 0.5) circle (0.2);
    \node[font=\tiny] at (1, 0.05) {COM};
    \node[font=\tiny] at (2.25, 0.05) {V$\Omega$};
    \node[font=\tiny] at (3.5, 0.05) {A};
\end{tikzpicture}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Funkce multimetru}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|c|l|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Symbol & \bfseries Měří & \bfseries Jednotka & \bfseries Zapojení \\
\hline
V$=$ & stejnosměrné napětí & V & paralelně \\
V$\sim$ & střídavé napětí (zásuvka) & V & paralelně \\
A & elektrický proud & A & sériově \\
$\Omega$ & elektrický odpor & ohm ($\Omega$) & samostatně, bez napětí \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Postup měření napětí baterie}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Zapni multimetr a nastav přepínač na \textbf{V$=$} (stejnosměrné napětí).
    \item Černý kabel zapoj do \textbf{COM}, červený do \textbf{V$\Omega$}.
    \item Hroty přilož na póly baterie -- černý na ($-$), červený na (+).
    \item Odečti hodnotu na displeji.
\end{enumerate}
\end{tcolorbox}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Pravidla bezpečné práce}
\vspace{2mm}

\begin{itemize}
    \item Vždy začni měřit od \textbf{nejvyššího rozsahu} a postupně přepínej dolů.
    \item Nikdy neměř \textbf{odpor} ve zapojeném obvodu (musí být bez napětí).
    \item Pro měření \textbf{proudu} musíš obvod \textbf{přerušit} a multimetr zapojit do něj.
    \item U napětí 230 V (zásuvka) -- pracuj jen \textbf{pod dohledem dospělého}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Co měříme nejčastěji}
\vspace{2mm}

\begin{itemize}
    \item Napětí baterie -- abychom poznali, že je vybitá (např. tužková $< 1{,}2$ V = vybitá).
    \item Spojitost vodiče -- ověření, že drát není přerušený.
    \item Odpor rezistoru, žárovky, topné spirály.
\end{itemize}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--elektromagnet': String.raw`
{\LARGE \bfseries Elektromagnet} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Elektromagnet} = magnet, který funguje, jen když jím \textbf{teče proud}.
    \item Skládá se z \textbf{cívky} (drátu navinutého do závitů) a \textbf{železného jádra} uvnitř.
    \item Když proud vypneme, magnetická síla zmizí.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Jak elektromagnet funguje}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Jádro
    \draw[thick, fill=gray!40] (0, -0.4) rectangle (5, 0.4);
    \node[font=\small] at (2.5, 0) {železné jádro};

    % Závity cívky
    \foreach \x in {0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5} {
        \draw[thick, zfred] (\x, 0.5) ellipse (0.15 and 0.7);
    }

    % Drát ke zdroji
    \draw[thick, zfred] (0.5, 1.2) -- (-0.5, 1.2) -- (-0.5, -1.5);
    \draw[thick, zfred] (4.5, 1.2) -- (5.5, 1.2) -- (5.5, -1.5);

    % Zdroj
    \draw[thick] (1.9, -1.5) -- (3.6, -1.5);
    \draw[thick] (2.5, -1.7) -- (2.5, -1.3);
    \draw[thick] (2.7, -1.9) -- (2.7, -1.1);
    \draw[thick] (3.6, -1.5) -- (5.5, -1.5);
    \draw[thick] (-0.5, -1.5) -- (1.9, -1.5);
    \node[font=\small] at (4.5, -1.85) {baterie};

    % Hřebíky přitahované
    \draw[thick] (5.5, 0) -- (6.3, 0);
    \draw[thick, fill=gray!50] (5.55, -0.05) -- (6.3, -0.05) -- (6.3, 0.05) -- (5.55, 0.05) -- cycle;
    \draw[thick] (5.5, 0.2) -- (6.5, 0.2);
    \draw[thick] (5.5, -0.2) -- (6.5, -0.2);

    \node[font=\small, anchor=west] at (6.6, 0) {hřebíky};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item Proudem vzniká kolem cívky \textbf{magnetické pole}.
    \item \textbf{Železné jádro} pole zesílí.
    \item \textbf{Vyšší proud nebo více závitů} = silnější magnet.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Rozdíl mezi magnetem a elektromagnetem}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Stálý magnet & \bfseries Elektromagnet \\
\hline
funguje stále & funguje, jen když teče proud \\
sílu nelze měnit & sílu lze měnit (proudem, počtem závitů) \\
nelze vypnout & lze zapnout/vypnout \\
příklady: ledničkový magnet & příklady: jeřáb, zvonek, motor \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Použití elektromagnetu}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Jeřáb na šrot} -- zvedá těžké železné předměty, po vypnutí proudu je upustí.
    \item \textbf{Zvonek u dveří} -- elektromagnet rozpohybuje kladívko, které tluče do zvonku.
    \item \textbf{Elektromotor} -- v každém pračce, ventilátoru, autě.
    \item \textbf{Reproduktor} -- elektromagnet rozkmitá membránu, vznikne zvuk.
    \item \textbf{Pevný disk počítače} -- magnetický záznam dat.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Jak udělat elektromagnet doma}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item Vezmi velký železný hřebík.
    \item Pevně kolem něj naviň izolovaný měděný drát (50 a více závitů).
    \item Konce drátu připoj k tužkové baterii.
    \item Hřebík začne přitahovat malé kovové předměty (sponky, jiné hřebíky).
\end{enumerate}
\end{tcolorbox}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--bezpecnost-pri-praci-s-elektrinou': String.raw`
{\LARGE \bfseries Bezpečnost při práci s elektřinou} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{tcolorbox}[colback=zfred!10, colframe=zfred!70, boxrule=0.7pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Elektřina je užitečná, ale nebezpečná!} Při napětí $\geq$ 50 V hrozí \textbf{úraz elektrickým proudem}, který může zabít. V zásuvkách je 230 V.
\end{tcolorbox}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Co dělá elektrický proud s tělem}
\vspace{2mm}

\begin{itemize}
    \item Křečovité stažení svalů -- člověk nemůže pustit drát.
    \item Popáleniny v místě, kudy proud vstoupil a vystoupil.
    \item Zástava srdce a dýchání.
    \item Smrtelné nebezpečí -- závisí na velikosti proudu, době a cestě tělem.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Bezpečnostní pravidla}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.4}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|>{\centering\arraybackslash}p{0.8cm}|p{12cm}|}
\hline
\rowcolor{zfgreen!25}
\bfseries $\checkmark$ & \bfseries Co dělat \\
\hline
\textcolor{zfgreen}{$\checkmark$} & Pracuj jen s nízkonapěťovými zdroji (baterie do 12 V). \\
\textcolor{zfgreen}{$\checkmark$} & Před opravou vždy \textbf{vypni jistič} v rozvodné skříni. \\
\textcolor{zfgreen}{$\checkmark$} & Měj \textbf{suché ruce} -- voda vede proud. \\
\textcolor{zfgreen}{$\checkmark$} & Používej \textbf{nepoškozené} kabely a zástrčky. \\
\textcolor{zfgreen}{$\checkmark$} & Při bouřce nestoj pod stromem ani v otevřeném terénu. \\
\hline
\end{tabular}

\vspace{2mm}
\renewcommand{\arraystretch}{1.4}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|>{\centering\arraybackslash}p{0.8cm}|p{12cm}|}
\hline
\rowcolor{zfred!25}
\bfseries $\boldsymbol{\times}$ & \bfseries Co nikdy nedělat \\
\hline
\textcolor{zfred}{$\boldsymbol{\times}$} & \textbf{Nikdy} nestrkej do zásuvky předměty (tužku, drát, prsty). \\
\textcolor{zfred}{$\boldsymbol{\times}$} & Nesahej na elektrické zařízení \textbf{mokrýma rukama}. \\
\textcolor{zfred}{$\boldsymbol{\times}$} & Nepoužívej spotřebič s \textbf{poškozeným kabelem}. \\
\textcolor{zfred}{$\boldsymbol{\times}$} & Nelez na sloupy s vysokým napětím (značka \textbf{trojúhelník s bleskem}). \\
\textcolor{zfred}{$\boldsymbol{\times}$} & Neodstraňuj kryty zásuvek a vypínačů sám. \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Výstražné značky}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Trojúhelník s bleskem (blesk jako TikZ zigzag)
    \draw[thick, fill=yellow!70] (0, 0) -- (1.4, 0) -- (0.7, 1.2) -- cycle;
    \fill[black] (0.85, 0.95) -- (0.95, 0.55) -- (0.78, 0.6) -- (0.85, 0.2) -- (0.5, 0.7) -- (0.7, 0.65) -- (0.6, 0.95) -- cycle;
    \node[font=\scriptsize] at (0.7, -0.5) {Pozor, elektřina};

    % Symbol vysoké napětí
    \begin{scope}[shift={(3, 0)}]
        \draw[thick, fill=yellow!70] (0, 0) -- (1.4, 0) -- (0.7, 1.2) -- cycle;
        \fill[black] (0.85, 0.95) -- (0.95, 0.65) -- (0.78, 0.7) -- (0.85, 0.4) -- (0.55, 0.75) -- (0.7, 0.7) -- (0.62, 0.95) -- cycle;
        \node[font=\bfseries\scriptsize, color=black] at (0.7, 0.2) {VN};
        \node[font=\scriptsize] at (0.7, -0.5) {Vysoké napětí};
    \end{scope}

    % Zákaz
    \begin{scope}[shift={(6, 0.6)}]
        \draw[thick, zfred, line width=2pt] (0, 0) circle (0.6);
        \fill[black] (0.15, 0.35) -- (0.25, -0.05) -- (0.08, 0) -- (0.15, -0.4) -- (-0.2, 0.1) -- (0, 0.05) -- (-0.1, 0.35) -- cycle;
        \draw[thick, zfred, line width=2pt] (-0.42, 0.42) -- (0.42, -0.42);
        \node[font=\scriptsize] at (0, -1.1) {Zákaz dotyku};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} První pomoc při úrazu elektřinou}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{enumerate}[noitemsep, topsep=2pt, leftmargin=18pt]
    \item \textbf{Vypni proud} (jistič v rozvodné skříni, vytáhni zástrčku).
    \item Pokud proud vypnout nelze -- odstraň postiženého \textbf{nevodičem} (suché dřevo, plast).
    \item \textbf{Nikdy} se postiženého nedotýkej holýma rukama, dokud teče proud!
    \item Zavolej \textbf{záchranku 155} (nebo 112).
    \item Zkontroluj dýchání a tep, případně zahaj resuscitaci.
\end{enumerate}
\end{tcolorbox}
`,

  // ─────────────────────────────────────────────────────────────────────
  'elektricke-obvody--vedeni-proudu-v-kapalinach': String.raw`
{\LARGE \bfseries Vedení proudu v kapalinách} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Většina \textbf{čistých kapalin} (destilovaná voda, olej, líh) proud \textbf{nevede}.
    \item Kapalina vede proud, jen když obsahuje \textbf{ionty} (rozpuštěnou sůl, kyselinu, hydroxid).
    \item Takovým kapalinám říkáme \textbf{elektrolyty}.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Pokus -- voda se solí}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Nádoba s vodou
    \draw[thick] (0,0) -- (0,2.5) (5,0) -- (5,2.5) (0,0) -- (5,0);
    \fill[cyan!30] (0.05, 0.02) rectangle (4.95, 1.8);
    \draw[cyan!70!black, thick] (0.05, 1.8) -- (4.95, 1.8);

    % Elektrody
    \draw[thick] (1.3, 0.3) rectangle (1.5, 2.8);
    \draw[thick] (3.5, 0.3) rectangle (3.7, 2.8);
    \node[font=\bfseries\small] at (1.4, 3.1) {+};
    \node[font=\bfseries\small] at (3.6, 3.1) {$-$};

    % Ionty
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (1.9, 1) {+};
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (2.5, 1.5) {+};
    \node[draw=zfred, fill=zfred!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (3.0, 0.5) {+};
    \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (2.2, 0.5) {$-$};
    \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (2.8, 1.2) {$-$};
    \node[draw=zfblue, fill=zfblue!30, thick, circle, minimum size=0.4cm, font=\scriptsize\bfseries] at (3.2, 1.6) {$-$};

    % Šipky pohybu iontů
    \draw[->, thick, zfblue] (2.6, 1.2) -- (3.3, 1.5);
    \draw[->, thick, zfred] (2, 1) -- (1.5, 0.8);

    % Zdroj a obvod
    \draw[thick] (1.4, 2.8) -- (1.4, 3.6) -- (2.3, 3.6);
    \draw[thick] (3.6, 2.8) -- (3.6, 3.6) -- (2.7, 3.6);
    \draw[thick] (2.3, 3.5) -- (2.3, 3.7);
    \draw[thick] (2.5, 3.3) -- (2.5, 3.9);
    \node[font=\small] at (2.7, 4.2) {baterie};

    % Žárovka
    \draw[thick] (5.5, 1.5) circle (0.4);
    \draw[thick] (5.22, 1.22) -- (5.78, 1.78);
    \draw[thick] (5.22, 1.78) -- (5.78, 1.22);
    \draw[thick] (5, 1.5) -- (5.1, 1.5);
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{itemize}
    \item \textbf{Čistá voda:} žárovka nesvítí $\to$ proud neteče.
    \item \textbf{Voda + sůl:} žárovka svítí $\to$ proud teče (ionty Na$^+$ a Cl$^-$ se pohybují).
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Co se s ionty děje}
\vspace{2mm}

\begin{itemize}
    \item Po zapnutí napětí \textbf{kationy} (+) putují k záporné elektrodě.
    \item \textbf{Aniony} ($-$) putují ke kladné elektrodě.
    \item Tomuto pohybu iontů v kapalině říkáme \textbf{elektrický proud v kapalinách}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Elektrolýza}
\vspace{2mm}

\begin{itemize}
    \item Při průchodu proudu kapalinou dochází k \textbf{chemickým změnám} -- nazýváme to \textbf{elektrolýza}.
    \item Na elektrodách se tvoří \textbf{plyny} (např. vodík, kyslík) nebo se \textbf{vylučuje kov}.
\end{itemize}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Vede / nevede proud}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfgreen!25}
\bfseries Vede proud & \bfseries Nevede proud \\
\hline
voda + sůl (slaná voda) & destilovaná (čistá) voda \\
voda + ocet, kyselina & olej, líh \\
mořská voda & benzín, petrolej \\
roztok hydroxidu sodného (louh) & cukrová voda (cukr není iont) \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Praktické využití}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Galvanické pokovování} -- pokrytí předmětu vrstvou kovu (chróm, zinek, zlato).
    \item \textbf{Výroba hliníku} z bauxitu pomocí elektrolýzy.
    \item \textbf{Akumulátor} (baterie v autě) -- ukládá energii pomocí iontů v kyselině.
    \item \textbf{Čištění odpadní vody} -- odstranění iontů.
\end{itemize}

\vspace{3mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfred!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Pozor!} Voda v koupelně, bazénu nebo dešti vede proud (obsahuje ionty). Proto je elektřina v okolí vody zvlášť nebezpečná.
\end{tcolorbox}
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
