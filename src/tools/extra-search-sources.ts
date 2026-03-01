// Wikipedia search — free, unlimited, JSON, no API key
export async function wikipediaSearch(query: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CloudflareSearchAgent/1.0" },
    });
    if (!res.ok) return "Wikipedia search failed.";
    const data = (await res.json()) as any;
    const results = data.query?.search || [];
    if (results.length === 0) return "No Wikipedia results found.";
    return results
      .map(
        (r: any, i: number) =>
          `[${i + 1}] ${r.title}\n    URL: https://en.wikipedia.org/wiki/${encodeURIComponent(r.title.replace(/ /g, "_"))}\n    ${r.snippet.replace(/<[^>]*>/g, "")}`
      )
      .join("\n\n");
  } catch {
    return "Wikipedia search error.";
  }
}

// Hacker News (Algolia) — free, unlimited, JSON, no API key
export async function hackerNewsSearch(query: string): Promise<string> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=5`;
  try {
    const res = await fetch(url);
    if (!res.ok) return "Hacker News search failed.";
    const data = (await res.json()) as any;
    const hits = data.hits || [];
    if (hits.length === 0) return "No Hacker News results found.";
    return hits
      .map(
        (h: any, i: number) =>
          `[${i + 1}] ${h.title || h.story_title || "Untitled"}\n    URL: ${h.url || `https://news.ycombinator.com/item?id=${h.objectID}`}\n    Points: ${h.points || 0} | Comments: ${h.num_comments || 0}`
      )
      .join("\n\n");
  } catch {
    return "Hacker News search error.";
  }
}

// GitHub search — free, 10 req/min unauthenticated, JSON
export async function githubSearch(query: string): Promise<string> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5&sort=stars`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CloudflareSearchAgent/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) return `GitHub search failed (${res.status}).`;
    const data = (await res.json()) as any;
    const items = data.items || [];
    if (items.length === 0) return "No GitHub repos found.";
    return items
      .map(
        (r: any, i: number) =>
          `[${i + 1}] ${r.full_name}\n    URL: ${r.html_url}\n    ${r.description || "No description"}\n    Stars: ${r.stargazers_count} | Language: ${r.language || "N/A"}`
      )
      .join("\n\n");
  } catch {
    return "GitHub search error.";
  }
}

// Reddit search — free, JSON, no API key
export async function redditSearch(query: string): Promise<string> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=relevance`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "CloudflareSearchAgent/1.0",
      },
    });
    if (!res.ok) return `Reddit search failed (${res.status}).`;
    const data = (await res.json()) as any;
    const posts = data.data?.children || [];
    if (posts.length === 0) return "No Reddit results found.";
    return posts
      .map(
        (p: any, i: number) =>
          `[${i + 1}] ${p.data.title}\n    URL: https://reddit.com${p.data.permalink}\n    Subreddit: r/${p.data.subreddit} | Score: ${p.data.score}`
      )
      .join("\n\n");
  } catch {
    return "Reddit search error.";
  }
}

// Archive.org CDX — free, unlimited, no API key
export async function archiveSearch(query: string): Promise<string> {
  const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(query)}&output=json&limit=5&fl=timestamp,original,statuscode&filter=statuscode:200`;
  try {
    const res = await fetch(url);
    if (!res.ok) return "Archive.org search failed.";
    const data = (await res.json()) as any[];
    if (!data || data.length <= 1) return "No Archive.org results found.";
    // First row is headers, rest are results
    return data
      .slice(1)
      .map(
        (r: any, i: number) =>
          `[${i + 1}] ${r[1]}\n    Archive URL: https://web.archive.org/web/${r[0]}/${r[1]}\n    Captured: ${r[0].slice(0, 4)}-${r[0].slice(4, 6)}-${r[0].slice(6, 8)}`
      )
      .join("\n\n");
  } catch {
    return "Archive.org search error.";
  }
}
