export const getPercent = (value?: number, ofValue?: number) => {
  if (!value || !ofValue) {
    return 0;
  }

  const diff = value - ofValue;
  return diff / ofValue;
};
