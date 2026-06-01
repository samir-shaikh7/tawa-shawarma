export function formatPrice(price: number | string) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return Math.round(num || 0).toString();
}
