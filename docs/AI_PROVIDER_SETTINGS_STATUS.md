# AI provider settings status

The `/settings` page lets a signed-in learner choose an AI provider, enter a model, and save a personal provider token for this browser in an HTTP-only cookie.

Current implementation status:

- `/settings` route exists.
- Dashboard links to `/settings`.
- Provider options include cppFan shared provider, Google Gemini, and Groq.
- The saved token is not rendered back to client components; the page only shows whether one exists and the ending characters.
- The AI chat POST handler reads saved personal provider settings before creating chat records.
- `streamAiTutorResponse()` accepts a per-request provider override and supports the shared provider, Google Gemini, Groq, and the deterministic fake provider for local/CI runs.

Recommended follow-up coverage:

1. Add route-level tests for cookie-backed provider overrides.
2. Add provider-specific mock tests for streaming adapters.
3. Add UI validation copy if provider model names change.
