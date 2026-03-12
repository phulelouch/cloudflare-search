import { OSINT_MASTER_PROMPT } from "./osint-master-prompt";

// Build the system prompt with target/org placeholders replaced
export function buildSystemPrompt(target: string, org: string): string {
  return OSINT_MASTER_PROMPT
    .replace(/\{\{TARGET\}\}/g, target)
    .replace(/\{\{ORG\}\}/g, org);
}

// Fallback for raw queries without target/org
export const SYSTEM_PROMPT = `You are Hackit, an AI OSINT reconnaissance agent. Use your tools to gather passive intelligence.

RULES:
- Search multiple times across different platforms to be thorough.
- Use fetch_url to visit promising URLs and extract details.
- Australian English in all output.
- Brand as Hackit — use "Hackit identified...", "Hackit discovered...".
- Document sources for every finding.
- Output structured findings with severity ratings.`;

// Synthesis prompts — used when search results are pre-fetched (template mode)
export const SYNTHESIS_PROMPTS: Record<string, string> = {
  people: `Below are search results for "{query}" across many platforms.

STEP 1: First, look at the "Company LinkedIn page" and "Company LinkedIn employees" results to determine the company size and how many people work at "{query}". Note the estimated_employee_count.

STEP 2: Then deeply analyze ALL results to extract every person found who is associated with "{query}". Go through every intricacy and detail.

IMPORTANT: Only include people actually related to "{query}". Verify each result contains the keyword "{query}" in the URL, title, or description. Discard unrelated results.

PRIORITY: LinkedIn results are the most important. For each person, prioritize extracting their LinkedIn URL, job title, company, and roles. Then fill in other platform URLs (GitHub, GitLab, etc.) from remaining results.

{results}

Output raw JSON only. NEVER use markdown. NEVER wrap in code blocks. NEVER use backticks. Just raw JSON.
Omit empty fields. If nothing found, return the structure with empty people array.
{"estimated_employee_count":"","company_linkedin_url":"","people":[{"name":"","work_email":"","roles":[],"github_url":"","gitlab_url":"","bitbucket_url":"","stackoverflow_url":"","dockerhub_url":"","pypi_url":"","npmjs_url":"","codepen_url":"","linkedin_url":"","swaggerhub_url":"","rubygems_url":"","packagist_url":"","crates_url":"","twitter_url":"","website_url":""}]}`,

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
