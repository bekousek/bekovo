import { useState } from 'react';
import { loadSave, resumeSave, useGame } from '../state';
import { GOALS, type GoalId } from '../logic/bench';
import { ArtSvg, Icon, Sprite } from '../pixel/Sprite';
import { AVATARS, avatarArt } from '../pixel/sprites';
import { formatKc } from '../data/parts';
import { START_SAVINGS } from '../data/questions';
import { sfx } from '../sfx';
import type { IconKey, SpriteKey } from '../pixel/sprites';

const GOAL_ART: Record<GoalId, SpriteKey> = { gaming: 'gpu', video: 'cpu', school: 'ssd' };

const LOOP: { icon: IconKey; title: string; text: string }[] = [
  { icon: 'bag', title: 'Brigády', text: 'Odpovídej na otázky z IT a vydělávej.' },
  { icon: 'cart', title: 'Obchod', text: 'Kup díly, které k sobě pasují.' },
  { icon: 'wrench', title: 'Dílna', text: 'Slož počítač podle účtenky.' },
  { icon: 'power', title: 'Systém', text: 'Zapni ho a nainstaluj systém a programy.' },
];
const DEMO_MONEY = 100000;

export default function Start() {
  const { update, go, flags, toast, reset } = useGame();
  const saved = typeof window !== 'undefined' ? loadSave() : null;
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [tried, setTried] = useState(false);

  const nameOk = name.trim().length >= 2;
  const ready = nameOk && goal !== null;

  const start = () => {
    setTried(true);
    if (!ready) return;
    sfx('ok');
    update((d) => {
      d.name = name.trim().slice(0, 20);
      d.avatar = avatar;
      d.goal = goal;
      d.startedAt = Date.now();
      if (flags.demo) d.money = DEMO_MONEY;
    });
    if (flags.demo) toast('info', `Režim pro učitele: na účtu máš ${formatKc(DEMO_MONEY)}.`);
    go('town');
  };

  return (
    <div className="st">
      <section className="st-hero">
        <h1 className="t-pixel t-48">Postav si PC</h1>
        <p className="st-hero__lead">
          Vydělej si na brigádách, nakup díly, které k sobě pasují, slož z nich počítač a nainstaluj systém.
        </p>
        <div className="st-hero__scene px-frame px-panel" aria-hidden="true">
          <HeroDesk />
        </div>
        <ol className="st-loop" aria-label="Jak se hraje">
          {LOOP.map((step) => (
            <li key={step.title} className="st-loop__step">
              <Icon name={step.icon} scale={3} />
              <span className="st-loop__title">{step.title}</span>
              <span className="st-loop__text">{step.text}</span>
            </li>
          ))}
        </ol>
        <p className="t-muted">
          Na účtu máš {formatKc(START_SAVINGS)} z narozenin. Na počítač to nestačí, zbytek si vyděláš.
          Hra se ukládá sama, takže můžeš pokračovat i příští hodinu.
        </p>
      </section>

      <section className="st-side">
        {saved && saved.name ? (
          <div className="st-resume px-frame px-panel">
            <h2 className="t-24">Rozehraná hra</h2>
            <p>
              {saved.name} · {formatKc(saved.money)} · nakoupeno dílů: {saved.owned.length}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="px-btn" onClick={() => { resumeSave(update); sfx('ok'); }}>
                Pokračovat <Icon name="arrow" />
              </button>
              <button type="button" className="px-btn px-btn--dark" onClick={() => reset()}>
                Smazat a začít znovu
              </button>
            </div>
          </div>
        ) : null}

        <form
          className="st-form px-frame px-panel"
          onSubmit={(e) => { e.preventDefault(); start(); }}
          noValidate
        >
          <h2 className="t-24">{saved && saved.name ? 'Nová hra' : 'Kdo staví?'}</h2>

          <div className="st-field">
            <label className="st-label" htmlFor="bpc-name">Přezdívka</label>
            <input
              id="bpc-name"
              className="px-input"
              value={name}
              maxLength={20}
              autoComplete="off"
              placeholder="Třeba Kuba"
              onChange={(e) => setName(e.target.value)}
              aria-invalid={tried && !nameOk}
              aria-describedby="bpc-name-help"
            />
            <p id="bpc-name-help" className={tried && !nameOk ? 't-bad t-16' : 't-muted t-16'}>
              {tried && !nameOk ? 'Napiš aspoň dva znaky.' : 'Neuváděj celé jméno, stačí přezdívka.'}
            </p>
          </div>

          <div className="st-field">
            <span className="st-label" id="bpc-avatar-l">Postavička</span>
            <div className="st-avatars" role="group" aria-labelledby="bpc-avatar-l">
              {AVATARS.map((look, i) => (
                <button
                  key={i}
                  type="button"
                  className="st-avatar px-frame"
                  aria-pressed={avatar === i}
                  aria-label={`Postavička ${i + 1}`}
                  onClick={() => { setAvatar(i); sfx('click'); }}
                >
                  <ArtSvg art={avatarArt(look)} scale={4} />
                </button>
              ))}
            </div>
          </div>

          <div className="st-field">
            <span className="st-label" id="bpc-goal-l">K čemu bude tvůj počítač?</span>
            <div className="st-goals" role="group" aria-labelledby="bpc-goal-l">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="st-goal px-frame"
                  aria-pressed={goal === g.id}
                  onClick={() => { setGoal(g.id); sfx('click'); }}
                >
                  <span className="st-goal__art"><Sprite name={GOAL_ART[g.id]} fit={[72, 64]} /></span>
                  <span className="st-goal__title">{g.title}</span>
                  <span className="st-goal__text">{g.pitch}</span>
                </button>
              ))}
            </div>
            {tried && !goal ? <p className="t-bad t-16">Vyber, k čemu počítač bude.</p> : null}
          </div>

          <button type="submit" className="px-btn px-btn--block">
            Do městečka <Icon name="arrow" />
          </button>
        </form>
      </section>
    </div>
  );
}

/** Stůl s krabicemi dílů: co tě v hodině čeká. */
function HeroDesk() {
  return (
    <div className="st-desk">
      <Sprite name="case" scale={4} />
      <div className="st-desk__parts">
        <Sprite name="gpu" scale={3} />
        <div className="st-desk__row">
          <Sprite name="cpu" scale={2} />
          <Sprite name="psu" scale={2} />
        </div>
        <div className="st-desk__row">
          <Sprite name="ram" scale={2} />
          <Sprite name="ssd" scale={2} />
        </div>
      </div>
    </div>
  );
}
