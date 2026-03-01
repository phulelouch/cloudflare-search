export const SYSTEM_PROMPT = `You are a thorough search agent with access to tools. Use your tools to find information.

RULES:
- Use your tools to search. Do NOT write out tool calls as text.
- Search multiple times across different platforms to be thorough.
- Use fetch_url to visit promising URLs and extract details.
- After all searching is done, output COMPACT JSON only. No markdown, no explanations.
- Omit empty fields. If nothing found, return [].`;

// Preset prompt templates — use via {"prompt": "people", "query": "Dvuln"}
export const PROMPT_TEMPLATES: Record<string, string> = {
  people: `Deeply investigate "{query}" and find ALL people associated with it. Go through everything in great detail and uncover every intricacy.

Search for "{query}" on each of these platforms separately:
- LinkedIn profiles and professional history
- GitHub profiles and repositories
- GitLab profiles
- Bitbucket profiles
- StackOverflow profiles
- npm package authors
- PyPI package authors
- DockerHub profiles
- CodePen profiles
- SwaggerHub profiles
- RubyGems authors
- Packagist authors
- crates.io authors
- Twitter / X profiles
- General web presence (developer, engineer, founder, CTO)

Also use github_search, reddit_search, and hackernews_search tools directly.

After searching, use fetch_url on every promising URL to deeply extract names, emails, roles, and profile details. Go through every intricacy — check profile pages, contribution pages, about pages. Focus especially on LinkedIn for professional roles, companies, and work history.

Output JSON array only:
[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":"","twitter_url":"","website_url":""}]`,

  repos: `Deeply investigate and find ALL public code repositories of "{query}". Go through everything in great detail.

Search for "{query}" repos on each platform separately:
- GitHub repositories
- GitLab repositories
- Bitbucket repositories
- General open source repositories

Also use the github_search tool directly.

After searching, use fetch_url on results to deeply extract repo details and intricacies.

Output JSON only:
{"repos":[{"platform":"","url":"","name":"","description":"","language":"","stars":""}]}`,

  apis: `Deeply investigate and find ALL public API documentation for "{query}". Go through everything in great detail.

Search for "{query}" APIs on each platform separately:
- API documentation pages
- SwaggerHub specs
- RapidAPI listings
- OpenAPI / Swagger specs
- REST API and GraphQL endpoints

Also use the github_search tool directly for API repos.

After searching, use fetch_url on results to deeply extract API details and intricacies.

Output JSON only:
{"apis":[{"name":"","docs_url":"","openapi_url":"","description":""}]}`,
};
