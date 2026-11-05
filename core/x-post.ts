// Fetch the full, untruncated text and author of an X post.
// oEmbed truncates long posts, so try full-text sources first.
export async function fetchXPost(postUrl: string): Promise<{ author: string; text: string } | null> {
  const id = postUrl.match(/\/status\/(\d+)/)?.[1];
  const clean = (h: string) => h.trim().replace(/^@/, "").toLowerCase();
  if (id) {
    try {
      const r = await fetch(`https://api.fxtwitter.com/status/${id}`, { headers: { "User-Agent": "Mozilla/5.0 RaidFiBot/1.0" } });
      if (r.ok) {
        const d = await r.json();
        const t = d?.tweet;
        if (t?.text && t?.author?.screen_name) return { author: clean(t.author.screen_name), text: String(t.text).toLowerCase() };
      }
    } catch (_) { /* fall through */ }
    try {
      const tok = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
      const r = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${tok}`, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (r.ok) {
        const d = await r.json();
        if (d?.text && d?.user?.screen_name) {
          const text = [d.text, d.note_tweet?.note_tweet_results?.result?.text].filter(Boolean).join(" ");
          // only trust if not truncated, else continue to oEmbed as additional source
          const res = { author: clean(d.user.screen_name), text: String(text).toLowerCase() };
          return res;
        }
      }
    } catch (_) { /* fall through */ }
  }
  try {
    const r = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=1&dnt=1`);
    if (!r.ok) return null;
    const d = await r.json();
    return {
      author: clean((d.author_url ?? "").split("/").filter(Boolean).pop() ?? ""),
      text: String(d.html ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").toLowerCase(),
    };
  } catch (_) {
    return null;
  }
}
