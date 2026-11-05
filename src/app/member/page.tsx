import { redirect } from "next/navigation";
import { currentActor } from "@/lib/actor";
export const dynamic = "force-dynamic";
export default async function Member() {
  const actor = await currentActor();
  if (!actor) redirect("/login");
  redirect(actor.roles.length ? "/admin" : "/member/events");
}
