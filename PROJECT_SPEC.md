# TraceFix — One-Flow Spec

## The flow
1. User pastes an error message / stack trace.
2. User clicks "Explain this error".
3. User reads: what happened, likely cause, 3 ranked fixes.

## Requirements
- R1 Accept any pasted text up to 20,000 chars; reject larger with a clear message.
- R2 Reject empty input with a clear message.
- R3 Return explanation (≤60 words), cause, exactly 3 ranked fixes.
- R4 Respond in under 10 seconds.
- R5 If the LLM is unavailable or fails, fall back to offline heuristics and say so in the UI.
- R6 No secrets in the repo; API key via environment variable only.
- R7 Clone-to-running in under 2 minutes with `npm install && npm start`.

## Exclusions (deliberately not built)
- No accounts, history, or persistence of any kind.
- No log-file or screenshot upload — pasted text only.
- No multi-language specialisation; general error text in, general explanation out.
- No "dependency diagnosis" / fix-the-code-for-you — this is explanation, not auto-repair.
- No mobile app, no browser extension.

## Success criteria for the flow
A stranger who has never seen the tool completes the flow unguided in under 2 minutes
and can state what they would do first after reading the output.
