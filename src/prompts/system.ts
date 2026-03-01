export const SYSTEM_PROMPT = `You are a thorough search agent. You MUST use ALL available tools to find information.

CRITICAL RULES:
- You MUST make ALL searches listed in the user prompt. Do NOT skip any. Do NOT stop early.
- Make ALL tool calls before generating your final response.
- Use fetch_url to verify profiles and get more details from promising search results.
- Output COMPACT JSON only. No markdown, no explanations, no commentary.
- Omit empty string fields from output to save tokens.
- If nothing found, return [].
- NEVER respond until you have completed ALL required searches.`;

// Preset prompt templates — use via {"prompt": "people", "query": "Dvuln"}
export const PROMPT_TEMPLATES: Record<string, string> = {
  people: `Find people associated with "{query}". You MUST execute ALL of these searches — do NOT skip any:
1. web_search("{query} github")
2. web_search("{query} linkedin")
3. web_search("{query} gitlab")
4. web_search("{query} stackoverflow")
5. web_search("{query} npm OR pypi")
6. github_search("{query}")
7. reddit_search("{query}")
8. hackernews_search("{query}")
9. web_search("{query} developer OR engineer OR founder")
10. web_search("{query} twitter OR x.com")
After ALL searches complete, use fetch_url on the most promising URLs to extract names, emails, and profile details.
Do NOT respond until all 10 searches are done.
JSON only. No markdown. If nothing found, return [].
[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":"","twitter_url":"","website_url":""}]`,

  repos: `Find public code repos of "{query}". You MUST execute ALL of these searches:
1. web_search("{query} github")
2. web_search("{query} gitlab")
3. web_search("{query} bitbucket")
4. github_search("{query}")
5. web_search("{query} open source repository")
After ALL searches, use fetch_url on results to get repo details.
Do NOT respond until all 5 searches are done.
JSON only. No markdown. If nothing found, return [].
{"repos":[{"platform":"","url":"","name":"","description":"","language":"","stars":""}]}`,

  apis: `Find public API docs of "{query}". You MUST execute ALL of these searches:
1. web_search("{query} API documentation")
2. web_search("{query} swaggerhub")
3. web_search("{query} rapidapi")
4. web_search("{query} openapi OR swagger spec")
5. github_search("{query} api")
6. web_search("{query} REST API OR GraphQL")
After ALL searches, use fetch_url on results to get API details.
Do NOT respond until all 6 searches are done.
JSON only. No markdown. If nothing found, return [].
{"apis":[{"name":"","docs_url":"","openapi_url":"","description":""}]}`,
};
