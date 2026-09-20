const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const MAX_LEN = 20000;

// Heuristic offline analyser — used when no LLM_API_KEY is set.
const RULES = [
  { re: /NullPointerException|undefined is not an object|Cannot read propert/i,
    cause: "You are reading a property on a null/undefined value.",
    fixes: ["Log the object one line before the crash to confirm it is null.",
            "Add a guard: if (!obj) return / throw a clear error.",
            "Trace back where the object should have been created — an early return or failed fetch is a common root cause."] },
  { re: /IndexOutOfBoundsException|Index \d+ out of bounds/i,
    cause: "A loop or index went past the end of a list/array.",
    fixes: ["Print the collection length next to the failing index.",
            "Check loop bounds: use < length, not <=.",
            "Empty collections at edge cases (first item, last item) are the usual trigger."] },
  { re: /ECONNREFUSED/i,
    cause: "Nothing is listening on the host:port you called.",
    fixes: ["Confirm the target service is running (curl the URL directly).",
            "Check the port/host in your config — localhost vs container hostname mixups are common.",
            "If in Docker, use the service name, not localhost, to reach a sibling container."] },
  { re: /ER_DUP_ENTRY|UNIQUE constraint|duplicate key/i,
    cause: "You inserted a row that violates a unique constraint.",
    fixes: ["Log the values being inserted — the duplicate is usually an ID or email.",
            "Decide the intent: upsert (ON DUPLICATE KEY / ON CONFLICT) or reject with a friendly error.",
            "Check for retry logic that resubmits the same record."] },
  { re: /CORS|Access-Control-Allow-Origin/i,
    cause: "The browser blocked a cross-origin request the server did not allow.",
    fixes: ["Add the frontend origin to the server's CORS allow-list.",
            "Remember credentials mode requires an explicit origin, not '*'.",
            "Check you are not hitting the wrong environment (staging vs prod URL)."] },
  { re: /Segmentation fault|SIGSEGV/i,
    cause: "The process touched memory it should not have — native code or memory corruption.",
    fixes: ["Reproduce under a debugger or ASan build.",
            "Check recent changes to native addons / FFI / pointer arithmetic.",
            "Check for stack exhaustion via unbounded recursion."] },
];

function heuristicAnalyse(text) {
  const firstLine = text.trim().split("\n")[0].slice(0, 200);
  for (const r of RULES) {
    if (r.re.test(text)) {
      return { explanation: `The program stopped at: "${firstLine}". ${r.cause}`,
               cause: r.cause, fixes: r.fixes, mode: "heuristic" };
    }
  }
  return { explanation: `The program reported: "${firstLine}". No known pattern matched the heuristic library.`,
           cause: "Unclassified error.", 
           fixes: ["Reproduce it reliably and note the exact input that triggers it.",
                   "Search the exact message — drop timestamps and memory addresses.",
                   "Bisect: comment out recent changes until it stops occurring."],
           mode: "heuristic" };
}

async function llmAnalyse(text) {
  // OpenAI-compatible chat completions endpoint. Set LLM_API_KEY (and optionally LLM_BASE_URL, LLM_MODEL).
  const base = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content:
          "You are a senior engineer. Given a stack trace or error message, reply with STRICT JSON: " +
          '{"explanation": string, "cause": string, "fixes": [string, string, string]}. ' +
          "explanation: plain English for a junior dev, max 60 words. fixes: ranked, most likely first, imperative, max 25 words each. No markdown." },
        { role: "user", content: text.slice(0, MAX_LEN) }
      ]
    })
  });
  if (!res.ok) throw new Error(`LLM API ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return { ...parsed, mode: "llm" };
}

app.post("/api/analyse", async (req, res) => {
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "Paste an error message or stack trace." });
  if (text.length > MAX_LEN) return res.status(400).json({ error: `Too long (${text.length} chars). Limit is ${MAX_LEN}.` });
  try {
    const result = process.env.LLM_API_KEY ? await llmAnalyse(text) : heuristicAnalyse(text);
    res.json(result);
  } catch (e) {
    // LLM failed — degrade to heuristics rather than dying. Noted in README as intentional.
    const result = heuristicAnalyse(text);
    result.degraded = true;
    res.json(result);
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("TraceFix on http://localhost:3000"));
