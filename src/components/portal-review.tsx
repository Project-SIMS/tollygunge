export function MemberReviewHeading({ name }: { name: string; email: string }) {
  const displayName = name.trim() || "member";
  return <h1 className="sr-only">Hello, {displayName}.</h1>;
}
