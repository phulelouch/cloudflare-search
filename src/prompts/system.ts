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
  people: `Deeply investigate and find ALL people associated with "{query}". Go through everything in great detail and uncover every intricacy.

You MUST execute ALL of these searches — do NOT skip any:
1. web_search("{query} linkedin profile")
2. web_search("{query} linkedin developer engineer")
3. web_search("{query} github profile")
4. web_search("{query} gitlab profile")
5. web_search("{query} stackoverflow profile")
6. web_search("{query} npmjs package author")
7. web_search("{query} pypi package author")
8. web_search("{query} dockerhub")
9. web_search("{query} codepen")
10. web_search("{query} swaggerhub")
11. web_search("{query} rubygems author")
12. web_search("{query} packagist author")
13. web_search("{query} crates.io author")
14. web_search("{query} bitbucket profile")
15. web_search("{query} twitter OR x.com")
16. web_search("{query} developer OR engineer OR founder OR CTO")
17. github_search("{query}")
18. reddit_search("{query}")
19. hackernews_search("{query}")

After ALL searches complete, deeply investigate each result. Use fetch_url on EVERY promising URL to extract names, emails, roles, and profile details in great detail. Go through every intricacy — check profile pages, contribution pages, about pages, and README files.

Focus especially on LinkedIn — search deeply for their professional profiles, roles, companies, and work history.

Do NOT respond until ALL 19 searches are done and you have fetched details from promising results.
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
