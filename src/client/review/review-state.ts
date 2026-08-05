export const REVIEW_OUTCOMES = ["approve", "reject", "defer"] as const;
export type ReviewOutcome = (typeof REVIEW_OUTCOMES)[number];

export interface ReviewRecord {
  outcome: ReviewOutcome;
  rationale: string;
}

export function recordReview(outcome: ReviewOutcome, rationale = "Reference-foundation review"): ReviewRecord {
  return { outcome, rationale };
}
