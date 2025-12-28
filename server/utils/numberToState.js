const ONES_INDEX = 7;

export function emptyState() {
  return {
    heaven: Array(15).fill(false),
    earth: Array(15).fill(0),
  };
}

// Converts a number into a soroban-like digit state (0-9 per rod).
// Supports up to 7 decimals because rods right of ones are 7.
export function numberToState(n) {
  const state = emptyState();

  // normalize to 7 decimal places to avoid float noise
  const fixed = Number(n.toFixed(7));

  for (let i = 0; i < 15; i++) {
    const power = ONES_INDEX - i;
    const place = Math.pow(10, power);

    // digit at this place (0..9)
    const digit = Math.floor((fixed / place + 1e-12) % 10);

    if (digit >= 5) {
      state.heaven[i] = true;
      state.earth[i] = digit - 5;
    } else {
      state.heaven[i] = false;
      state.earth[i] = digit;
    }
  }

  return state;
}
