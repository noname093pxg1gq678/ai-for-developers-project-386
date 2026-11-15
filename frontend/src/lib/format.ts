export function formatDuration(minutes: number): string {
  const ones = minutes % 10;
  const tens = minutes % 100;
  if (ones === 1 && tens !== 11) {
    return `${minutes} минута`;
  }
  if (ones >= 2 && ones <= 4 && (tens < 10 || tens >= 20)) {
    return `${minutes} минуты`;
  }
  return `${minutes} минут`;
}
