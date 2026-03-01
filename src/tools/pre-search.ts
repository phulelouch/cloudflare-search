import { googleSearch, duckDuckGoSearch } from "./web-search";
import { githubSearch, hackerNewsSearch, redditSearch } from "./extra-search-sources";

// Try Google first, fall back to DDG (2 fetches worst case)
async function search(query: string): Promise<string> {
  const google = await googleSearch(query);
  if (google) return google;
  return duckDuckGoSearch(query);
}

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

// People search — first find company LinkedIn, then search for people
export async function preSearchPeople(query: string): Promise<string> {
  return runSearches([
    // Company LinkedIn overview (determine size + employee count)
    { label: "Company LinkedIn page", fn: () => search(`${query} site:linkedin.com/company`) },
    { label: "Company LinkedIn employees", fn: () => search(`${query} linkedin employees team size`) },
    { label: "Company LinkedIn people list", fn: () => search(`site:linkedin.com/in ${query}`) },
    // Individual LinkedIn profiles
    { label: "LinkedIn profiles", fn: () => search(`${query} linkedin profile developer engineer`) },
    { label: "LinkedIn leadership", fn: () => search(`${query} linkedin CTO founder CEO manager`) },
    // Code platforms
    { label: "GitHub + GitLab", fn: () => search(`${query} github gitlab profile`) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "StackOverflow + Bitbucket", fn: () => search(`${query} stackoverflow bitbucket profile`) },
    // Package registries
    { label: "npm + PyPI + DockerHub", fn: () => search(`${query} npmjs pypi dockerhub author`) },
    { label: "Other registries", fn: () => search(`${query} swaggerhub rubygems packagist crates.io codepen`) },
    // Social + general
    { label: "Twitter/X", fn: () => search(`${query} twitter x.com profile`) },
    { label: "General web", fn: () => search(`${query} developer engineer founder about team`) },
    { label: "Reddit", fn: () => redditSearch(query) },
    { label: "HackerNews", fn: () => hackerNewsSearch(query) },
  ]);
}

export async function preSearchRepos(query: string): Promise<string> {
  return runSearches([
    { label: "GitHub", fn: () => search(`${query} github repository`) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "GitLab + Bitbucket", fn: () => search(`${query} gitlab bitbucket repository`) },
    { label: "Open source", fn: () => search(`${query} open source repository`) },
  ]);
}

export async function preSearchApis(query: string): Promise<string> {
  return runSearches([
    { label: "API docs", fn: () => search(`${query} API documentation`) },
    { label: "SwaggerHub + RapidAPI", fn: () => search(`${query} swaggerhub rapidapi`) },
    { label: "OpenAPI/Swagger", fn: () => search(`${query} openapi swagger spec`) },
    { label: "GitHub API repos", fn: () => githubSearch(`${query} api`) },
  ]);
}
