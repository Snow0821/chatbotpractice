// Vercel 서버리스 함수: 브라우저 요청을 받아 OpenRouter로 전달합니다.
// API 키는 서버에서만 사용되므로 클라이언트에 노출되지 않습니다.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/free";
const SYSTEM_PROMPT = "You are a helpful, friendly assistant. Answer in the user's language.";
const MAX_HISTORY = 20;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENROUTER_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "messages 배열이 필요합니다." });
  }

  // 클라이언트가 보낸 대화 중 user/assistant 메시지만 허용하고 최근 것만 유지
  const history = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY);

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": `https://${req.headers.host ?? "localhost"}`,
        "X-Title": "chatbotpractice",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      }),
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      const message = data?.error?.message || `OpenRouter 오류 (${upstream.status})`;
      return res.status(upstream.status).json({ error: message });
    }

    const reply = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply, model: data?.model });
  } catch (err) {
    return res.status(502).json({ error: "OpenRouter 요청에 실패했습니다." });
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
