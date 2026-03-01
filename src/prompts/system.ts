export const SYSTEM_PROMPT = `You are a search agent with access to tools. Use your tools to find information.

RULES:
- Search multiple times across different platforms to be thorough.
- Use fetch_url to visit promising URLs and extract details.
- Output raw JSON only. NEVER use markdown. NEVER wrap in code blocks. NEVER use backticks.
- Omit empty fields. If nothing found, return [].`;

// Synthesis prompts — used when search results are pre-fetched
export const SYNTHESIS_PROMPTS: Record<string, string> = {
  people: `Below are search results for "{query}" across many platforms. Deeply analyze every result and extract ALL people found. Go through every intricacy and detail.

IMPORTANT: Only include results that are actually related to "{query}". Verify each result contains the keyword "{query}" in the URL, title, or description. Discard unrelated results.

For each person found, extract as many fields as possible. Focus especially on LinkedIn for professional roles, companies, and work history.

{results}

Output raw JSON array only. NEVER use markdown. NEVER wrap in code blocks. NEVER use backticks. Just raw JSON.
Omit empty fields. If nothing found, return [].
[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":"","twitter_url":"","website_url":""}]`,

  repos: `Below are search results for "{query}" repositories. Deeply analyze every result and extract ALL repositories found.

IMPORTANT: Only include repos that are actually related to "{query}". Verify each result contains the keyword "{query}" in the URL, name, or description. Discard unrelated results.

{results}

Output raw JSON only. NEVER use markdown. NEVER wrap in code blocks. NEVER use backticks. Just raw JSON.
Omit empty fields. If nothing found, return {"repos":[]}.
{"repos":[{"platform":"","url":"","name":"","description":"","language":"","stars":""}]}`,

  apis: `Below are search results for "{query}" APIs. Deeply analyze every result and extract ALL API documentation found.

IMPORTANT: Only include APIs that are actually related to "{query}". Verify each result contains the keyword "{query}" in the URL, name, or description. Discard unrelated results.

{results}

Output raw JSON only. NEVER use markdown. NEVER wrap in code blocks. NEVER use backticks. Just raw JSON.
Omit empty fields. If nothing found, return {"apis":[]}.
{"apis":[{"name":"","docs_url":"","openapi_url":"","description":""}]}`,
};
