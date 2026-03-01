# Free Web Search APIs - Comparison Matrix

Quick reference for choosing the right API.

---

## SUMMARY TABLE

| API | Works from Workers | Auth Required | Free Tier | Rate Limit | Content Type | JSON | Production Ready |
|-----|:-:|:-:|---|---|---|:-:|:-:|
| **Wikipedia** | ✅ | NO | Unlimited | 200/sec | Knowledge | ✅ | ✅ YES |
| **Hacker News Algolia** | ✅ | NO | Unlimited | Undocumented | Tech news | ✅ | ✅ YES |
| **GitHub Search** | ✅ | NO | Limited | 5/min search | Code/repos | ✅ | ⚠️ Limited |
| **Reddit JSON** | ✅ | NO | Limited | ~1/sec | User posts | ✅ | ⚠️ Fragile |
| **Archive.org CDX** | ✅ | NO | Unlimited | None pub. | Historical | ✅ | ✅ YES |
| **DuckDuckGo IA** | ✅ | NO | Unlimited | Unknown | Instant answers | ✅ | ⚠️ Limited |
| **Marginalia** | ✅ | YES (public key) | Limited | Shared | Indie web | ✅ | ⚠️ Limited |
| **Mojeek** | ✅ | YES (API key) | Free trial | Unknown | Full index | ✅ | ⚠️ After trial |
| **Brave Search** | ✅ | YES | $5 credit | Per plan | Full index | ✅ | ⚠️ Paid |
| **Bing API** | ❌ | YES | Dead | — | — | — | ❌ RETIRED |
| **Yandex** | ❌ | YES | Paid only | Strict blocks | — | ✅ | ❌ NOT FREE |
| **Startpage** | ❌ | Via services | Paid only | — | — | ✅ | ❌ NOT FREE |
| **Ecosia** | ❌ | Prohibited | None | — | — | ✅ | ❌ NOT FREE |
| **Yahoo Search** | ❌ | Via services | Paid only | IP blocks | — | ✅ | ❌ NOT FREE |
| **Qwant** | ✅ | NO | Unlimited* | Undocumented | Full index | ✅ | ❌ Risky |
| **Wiby.me** | ⚠️ | NO | Unlimited* | Unknown | Classic web | ✅ | ❌ No docs |
| **Common Crawl** | ✅ | NO | Unlimited | None pub. | Historical | ✅ | ⚠️ Slow |

*Unofficial/undocumented - may break anytime

---

## QUICK SELECTION GUIDE

### "I need general web search results"
❌ **No truly free option exists for production use**
- Best paid: **Brave Search** ($5/month = ~1,000 queries)
- Budget: **SerpApi** (250 free/month)

### "I need knowledge/reference lookups"
✅ **Wikipedia API**
- Unlimited, no auth, 200 req/sec
- Best for factual questions

### "I need tech/developer content"
✅ **Hacker News Algolia**
- Unlimited, no auth, very fast
- Great for tech news and discussions

### "I need source code search"
✅ **GitHub API**
- No auth for 5/min, better with token
- Limited to code/repos only

### "I need historical web data"
✅ **Archive.org CDX**
- Unlimited, no auth, free
- Snapshots from 1996+

### "I need user opinions/discussions"
⚠️ **Reddit JSON API**
- Works sometimes, but fragile
- Caching recommended
- May fail in production

### "I need quick facts/answers"
✅ **DuckDuckGo Instant Answers**
- No auth, no rate limits published
- Instant answers only (not web search)

### "I want indie search engine results"
✅ **Marginalia Search**
- Free public key (shared rate limit)
- High-quality indie web index

---

## API ENDPOINT REFERENCE

### Wikipedia
```
GET https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=QUERY
GET https://en.wikipedia.org/api/rest_v1/page/summary/TITLE
```

### Hacker News
```
GET https://hn.algolia.com/api/v1/search?query=QUERY
GET https://hn.algolia.com/api/v1/search_by_date?query=QUERY
```

### GitHub
```
GET https://api.github.com/search/repositories?q=QUERY
GET https://api.github.com/search/code?q=QUERY
GET https://api.github.com/search/users?q=QUERY
```

