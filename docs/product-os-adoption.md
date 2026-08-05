# Product OS adoption

Kit is the executable reference for the proposed private Product OS `0.3.0-candidate.1`; the lock remains `proposed` until U11 validates and a trusted release environment publishes the candidate. Product OS owns reusable WHAT/WHY. Kit implements HOW and cannot amend doctrine.

The adopter fetches a pinned private release, verifies trusted signature and every hash, checks the compatibility matrix and repository-specific payload, then plans a deterministic `adoption/product-os-<version>` branch. Local edits become conflicts. Unknown organizations receive only `client-safe` tooling. Deletions are emitted as separate unexecuted proposals. A repository-scoped short-lived identity and release-environment approval are mandatory before any write or PR.

Normal rollback covers code/configuration only in the declared expand-and-contract window. Irreversible data work needs a separate approved recovery plan. Current Kit candidate exceptions: none.
