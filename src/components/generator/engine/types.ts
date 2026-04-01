export interface AltUnit {
  unit: string;
  factor: number;
}

export interface Variable {
  symbol: string;
  name: string;
  unit: string;
  altUnits?: AltUnit[];
  range?: [number, number];
  constant?: number;
}

export interface Formula {
  id: string;
  name: string;
  subtopicIds: string[];
  formula: string;
  variables: Variable[];
}

export interface GeneratedValue {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  originalValue: number;
  originalUnit: string;
  needsConversion: boolean;
}

export interface Problem {
  id: number;
  knowns: GeneratedValue[];
  unknown: GeneratedValue;
  formula: string;
}

export interface GeneratorSettings {
  formulaId: string;
  count: number;
  solveFor: string;
  withConversion: boolean;
}
