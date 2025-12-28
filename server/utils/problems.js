function round1(x) {
  return Math.round(x * 10) / 10;
}

export function generateProblem() {
  const a = round1(Math.floor(Math.random() * 100) / 10);
  const b = round1(Math.floor(Math.random() * 100) / 10);
  const op = Math.random() < 0.5 ? "+" : "-";

  let left = a, right = b;
  if (op === "-" && left < right) [left, right] = [right, left];

  const expectedAnswer = op === "+" ? round1(left + right) : round1(left - right);
  const prompt = `${left} ${op} ${right}`;

  return { prompt, expectedAnswer };
}
