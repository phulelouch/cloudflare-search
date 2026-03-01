import { braveSearch, duckDuckGoSearch } from "./web-search";
import { githubSearch, hackerNewsSearch, redditSearch } from "./extra-search-sources";
import { fetchUrl } from "./fetch-url";
import type { Env } from "../types";

// Use Brave API (actually works from Workers), fall back to DDG
async function search(query: string, env: Env): Promise<string | null> {
  if (env.BRAVE_API_KEY) {
    const brave = await braveSearch(query, env);
    if (brave) return brave;
  }
  const ddg = await duckDuckGoSearch(query);
  return ddg || null;
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

// People search — LinkedIn-focused, uses Brave API for reliable results
export async function preSearchPeople(query: string, env: Env): Promise<string> {
  return runSearches([
    // LinkedIn focus (company + people)
    { label: "Company LinkedIn", fn: () => search(`${query} site:linkedin.com/company`, env) },
    { label: "LinkedIn employees", fn: () => search(`${query} linkedin employees team people`, env) },
    { label: "LinkedIn profiles", fn: () => search(`site:linkedin.com/in ${query}`, env) },
    { label: "LinkedIn leadership", fn: () => search(`${query} linkedin CTO founder CEO engineer`, env) },
    // Direct URL fetch (try company LinkedIn page directly)
    { label: "Company website", fn: () => fetchUrl(`https://dvuln.com`) },
    // Code platforms
    { label: "GitHub + GitLab", fn: () => search(`${query} github gitlab profile`, env) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    // Social + general
    { label: "Twitter/X", fn: () => search(`${query} twitter x.com`, env) },
    { label: "General web", fn: () => search(`${query} team about developer engineer founder`, env) },
    { label: "Reddit", fn: () => redditSearch(query) },
    { label: "HackerNews", fn: () => hackerNewsSearch(query) },
  ]);
}

export async function preSearchRepos(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "GitHub", fn: () => search(`${query} github repository`, env) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "GitLab + Bitbucket", fn: () => search(`${query} gitlab bitbucket repository`, env) },
    { label: "Open source", fn: () => search(`${query} open source repository`, env) },
  ]);
}

export async function preSearchApis(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "API docs", fn: () => search(`${query} API documentation`, env) },
    { label: "SwaggerHub + RapidAPI", fn: () => search(`${query} swaggerhub rapidapi`, env) },
    { label: "OpenAPI/Swagger", fn: () => search(`${query} openapi swagger spec`, env) },
    { label: "GitHub API repos", fn: () => githubSearch(`${query} api`) },
  ]);
}
