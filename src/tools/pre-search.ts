import { webSearch } from "./web-search";
import { githubSearch, hackerNewsSearch, redditSearch } from "./extra-search-sources";
import { fetchUrl } from "./fetch-url";
import type { Env } from "../types";

// Execute all searches for a template in parallel, return combined results
async function runSearches(
  queries: { label: string; fn: () => Promise<string> }[]
): Promise<string> {
  const results = await Promise.allSettled(queries.map((q) => q.fn()));
  return queries
    .map((q, i) => {
      const r = results[i];
      const value = r.status === "fulfilled" ? r.value : "Search failed.";
      return `=== ${q.label} ===\n${value}`;
    })
    .join("\n\n");
}

// Pre-execute all people-related searches
export async function preSearchPeople(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "LinkedIn", fn: () => webSearch(`${query} linkedin profile`, env) },
    { label: "LinkedIn roles", fn: () => webSearch(`${query} linkedin developer engineer CTO`, env) },
    { label: "GitHub web", fn: () => webSearch(`${query} github profile`, env) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "GitLab", fn: () => webSearch(`${query} gitlab profile`, env) },
    { label: "Bitbucket", fn: () => webSearch(`${query} bitbucket profile`, env) },
    { label: "StackOverflow", fn: () => webSearch(`${query} stackoverflow profile`, env) },
    { label: "npm", fn: () => webSearch(`${query} npmjs package author`, env) },
    { label: "PyPI", fn: () => webSearch(`${query} pypi package author`, env) },
    { label: "DockerHub", fn: () => webSearch(`${query} dockerhub`, env) },
    { label: "CodePen", fn: () => webSearch(`${query} codepen`, env) },
    { label: "SwaggerHub", fn: () => webSearch(`${query} swaggerhub`, env) },
    { label: "RubyGems", fn: () => webSearch(`${query} rubygems author`, env) },
    { label: "Packagist", fn: () => webSearch(`${query} packagist author`, env) },
    { label: "crates.io", fn: () => webSearch(`${query} crates.io author`, env) },
    { label: "Twitter/X", fn: () => webSearch(`${query} twitter OR x.com`, env) },
    { label: "General", fn: () => webSearch(`${query} developer engineer founder`, env) },
    { label: "Reddit", fn: () => redditSearch(query) },
    { label: "HackerNews", fn: () => hackerNewsSearch(query) },
  ]);
}

// Pre-execute all repo-related searches
export async function preSearchRepos(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "GitHub web", fn: () => webSearch(`${query} github repository`, env) },
    { label: "GitHub API", fn: () => githubSearch(query) },
    { label: "GitLab", fn: () => webSearch(`${query} gitlab repository`, env) },
    { label: "Bitbucket", fn: () => webSearch(`${query} bitbucket repository`, env) },
    { label: "Open source", fn: () => webSearch(`${query} open source repository`, env) },
  ]);
}

// Pre-execute all API-related searches
export async function preSearchApis(query: string, env: Env): Promise<string> {
  return runSearches([
    { label: "API docs", fn: () => webSearch(`${query} API documentation`, env) },
    { label: "SwaggerHub", fn: () => webSearch(`${query} swaggerhub`, env) },
    { label: "RapidAPI", fn: () => webSearch(`${query} rapidapi`, env) },
    { label: "OpenAPI/Swagger", fn: () => webSearch(`${query} openapi swagger spec`, env) },
    { label: "GitHub API repos", fn: () => githubSearch(`${query} api`) },
    { label: "REST/GraphQL", fn: () => webSearch(`${query} REST API GraphQL`, env) },
  ]);
}
