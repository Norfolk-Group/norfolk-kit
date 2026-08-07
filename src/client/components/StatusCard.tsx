interface StatusCardProps {
  subject: string;
  status: "loading" | "ready" | "error";
  detail?: string;
}

export function StatusCard({ subject, status, detail }: StatusCardProps) {
  const statement = status === "ready"
    ? `${subject} is ready`
    : status === "error"
      ? `${subject} could not be reached`
      : `Checking ${subject}`;
  return (
    <section className="status-card" aria-live="polite">
      <div className={`status-mark status-mark--${status}`} aria-hidden="true" />
      <div>
        <h2>{statement}</h2>
        <p>{detail ?? (status === "error" ? "Check the server, then try again." : "One capability, shared by every caller.")}</p>
      </div>
    </section>
  );
}
