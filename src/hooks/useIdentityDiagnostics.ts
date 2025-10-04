// Auth0 migration: This hook previously provided Netlify Identity diagnostics
// Now returns empty diagnostics since we're using Auth0
// The error display logic in Settings.tsx and GuidancePanel.tsx remains for backwards compatibility

export function useIdentityDiagnostics() {
  // Return empty diagnostics object - no errors since we're not using Netlify Identity
  return { error: null };
}
