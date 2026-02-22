# Security Standards & Review Workflow

## Security Mandates
- **Secrets:** Never commit API keys, tokens, or encryption keys. Use environment variables.
- **Authentication:** Refresh tokens must be encrypted at rest and never overwritten if omitted on renewal by providers. Validate redirect URIs and state parameters.
- **Data Protection:** Treat user identifiers, metadata, and hashes as sensitive. Provide deletion paths.
- **Crypto:** Never invent cryptography. Use up-to-date, standard libraries.

## Agent Review Workflow
When asked to review code or create a PR:
1. Understand the scope and intent of the change.
2. Threat-model the change for potential security gaps or data leaks.
3. Trace execution paths (success + failure) to ensure robust error handling.
4. Validate data integrity and lifecycle.
5. Review test coverage and test choice (use mocks/fixtures for external services in CI).
6. Verify matching documentation updates.

**Review Output Format:**
- Severity: High / Medium / Low
- Location: `file:line`
- Risk: Explain what could break or leak.
- Fix: Provide a concrete, actionable recommendation.
- Action: Conclude with Blockers vs. Non-blocking improvements.
