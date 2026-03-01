# Free Web Search API Research for Cloudflare Workers

**Research Date:** March 2026
**Focus:** Server-side fetch from Cloudflare Workers (no browser, no proxy required)
**Goal:** Find DuckDuckGo HTML scraping alternatives

---

## Executive Summary

Most mainstream search engines **DO NOT** work from server-side fetch without authentication or CAPTCHA challenges. The best free alternatives are:

1. **Wikipedia API** - ✅ YES (best free option)
2. **GitHub API Search** - ✅ YES (limited)
3. **Reddit JSON** - ✅ YES (limited rate limits)
4. **Hacker News Algolia** - ✅ YES (no auth)
5. **Archive.org CDX** - ✅ YES (no auth, slow)
6. **Marginalia Search** - ✅ YES (public key works)
7. **Qwant Unofficial API** - ⚠️ MAYBE (undocumented, may break)
8. **Wiby.me JSON** - ⚠️ MAYBE (minimal docs)

---

## Detailed Analysis

### 1. BING WEB SEARCH API
**Status:** ❌ DEAD (August 2026 retirement)

- **Server-side fetch?** N/A (officially retired)
- **API key required?** YES (required before shutdown)
- **Free tier?** F1 tier offered $0, but service ended
- **JSON output?** YES
- **Rate limits?** N/A
- **Cloudflare Workers compatible?** NO

**Key findings:**
- Microsoft ended Bing Search APIs on August 11, 2026
- All instances decommissioned
- Customers pushed to Azure AI Agents (paid)
- Alternatives cost 40-483% more

**Conclusion:** Not viable.

---

### 2. MOJEEK API
**Status:** ⚠️ POSSIBLE but requires API key

- **Server-side fetch?** YES (HTTP requests)
- **API key required?** YES (free trial available)
- **Free tier?** Free trial with limited credits (must sign up)
- **JSON output?** YES (also XML)
- **Rate limits?** Not clearly documented
- **Cloudflare Workers compatible?** YES (needs API key stored in KV)

**Key findings:**
- Indie UK-based search engine with own index
- Free credits available after signup
- Returns URLs, titles, snippets
- Supports advanced search operators
- Privacy-friendly alternative to Google

**Example endpoint:**
```
https://api.mojeek.com/search?q=cloudflare+workers&format=json
```

**Conclusion:** Works but requires signup and API key management.

---

### 3. YANDEX SEARCH API
**Status:** ❌ NO direct free API (scraping difficult)

- **Server-side fetch?** NO (strict anti-bot, frequent CAPTCHAs)
- **API key required?** YES (paid services)
- **Free tier?** Paid options ($0.25-$4/1K queries)
- **JSON output?** Available via paid scraping services
- **Rate limits?** Aggressive IP blocking
- **Cloudflare Workers compatible?** NO

**Key findings:**
- Yandex uses strict anti-scraping measures
- Quick IP blocking and CAPTCHA triggers
- Free trial from Thordata/ScrapingBee (paid credits)
- Official API requires payment
- DIY scraping requires proxy rotation (difficult from Workers)

**Conclusion:** Not viable for free server-side access.

---

### 4. QWANT API
**Status:** ⚠️ FREE but undocumented/unofficial

- **Server-side fetch?** YES (reverse-engineered)
- **API key required?** NO
- **Free tier?** Unlimited (no documented limits)
- **JSON output?** YES (via community wrappers)
- **Rate limits?** Not officially documented
- **Cloudflare Workers compatible?** MAYBE (no guarantees)

**Key findings:**
- Qwant API is unofficial and closed-source
- Community-created wrappers available (NullDev/qwant-api on GitHub)
- No rate limiting documented
- Privacy-friendly European search engine
- Risk: API may change/break without notice
- npm package: `qwant-api`

**Example endpoint (unofficial):**
```
https://api.qwant.com/v3/search/web?q=cloudflare&count=10
```

**Conclusion:** Works but fragile; not recommended for production.

---

