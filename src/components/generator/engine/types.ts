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
  power?: number;
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
  isConstant?: boolean;
}

export interface Problem {
  id: number;
  knowns: GeneratedValue[];
  unknown: GeneratedValue;
  formula: string;
  scenario?: Scenario;
  fillers?: Record<string, string[]>;
}

export interface GeneratorSettings {
  formulaId: string;
  count: number;
  solveFor: string;
  withConversion: boolean;
  scenario?: Scenario | null;
  fillers?: Record<string, string[]>;
}

export interface Scenario {
  id: string;
  templates: Record<string, string>;
  ranges?: Record<string, [number, number]>;
}

export interface ScenarioBank {
  formulaId: string;
  fillers?: Record<string, string[]>;
  scenarios: Scenario[];
}
