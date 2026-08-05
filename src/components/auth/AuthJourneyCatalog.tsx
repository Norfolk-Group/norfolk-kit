export const AUTH_JOURNEYS = [
  ["Entry", "Login, open or invite-only entry, invitation valid/expired/revoked/used"],
  ["Verification", "Email verification, MFA enrollment/challenge/recovery, SSO routing"],
  ["Organization", "Selection, no authorized organization, switching, membership change"],
  ["Continuity", "Session expiry, reauthentication, safe return intent, callback retry"],
  ["Denial", "Locked or disabled user, access denial, recoverable next action"],
] as const;

export function AuthJourneyCatalog() {
  return <main aria-labelledby="auth-title"><p>Private Norfolk AI reference · Product OS candidate · Kit 0.1.0</p><h1 id="auth-title">First-party authentication journey</h1><p>WorkOS provides identity infrastructure. The product owns continuity, explanation, recovery, accessibility, and authorization.</p><table><thead><tr><th>Journey</th><th>Required states</th></tr></thead><tbody>{AUTH_JOURNEYS.map(([name, states]) => <tr key={name}><th scope="row">{name}</th><td>{states}</td></tr>)}</tbody></table><h2>Interaction contract</h2><ul><li>Keyboard and screen-reader complete</li><li>Mobile, slow-network, provider-error, and reduced-motion behavior</li><li>Application-relative allowlisted return intent</li><li>Identical authorization through direct, UI/tRPC, and MCP paths</li></ul></main>;
}
