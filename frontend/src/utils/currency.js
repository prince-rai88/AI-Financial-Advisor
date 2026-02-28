export function formatINR(value, options = {}) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    ...options,
  }).format(amount);
}
