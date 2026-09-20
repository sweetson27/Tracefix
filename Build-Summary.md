TraceFix — Build Summary
Team: TeamName | Theme: AI and Developer Tools

PROBLEM STATEMENT (final, v2): Junior developers hit runtime errors whose
messages reference internals they can't yet read. Today they copy-paste into
search engines or general chatbots, costing 30 minutes to hours per incident.
Changed from v1: v1 assumed a dedicated tool was obviously the right home;
v2 names the general chatbot as the real competitor and makes adoption the
thing the tests must prove.

WHAT I BUILT: One flow — paste an error, click explain, read the cause and
three ranked fixes. Deliberately does NOT do: accounts, history, file
uploads, code auto-repair, multi-file analysis.

TECH STACK: Vanilla JS front end (zero build step), Node/Express back end
(one dependency), no database (stateless flow), OpenAI-compatible LLM API
with env-based key and offline heuristic fallback so the demo works with no
credentials.

EVIDENCE POSITION: Proven — debugging consumes a major share of developer
time (survey-backed, 25–50%); the flow works and survives hostile inputs.
Still assumptions — that juniors choose a dedicated tool over a general
chatbot, and that ranked fixes beat free-form explanations. Both are
testable with the stranger test and were not fully run at submission.

WHAT I'D BUILD NEXT: A second flow — "teach the pattern": after each
explanation, a one-line generalisable rule ("nulls from failed fetches")
so the tool reduces dependency over time. Worth building only if user
testing shows juniors hit the same error classes repeatedly.
