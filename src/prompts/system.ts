export const SYSTEM_PROMPT = `You search for publicly available information using web_search and fetch_url tools.

IMPORTANT RULES:
- Make MULTIPLE searches across different platforms to be thorough.
- Use fetch_url to verify profiles and get more details from search results.
- Output JSON only. No markdown, no explanations, no commentary.
- If nothing found, return [].`;

// Preset prompt templates — use via {"prompt": "people", "query": "Dvuln"}
export const PROMPT_TEMPLATES: Record<string, string> = {
  people: `Search for people at "{query}". You MUST make separate searches for EACH platform:
1. web_search("{query} site:github.com")
2. web_search("{query} site:linkedin.com")
3. web_search("{query} site:gitlab.com")
4. web_search("{query} site:stackoverflow.com")
5. web_search("{query} npm OR pypi contributors")
Then use fetch_url on promising results to get names and details.
JSON only. No markdown. If nothing found, return [].
[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":""}]`,

  repos: `Search for public code repos of "{query}". You MUST search each platform separately:
1. web_search("{query} site:github.com")
2. web_search("{query} site:gitlab.com")
3. web_search("{query} site:bitbucket.org")
Then use fetch_url on results to get repo details.
JSON only. No markdown. If nothing found, return [].
{"repos":[{"platform":"","url":"","name":"","description":"","language":""}]}`,

  apis: `Search for public API docs of "{query}". You MUST search separately:
1. web_search("{query} API documentation")
2. web_search("{query} site:swaggerhub.com")
3. web_search("{query} site:rapidapi.com")
4. web_search("{query} openapi OR swagger")
Then use fetch_url on results to get API details.
JSON only. No markdown. If nothing found, return [].
{"apis":[{"name":"","docs_url":"","openapi_url":"","description":""}]}`,
};
