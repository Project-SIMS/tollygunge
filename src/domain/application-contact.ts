type ContactBody = { email?: string; mobile?: string; phone?: string };
export function registeredApplicationContact(person: {
  contact_email?: string | null; mobile_normalized?: string | null;
  accepted?: ContactBody | null;
} | null | undefined, accountEmail: string) {
  const first = (...values: (string | null | undefined)[]) => values.find(value => value?.trim())?.trim() ?? "";
  return {
    email: first(person?.contact_email, person?.accepted?.email, accountEmail),
    phone: first(person?.mobile_normalized, person?.accepted?.mobile, person?.accepted?.phone),
  };
}
export function prefillApplicationPhone(details: Record<string, string>, phone: string) {
  return details.phone?.trim() || !phone ? details : { ...details, phone };
}
