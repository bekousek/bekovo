/**
 * Odhad hmotnosti tělesa z dokumentu (plošná hustota kg/m² × plocha tvarů).
 * Stejný výpočet dělá Rapier z colliderů; tenhle je pro editor, který
 * potřebuje hmotnost dřív, než se těleso dostane do enginu (např. rozumná
 * výchozí tuhost pružiny).
 */
import { polygonArea } from '../rigid/geometry';
import type { Body, Shape } from './schema';

function shapeArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.r * shape.r;
    case 'box':
      return 4 * shape.hw * shape.hh;
    case 'polygon':
      return Math.abs(polygonArea(shape.points));
    case 'plane':
      return 0; // nekonečná rovina je vždy statická — hmotnost nedává smysl
  }
}

/** Celková plocha tvarů tělesa [m²]; rovina → 0. */
export function bodyArea(body: Body): number {
  let area = 0;
  for (const s of body.shapes) area += shapeArea(s);
  return area;
}

/** Hmotnost [kg]; tělesa bez plochy (samotná rovina) → 0. */
export function estimateBodyMass(body: Body): number {
  return bodyArea(body) * body.material.density;
}
