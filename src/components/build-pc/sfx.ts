/**
 * 8bitové zvuky syntetizované přes WebAudio, bez souborů.
 * Ve výchozím stavu vypnuté (třída s 25 počítači).
 */
let on = false;
let ctx: AudioContext | null = null;

export function setSoundOn(v: boolean) {
  on = v;
}

type Kind = 'ok' | 'bad' | 'coin' | 'click' | 'place' | 'power';

const NOTES: Record<Kind, [number, number][]> = {
  ok: [[660, 0.06], [880, 0.09]],
  bad: [[220, 0.12], [165, 0.16]],
  coin: [[988, 0.05], [1319, 0.12]],
  click: [[440, 0.03]],
  place: [[330, 0.04], [495, 0.06]],
  power: [[262, 0.08], [330, 0.08], [392, 0.08], [523, 0.16]],
};

export function sfx(kind: Kind) {
  if (!on) return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, dur] of NOTES[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    /* prohlížeč bez WebAudio */
  }
}
