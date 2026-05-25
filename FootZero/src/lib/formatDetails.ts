export const formatDetails = (details: any): string => {
  if (!details) return "";
  if (typeof details === "string") {
    try {
      details = JSON.parse(details);
    } catch {
      return details;
    }
  }
  if (typeof details !== "object") return String(details);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (details.mode && details.distance_km !== undefined) {
    return `${cap(String(details.mode))} · ${details.distance_km} km`;
  }
  if (details.meal_type) {
    return `${cap(String(details.meal_type))} meal`;
  }
  if (details.kwh !== undefined) {
    return `${details.kwh} kWh`;
  }
  if (details.type && details.amount !== undefined) {
    return `${cap(String(details.type))} · ${details.amount} items`;
  }
  if (details.source && details.quantity !== undefined && details.unit) {
    return `${details.source} · ${details.quantity} ${details.unit}`;
  }
  if (details.source) {
    return String(details.source);
  }
  return Object.entries(details)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join(" · ");
};

export const capitalizeCategory = (category: string): string => {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};