#!/usr/bin/env node
/**
 * Ověří fyzikální konzistenci src/content/formulas/*.json proti známé tabulce
 * SI převodních faktorů. Zachytává chyby jako K1 z AUDIT.md (obrácený faktor
 * km/h, g/cm³), kdy generátor příkladů tiskl fyzikálně nesmyslná zadání.
 *
 * altUnit.factor = kolik základních SI jednotek je 1 alternativní jednotka
 * (problemGenerator.ts: displayValue = value / factor).
 *
 * Použití: node scripts/validate-formulas.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FORMULAS_DIR = path.join(__dirname, '..', 'src', 'content', 'formulas');

// Zdroj pravdy pro povolené alt jednotky. Přidáváš-li vzorec s novou
// jednotkou, přidej ji i sem — jinak validace (schválně) selže.
const KNOWN_FACTORS = {
  km: 1000, cm: 0.01, mm: 0.001, dm: 0.1,
  'km/h': 0.2778, 'km/s': 1000,
  min: 60, h: 3600, ms: 0.001,
  kJ: 1000, MJ: 1_000_000, kWh: 3_600_000, Wh: 3600,
  kW: 1000, MW: 1_000_000,
  kPa: 1000, hPa: 100,
  g: 0.001, t: 1000,
  'cm³': 0.000001, 'dm³': 0.001, l: 0.001, ml: 0.000001,
  'cm²': 0.0001, 'dm²': 0.01,
  'g/cm³': 1000,
  'kΩ': 1000, 'MΩ': 1_000_000,
  mV: 0.001, kV: 1000,
  mA: 0.001,
  kN: 1000,
  'kJ/kg': 1000,
  kHz: 1000,
};

// Relativní tolerance — některé faktory jsou v datech zaokrouhlené na 4
// desetinná místa (km/h = 0.2778 místo přesných 0.27778).
const TOLERANCE = 0.001;

function main() {
  const files = readdirSync(FORMULAS_DIR).filter((f) => f.endsWith('.json'));
  const errors = [];

  for (const file of files) {
    const full = path.join(FORMULAS_DIR, file);
    let formula;
    try {
      formula = JSON.parse(readFileSync(full, 'utf-8'));
    } catch (e) {
      errors.push(`${file}: nejde parsovat jako JSON (${e.message})`);
      continue;
    }

    for (const v of formula.variables ?? []) {
      for (const alt of v.altUnits ?? []) {
        const known = KNOWN_FACTORS[alt.unit];
        if (known === undefined) {
          errors.push(
            `${file}: neznámá alt jednotka "${alt.unit}" (proměnná ${v.symbol}) — ` +
            `přidej ji do KNOWN_FACTORS ve scripts/validate-formulas.mjs, nebo jde o překlep.`,
          );
          continue;
        }
        const relErr = Math.abs(alt.factor - known) / known;
        if (relErr > TOLERANCE) {
          errors.push(
            `${file}: "${alt.unit}" (proměnná ${v.symbol}) má factor ${alt.factor}, ` +
            `očekáváno ≈${known} (odchylka ${(relErr * 100).toFixed(1)} %).`,
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`✗ Nalezeno ${errors.length} problémů v src/content/formulas/:\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ Všechny převodní faktory (${files.length} souborů formulas/) sedí se známou tabulkou.`);
}

main();
