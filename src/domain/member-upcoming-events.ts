type RegistrationEvent = {
  registration_status: string | null; starts_at: string; ends_at: string;
  completed_at: string | null; archived_at: string | null;
};
export function upcomingMemberEvents<T extends RegistrationEvent>(events: T[], now = Date.now()): T[] {
  return events.filter(event => event.registration_status === "registered" &&
    !event.completed_at && !event.archived_at && new Date(event.ends_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}
