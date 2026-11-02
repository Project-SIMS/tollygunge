import Link from "@/components/navigation-link";
import { notFound } from "next/navigation";
import { WorkspacePageHeading } from "@/components/workspace-ui";
import { ReviewWorkspace } from "../../review-workspace";

const workspaces: Record<string, { title: string; description: string }> = {
  members: {
    title: "Membership Directory & Review",
    description: "Manage membership records, inspect applicant qualifications, and review applications.",
  },
  events: {
    title: "Events Hub",
    description: "Event publishing, registration capacity quotas, and attendee attendance tracking.",
  },
  content: {
    title: "Content & CMS",
    description: "Website drafts, editorial rich-text content, media assets, and published snapshots.",
  },
  crm: {
    title: "Inquiries & CRM",
    description: "Public intake inquiries triage, staff follow-up assignments, and internal communications.",
  },
  communications: {
    title: "Communications & Broadcasts",
    description: "Shared inbox, audience segmentation, email templates, and campaign broadcasting.",
  },
  payments: {
    title: "Payment Instructions",
    description: "Association bank details, UPI ID configurations, and verified payee QR snapshots.",
  },
  governance: {
    title: "Governance & Committees",
    description: "Manage leadership profiles, committee rosters, and verified portraits.",
  },
  access: {
    title: "Staff Access & Security",
    description: "Operational role assignments, session revocation, and immutable audit logs.",
  },
  reports: {
    title: "Scoped Reports & Exports",
    description: "Role-scoped analytics, attendance logs, and verified CSV/XLSX data exports.",
  },
  media: {
    title: "Editorial Media Library",
    description: "Normalized WebP imagery, EXIF metadata removal, and accessible asset publication.",
  },
  flyers: {
    title: "Flyer Builder",
    description: "Dynamic one- and two-speaker event flyers with auto-generated verification QR passes.",
  },
};

export const metadata = { robots: { index: false, follow: false } };

export default async function Workspace({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const config = workspaces[workspace];
  if (!config) notFound();

  return (
    <main id="main" className="workspace-main workspace-page">
      <div className="portal-page-intro">
        <WorkspacePageHeading
          workspace={workspace}
          title={config.title}
          description={config.description}
        />
      </div>

      {workspace === "members" ? (
        <section className="bento-card" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Applicant Verification Queue</h2>
          </div>
          <ReviewWorkspace />
        </section>
      ) : (
        <div className="bento-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="eyebrow" style={{ textTransform: "uppercase" }}>WORKSPACE PREVIEW · {workspace}</span>
          </div>
          <h2>{config.title}</h2>
          <div className="notice" style={{ marginBottom: 24 }}>
            This workspace view is running in design preview mode with synthetic records. You can explore all navigation tabs and switch workspaces seamlessly.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="button" href="/preview/admin">
              ← Return to Dashboard
            </Link>
            <Link className="button secondary" href="/preview/admin/workspaces/members">
              Review Members
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
