// Reviewed PIN-specific city mappings; do not infer a city from a district name.
// Source: https://sambalpur.odisha.gov.in/en/directory/std-and-pin-codes
// Reviewed 2026-11-04. Locality names remain supplied by the postal reference.
const reviewedCities = [
  { pin: "768017", state: "Odisha", district: "Sambalpur", city: "Burla" },
  { pin: "768018", state: "Odisha", district: "Sambalpur", city: "Burla" },
  { pin: "768019", state: "Odisha", district: "Sambalpur", city: "Burla" },
  { pin: "768020", state: "Odisha", district: "Sambalpur", city: "Burla" },
];
export function reviewedPostalCities({ pin = "", state = "", district = "" }: {
  pin?: string; state?: string; district?: string;
}): string[] {
  if (!pin) return [];
  return [...new Set(reviewedCities.filter(row => row.pin === pin &&
    (!state || row.state.toLowerCase() === state.toLowerCase()) &&
    (!district || row.district.toLowerCase() === district.toLowerCase()))
    .map(row => row.city))];
}
