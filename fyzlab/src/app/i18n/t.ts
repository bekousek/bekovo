import { cs, type MsgKey } from './cs';

/** Překladová funkce. Až přibude další jazyk, tady se přepne katalog. */
export function t(key: MsgKey): string {
  return cs[key];
}
