```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed." });
  }

  const { input, mode } = req.body || {};

  if (!input || !mode) {
    return res.status(400).json({ error: "Missing input or mode." });
  }

  const systemPrompt = `
You are the Narrative Fuel Engine Sandbox.

Hard rules:
- Do not claim prediction, diagnosis, certainty, or validation.
- Always label outputs TEST ONLY unless the user explicitly provides a locked ledger record.
- In Creative mode, generate useful creative output.
- In Advanced mode, analyze only what the input supports.
- Detect fuel yourself. Do not ask the user to pick fuel.
- Always include Anti-NFE.
- Keep output clear and structured.
`;

  const userPrompt = `
MODE:
${mode}

USER INPUT:
${input}

Return exactly this structure:

Classification:
Mode:
Detected Fuel:
Engine Read:
Output:
Anti-NFE:
Promotion Status:
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.5",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI API error." });
    }

    const result = data.output_text || "No output returned.";

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: "Server error calling NFE backend." });
  }
}
```
