export function formatPrice(amount: string, currency: string) {
  const n = parseFloat(amount);
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(n);
}