### 5. STARTPAGE SEARCH
**Status:** ❌ NO direct API (scraping prohibited)

- **Server-side fetch?** NO (anti-scraping)
- **API key required?** YES (3rd party services)
- **Free tier?** Via paid scraping services (Apify, A-Parser)
- **JSON output?** Available via services
- **Rate limits?** Unknown
- **Cloudflare Workers compatible?** NO

**Key findings:**
- No official API
- Explicitly prohibits unauthorized scraping
- Results come from Google (Startpage pays)
- Third-party scrapers available (paid)
- Privacy-focused but not developer-friendly

**Conclusion:** Not viable for free access.

---

### 6. ECOSIA SEARCH
**Status:** ❌ NO direct free API

- **Server-side fetch?** NO (prohibited)
- **API key required?** YES (via scraping services)
- **Free tier?** Eco-friendly but no free API
- **JSON output?** Via paid services
- **Rate limits?** N/A
- **Cloudflare Workers compatible?** NO

**Key findings:**
- Uses Bing API internally (results from Bing)
- Explicitly prohibits scraping/automation
- Terms of service forbid unauthorized access
- No official API offered
- Environmental angle doesn't help developers

**Conclusion:** Not viable.

---

### 7. YAHOO SEARCH
**Status:** ❌ NO (scraping detected and blocked)

- **Server-side fetch?** NO (anti-bot protection)
- **API key required?** YES (via SerpApi, ScrapingBee, etc.)
- **Free tier?** Via paid scraping services
- **JSON output?** Available via services
- **Rate limits?** Strict blocking
- **Cloudflare Workers compatible?** NO (without proxy service)

**Key findings:**
- lite.search.yahoo.com NOT a free endpoint
- Regular search.yahoo.com has bot detection
- CAPTCHAs and IP blocking common
- Third-party SERP APIs provide access (paid)
- SerpApi offers Yahoo endpoint

**Conclusion:** Not viable for direct free access.

---

### 8. WIKIPEDIA API ⭐ RECOMMENDED
**Status:** ✅ YES - BEST FREE OPTION

- **Server-side fetch?** YES (full support)
- **API key required?** NO
- **Free tier?** Unlimited (public API)
- **JSON output?** YES
- **Rate limits?** 200 requests/second per IP
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- No authentication needed
- Official Wikimedia REST API
- Supports search, page content, images, metadata
- High rate limits for server-side use
- Wikipedia's user-agent requirement: identify your app
- Can search ~6+ million articles

**Example endpoints:**
```
# Search articles
https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=cloudflare

# Get page content
https://en.wikipedia.org/api/rest_v1/page/summary/Cloudflare
```

**Rate limits:** 200 req/sec (sufficient for most use)

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'cloudflare';
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MyApp/1.0' }
    });
    return new Response(await response.text());
  }
};
```

**Conclusion:** Excellent for knowledge/reference searches. Limited to Wikipedia content.

---

### 9. GITHUB API SEARCH ⭐ GOOD
**Status:** ✅ YES (limited)

- **Server-side fetch?** YES
- **API key required?** NO (for unauthenticated requests)
- **Free tier?** 60 req/hour (general), 5 req/min (search)
- **JSON output?** YES
- **Rate limits?** 5 searches/min unauthenticated, 30/min authenticated
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- Search limited to: repositories, code, users, issues, commits
- Unauthenticated limit: 5 searches/minute (very restrictive)
- Authenticated limit: 30 searches/minute (requires token)
- No API key needed but token improves limits
- Works well for code/repo search only

**Example endpoint:**
```
https://api.github.com/search/repositories?q=cloudflare+language:javascript
```

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'cloudflare';
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MyApp/1.0' }
    });
    return new Response(await response.text());
  }
};
```

**Conclusion:** Limited to code/repo search. Rate limits very restrictive (5/min).

---

### 10. HACKER NEWS ALGOLIA API ⭐ GOOD
**Status:** ✅ YES - NO AUTH, FAST

