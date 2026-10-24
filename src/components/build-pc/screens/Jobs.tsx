import { useEffect, useRef, useState } from 'react';
import { useGame } from '../state';
import { ScreenHead, shuffle } from '../ui';
import { Icon, Sprite } from '../pixel/Sprite';
import { formatKc } from '../data/parts';
import {
  JOBS, PAY_PER_CORRECT, PERFECT_BONUS, QUESTIONS, QUESTIONS_PER_JOB, QUESTION_BY_ID, type QuestionCategory,
} from '../data/questions';
import { sfx } from '../sfx';

const LETTERS = ['A', 'B', 'C', 'D'];
/** Jak dlouho se po odpovědi musí číst vysvětlení, než jde dál (ms). */
const READ_DELAY = 1500;

export default function Jobs() {
  const { s } = useGame();
  if (s.quiz && !s.quiz.done) return <Quiz />;
  if (s.quiz && s.quiz.done) return <Payslip />;
  return <JobList />;
}

function JobList() {
  const { s, update } = useGame();
  const maxPay = QUESTIONS_PER_JOB * PAY_PER_CORRECT + PERFECT_BONUS;

  const startJob = (cat: QuestionCategory) => {
    sfx('click');
    update((d) => {
      const pool = QUESTIONS.filter((q) => q.cat === cat);
      let fresh = pool.filter((q) => !d.asked.includes(q.id));
      if (fresh.length < QUESTIONS_PER_JOB) {
        // Banka tématu došla: otázky se smí opakovat, ale co nejpozději.
        d.asked = d.asked.filter((id) => QUESTION_BY_ID[id]?.cat !== cat);
        fresh = pool;
      }
      const ids = shuffle(fresh).slice(0, QUESTIONS_PER_JOB).map((q) => q.id);
      d.quiz = { cat, ids, orders: ids.map(() => shuffle([0, 1, 2, 3])), i: 0, picks: ids.map(() => null), done: false };
    });
  };

  return (
    <>
      <ScreenHead
        title="Brigády"
        lead={`Každá brigáda je ${QUESTIONS_PER_JOB} otázek. Za správnou odpověď dostaneš ${formatKc(PAY_PER_CORRECT)}, za všech pět navíc ${formatKc(PERFECT_BONUS)}.`}
      >
        <div className="jobs-stats">
          <span>Brigád: <b>{s.jobsDone}</b></span>
          <span>Správně: <b>{s.correct} z {s.answered}</b></span>
          <span>Vyděláno: <b>{formatKc(s.earned)}</b></span>
        </div>
      </ScreenHead>
      <div className="jobs">
        {JOBS.map((j) => (
          <button key={j.id} type="button" className="job px-frame" onClick={() => startJob(j.id)}>
            <span className="job__place">{j.place}</span>
            <span className="job__title">{j.title}</span>
            <span className="job__pitch">{j.pitch}</span>
            <span className="job__meta">{QUESTIONS_PER_JOB} otázek · až {formatKc(maxPay)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Quiz() {
  const { s, update } = useGame();
  const quiz = s.quiz!;
  const q = QUESTION_BY_ID[quiz.ids[quiz.i]];
  const order = quiz.orders[quiz.i];
  const pick = quiz.picks[quiz.i];
  const answered = pick !== null;
  const [canNext, setCanNext] = useState(false);
  const job = JOBS.find((j) => j.id === quiz.cat)!;
  const nextRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setCanNext(false);
    cardRef.current?.focus();
  }, [quiz.i]);

  useEffect(() => {
    if (!answered) return;
    const t = window.setTimeout(() => { setCanNext(true); nextRef.current?.focus(); }, READ_DELAY);
    return () => window.clearTimeout(t);
  }, [answered, quiz.i]);

  const choose = (orig: number) => {
    if (answered) return;
    const right = orig === 0;
    sfx(right ? 'coin' : 'bad');
    update((d) => {
      const z = d.quiz!;
      z.picks[z.i] = orig;
      d.answered += 1;
      if (!d.asked.includes(q.id)) d.asked.push(q.id);
      if (right) {
        d.correct += 1;
        d.money += PAY_PER_CORRECT;
        d.earned += PAY_PER_CORRECT;
      }
    });
  };

  const next = () => {
    if (!canNext) return;
    sfx('click');
    update((d) => {
      const z = d.quiz!;
      if (z.i + 1 < z.ids.length) {
        z.i += 1;
        return;
      }
      z.done = true;
      d.jobsDone += 1;
      const correct = z.picks.filter((p) => p === 0).length;
      if (correct === z.ids.length) {
        d.money += PERFECT_BONUS;
        d.earned += PERFECT_BONUS;
      }
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toUpperCase();
      const idx = ['1', '2', '3', '4'].indexOf(k) >= 0 ? ['1', '2', '3', '4'].indexOf(k) : LETTERS.indexOf(k);
      if (!answered && idx >= 0) { e.preventDefault(); choose(order[idx]); }
      if (answered && e.key === 'Enter' && canNext && document.activeElement === document.body) { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const right = pick === 0;
  return (
    <div className="quiz">
      <div className="quiz__top">
        <div>
          <p className="t-pixel t-16 t-gold">{job.place}</p>
          <h1 className="t-24">{job.title}</h1>
        </div>
        <div className="quiz__progress" aria-label={`Otázka ${quiz.i + 1} z ${quiz.ids.length}`}>
          {quiz.ids.map((_, i) => {
            const p = quiz.picks[i];
            const cls = p === null ? (i === quiz.i ? 'quiz__pip--now' : '') : p === 0 ? 'quiz__pip--ok' : 'quiz__pip--bad';
            return <span key={i} className={`quiz__pip ${cls}`} />;
          })}
        </div>
      </div>

      <section className="quiz__card px-frame px-panel" aria-live="polite">
        <h2 ref={cardRef} tabIndex={-1} className="quiz__q">{q.text}</h2>
        {q.img ? (
          <div className="quiz__img"><Sprite name={q.img} fit={[300, 170]} title="Obrázek dílu" /></div>
        ) : null}
        <div className="quiz__opts">
          {order.map((orig, i) => {
            let cls = 'quiz__opt px-frame';
            if (answered) {
              if (orig === 0) cls += ' quiz__opt--right';
              else if (orig === pick) cls += ' quiz__opt--wrong';
              else cls += ' quiz__opt--dim';
            }
            return (
              <button key={orig} type="button" className={cls} disabled={answered} onClick={() => choose(orig)}>
                <span className="quiz__key" aria-hidden="true">{LETTERS[i]}</span>
                <span>{q.options[orig]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {answered ? (
        <div className="quiz__explain px-frame" style={{ ['--line' as string]: right ? 'var(--c-green)' : 'var(--c-orange)' }}>
          <Icon name={right ? 'check' : 'cross'} scale={3} />
          <div style={{ display: 'grid', gap: 6 }}>
            <p className={`t-pixel t-20 ${right ? 't-ok' : 't-bad'}`}>
              {right ? `Správně! +${formatKc(PAY_PER_CORRECT)}` : `Správně je: ${q.options[0]}`}
            </p>
            <p>{q.explain}</p>
          </div>
        </div>
      ) : null}

      <div className="quiz__foot">
        <p className="t-muted t-16">Odpovídat můžeš i klávesami A–D.</p>
        <button
          ref={nextRef}
          type="button"
          className="px-btn"
          disabled={!answered || !canNext}
          aria-disabled={!answered || !canNext}
          onClick={next}
        >
          {quiz.i + 1 < quiz.ids.length ? 'Další otázka' : 'Výplata'} <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function Payslip() {
  const { s, update, go } = useGame();
  const quiz = s.quiz!;
  const job = JOBS.find((j) => j.id === quiz.cat)!;
  const correct = quiz.picks.filter((p) => p === 0).length;
  const perfect = correct === quiz.ids.length;
  const total = correct * PAY_PER_CORRECT + (perfect ? PERFECT_BONUS : 0);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="payslip px-frame px-paper receipt">
        <div className="receipt__head">
          <span className="receipt__shop">Výplatní páska</span>
          <span className="receipt__sub">{job.title} · {job.place}</span>
        </div>
        <div className="payslip__row"><span>Správné odpovědi</span><span className="t-num">{correct} × {formatKc(PAY_PER_CORRECT)}</span></div>
        <div className="payslip__row"><span>Bonus za všech pět</span><span className="t-num">{perfect ? formatKc(PERFECT_BONUS) : '—'}</span></div>
        <div className="payslip__row payslip__row--total"><span>Celkem</span><span className="t-num">{formatKc(total)}</span></div>
        <p style={{ fontSize: 16 }}>Na účtu teď máš <b>{formatKc(s.money)}</b>.</p>
      </section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <button type="button" className="px-btn" onClick={() => update((d) => { d.quiz = null; })}>
          Další brigáda <Icon name="arrow" />
        </button>
        <button type="button" className="px-btn px-btn--dark" onClick={() => { update((d) => { d.quiz = null; }); go('shop'); }}>
          <Icon name="cart" /> Do PC obchodu
        </button>
        <button type="button" className="px-btn px-btn--dark" onClick={() => { update((d) => { d.quiz = null; }); go('town'); }}>
          Do městečka
        </button>
      </div>
    </div>
  );
}
