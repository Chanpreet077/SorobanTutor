export type SorobanState = {
  heaven: boolean[]; // length 15
  earth: number[];  // length 15 (0..4)
};

export const emptyState = (): SorobanState => ({
  heaven: Array(15).fill(false),
  earth: Array(15).fill(0),
});
