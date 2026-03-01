import type { Env, SearchResult } from "../types";

// Brave Search API
export async function braveSearch(query: string, env: Env): Promise<string | null> {
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

// Run all available search engines in parallel, return first successful result
export async function webSearch(query: string, env: Env): Promise<string> {
  const searches: Promise<string | null>[] = [duckDuckGoSearch(query)];

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
