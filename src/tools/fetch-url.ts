// Block internal/private network URLs to prevent SSRF
function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return true;
    const h = parsed.hostname.toLowerCase();
    return (
      h === "localhost" ||
      h === "[::1]" ||
      h === "0.0.0.0" ||
      h.startsWith("127.") ||
      h.startsWith("10.") ||
      h.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      h === "169.254.169.254" ||
      h.startsWith("fc00:") ||
      h.startsWith("fd00:") ||
      h.endsWith(".internal") ||
      h.endsWith(".local")
    );
  } catch {
    return true;
  }
}

// Fetch and strip HTML from a URL, returning plain text
export async function fetchUrl(url: string): Promise<string> {
  if (isBlockedUrl(url)) {
    return "Cannot fetch this URL: blocked for security reasons.";
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return `Failed to fetch URL: HTTP ${res.status}`;
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await res.json();
      return JSON.stringify(json, null, 2).slice(0, 6000);
    }

    const html = await res.text();

    // Strip scripts, styles, nav, footer, header, then all tags
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 6000) || "Page content was empty.";
  } catch (err) {
    return `Error fetching URL: ${err}`;
  }
}