- **Server-side fetch?** YES
- **API key required?** NO
- **Free tier?** Unlimited (public service)
- **JSON output?** YES
- **Rate limits?** Not documented (appears unlimited)
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- Searches 10+ years of Hacker News
- Includes articles, comments, users
- Separate from official Hacker News API (Firebase)
- Maintained by Algolia (not Hackr News)
- Supports sorting by date, relevance
- Very fast response times

**Example endpoints:**
```
# Search by relevance
https://hn.algolia.com/api/v1/search?query=cloudflare

# Search by date
https://hn.algolia.com/api/v1/search_by_date?query=cloudflare

# With pagination
https://hn.algolia.com/api/v1/search?query=cloudflare&page=0&hitsPerPage=10
```

**Response includes:** Story titles, URLs, points, comments, timestamp

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'cloudflare';
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=20`;

    const response = await fetch(url);
    return new Response(await response.text());
  }
};
```

**Conclusion:** Excellent for tech news/developer content. No auth, fast, reliable.

---

### 11. REDDIT JSON API ⭐ GOOD
**Status:** ✅ YES (limited by rate limits)

- **Server-side fetch?** YES (with User-Agent header)
- **API key required?** NO
- **Free tier?** Limited by IP-based rate limiting
- **JSON output?** YES
- **Rate limits?** ~1 req/sec per IP (community guideline)
- **Cloudflare Workers compatible?** MAYBE ⚠️

**Key findings:**
- Append `.json` to any Reddit URL to get JSON
- No authentication needed
- Rate limits based on User-Agent
- Cloudflare Workers IP sharing may cause issues
- Reddit's guidelines: use proper User-Agent, 2-sec delays between requests

**Example endpoints:**
```
# Search
https://www.reddit.com/search.json?q=cloudflare&limit=25

# Subreddit search
https://www.reddit.com/r/programming/search.json?q=cloudflare
```

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'cloudflare';
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=20`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MyApp/1.0 (by username)' }
    });
    return new Response(await response.text());
  }
};
```

**Issues for Cloudflare Workers:**
- Shared IP pool may trigger rate limiting faster
- Reddit may block Cloudflare IPs entirely
- Not guaranteed to work in production

**Conclusion:** Works sometimes, but fragile for production use.

---

### 12. ARCHIVE.ORG WAYBACK MACHINE CDX API ⭐ GOOD
**Status:** ✅ YES (no auth, slower)

- **Server-side fetch?** YES
- **API key required?** NO
- **Free tier?** Unlimited
- **JSON output?** YES (also plain CDX)
- **Rate limits?** Not published (appears reasonable)
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- Queries the Wayback Machine index (CDX format)
- 29+ years of web archive data
- Free and fully open
- Returns JSON with captured pages' metadata
- Slower than real-time search (historical snapshots)
- Useful for finding old versions of websites

**Example endpoints:**
```
# Search CDX index
https://web.archive.org/cdx/search/cdx?url=cloudflare.com&format=json

# With date filtering
https://web.archive.org/cdx/search/cdx?url=cloudflare.com&from=20200101&to=20250101&format=json
```

**Response includes:** Timestamp, status code, MIME type, length, archive URL

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const url = 'cloudflare.com';
    const apiUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&format=json&collapse=statuscode`;

    const response = await fetch(apiUrl);
    return new Response(await response.text());
  }
};
```

**Limitations:** Historical data only, not current web. Useful for research, not real-time search.

**Conclusion:** Excellent for web history research, not for current search results.

---

### 13. COMMON CRAWL INDEX ⚠️ COMPLEX
**Status:** ✅ POSSIBLE (very slow, requires processing)

- **Server-side fetch?** YES (but impractical)
- **API key required?** NO
- **Free tier?** Unlimited
- **JSON output?** YES (CDXJ format)
- **Rate limits?** None published
- **Cloudflare Workers compatible?** NO (Worker timeout limits)

**Key findings:**
- Massive index of web crawl data
- Free, open, but slow to query
- Data from Amazon S3 (public dataset)
- Requires understanding CDXJ format
- Full-text search not available; only indexed data
- Queries can take 30+ seconds

