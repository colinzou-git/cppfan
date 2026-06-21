# AI provider settings status

The `/settings` page lets a signed-in learner choose an AI provider, enter a model, and save a personal provider credential for this browser in an HTTP-only cookie.

Current implementation status:

- `/settings` route exists.
- Dashboard links to `/settings`.
- Provider options include cppFan shared provider, Google Gemini, and Groq.
- The saved credential is not rendered back to client components; the page only shows whether one exists and the ending characters.
- The AI chat runtime still uses the deployment-level provider path until the per-request provider runtime is wired in `app/api/ai/chat/route.ts` and `src/features/ai-chat/ai-chat-provider.ts`.

Follow-up required before treating personal provider selection as active for tutor responses:

1. Pass `getAiProviderPreferenceOverride()` into the AI chat POST handler.
2. Extend `streamAiTutorResponse()` to accept a per-request provider config without mutating `process.env`.
3. Add Google Gemini support or a documented OpenAI-compatible adapter.
4. Add tests for shared provider fallback, saved Groq key, saved Google key, missing key, and invalid provider.
