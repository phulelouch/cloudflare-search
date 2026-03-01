export const SYSTEM_PROMPT = `You search for publicly available information. Output JSON only. No markdown, no explanations. If nothing found, return [].`;

// Preset prompt templates — use via {"prompt": "people", "query": "Dvuln"}
export const PROMPT_TEMPLATES: Record<string, string> = {
  people: `Search for people at "{query}". Find profiles on GitHub, GitLab, LinkedIn, StackOverflow, npm, PyPI. JSON only. No markdown. If nothing found, return [].
[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":""}]`,

  repos: `Search for public code repos of "{query}" on GitHub, GitLab, Bitbucket. JSON only. No markdown. If nothing found, return [].
{"repos":[{"platform":"","url":"","name":"","description":"","language":""}]}`,

  apis: `Search for public API docs of "{query}" on SwaggerHub, RapidAPI, or their website. JSON only. No markdown. If nothing found, return [].
{"apis":[{"name":"","docs_url":"","openapi_url":"","description":""}]}`,
};
