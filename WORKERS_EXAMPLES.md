# Cloudflare Workers Search API Examples

Tested code snippets for free search APIs from Cloudflare Workers.

---

## 1. WIKIPEDIA API (RECOMMENDED)

**Pros:** No auth, fast, reliable 200 req/sec limit
**Cons:** Wikipedia content only

### Search articles:
```javascript
export default {
  async fetch(request) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare';

    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=10`,
        { headers: { 'User-Agent': 'CloudflareWorker/1.0' } }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### Get page summary:
```javascript
export default {
  async fetch(request) {
    const title = new URL(request.url).searchParams.get('title') || 'Cloudflare';

    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { headers: { 'User-Agent': 'CloudflareWorker/1.0' } }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 2. HACKER NEWS ALGOLIA API (RECOMMENDED)

**Pros:** No auth, fast, unlimited queries, tech-focused
**Cons:** Hacker News content only

### Search with pagination:
```javascript
export default {
  async fetch(request) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare';
    const page = new URL(request.url).searchParams.get('page') || 0;

    try {
      const response = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(searchQuery)}&page=${page}&hitsPerPage=20`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### Search by date (most recent):
```javascript
export default {
  async fetch(request) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare';

    try {
      const response = await fetch(
        `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(searchQuery)}&hitsPerPage=30`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 3. GITHUB API SEARCH

**Pros:** No auth needed, repos and code
**Cons:** 5 searches/min limit unauthenticated

### Search repositories:
```javascript
export default {
  async fetch(request) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare workers';

    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=20`,
        { headers: { 'User-Agent': 'CloudflareWorker/1.0' } }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### With authentication (higher limits, 30/min):
```javascript
export default {
  async fetch(request, env) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare';
    const githubToken = env.GITHUB_TOKEN; // Store in Cloudflare secret

    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=20`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'CloudflareWorker/1.0'
          }
        }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 4. REDDIT JSON API

**Pros:** No auth, real user-generated content
**Cons:** Rate limiting, IP blocking risk, may fail in production

### Search subreddit:
```javascript
export default {
  async fetch(request) {
    const searchQuery = new URL(request.url).searchParams.get('q') || 'cloudflare';
    const subreddit = new URL(request.url).searchParams.get('sub') || 'programming';

    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&limit=25&restrict_sr=on`,
        {
          headers: {
            'User-Agent': 'CloudflareWorker/1.0 (by myusername)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Reddit responded with ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### With caching to reduce rate limit hits:
```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q') || 'cloudflare';
    const cacheKey = `reddit_search_${searchQuery}`;

    // Check cache first
    const cached = await env.REDDIT_CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
      });
    }

    try {
      const response = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(searchQuery)}&limit=20`,
        { headers: { 'User-Agent': 'CloudflareWorker/1.0' } }
      );

      const text = await response.text();

      // Cache for 1 hour
      await env.REDDIT_CACHE.put(cacheKey, text, { expirationTtl: 3600 });

      return new Response(text, {
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 5. ARCHIVE.ORG WAYBACK MACHINE CDX API

**Pros:** No auth, historical web data, unlimited
**Cons:** Old snapshots, not real-time search

### Search CDX index:
```javascript
export default {
  async fetch(request) {
    const domainToSearch = new URL(request.url).searchParams.get('domain') || 'cloudflare.com';

    try {
      const response = await fetch(
        `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domainToSearch)}&format=json&collapse=statuscode&limit=50`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### With date filtering:
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain') || 'example.com';
    const fromDate = url.searchParams.get('from') || '20200101';
    const toDate = url.searchParams.get('to') || '20250101';

    try {
      const response = await fetch(
        `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&from=${fromDate}&to=${toDate}&format=json&limit=100`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 6. DUCKDUCKGO INSTANT ANSWERS (Limited)

**Pros:** No auth, factual answers
**Cons:** Not web search, only instant answers

### Get instant answer:
```javascript
export default {
  async fetch(request) {
    const query = new URL(request.url).searchParams.get('q') || 'population of france';

    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );

      const data = await response.json();

      // Extract useful fields
      const result = {
        query: query,
        answer: data.AbstractText || null,
        answerUrl: data.AbstractURL || null,
        answerSource: data.AbstractSource || null,
        icon: data.Icon?.URL || null,
        related: data.RelatedTopics?.slice(0, 5) || []
      };

      return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 7. MARGINALIA SEARCH (Indie engine)

**Pros:** No auth (public key), interesting alternative results
**Cons:** Shared rate limit

### Search with public key:
```javascript
export default {
  async fetch(request) {
    const query = new URL(request.url).searchParams.get('q') || 'cloudflare';

    try {
      const response = await fetch(
        `https://api.marginalia.nu/api/search?query=${encodeURIComponent(query)}&key=public`
      );

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded on public key' }),
          { status: 429 }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

### With personal API key (request from contact@marginalia-search.com):
```javascript
export default {
  async fetch(request, env) {
    const query = new URL(request.url).searchParams.get('q') || 'cloudflare';
    const marginaliaKey = env.MARGINALIA_KEY; // Store in secret

    try {
      const response = await fetch(
        `https://api.marginalia.nu/api/search?query=${encodeURIComponent(query)}&key=${marginaliaKey}`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## 8. MOJEEK API (After signup)

**Requires:** Free API key from signup at mojeek.com

### Basic search:
```javascript
export default {
  async fetch(request, env) {
    const query = new URL(request.url).searchParams.get('q') || 'cloudflare';
    const mojeekKey = env.MOJEEK_API_KEY; // Store in secret

    try {
      const response = await fetch(
        `https://api.mojeek.com/search?q=${encodeURIComponent(query)}&fmt=json&api_key=${mojeekKey}`
      );

      const data = await response.json();
      return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};
```

---

## SETUP INSTRUCTIONS FOR WRANGLER

### 1. Environment variables (wrangler.toml):
```toml
[env.production]
vars = { SEARCH_CACHE_TTL = "3600" }

[env.production.env]
vars = {
  GITHUB_TOKEN = "ghp_...",
  MARGINALIA_KEY = "your-key-here",
  MOJEEK_API_KEY = "your-key-here"
}

[build]
command = "echo 'No build step needed'"
cwd = "."
```

### 2. Create KV binding for caching (wrangler.toml):
```toml
[[kv_namespaces]]
binding = "REDDIT_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Deploy:
```bash
wrangler deploy
```

### 4. Test:
```bash
curl "https://your-worker.workers.dev/?q=cloudflare"
```

---

## BEST PRACTICES

1. **Always set User-Agent:**
   ```javascript
   headers: { 'User-Agent': 'YourApp/1.0 (+yoursite.com)' }
   ```

2. **Implement caching:**
   ```javascript
   const cacheKey = `search_${query}`;
   const cached = await env.CACHE.get(cacheKey);
   if (cached) return cached;
   ```

3. **Handle rate limits gracefully:**
   ```javascript
   if (response.status === 429) {
     return new Response('Rate limit exceeded', { status: 429 });
   }
   ```

4. **Store secrets in Cloudflare:**
   ```bash
   wrangler secret put GITHUB_TOKEN
   ```
   Then use: `const token = env.GITHUB_TOKEN;`

5. **Never hardcode API keys in code.**

6. **Test with actual Cloudflare IPs** before production (some APIs block shared IPs).

---

## PRODUCTION RECOMMENDATION

**Use a combination approach:**
1. Try Wikipedia first (factual queries)
2. Fall back to Hacker News for tech content
3. Cache all results in KV for 1 hour
4. For general web search, use paid API (Brave $5/mo)

This balances cost, reliability, and coverage.