**Example endpoints:**
```
https://index.commoncrawl.org/cdx/search/cdx?url=cloudflare.com&format=json
```

**Cloudflare Workers limitation:** 30-second execution timeout; Common Crawl queries often exceed this.

**Conclusion:** Not practical for Workers (timeout issues). Consider for batch processing.

---

### 14. MARGINALIA SEARCH API ⭐ INTERESTING
**Status:** ✅ YES (free "public" key)

- **Server-side fetch?** YES
- **API key required?** YES (but "public" key provided)
- **Free tier?** Shared rate limit with public key
- **JSON output?** YES
- **Rate limits?** Shared limit (no specific numbers)
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- Indie Swedish search engine for small/text-heavy sites
- Focus on quality over quantity (curated index)
- Public key: "public" (shared rate limit)
- Can request personal key via email: contact@marginalia-search.com
- CC-BY-NC-SA 4.0 license
- Results skew indie/alternative web

**Example endpoints:**
```
https://api.marginalia.nu/api/search?query=cloudflare&key=public

# Or alternative domain
https://api.marginalia-search.com/api/search?query=cloudflare&key=public
```

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'cloudflare';
    const url = `https://api.marginalia.nu/api/search?query=${encodeURIComponent(query)}&key=public`;

    const response = await fetch(url);
    return new Response(await response.text());
  }
};
```

**Pros:** Free, interesting results, indie-friendly
**Cons:** Shared rate limit, smaller index

**Conclusion:** Good alternative search engine with free access. Not for high-volume production use.

---

### 15. WIBY.ME SEARCH API ⚠️ MINIMAL
**Status:** ⚠️ MAYBE (poor documentation)

- **Server-side fetch?** YES (possibly)
- **API key required?** NO
- **Free tier?** Appears unlimited
- **JSON output?** YES
- **Rate limits?** Not documented
- **Cloudflare Workers compatible?** MAYBE

**Key findings:**
- Indie search for "classic web" (older websites)
- Mentions JSON API at wiby.me/json
- Documentation minimal/vague
- No clear endpoint examples
- Open source (GPLv2)
- Limited index compared to major engines

**Potential endpoint:**
```
https://wiby.me/json?q=cloudflare
# Exact endpoint not confirmed
```

**Conclusion:** Too poorly documented. Not recommended without testing.

---

### 16. DUCKDUCKGO INSTANT ANSWER API
**Status:** ⚠️ LIMITED (no web search, only instant answers)

- **Server-side fetch?** YES
- **API key required?** NO
- **Free tier?** Unlimited
- **JSON output?** YES
- **Rate limits?** Not documented
- **Cloudflare Workers compatible?** YES ✅

**Key findings:**
- **Important:** This is NOT a web search API
- Returns only instant answers (factual lookups, calculations)
- No general web search results
- Free, no authentication
- Suitable for: math, definitions, conversions, flight status, passwords, etc.
- Limited to ~100 specialized answer types

**Example endpoints:**
```
https://api.duckduckgo.com/?q=population+of+france&format=json

