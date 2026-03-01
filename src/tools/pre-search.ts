import { duckDuckGoSearch } from "./web-search";
import { githubSearch, hackerNewsSearch, redditSearch } from "./extra-search-sources";

// Execute all searches in parallel, return combined results
async function runSearches(
  queries: { label: string; fn: () => Promise<string | null> }[]
): Promise<string> {
  const results = await Promise.allSettled(queries.map((q) => q.fn()));
  return queries
    .map((q, i) => {
      const r = results[i];
      const value = r.status === "fulfilled" && r.value ? r.value : "No results.";
      return `=== ${q.label} ===\n${value}`;
    })
    .join("\n\n");
}

// Use DDG only (1 fetch per search) to stay under Cloudflare's 50 subrequest limit
// Combined related platforms into fewer searches to reduce total fetches

export async function preSearchPeople(query: string): Promise<string> {
  return runSearches([
    { label: "LinkedIn", fn: () => duckDuckGoSearch(`${query} linkedin profile`) },
    { label: "LinkedIn roles", fn: () => duckDuckGoSearch(`${query} linkedin developer engineer CTO`) },
    { label: "GitHub + GitLab", fn: () => duckDuckGoSearch(`${query} github gitlab profile`) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "Bitbucket + StackOverflow", fn: () => duckDuckGoSearch(`${query} bitbucket stackoverflow profile`) },
    { label: "npm + PyPI", fn: () => duckDuckGoSearch(`${query} npmjs pypi package author`) },
    { label: "DockerHub + CodePen", fn: () => duckDuckGoSearch(`${query} dockerhub codepen`) },
    { label: "SwaggerHub + RubyGems + Packagist + crates.io", fn: () => duckDuckGoSearch(`${query} swaggerhub rubygems packagist crates.io`) },
    { label: "Twitter/X", fn: () => duckDuckGoSearch(`${query} twitter x.com`) },
    { label: "General", fn: () => duckDuckGoSearch(`${query} developer engineer founder`) },
    { label: "Reddit", fn: () => redditSearch(query) },
    { label: "HackerNews", fn: () => hackerNewsSearch(query) },
  ]);
}

export async function preSearchRepos(query: string): Promise<string> {
  return runSearches([
    { label: "GitHub", fn: () => duckDuckGoSearch(`${query} github repository`) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "GitLab + Bitbucket", fn: () => duckDuckGoSearch(`${query} gitlab bitbucket repository`) },
    { label: "Open source", fn: () => duckDuckGoSearch(`${query} open source repository`) },
  ]);
}

export async function preSearchApis(query: string): Promise<string> {
  return runSearches([
    { label: "API docs", fn: () => duckDuckGoSearch(`${query} API documentation`) },
    { label: "SwaggerHub + RapidAPI", fn: () => duckDuckGoSearch(`${query} swaggerhub rapidapi`) },
    { label: "OpenAPI/Swagger", fn: () => duckDuckGoSearch(`${query} openapi swagger spec`) },
    { label: "GitHub API repos", fn: () => githubSearch(`${query} api`) },
  ]);
}
