export function linearRegression(
  data: { month: string; value: number }[]
): { slope: number; intercept: number; predictions: { month: string; value: number }[] } {
  const n = data.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  data.forEach((point, index) => {
    sumX += index;
    sumY += point.value;
    sumXY += index * point.value;
    sumXX += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: { month: string; value: number }[] = [];
  const months = ["Jul '25", "Aug '25", "Sep '25"];
  for (let i = 0; i < 3; i++) {
    const x = n + i;
    const predictedValue = slope * x + intercept;
    predictions.push({ month: months[i], value: Number(predictedValue.toFixed(2)) });
  }

  return { slope, intercept, predictions };
}