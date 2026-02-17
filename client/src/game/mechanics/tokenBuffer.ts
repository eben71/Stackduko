export const TOKEN_BUFFER_CAPACITY = 5;

export function canAddTokens(buffer: number[], incoming: number, capacity = TOKEN_BUFFER_CAPACITY) {
  return buffer.length + incoming <= capacity;
}

export function addTokens(buffer: number[], value: number, amount = 2): number[] {
  return [...buffer, ...Array.from({ length: amount }, () => value)];
}

export function removeTokenAt(
  buffer: number[],
  index: number,
): { next: number[]; value: number | null } {
  if (index < 0 || index >= buffer.length) return { next: buffer, value: null };
  const next = [...buffer];
  const [value] = next.splice(index, 1);
  return { next, value: value ?? null };
}
