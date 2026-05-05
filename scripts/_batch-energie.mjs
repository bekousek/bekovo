/**
 * Vloží LaTeX zápisy pro 3 podkapitoly tématu Energie (8. ročník).
 * Spuštění: node scripts/_batch-energie.mjs
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
  'energie--energie': String.raw`
{\LARGE \bfseries Energie} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Energie} je schopnost tělesa konat práci.
    \item Značka: \textbf{E}. Jednotka: \textbf{joule (J)} -- stejná jako u práce.
    \item Energie se nedá vyrobit ani zničit -- jen \textbf{přeměňuje} z jedné formy na druhou.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Druhy mechanické energie}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Polohová
    \draw[thick, fill=brown!50] (-1, 0) rectangle (2, 0.2);
    \draw[thick, fill=zfgreen!50] (-1, 0.2) -- (-1, 1.4) -- (2, 1.4) -- (2, 0.2) -- cycle;
    \draw[thick, fill=zfred!60] (0.3, 1.7) circle (0.3);
    \draw[<->, thick, dashed] (-1.4, 0.2) -- (-1.4, 1.7);
    \node[font=\small] at (-1.7, 0.95) {$h$};
    \node[font=\bfseries\small] at (0.5, -0.4) {polohová};
    \node[font=\scriptsize] at (0.5, -0.8) {$E_p$ (gravitační)};

    % Pohybová
    \begin{scope}[shift={(5, 0)}]
        \draw[thick, fill=brown!50] (-1, 0) rectangle (3, 0.2);
        \draw[thick, fill=zfred!60] (0.3, 0.5) circle (0.3);
        \draw[->, ultra thick, zfblue] (0.7, 0.5) -- (2.3, 0.5);
        \node[font=\bfseries, color=zfblue] at (1.5, 0.85) {$v$};
        \node[font=\bfseries\small] at (1, -0.4) {pohybová};
        \node[font=\scriptsize] at (1, -0.8) {$E_k$ (kinetická)};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $E_p = m \cdot g \cdot h$ \quad\quad
$E_k = \dfrac{1}{2} \cdot m \cdot v^2$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{Polohová (gravitační) energie} -- má ji každé těleso ve výšce $h$ nad zemí.
    \item \textbf{Pohybová (kinetická) energie} -- má ji každé pohybující se těleso.
    \item Součet $E_p + E_k$ = celková mechanická energie.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Další druhy energie}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Druh energie & \bfseries Příklady \\
\hline
\textbf{tepelná} & teplá voda, oheň, slunce \\
\textbf{elektrická} & baterie, zásuvka, blesk \\
\textbf{chemická} & potraviny, palivo, baterie \\
\textbf{světelná} & žárovka, slunce, LED \\
\textbf{zvuková} & reproduktor, hlasivky \\
\textbf{jaderná} & jádra atomů, slunce, jaderná elektrárna \\
\textbf{magnetická} & magnety, elektromagnety \\
\hline
\end{tabular}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Zákon zachování energie}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfgreen!60, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\textbf{Zákon zachování energie:} Energie se nedá vyrobit ani zničit. Lze ji jen \textbf{přeměnit} z jedné formy na jinou.
\end{tcolorbox}

\vspace{2mm}
{\Large \bfseries \color{zfblue} Příklady přeměn energie}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfblue, fill=zfblue!15, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=0.8cm] (e1) at (0, 0) {chemická};
    \node[draw=zfred, fill=zfred!15, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=0.8cm] (e2) at (4.5, 0) {tepelná};
    \node[draw=yellow!50!orange, fill=yellow!30, thick, rounded corners=4pt, minimum width=2.4cm, minimum height=0.8cm] (e3) at (9, 0) {světelná};
    \draw[->, very thick] (e1.east) -- (e2.west);
    \draw[->, very thick] (e2.east) -- (e3.west);
    \node[font=\small] at (4.5, -1) {hořící svíčka: vosk $\to$ teplo $\to$ světlo};
\end{tikzpicture}
\end{center}

\vspace{2mm}
\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Zařízení / děj & \bfseries Přeměna energie \\
\hline
žárovka & elektrická $\to$ světelná + tepelná \\
elektromotor & elektrická $\to$ pohybová \\
baterie & chemická $\to$ elektrická \\
spalovací motor & chemická $\to$ tepelná $\to$ pohybová \\
solární panel & světelná $\to$ elektrická \\
vodní elektrárna & polohová $\to$ pohybová $\to$ elektrická \\
fotosyntéza & světelná $\to$ chemická \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Příklad}
\vspace{2mm}

\noindent
\textbf{Příklad:} Jablko (0,1 kg) leží na stole vysokém 0,8 m. Jakou má polohovou energii?

\smallskip
\noindent
\textbf{Zápis:}\\
$m = 0{,}1$ kg\\
$h = 0{,}8$ m\\
$g = 10$ N/kg\\
$E_p = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $E_p = m \cdot g \cdot h$

\smallskip
\noindent
\textbf{Dosazení:} \quad $E_p = 0{,}1~\text{kg} \cdot 10~\text{N/kg} \cdot 0{,}8~\text{m} = 0{,}8$ J

\smallskip
\noindent
\textbf{Odpověď:} Jablko má polohovou energii 0,8 J.
`,

  // ─────────────────────────────────────────────────────────────────────
  'energie--ucinnost': String.raw`
{\LARGE \bfseries Účinnost} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item Žádný stroj nedokáže \textbf{přeměnit veškerou} energii bez ztrát.
    \item Část energie se vždy promění na \textbf{teplo} (třením, odporem).
    \item \textbf{Účinnost} udává, kolik z dodané energie se promění užitečně.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vzorec}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center}
\Large $\eta = \dfrac{W_{už}}{W_{c}} \cdot 100\,\%$
\end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{$\eta$} (řecké \emph{éta}) -- účinnost, vyjadřuje se v \%.
    \item \textbf{$W_{už}$} -- užitečná práce (energie).
    \item \textbf{$W_{c}$} -- celková dodaná energie.
    \item Místo práce může být i \textbf{výkon} ($P_{už}$ a $P_{c}$).
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Účinnost je vždy menší než 100\,\%}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    \node[draw=zfblue, fill=zfblue!15, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=1cm] (vstup) at (0, 0) {dodaná energie};
    \node[draw=zfgreen, fill=zfgreen!15, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=1cm] (uz) at (5, 0.7) {užitečná};
    \node[draw=zfred, fill=zfred!15, thick, rounded corners=4pt, minimum width=2.6cm, minimum height=1cm] (zt) at (5, -0.7) {ztráty (teplo)};

    \draw[->, ultra thick] (vstup.east) -- (uz.west);
    \draw[->, ultra thick] (vstup.east) -- (zt.west);

    \node[font=\bfseries\small, color=zfgreen] at (3, 1.4) {$\eta$};
    \node[font=\bfseries\small, color=zfred] at (3, -1.4) {$1 - \eta$};
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Účinnosti běžných zařízení}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|c|}
\hline
\rowcolor{zfblue!25}
\bfseries Zařízení & \bfseries Účinnost \\
\hline
běžná žárovka & 5 \% \\
LED žárovka & 30--40 \% \\
parní stroj & 5--15 \% \\
benzinový motor & 25 \% \\
naftový (Diesel) motor & 35 \% \\
elektromotor & 90--95 \% \\
fotovoltaický panel & 15--22 \% \\
vodní turbína & až 90 \% \\
plynový kotel & 90--95 \% \\
lidský organismus (fyzická práce) & 20--25 \% \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Kde se ztrácí energie?}
\vspace{2mm}

\begin{itemize}
    \item \textbf{Tření} -- pohybující se části se třou, vzniká teplo.
    \item \textbf{Odpor vzduchu / vody} -- při pohybu motorů.
    \item \textbf{Elektrický odpor} -- vodiče se zahřívají.
    \item \textbf{Vyzařování tepla} -- horké stroje předávají energii okolí.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Příklady výpočtu}
\vspace{2mm}

\noindent
\textbf{Příklad 1:} Žárovka odebírá z elektřiny 60 W, ale světlo vyzařuje s výkonem 3 W. Jaká je její účinnost?

\smallskip
\noindent
\textbf{Zápis:}\\
$P_c = 60$ W (celkový příkon)\\
$P_{už} = 3$ W (užitečný výkon)\\
$\eta = ?\,\%$

\smallskip
\noindent
\textbf{Vzorec:} \quad $\eta = \dfrac{P_{už}}{P_c} \cdot 100\,\%$

\smallskip
\noindent
\textbf{Dosazení:} \quad $\eta = \dfrac{3~\text{W}}{60~\text{W}} \cdot 100\,\% = 5\,\%$

\smallskip
\noindent
\textbf{Odpověď:} Účinnost žárovky je 5 \% (zbytek se mění na teplo).

\vspace{4mm}
\noindent
\textbf{Příklad 2:} Motor s účinností 80 \% odebírá energii 1\,000 J. Kolik užitečné energie vykoná?

\smallskip
\noindent
\textbf{Zápis:}\\
$\eta = 80\,\% = 0{,}8$\\
$W_c = 1\,000$ J\\
$W_{už} = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $W_{už} = \eta \cdot W_c$

\smallskip
\noindent
\textbf{Dosazení:} \quad $W_{už} = 0{,}8 \cdot 1\,000~\text{J} = 800$ J

\smallskip
\noindent
\textbf{Odpověď:} Motor vykoná užitečnou práci 800 J.

\vspace{4mm}
\noindent
\textbf{Příklad 3:} Žárovku 60 W nahradíme LED za 6 W o stejném světelném výkonu. Kolik ušetříme za rok, pokud svítí 8 h denně?

\smallskip
\noindent
\textbf{Zápis:}\\
$P_1 = 60$ W (klasická žárovka)\\
$P_2 = 6$ W (LED)\\
$t = 8$ h/den $\cdot$ 365 dní = 2\,920 h\\
úspora $= ?$ kWh

\smallskip
\noindent
\textbf{Vzorec:} \quad úspora $= (P_1 - P_2) \cdot t$

\smallskip
\noindent
\textbf{Dosazení:} \quad úspora $= (60 - 6)~\text{W} \cdot 2\,920~\text{h} = 157\,680$ Wh $\approx 158$ kWh

\smallskip
\noindent
\textbf{Odpověď:} Za rok ušetříme cca 158 kWh elektřiny.
`,

  // ─────────────────────────────────────────────────────────────────────
  'energie--teplo-a-jeho-sireni': String.raw`
{\LARGE \bfseries Teplo a jeho šíření} \\[2mm]
{\color{zfblue}\hrule height 1.5pt}
\vspace{4mm}

\begin{itemize}
    \item \textbf{Teplo (Q)} = energie, která přechází mezi tělesy o různé teplotě.
    \item Jednotka: \textbf{joule (J)}, často \textbf{kilojoule (kJ)}.
    \item Teplo \textbf{vždy} přechází z teplejšího na chladnější těleso.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tři způsoby šíření tepla}
\vspace{2mm}

\begin{center}
\begin{tikzpicture}[scale=1, every node/.style={font=\small}]
    % Vedení
    \draw[thick, fill=zfblue!40] (0, 0) rectangle (3.5, 0.5);
    \draw[thick, fill=zfred!60] (3.5, 0) rectangle (3.7, 0.5);
    \fill[zfred!30] (0, 0.6) -- (3, 1.5) -- (3, 0.6) -- cycle;
    \draw[->, thick, zfred] (3.3, 0.25) -- (0.3, 0.25);
    \node[font=\bfseries\small] at (1.75, -0.4) {1) Vedení};
    \node[font=\scriptsize] at (1.75, -0.8) {(kov, dotyk)};

    % Proudění
    \begin{scope}[shift={(6, 0)}]
        \draw[thick] (0, 0) rectangle (3, 1.5);
        \fill[orange!40] (0.05, 0.05) rectangle (2.95, 0.4);
        \draw[->, thick, zfred] (0.3, 0.5) .. controls (0.3, 1) .. (1.5, 1.2);
        \draw[->, thick, zfblue] (1.5, 1.2) .. controls (2.7, 1) .. (2.7, 0.5);
        \node[font=\scriptsize, color=zfred] at (0.6, 1.2) {teplo};
        \node[font=\bfseries\small] at (1.5, -0.4) {2) Proudění};
        \node[font=\scriptsize] at (1.5, -0.8) {(kapalina, plyn)};
    \end{scope}

    % Záření
    \begin{scope}[shift={(11, 0.7)}]
        \fill[yellow!70] (0, 0) circle (0.4);
        \foreach \a in {0, 45, 90, 135, 180, 225, 270, 315} {
            \draw[->, thick, orange] ({0.5*cos(\a)}, {0.5*sin(\a)}) -- ({1.3*cos(\a)}, {1.3*sin(\a)});
        }
        \node[font=\bfseries\small] at (0, -2) {3) Záření};
        \node[font=\scriptsize] at (0, -2.4) {(i ve vakuu)};
    \end{scope}
\end{tikzpicture}
\end{center}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Vedení (kondukce)}
\vspace{2mm}

\begin{itemize}
    \item Teplo se předává \textbf{přímo mezi částicemi} -- z teplejších na chladnější.
    \item Probíhá hlavně v \textbf{pevných látkách}.
    \item \textbf{Dobré vodiče tepla:} kovy (měď, hliník, železo).
    \item \textbf{Špatné vodiče (izolanty):} dřevo, plast, sklo, polystyren, vlna, peří.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Proudění (konvekce)}
\vspace{2mm}

\begin{itemize}
    \item Teplo přenáší \textbf{pohybující se kapalina nebo plyn}.
    \item Teplá látka má \emph{menší hustotu} -- stoupá nahoru. Studená klesá dolů.
    \item Vznikají \textbf{proudy} (konvekční proudy).
    \item Příklady: ohřev vody v hrnci, topení v pokoji, vítr, výtah teplého vzduchu nad ohněm.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tepelné záření (radiace)}
\vspace{2mm}

\begin{itemize}
    \item Teplo se šíří \textbf{elektromagnetickými vlnami} (jako světlo).
    \item Funguje i ve \textbf{vakuu} -- proto k nám doletí teplo Slunce.
    \item Tmavé předměty teplo lépe pohlcují (a vyzařují); světlé odrážejí.
    \item Příklady: Slunce hřeje, infrazářič, oheň, infrakamera.
\end{itemize}

\vspace{4mm}
{\Large \bfseries \color{zfblue} Tepelné izolace v praxi}
\vspace{2mm}

\begin{center}
\renewcommand{\arraystretch}{1.3}
\setlength{\tabcolsep}{8pt}
\begin{tabular}{|l|l|}
\hline
\rowcolor{zfblue!25}
\bfseries Předmět & \bfseries Co a jak izoluje \\
\hline
zimní bunda & vrstva vzduchu mezi vlákny -- omezuje vedení \\
termoska & vakuum mezi stěnami -- žádné vedení ani proudění \\
polystyren / vlna ve zdi & izolant -- snižuje úniky tepla z domu \\
fólie na okně & odráží záření zpět dovnitř \\
mikrotenový sáček s ledem & izolant proti teplu zvenčí \\
\hline
\end{tabular}
\end{center}

\vspace{3mm}
{\Large \bfseries \color{zfblue} Teplo přijímané a odevzdané}
\vspace{2mm}

\begin{tcolorbox}[colback=zfgray, colframe=zfblue!50, boxrule=0.5pt, arc=2pt, left=6pt, right=6pt, top=4pt, bottom=4pt]
\begin{center} \Large $Q = m \cdot c \cdot \Delta t$ \end{center}
\end{tcolorbox}

\begin{itemize}
    \item \textbf{Q} -- přijaté/odevzdané teplo (J).
    \item \textbf{m} -- hmotnost (kg). \textbf{$\Delta t$} -- změna teploty (\textdegree C).
    \item \textbf{c} -- měrná tepelná kapacita (J/(kg$\cdot$\textdegree C)). Pro vodu $c = 4\,180$ J/(kg$\cdot$\textdegree C).
\end{itemize}

\vspace{2mm}
\noindent
\textbf{Příklad:} Kolik tepla potřebujeme k ohřátí 2 kg vody z 20\,\textdegree C na 80\,\textdegree C?

\smallskip
\noindent
\textbf{Zápis:}\\
$m = 2$ kg\\
$\Delta t = 80 - 20 = 60$ \textdegree C\\
$c = 4\,180$ J/(kg$\cdot$\textdegree C)\\
$Q = ?$ J

\smallskip
\noindent
\textbf{Vzorec:} \quad $Q = m \cdot c \cdot \Delta t$

\smallskip
\noindent
\textbf{Dosazení:} \quad $Q = 2~\text{kg} \cdot 4\,180~\text{J/(kg}\cdot\text{\textdegree C)} \cdot 60~\text{\textdegree C} = 501\,600$ J $\approx 500$ kJ

\smallskip
\noindent
\textbf{Odpověď:} K ohřátí potřebujeme přibližně 500 kJ tepla.
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
