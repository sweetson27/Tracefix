# TraceFix

**The one flow:** paste an error message or stack trace → get a plain-English
explanation of what broke, the most likely cause, and three ranked fix steps.

## What it deliberately does NOT do
- No log-file upload, no multi-file analysis, no accounts, no history.
- Not a debugger — it explains and ranks, it does not run your code.

## Functional status
- Working: paste → analyse → ranked fixes, input validation (empty / >20k chars
  rejected with clear messages), LLM-failure fallback to offline heuristics.
- If no LLM_API_KEY is set, the app runs in heuristic mode: a rule library of
  six common error classes (null refs, index errors, ECONNREFUSED, duplicate
  keys, CORS, segfaults) with a generic fallback. This is intentional so the
  demo works with zero credentials.

## Setup
1. `npm install`
2. Optional: `export LLM_API_KEY=sk-...` (uses any OpenAI-compatible endpoint;
   set `LLM_BASE_URL` and `LLM_MODEL` to override defaults)
3. `npm start` → open http://localhost:3000
4. Demo: paste `TypeError: Cannot read properties of undefined (reading 'name')`
   and press "Explain this error".

No secrets are committed. No .env file is included.