### Reddit
```
GET https://www.reddit.com/search.json?q=QUERY
GET https://www.reddit.com/r/SUBREDDIT/search.json?q=QUERY
```

### Archive.org
```
GET https://web.archive.org/cdx/search/cdx?url=DOMAIN&format=json
```

### DuckDuckGo
```
GET https://api.duckduckgo.com/?q=QUERY&format=json
```

### Marginalia
```
GET https://api.marginalia.nu/api/search?query=QUERY&key=public
```

### Mojeek
```
GET https://api.mojeek.com/search?q=QUERY&fmt=json&api_key=KEY
```

---

## COST ANALYSIS (Monthly)

| Service | Cost | Queries |
|---------|------|---------|
| Wikipedia | FREE | Unlimited |
| Hacker News | FREE | Unlimited |
| GitHub | FREE | 5/min × 60 × 24 × 30 = 216,000/month |
| Reddit | FREE | ~30,000/month (estimated) |
| Archive.org | FREE | Unlimited |
| DuckDuckGo IA | FREE | Unknown |
| Marginalia | FREE (shared) | Unknown |
| Qwant | FREE (risky) | Unlimited |
| **Brave Search** | **$5** | **~1,000** |
| **SerpApi** | **$0** | **250/month free** |
| Mojeek | $0 initially | Free trial only |
| Common Crawl | FREE | Unlimited (slow) |

---

## RELIABILITY SCORING

### Tier 1: Production-Ready ⭐⭐⭐⭐⭐
- Wikipedia API
- Hacker News Algolia
- Archive.org CDX
- GitHub API (with auth token)

### Tier 2: Good but Limited ⭐⭐⭐⭐
- Marginalia Search (indie results)
- DuckDuckGo Instant Answers (limited scope)
- Reddit JSON (with caching)

### Tier 3: Risk/Unknown ⭐⭐⭐
- Qwant API (undocumented)
- Wiby.me (poor docs)
- Common Crawl (too slow)

### Tier 4: Not Free/Dead ❌
- Brave Search (paid tier)
- Bing API (retired)
- Yandex, Startpage, Ecosia, Yahoo (no free access)

---

## HYBRID STRATEGY

**Recommended approach for production:**

```
1. Try Wikipedia API first (knowledge queries)
2. Try Hacker News Algolia (tech queries)
3. Fall back to GitHub (code queries)
4. Cache all results in KV for 1 hour
5. For general web search → use Brave ($5/month)
```

**Cost:** $5/month + free APIs
**Coverage:** 80% of use cases covered
**Reliability:** Very high

---

## GOTCHAS & WARNINGS

### Cloudflare IP Issues
Reddit and other scrapers may block Cloudflare's shared IP pool. Test with actual Worker IPs before assuming it works.

### Rate Limit Headers
Not all APIs document rate limits. Use response headers to detect:
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After`

### User-Agent Requirement
Many APIs require proper User-Agent. Always set:
```javascript
headers: { 'User-Agent': 'YourApp/1.0 (+yoursite.com)' }
```

### Shared Rate Limits
Marginalia's "public" key is shared across all users on that key. Heavy usage blocks everyone.

### Timeout Limits
Cloudflare Workers timeout after 30 seconds. Common Crawl queries can exceed this.

### CORS & Proxying
Wikipedia, GitHub, etc. may have CORS restrictions. Cloudflare Workers can bypass with server-side fetch, but verify headers.

---

## TESTING CHECKLIST

Before production, verify:

- [ ] API responds from actual Cloudflare Worker
- [ ] Rate limits documented or tested
- [ ] Response time < 5 seconds
- [ ] Error handling works (404, 429, 5xx)
- [ ] User-Agent header accepted
- [ ] JSON parsing doesn't fail on edge cases
- [ ] Cache headers honored (if applicable)
- [ ] No CORS issues from browser
- [ ] IP not blocked/rate-limited after 100 requests

---

## FINAL RECOMMENDATION

**Free Tier Only:** Wikipedia + Hacker News Algolia (covers 60% of needs)

**With $5/Month:** Brave Search + free APIs (covers 95% of needs)

**General web search without paying:** Not possible in 2026. Free SERP APIs are dead.
