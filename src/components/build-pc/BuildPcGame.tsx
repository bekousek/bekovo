import { useState } from 'react';
import { GameProvider, useGame } from './state';
import { Dialog, Money, Toasts } from './ui';
import { ArtSvg, Icon } from './pixel/Sprite';
import { AVATARS, avatarArt } from './pixel/sprites';
import { GOAL_BY_ID } from './logic/bench';
import { setSoundOn } from './sfx';
import Start from './screens/Start';
import Town from './screens/Town';
import Jobs from './screens/Jobs';
import Library from './screens/Library';
import Shop from './screens/Shop';
import Workshop from './screens/Workshop';
import Post from './screens/Post';
import OsInstall from './screens/OsInstall';
import Software from './screens/Software';
import Finish from './screens/Finish';

export default function BuildPcGame() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

function Game() {
  const { s } = useGame();
  setSoundOn(s.sound);
  return (
    <div className="bpc">
      {s.screen !== 'start' ? <Hud /> : null}
      <main className={`bpc-main${s.screen === 'town' ? ' bpc-main--full' : ''}`}>
        <ScreenSwitch />
      </main>
      <Toasts />
    </div>
  );
}

function ScreenSwitch() {
  const { s } = useGame();
  switch (s.screen) {
    case 'start': return <Start />;
    case 'town': return <Town />;
    case 'jobs': return <Jobs />;
    case 'library': return <Library />;
    case 'shop': return <Shop />;
    case 'workshop': return <Workshop />;
    case 'post': return <Post />;
    case 'os': return <OsInstall />;
    case 'software': return <Software />;
    case 'finish': return <Finish />;
  }
}

function Hud() {
  const { s, update, reset } = useGame();
  const [menu, setMenu] = useState(false);
  const goal = s.goal ? GOAL_BY_ID[s.goal] : null;
  return (
    <header className="bpc-hud">
      <div className="bpc-hud__title">
        <ArtSvg art={avatarArt(AVATARS[s.avatar] ?? AVATARS[0])} scale={2} />
        <span>{s.name || 'Postav si PC'}</span>
      </div>
      {goal ? <span className="bpc-hud__goal">Zakázka: {goal.short}</span> : null}
      <span className="bpc-hud__spacer" />
      <Money value={s.money} />
      <button
        type="button"
        className="bpc-iconbtn"
        aria-pressed={s.sound}
        aria-label={s.sound ? 'Vypnout zvuk' : 'Zapnout zvuk'}
        onClick={() => update((d) => { d.sound = !d.sound; })}
      >
        <Icon name={s.sound ? 'speaker' : 'mute'} />
      </button>
      <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setMenu(true)}>
        Menu
      </button>
      {menu ? (
        <Dialog
          title="Menu"
          onClose={() => setMenu(false)}
          actions={
            <>
              <button type="button" className="px-btn px-btn--bad px-btn--small" onClick={() => { setMenu(false); reset(); }}>
                Smazat a začít znovu
              </button>
              <button type="button" className="px-btn px-btn--small" onClick={() => setMenu(false)}>
                Hrát dál
              </button>
            </>
          }
        >
          <p>Hra se ukládá sama v tomhle prohlížeči. Když zavřeš okno, příště můžeš pokračovat.</p>
          <p className="t-muted">„Smazat a začít znovu“ vymaže peníze, nákupy i složený počítač.</p>
        </Dialog>
      ) : null}
    </header>
  );
}
