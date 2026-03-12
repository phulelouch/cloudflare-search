import type { Env, SearchResult } from "../types";

// Call open-webSearch container via Cloudflare Containers binding
async function openWebSearch(
  query: string,
  env: Env,
  limit = 5,
  engines?: string[]
): Promise<SearchResult[]> {
  try {
    // Get a shared container instance by name
    const container = env.SEARCH_CONTAINER.getByName("search");

    // JSON-RPC call to open-webSearch MCP endpoint
    const res = await container.fetch(
      new Request("http://container/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "search",
            arguments: {
              query,
              limit,
              ...(engines ? { engines } : {}),
            },
          },
          id: 1,
        }),
        signal: AbortSignal.timeout(8000),
      })
    );

    if (!res.ok) return [];

    const data = (await res.json()) as any;

    // Check for JSON-RPC error response
    if (data?.error) {
      console.error(`open-webSearch error: ${data.error.message} (code ${data.error.code})`);
      return [];
    }

    // MCP response: { result: { content: [{ text: "..." }] } }
    const content = data?.result?.content;
    if (!content || !Array.isArray(content)) return [];

    const text = content[0]?.text;
    if (!text) return [];
    const parsed = JSON.parse(text);
    return (parsed.results || parsed || []).slice(0, limit).map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: r.description || r.snippet || "",
    }));
  } catch {
    return [];
  }
}

// Format search results as readable text for LLM consumption
function formatResults(results: SearchResult[]): string {
  if (results.length === 0) return "No search results found.";
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`
    )
    .join("\n\n");
}

// Primary search — calls open-webSearch container, falls back to DuckDuckGo scrape
export async function webSearch(query: string, env: Env): Promise<string> {
  const results = await openWebSearch(query, env);
  if (results.length > 0) return formatResults(results);
  return duckDuckGoSearch(query);
}

// Search for pre-search module — returns formatted text or null
export async function search(query: string, env: Env): Promise<string | null> {
  const results = await openWebSearch(query, env);
  if (results.length > 0) return formatResults(results);
  const ddg = await duckDuckGoSearch(query);
  return ddg || null;
}

// DuckDuckGo HTML scrape fallback (no external dependency)
export async function duckDuckGoSearch(query: string): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return "DuckDuckGo search failed.";

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
    return formatResults(results);
  } catch {
    return "DuckDuckGo search error.";
  }
}
