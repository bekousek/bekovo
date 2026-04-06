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
  const formulaStr = formula.formula;
  const vars = formula.variables;

  // Get value for any variable (from generated values or constants)
  const get = (v: Variable) => v.constant !== undefined ? v.constant : knownValues.get(v.symbol)!;

  const hasMultiplication = formulaStr.includes('\\cdot');
  const hasDivision = formulaStr.includes('\\frac');
  // If formula has \cdot, it's multiplication (even if \frac appears for constants like ½)
  const isMultiplication = hasMultiplication;
  const isDivision = hasDivision && !hasMultiplication;

  if (isDivision) {
    // Pattern: vars[0] = vars[1] / vars[2]
    // Constants can occupy any position (e.g., f = 1/T where 1 is constant)
    const [result, numerator, denominator] = vars;
    if (solveForSymbol === result.symbol) {
      return get(numerator) / get(denominator);
    } else if (solveForSymbol === numerator.symbol) {
      return get(result) * get(denominator);
    } else {
      return get(numerator) / get(result);
    }
  }

  if (isMultiplication) {
    // Pattern: vars[0] = vars[1] * vars[2] (* vars[3]...)
    // Supports power (e.g., v² via power: 2) and constants (e.g., g=10)
    const [result, ...allFactors] = vars;

    // Get factor contribution: value^power (default power = 1)
    const factorValue = (f: Variable) => Math.pow(get(f), f.power ?? 1);

    if (solveForSymbol === result.symbol) {
      return allFactors.reduce((acc, f) => acc * factorValue(f), 1);
    } else {
      // Solve for one of the factors: divide result by all OTHER factors
      const product = get(result);
      const solveVar = allFactors.find(f => f.symbol === solveForSymbol)!;
      const otherFactors = allFactors.filter(f => f.symbol !== solveForSymbol);
      const otherProduct = otherFactors.reduce((acc, f) => acc * factorValue(f), 1);
      const raw = product / otherProduct;
      // If the variable has a power, take the inverse root
      const power = solveVar.power ?? 1;
      return power !== 1 ? Math.pow(raw, 1 / power) : raw;
    }
  }

  // Fallback
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
        isConstant: v.constant !== undefined,
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
