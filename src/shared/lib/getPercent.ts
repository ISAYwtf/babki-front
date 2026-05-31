export const getPercent = (
  value?: number,
  ofValue?: number,
  options?: { multiplyBy100?: boolean; useDiff?: boolean },
) => {
  if (!value || !ofValue) {
    return 0;
  }

  const { useDiff = true, multiplyBy100 = false } = options || {};

  const diff = useDiff ? value - ofValue : value;
  const multiplier = multiplyBy100 ? 100 : 1;
  return (diff / ofValue) * multiplier;
};
