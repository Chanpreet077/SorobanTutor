import type { SorobanState } from "./soroban";

const ONES_INDEX = 7;

export function stateToNumberClient(state: SorobanState): number {
  let total = 0;
  for (let i = 0; i < 15; i++) {
    const digit = (state.heaven[i] ? 5 : 0) + state.earth[i];
    const power = ONES_INDEX - i;
    total += digit * Math.pow(10, power);
  }
  return Number(total.toFixed(7));
}
