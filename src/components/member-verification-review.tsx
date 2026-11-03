"use client";
import { useId, useRef, useState } from "react";
import { api } from "./operations-client";
import { SubmittedDetails } from "./verification-submitted-details";
import type { Review, VerificationData } from "./verification-workspace";

export function MemberVerificationReview({
  personId,
  userId,
  name,
  verified,
  disabled = false,
  onApproved,
}: {
  personId: string | null;
  userId: string | null;
  name: string;
  verified: boolean;
  disabled?: boolean;
  onApproved: () => Promise<void>;
}) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<Review>();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [canApprove, setCanApprove] = useState(false);
  async function inspect() {
    setOpen(true);
    setBusy(true);
    setReview(undefined);
    setMessage("");
    try {
      if (!personId && !userId) {
        setMessage(
          "No submitted verification details. The member must complete and submit their verification form first.",
        );
        return;
      }
      const params = new URLSearchParams({
        status: "pending",
        ...(personId ? { personId } : { userId: userId! }),
      });
      const result = await api<VerificationData>(
        "/api/staff/verification?" + params,
      );
      setCanApprove(result.admin);
      const pending = result.reviews.find(
        (item) =>
          item.status === "pending" &&
          (!personId || item.person_id === personId),
      );
      setReview(pending);
      if (!pending)
        setMessage(
          "No pending verification submission. The member must complete and submit their verification form first.",
        );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load verification details.",
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => heading.current?.focus());
    }
  }
  return (
    <div className="member-verification-review">
      <button
        ref={trigger}
        type="button"
        className="button secondary"
        disabled={busy || disabled}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => void inspect()}
      >
        {verified
          ? "Review verification update"
          : "Approve profile verification"}
      </button>
      {open && (
        <section
          id={id}
          className="decision-panel"
          aria-labelledby={`${id}-heading`}
          aria-busy={busy}
        >
          <h4 id={`${id}-heading`} ref={heading} tabIndex={-1}>
            Profile verification · {name}
          </h4>
          {busy && <p role="status">Loading verification details…</p>}
          {message && <p role="status">{message}</p>}
          {review && (
            <>
              <p>
                Review the submitted details and private evidence against
                requirements v{review.requirement_version} before approving.
              </p>
              <SubmittedDetails review={review} />
              {canApprove ? (
                <>
                  <label>
                    Approval note (optional)
                    <textarea
                      maxLength={2000}
                      value={reason}
                      disabled={busy || disabled}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="button"
                    disabled={busy || disabled}
                    onClick={async () => {
                      setBusy(true);
                      setMessage("");
                      try {
                        await api("/api/staff/verification", {
                          action: "approve",
                          id: review.id,
                          version: review.version,
                          reason,
                        });
                        setReview(undefined);
                        setMessage("Profile verification approved.");
                        await onApproved();
                      } catch (error) {
                        setMessage(
                          error instanceof Error
                            ? error.message
                            : "Unable to approve verification.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Confirm profile verification
                  </button>
                </>
              ) : (
                <p>Only an administrator can approve profile verification.</p>
              )}
            </>
          )}
          <button
            type="button"
            className="button secondary"
            disabled={busy || disabled}
            onClick={() => {
              setOpen(false);
              requestAnimationFrame(() => trigger.current?.focus());
            }}
          >
            Close verification review
          </button>
        </section>
      )}
    </div>
  );
}