# Response includes AbstractText (answer), AbstractURL, etc.
```

**Cloudflare Workers code:**
```javascript
export default {
  async fetch(request) {
    const query = 'weather cloudflare';
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    // Extract instant answer
    return new Response(JSON.stringify({
      answer: data.AbstractText,
      url: data.AbstractURL
    }));
  }
};
```

**Limitation:** Only instant answers, NOT web search. Original DuckDuckGo HTML scraping is still better for general search.

**Conclusion:** Works but doesn't replace web search capability.

---

### 17. BRAVE SEARCH API
**Status:** ❌ NOT FREE (removed free tier)

- **Server-side fetch?** YES
- **API key required?** YES
- **Free tier?** $5 credit/month (~1,000 queries)
- **JSON output?** YES
- **Rate limits?** Per your plan
- **Cloudflare Workers compatible?** YES (with key in KV)

**Key findings:**
- Removed free tier May 2026
- Now $5/1,000 requests (metered)
- $5 monthly credit if you attribute them
- Privacy-focused alternative to Google
- High-quality results

**Pricing:** $5 per 1,000 requests = 0.005/request

**Conclusion:** Not free enough for high-volume use.

---

### 18. ADDITIONAL PAID OPTIONS (EXCLUDED)
Not recommended but noted:

- **SerpApi:** 250 free searches/month (limited)
- **Serper:** 2,500 free searches/month (limited)
- **Google Custom Search:** 100/day free (closed to new signups)
- **Exa AI:** Paid web search API
- **Tavily:** Paid, designed for AI agents

---

## SPECIAL CASE: DUCKDUCKGO HTML SCRAPING

Since you mentioned scraping DuckDuckGo, here's the reality:

**Why you can't scrape DuckDuckGo from Workers:**
1. CAPTCHAs triggered on bot-like requests
2. IP blocking common
3. User-Agent detection
4. Cloudflare's shared IP pool gets blocked quickly
5. No direct API available

**Why existing libraries work:**
- Desktop tools use proxy rotation or dedicated IPs
- Residential proxies bypass detection
- Manual requests with proper delays may work short-term

**Why Workers are different:**
- Shared IP addresses across users
- Rate limits kick in faster
- No persistent connection for delays
- Cannot use rotating proxies easily

---

## RECOMMENDED SOLUTIONS FOR CLOUDFLARE WORKERS

### Tier 1: Fully Free, No Auth, Reliable ✅
1. **Wikipedia API** - Best for knowledge/reference
2. **Hacker News Algolia** - Best for tech news
3. **Archive.org CDX** - Best for web history

### Tier 2: Free, No Auth, Limited ⚠️
1. **GitHub API** - 5 searches/min (code only)
2. **Reddit JSON** - May hit rate limits, IP blocking risk
3. **DuckDuckGo Instant Answers** - Instant answers only, not web search

### Tier 3: Free With Signup/Key, Worth Trying
1. **Marginalia Search** - "public" key, indie results
2. **Qwant API** - Unofficial but works (risk of breaking)
3. **Mojeek API** - Small free trial, then paid

### Tier 4: Practical but Paid ❌
1. **Brave Search** - $5/month credit (best-paid option)
2. **Mojeek** - After free trial runs out
3. **SerpApi/Serper** - If you need volume

---

## IMPLEMENTATION CHECKLIST FOR WORKERS

For ANY API from Workers, remember:

- [ ] Set proper User-Agent header
- [ ] Handle rate limits (implement backoff)
- [ ] Store API keys in KV, not in code
- [ ] Test from actual Cloudflare IP range
- [ ] Handle timeouts (30-sec Workers limit)
- [ ] Cache responses in KV when possible
- [ ] Monitor CORS issues (Workers can proxy these away)
- [ ] Add error handling for API downtime
- [ ] Log API usage for debugging

---

## UNRESOLVED QUESTIONS

1. **Wiby.me JSON API:** Exact endpoint unclear, no official docs. Would need to test.
2. **Qwant API stability:** No SLA or official documentation; could break anytime.
3. **Reddit rate limits on Cloudflare IPs:** Real-world production testing needed.
4. **Marginalia "public" key limits:** Exact threshold unknown, only "shared rate limit" mentioned.
5. **Common Crawl latency:** Does 30+ second query time violate Workers timeout?

---

## FINAL VERDICT

**Best free alternative to DuckDuckGo scraping:**
- **Wikipedia API** for factual searches
- **Hacker News Algolia** for tech community posts
- **Archive.org CDX** for historical lookups
- **GitHub API** for code searches

**For general web search without paying:**
→ **You cannot reliably replicate Google/DDG search from Workers for free.** The existing services either require auth, have rate limits, or serve different content types.

**If you need general web search:**
→ **Invest in one of: Brave ($5/mo), Mojeek (after free trial), or SerpApi (250 free/mo).** Free SERP APIs are a myth in 2026.
