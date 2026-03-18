

## AI Post Verification for Contributions

### Overview
Add an AI verification step when users submit a post URL. The AI analyzes the tweet content (fetched via the URL/tweet ID) and scores it based on quality, relevance, and authenticity. The score adjusts the points earned and provides feedback to the user on how to improve.

### Architecture

```text
User submits post URL
        │
        ▼
Frontend calls edge function: verify-contribution
        │
        ▼
Edge function:
  1. Fetches tweet content (via Twitter/X oEmbed API)
  2. Sends content to Lovable AI (Gemini Flash) for analysis
  3. AI returns: score_modifier (-5 to +5), verdict, feedback
        │
        ▼
Frontend receives result:
  - points_earned = 10 + score_modifier (min 1)
  - Shows feedback toast/card explaining the score
  - Inserts contribution with adjusted points
```

### Database Changes
- Add two columns to `contributions` table:
  - `ai_score` (integer, default 10) -- the final adjusted points
  - `ai_feedback` (text, nullable) -- explanation shown to user

### Edge Function: `verify-contribution`
- Accepts `{ post_url }` from authenticated user
- Uses Twitter oEmbed API (`https://publish.twitter.com/oembed?url=...`) to get tweet text (no API key needed)
- Sends tweet text to Lovable AI with a prompt that scores on:
  - **Relevance** to RaidFi/crypto/web3 community
  - **AI-generated detection** (light penalty, -1 only)
  - **Spam/low-effort detection** (heavier penalty, -3 to -5)
  - **Quality/engagement potential** (bonus +1 to +5)
- Uses tool calling to extract structured output: `{ score_modifier: number, verdict: string, feedback: string }`
- Returns the result to the frontend

### Frontend Changes (`Contributions.tsx`)
- In `handleSubmitPost`: call the edge function before inserting, use the returned adjusted score as `points_earned`
- Show a feedback card/toast after submission with the AI's verdict and improvement tips
- Display `ai_feedback` on each contribution card (small text below the tweet embed)

### Scoring Rules (in AI prompt)
| Category | Modifier |
|----------|----------|
| High-quality, original, relevant | +3 to +5 |
| Normal, acceptable post | 0 |
| Likely AI-generated (not harsh) | -1 |
| Low-effort / generic | -2 to -3 |
| Spam / irrelevant / suspicious | -4 to -5 |

Minimum final score: 1 point (never zero or negative).

### Implementation Steps
1. Add `ai_score` and `ai_feedback` columns to `contributions` via migration
2. Create `supabase/functions/verify-contribution/index.ts` edge function
3. Update `Contributions.tsx` submission flow to call the edge function and display feedback
4. Update `ContributionsManager.tsx` admin view to show AI feedback column

