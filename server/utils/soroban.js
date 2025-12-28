const ONES_INDEX = 7; // middle rod for 15 rods (0..14)

export function rodDigit(state, i) {
  const heaven = Boolean(state.heaven?.[i]);
  const earth = Number(state.earth?.[i] ?? 0);
  return (heaven ? 5 : 0) + earth; // 0..9
}

export function validateState(state) {
  if (!state || !Array.isArray(state.heaven) || !Array.isArray(state.earth)) {
    return "state must have heaven[] and earth[] arrays";
  }
  if (state.heaven.length !== 15 || state.earth.length !== 15) {
    return "heaven and earth must be length 15";
  }
  for (let i = 0; i < 15; i++) {
    const h = state.heaven[i];
    const e = state.earth[i];

    if (typeof h !== "boolean") return `heaven[${i}] must be boolean`;
    if (!Number.isInteger(e) || e < 0 || e > 4) return `earth[${i}] must be int 0..4`;
  }
  return null; // valid
}

export function stateToNumber(state) {
  const err = validateState(state);
  if (err) throw new Error(err);

  let total = 0;

  for (let i = 0; i < 15; i++) {
    const digit = rodDigit(state, i); // 0..9
    const power = ONES_INDEX - i;     // left positive, right negative
    total += digit * Math.pow(10, power);
  }

  // avoid ugly floating errors like 0.30000000000000004
  // round to max 7 decimal places (because we have 7 rods right of ones)
  return Number(total.toFixed(7));
}
