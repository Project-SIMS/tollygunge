import { PortalSubsections } from "@/components/portal-subsections";
import { redirect } from "next/navigation";

import { currentActor } from "@/lib/actor";

import { AccountShell } from "@/components/site-shell";

import { MemberProfile } from "@/app/member/profile";

import { privateStorageConfigured } from "@/lib/private-storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your profile",

  robots: { index: false, follow: false },
};

export default async function Page() {
  const actor = await currentActor();

  if (!actor) redirect("/login");

  return (
    <AccountShell>
      <main id="main" className="member-content member-profile-page">
        <h1 className="sr-only">Your professional profile</h1>
        <PortalSubsections />

        <MemberProfile
          storageEnabled={privateStorageConfigured()}
          email={actor.email}
        />
      </main>
    </AccountShell>
  );
}
