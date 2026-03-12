import { search } from "./web-search";
import { githubSearch, hackerNewsSearch, redditSearch } from "./extra-search-sources";
import type { Env } from "../types";

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

// People search — LinkedIn-focused, multi-platform
export async function preSearchPeople(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "Company LinkedIn", fn: () => search(`${query} site:linkedin.com/company`, env) },
    { label: "LinkedIn employees", fn: () => search(`${query} linkedin employees team people`, env) },
    { label: "LinkedIn profiles", fn: () => search(`site:linkedin.com/in ${query}`, env) },
    { label: "LinkedIn leadership", fn: () => search(`${query} linkedin CTO founder CEO engineer`, env) },
    { label: "Company website", fn: () => search(`${query} official website about`, env) },
    { label: "GitHub + GitLab", fn: () => search(`${query} github gitlab profile`, env) },
    { label: "GitHub API", fn: () => githubSearch(query) },
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
