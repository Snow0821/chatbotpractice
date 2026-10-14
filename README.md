# chatbotpractice

OpenRouter API를 사용하는 간단한 챗봇입니다. Vercel에 바로 배포할 수 있습니다.

## 구조

- `public/index.html` — 채팅 UI (정적 페이지)
- `api/chat.js` — Vercel 서버리스 함수. 브라우저 요청을 OpenRouter로 전달하며, API 키는 서버에서만 사용됩니다.

## 환경 변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | 예 | OpenRouter API 키 |
| `OPENROUTER_MODEL` | 아니오 | 사용할 모델 ID (기본값: `openrouter/free` — 사용 가능한 무료 모델로 자동 라우팅, 예: `google/gemma-4-31b-it:free`) |

Vercel 대시보드 → Project → Settings → Environment Variables 에서 설정한 뒤 재배포하세요.

## 로컬 실행

```bash
npm i -g vercel
vercel env pull   # 또는 .env.local 에 OPENROUTER_API_KEY 작성
vercel dev
```
