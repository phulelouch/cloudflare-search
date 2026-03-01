import type { Env, SearchResult } from "../types";

const BRAVE_MONTHLY_LIMIT = 1000;

// Check and increment Brave usage counter (resets monthly)
async function checkBraveQuota(env: Env): Promise<boolean> {
  const key = `brave_usage:${new Date().toISOString().slice(0, 7)}`; // e.g. brave_usage:2026-03
  const count = parseInt((await env.KV.get(key)) || "0", 10);
  if (count >= BRAVE_MONTHLY_LIMIT) return false;
  // Increment counter, expires in 35 days (auto-cleanup)
  await env.KV.put(key, String(count + 1), { expirationTtl: 35 * 86400 });
  return true;
}

// Brave Search API (capped at 1,000 req/month)
export async function braveSearch(query: string, env: Env): Promise<string | null> {
  if (!await checkBraveQuota(env)) return null;

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": env.BRAVE_API_KEY,
    },
  });

  // 402/429 = quota exceeded, return null to trigger DDG fallback
  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as any;
  const results: SearchResult[] = (data.web?.results || []).slice(0, 5);

  if (results.length === 0) {
    return "No search results found.";
  }

  return results
    .map(
      (r: any, i: number) =>
        `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.description || r.snippet || ""}`
    )
    .join("\n\n");
}

// Run all search engines in parallel, return first successful result
export async function webSearch(query: string, env: Env): Promise<string> {
  const searches: Promise<string | null>[] = [
    googleSearch(query),
    bingSearch(query),
    duckDuckGoSearch(query),
  ];

  if (env.BRAVE_API_KEY) {
    searches.unshift(braveSearch(query, env));
  }

  const results = await Promise.allSettled(searches);

  // Return first successful non-null result
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }

  return "No search results found from any search engine.";
}

// Google HTML scrape (no API key)
export async function googleSearch(query: string): Promise<string | null> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5&hl=en`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const results: SearchResult[] = [];

    // Google wraps results in <a href="/url?q=..."> with <h3> titles
    const linkRegex = /<a[^>]+href="\/url\?q=([^&"]+)[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null && results.length < 5) {
      const rawUrl = decodeURIComponent(match[1]);
      if (rawUrl.startsWith("http")) {
        results.push({
          url: rawUrl,
          title: match[2].replace(/<[^>]*>/g, "").trim(),
          snippet: "",
        });
      }
    }

    if (results.length === 0) return null;
    return results
      .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}`)
      .join("\n\n");
  } catch {
    return null;
  }
}

// Bing HTML scrape (no API key)
export async function bingSearch(query: string): Promise<string | null> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=5`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const results: SearchResult[] = [];

    // Bing results: <li class="b_algo"><h2><a href="URL">Title</a></h2>...<p>snippet</p>
    const resultRegex = /<li class="b_algo"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
      results.push({
        url: match[1],
        title: match[2].replace(/<[^>]*>/g, "").trim(),
        snippet: match[3].replace(/<[^>]*>/g, "").trim(),
      });
    }

    if (results.length === 0) return null;
    return results
      .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`)
      .join("\n\n");
  } catch {
    return null;
  }
}

// DuckDuckGo HTML scrape fallback (no API key needed)
export async function duckDuckGoSearch(query: string): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    return `DuckDuckGo search failed with status ${res.status}`;
  }

  const html = await res.text();
  const results: SearchResult[] = [];
  const resultRegex =
    /<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>(.+?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
    results.push({
      url: match[1],
      title: match[2].replace(/<[^>]*>/g, "").trim(),
      snippet: match[3].replace(/<[^>]*>/g, "").trim(),
    });
  }

  if (results.length === 0) {
    return "No search results found.";
  }

  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`)
    .join("\n\n");
}
