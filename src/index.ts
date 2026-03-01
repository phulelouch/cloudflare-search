import { webSearch } from "./tools/web-search";
import { fetchUrl } from "./tools/fetch-url";
import {
  wikipediaSearch,
  hackerNewsSearch,
  githubSearch,
  redditSearch,
  archiveSearch,
} from "./tools/extra-search-sources";
import { preSearchPeople, preSearchRepos, preSearchApis } from "./tools/pre-search";
import { SYSTEM_PROMPT, SYNTHESIS_PROMPTS } from "./prompts/system";
import type { Env, AgentRequest } from "./types";

const DEFAULT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const MAX_TOOL_ROUNDS = 10;

const ALLOWED_MODELS = [
  DEFAULT_MODEL,
  "@cf/meta/llama-3.1-8b-instruct-fast",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
];

const TOOLS_SCHEMA = [
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the internet for current information.",
      parameters: {
        type: "object",
        properties: {
          search_query: { type: "string", description: "The search query" },
        },
        required: ["search_query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fetch_url",
      description: "Fetch and read the text content of a webpage URL.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to fetch" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "wikipedia_search",
      description: "Search Wikipedia for knowledge and reference information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "github_search",
      description: "Search GitHub for repositories and code projects.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "hackernews_search",
      description: "Search Hacker News for tech news and discussions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "reddit_search",
      description: "Search Reddit for discussions and community posts.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "archive_search",
      description: "Search Archive.org for historical website snapshots.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The domain or URL" },
        },
        required: ["query"],
      },
    },
  },
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Execute a tool call
async function executeTool(
  name: string,
  args: Record<string, string>,
  env: Env
): Promise<string> {
  switch (name) {
    case "web_search":
      return await webSearch(args.search_query, env);
    case "fetch_url":
      return await fetchUrl(args.url);
    case "wikipedia_search":
      return await wikipediaSearch(args.query);
    case "github_search":
      return await githubSearch(args.query);
    case "hackernews_search":
      return await hackerNewsSearch(args.query);
    case "reddit_search":
      return await redditSearch(args.query);
    case "archive_search":
      return await archiveSearch(args.query);
    default:
      return `Unknown tool: ${name}`;
  }
}

// Pre-search runners for each template
const PRE_SEARCH_RUNNERS: Record<string, (q: string) => Promise<string>> = {
  people: preSearchPeople,
  repos: preSearchRepos,
  apis: preSearchApis,
};

// Template mode: pre-execute searches, then ask model to synthesize
async function handleTemplateQuery(
  query: string,
  template: string,
  model: string,
  env: Env
): Promise<string> {
  // Run all searches in parallel (uses DDG only to stay under subrequest limit)
  const runner = PRE_SEARCH_RUNNERS[template];
  const searchResults = await runner(query);

  // Build synthesis prompt with results injected
  const synthesisPrompt = SYNTHESIS_PROMPTS[template]
    .replace(/\{query\}/g, query)
    .replace(/\{results\}/g, searchResults);

  const aiResponse = (await env.AI.run(model as any, {
    messages: [
      { role: "system", content: "You analyze search results and output JSON only. No markdown, no explanations, no commentary." },
      { role: "user", content: synthesisPrompt },
    ],
  })) as any;

  return aiResponse.response || aiResponse.content || "[]";
}

// Raw query mode: model uses tool calling loop
async function handleRawQuery(
  query: string,
  model: string,
  env: Env
): Promise<string> {
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: query },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const aiResponse = (await env.AI.run(model as any, {
      messages,
      tools: TOOLS_SCHEMA,
    })) as any;

    if (aiResponse.response && (!aiResponse.tool_calls || aiResponse.tool_calls.length === 0)) {
      return aiResponse.response;
    }

    if (!aiResponse.tool_calls || aiResponse.tool_calls.length === 0) {
      return aiResponse.response || aiResponse.content || "No response generated.";
    }

    messages.push({ role: "assistant", tool_calls: aiResponse.tool_calls });

    for (const toolCall of aiResponse.tool_calls) {
      const name = toolCall.name || toolCall.function?.name;
      const rawArgs = toolCall.arguments || toolCall.function?.arguments;
      const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
      const result = await executeTool(name, args, env);
      messages.push({ role: "tool", name, content: result });
    }
  }

  return "Max tool rounds reached.";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: 'POST required. Send { "query": "your question" }' },
        { status: 405 }
      );
    }

    if (env.API_KEY && request.headers.get("x-api-key") !== env.API_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: AgentRequest;
    try {
      body = (await request.json()) as AgentRequest;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.query || typeof body.query !== "string") {
      return Response.json({ error: "Missing 'query' field" }, { status: 400 });
    }
    if (body.query.length > 10000) {
      return Response.json({ error: "Query too long (max 10000 chars)" }, { status: 400 });
    }

    const model = ALLOWED_MODELS.includes(body.model || "")
      ? body.model!
      : DEFAULT_MODEL;

    try {
      let response: string;

      if (body.prompt && SYNTHESIS_PROMPTS[body.prompt]) {
        // Template mode: pre-search + synthesize
        response = await handleTemplateQuery(body.query, body.prompt, model, env);
      } else {
        // Raw query mode: tool calling loop
        response = await handleRawQuery(body.query, model, env);
      }

      return Response.json(
        { response, model },
        { headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    } catch (err: any) {
      return Response.json(
        { error: err.message || "Internal error" },
        { status: 500 }
      );
    }
  },
};
