import type { Formula, Variable, Problem, GeneratedValue, GeneratorSettings } from './types';

function roundNice(value: number): number {
  if (value === 0) return 0;
  const abs = Math.abs(value);
  if (abs >= 1000) return Math.round(value / 10) * 10;
  if (abs >= 100) return Math.round(value);
  if (abs >= 10) return Math.round(value * 10) / 10;
  if (abs >= 1) return Math.round(value * 100) / 100;
  if (abs >= 0.1) return Math.round(value * 1000) / 1000;
  return Math.round(value * 10000) / 10000;
}

function randomInRange(min: number, max: number): number {
  const value = min + Math.random() * (max - min);
  return roundNice(value);
}

function pickRandomAltUnit(variable: Variable): { unit: string; factor: number } | null {
  if (!variable.altUnits || variable.altUnits.length === 0) return null;
  const idx = Math.floor(Math.random() * variable.altUnits.length);
  return variable.altUnits[idx];
}

function computeUnknown(formula: Formula, knownValues: Map<string, number>, solveForSymbol: string): number {
  const get = (sym: string) => knownValues.get(sym)!;
  const formulaStr = formula.formula;

  // Parse formula pattern: result = a * b, result = a / b, result = a + b
  // We handle: X = Y / Z, X = Y * Z, X = Y * Z * W (with constants)
  const vars = formula.variables;
  const solveIdx = vars.findIndex(v => v.symbol === solveForSymbol);

  // For formulas like rho = m/V, v = s/t, p = F/S:
  // var[0] = var[1] / var[2]  (or var[1] * var[2] for F=m*a, W=F*s)
  // Detect if formula contains \frac (division) or \cdot (multiplication)
  const isDivision = formulaStr.includes('\\frac');
  const isMultiplication = formulaStr.includes('\\cdot');

  if (isDivision) {
    // Pattern: vars[0] = vars[1] / vars[2]
    // Find non-constant variables
    const nonConstVars = vars.filter(v => v.constant === undefined);
    if (nonConstVars.length === 3) {
      const [result, numerator, denominator] = nonConstVars;
      if (solveForSymbol === result.symbol) {
        return get(numerator.symbol) / get(denominator.symbol);
      } else if (solveForSymbol === numerator.symbol) {
        return get(result.symbol) * get(denominator.symbol);
      } else {
        return get(numerator.symbol) / get(result.symbol);
      }
    }
  }

  if (isMultiplication) {
    // Pattern: vars[0] = vars[1] * vars[2] (* vars[3]...)
    const nonConstVars = vars.filter(v => v.constant === undefined);
    if (nonConstVars.length >= 2) {
      const [result, ...factors] = nonConstVars;
      if (solveForSymbol === result.symbol) {
        return factors.reduce((acc, f) => acc * get(f.symbol), 1);
      } else {
        // Solve for one of the factors
        const product = get(result.symbol);
        const otherFactors = factors.filter(f => f.symbol !== solveForSymbol);
        const otherProduct = otherFactors.reduce((acc, f) => acc * get(f.symbol), 1);
        return product / otherProduct;
      }
    }
  }

  // Fallback: shouldn't reach here with valid formulas
  return 0;
}

export function generateProblems(formula: Formula, settings: GeneratorSettings): Problem[] {
  const problems: Problem[] = [];
  const solveForVar = formula.variables.find(v => v.symbol === settings.solveFor)!;
  const knownVars = formula.variables.filter(v => v.symbol !== settings.solveFor);

  for (let i = 0; i < settings.count; i++) {
    const knownValues = new Map<string, number>();
    const knowns: GeneratedValue[] = [];

    // Generate values for known variables
    for (const v of knownVars) {
      let value: number;
      if (v.constant !== undefined) {
        value = v.constant;
      } else if (v.range) {
        value = randomInRange(v.range[0], v.range[1]);
      } else {
        value = randomInRange(1, 100);
      }
      knownValues.set(v.symbol, value);

      // Optionally convert to alternative unit
      let displayValue = value;
      let displayUnit = v.unit;
      let needsConversion = false;

      if (settings.withConversion && v.constant === undefined && Math.random() > 0.5) {
        const altUnit = pickRandomAltUnit(v);
        if (altUnit) {
          displayValue = roundNice(value / altUnit.factor);
          displayUnit = altUnit.unit;
          needsConversion = true;
        }
      }

      knowns.push({
        symbol: v.symbol,
        name: v.name,
        value: displayValue,
        unit: displayUnit,
        originalValue: value,
        originalUnit: v.unit,
        needsConversion,
      });
    }

    // Compute unknown
    const unknownValue = computeUnknown(formula, knownValues, settings.solveFor);
    const unknown: GeneratedValue = {
      symbol: solveForVar.symbol,
      name: solveForVar.name,
      value: roundNice(unknownValue),
      unit: solveForVar.unit,
      originalValue: roundNice(unknownValue),
      originalUnit: solveForVar.unit,
      needsConversion: false,
    };

    problems.push({
      id: i + 1,
      knowns,
      unknown,
      formula: formula.formula,
    });
  }

  return problems;
}
