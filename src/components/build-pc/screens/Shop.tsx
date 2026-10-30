import { useState } from 'react';
import { useGame } from '../state';
import { Dialog, ScreenHead } from '../ui';
import { Icon, Sprite } from '../pixel/Sprite';
import {
  CATEGORIES, PART_BY_ID, PRICES_DATE, PRICES_SOURCE, formatKc, partsIn, specsOf, type Category, type Part,
} from '../data/parts';
import { checkBuild, type Issue } from '../logic/compat';
import { installedIds, refundOf, RETURN_FEE, spriteOf } from '../logic/assembly';
import { sfx } from '../sfx';

export default function Shop() {
  const { s, update, toast, go } = useGame();
  const [cat, setCat] = useState<Category>('cpu');
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [returning, setReturning] = useState<Part | null>(null);

  const cart = s.cart.map((id) => PART_BY_ID[id]);
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  const after = s.money - total;
  const installed = installedIds(s.asm);
  const catInfo = CATEGORIES.find((c) => c.id === cat)!;

  const countIn = (c: Category) => [...s.cart, ...s.owned].filter((id) => PART_BY_ID[id]?.cat === c).length;

  const add = (p: Part) => {
    sfx('click');
    setIssues(null);
    update((d) => { if (!d.cart.includes(p.id)) d.cart.push(p.id); });
  };
  const remove = (id: string) => {
    setIssues(null);
    update((d) => { d.cart = d.cart.filter((x) => x !== id); });
  };
  const check = () => {
    sfx('click');
    update((d) => { d.checks += 1; });
    setIssues(checkBuild([...s.owned, ...s.cart]));
  };
  const pay = () => {
    if (cart.length === 0 || after < 0) return;
    sfx('coin');
    update((d) => {
      d.owned.push(...d.cart);
      d.money -= total;
      d.spent += total;
      d.cart = [];
    });
    setIssues(null);
    toast('ok', `Zaplaceno ${formatKc(total)}. Díly ti dovezou domů, skládat je budeš v dílně.`);
  };
  const doReturn = (p: Part) => {
    const back = refundOf(p);
    sfx('coin');
    update((d) => {
      const i = d.owned.indexOf(p.id);
      if (i >= 0) d.owned.splice(i, 1);
      d.money += back;
      d.spent -= back;
      d.returns += 1;
    });
    setReturning(null);
    toast('info', `${p.short} vrácen. Zpátky jsi dostal ${formatKc(back)}.`);
  };

  return (
    <>
      <ScreenHead
        title="PC obchod"
        lead={`Skutečné modely a ceny z ${PRICES_SOURCE} k ${PRICES_DATE}. Klikni na parametr a uvidíš, co znamená.`}
      />
      <div className="shop">
        <section aria-label="Zboží">
          <div className="shop-tabs" role="tablist" aria-label="Kategorie dílů">
            {CATEGORIES.map((c) => {
              const n = countIn(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={c.id === cat}
                  className="shop-tab"
                  onClick={() => setCat(c.id)}
                >
                  {c.label}
                  {n > 0 ? <span className="shop-tab__count" aria-label={`vybráno ${n}`}>{n}</span> : null}
                </button>
              );
            })}
          </div>
          <p className="shop-cathint">
            {catInfo.hint}{catInfo.required ? '' : ' Není povinné pro každou sestavu.'}
          </p>
          <div className="shop-list" role="tabpanel">
            {partsIn(cat).map((p) => (
              <Product
                key={p.id}
                p={p}
                inCart={s.cart.includes(p.id)}
                owned={s.owned.filter((x) => x === p.id).length}
                onAdd={() => add(p)}
                onRemove={() => remove(p.id)}
              />
            ))}
          </div>
        </section>

        <aside className="shop-side" aria-label="Košík">
          <div className="receipt px-frame">
            <div className="receipt__head">
              <span className="receipt__shop">PC obchod</span>
              <span className="receipt__sub">Košík · {s.name}</span>
            </div>
            {cart.length === 0 ? (
              <p className="receipt__empty">Košík je prázdný.</p>
            ) : (
              <ul className="receipt__lines">
                {cart.map((p) => (
                  <li key={p.id} className="receipt__line">
                    <span>{p.short}</span>
                    <span className="receipt__price">{formatKc(p.price)}</span>
                    <button type="button" className="receipt__x" onClick={() => remove(p.id)}>Odebrat</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="receipt__total"><span>Celkem</span><span className="t-num">{formatKc(total)}</span></div>
            <div className={`receipt__after${after < 0 ? ' receipt__after--bad' : ''}`}>
              <span>{after < 0 ? 'Chybí ti' : 'Po zaplacení zbude'}</span>
              <span className="t-num">{formatKc(Math.abs(after))}</span>
            </div>
            <div className="receipt__actions">
              <button type="button" className="px-btn px-btn--block" disabled={cart.length === 0 || after < 0} onClick={pay}>
                <Icon name="coin" /> Zaplatit
              </button>
              <button type="button" className="px-btn px-btn--dark px-btn--block" onClick={check} disabled={s.cart.length + s.owned.length === 0}>
                Zkontrolovat sestavu
              </button>
              {after < 0 ? (
                <button type="button" className="px-btn px-btn--dark px-btn--block" onClick={() => go('jobs')}>
                  <Icon name="bag" /> Vydělat na brigádě
                </button>
              ) : null}
            </div>
          </div>

          {issues ? <CompatPanel issues={issues} /> : null}

          {s.owned.length > 0 ? (
            <div className="owned px-frame">
              <h2 className="t-20">Doma máš</h2>
              {s.owned.map((id, i) => {
                const p = PART_BY_ID[id];
                const inPc = installed.includes(id);
                return (
                  <div key={`${id}-${i}`} className="owned__row">
                    <span>{p.short}</span>
                    {inPc ? (
                      <span className="t-muted t-16">v počítači</span>
                    ) : (
                      <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setReturning(p)}>
                        Vrátit
                      </button>
                    )}
                  </div>
                );
              })}
              <p className="prices-note">Zboží z e-shopu jde do 14 dnů vrátit bez udání důvodu. Dopravu zpátky platíš ty ({formatKc(RETURN_FEE)}).</p>
            </div>
          ) : null}
        </aside>
      </div>

      {returning ? (
        <Dialog
          title="Vrátit zboží?"
          onClose={() => setReturning(null)}
          actions={
            <>
              <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setReturning(null)}>Nechat si</button>
              <button type="button" className="px-btn px-btn--small" onClick={() => doReturn(returning)}>
                Vrátit za {formatKc(refundOf(returning))}
              </button>
            </>
          }
        >
          <p>
            {returning.name}: zaplatil jsi {formatKc(returning.price)}
            {returning.price > 0 ? `, zpátky dostaneš ${formatKc(refundOf(returning))} (doprava ${formatKc(RETURN_FEE)}).` : '. Je zdarma, nic se nevrací.'}
          </p>
        </Dialog>
      ) : null}
    </>
  );
}

function Product({ p, inCart, owned, onAdd, onRemove }: { p: Part; inCart: boolean; owned: number; onAdd: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const specs = specsOf(p);
  return (
    <article className="prod px-frame">
      <div className="prod__art"><Sprite name={spriteOf(p)} fit={[150, 100]} /></div>
      <div className="prod__body">
        <h3 className="prod__name">{p.name}</h3>
        <p className="prod__blurb">{p.blurb}</p>
        <div className="prod__specs">
          {specs.map((sp, i) => (
            <button
              key={sp.label}
              type="button"
              className="spec"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <b>{sp.label}</b> {sp.value}
            </button>
          ))}
        </div>
        {open !== null && specs[open]?.hint ? <p className="prod__hint">{specs[open].hint}</p> : null}
      </div>
      <div className="prod__buy">
        <span className="prod__price">{p.price === 0 ? 'zdarma' : formatKc(p.price)}</span>
        {inCart ? (
          <button type="button" className="px-btn px-btn--ok px-btn--small" onClick={onRemove} aria-label={`Odebrat ${p.short} z košíku`}>
            <Icon name="check" /> V košíku
          </button>
        ) : (
          <button type="button" className="px-btn px-btn--small" onClick={onAdd}>
            <Icon name="cart" /> Do košíku
          </button>
        )}
        {owned > 0 ? <span className="prod__state">Už máš doma{owned > 1 ? ` (${owned}×)` : ''}</span> : null}
      </div>
    </article>
  );
}

function CompatPanel({ issues }: { issues: Issue[] }) {
  const errors = issues.filter((i) => i.level === 'error');
  return (
    <section
      className="compat px-frame"
      style={{ ['--line' as string]: errors.length ? 'var(--c-orange)' : 'var(--c-green)' }}
      aria-live="polite"
    >
      <h2 className="t-20">{errors.length ? 'Pozor, něco nepasuje' : issues.length ? 'Sestava pasuje' : 'Všechno pasuje'}</h2>
      {issues.length === 0 ? <p className="t-16">Díly v košíku i doma k sobě pasují a nic nechybí.</p> : null}
      {issues.map((i, n) => (
        <div key={n} className="compat__item">
          <Icon name={i.level === 'error' ? 'cross' : i.level === 'warn' ? 'warn' : 'info'} />
          <p>{i.text}</p>
        </div>
      ))}
    </section>
  );
}
