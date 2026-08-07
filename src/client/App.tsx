import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { useEffect, useState } from "react";
import type { AppRouter } from "../adapters/trpc/router";
import { StatusCard } from "./components/StatusCard";
import { recordReview, REVIEW_OUTCOMES, type ReviewOutcome } from "./review/review-state";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
      headers: {
        "x-actor-id": "reference-browser-user",
        "x-actor-type": "human",
        "x-permissions": "reference:read",
        "x-correlation-id": "reference-browser-session",
      },
    }),
  ],
});

export function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [outcome, setOutcome] = useState<ReviewOutcome | "pending">("pending");

  useEffect(() => {
    client.reference.status.query({ subject: "Product OS" }).then(
      () => setStatus("ready"),
      () => setStatus("error"),
    );
  }, []);

  return (
    <main>
      <header>
        <p className="eyebrow">Executable reference · 0.1</p>
        <h1>Norfolk Kit Reference</h1>
        <p className="lede">The same authorized capability serves the interface, tRPC, and MCP.</p>
      </header>
      <StatusCard subject="Product OS" status={status} />
      <section className="review" aria-labelledby="review-title">
        <div>
          <p className="eyebrow">Visible review gate</p>
          <h2 id="review-title">Choose an outcome</h2>
        </div>
        <div className="review-actions">
          {REVIEW_OUTCOMES.map((value) => (
            <button key={value} type="button" onClick={() => setOutcome(recordReview(value).outcome)}>
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
        <p className="review-result">Outcome: <strong data-testid="review-outcome">{outcome}</strong></p>
      </section>
    </main>
  );
}
