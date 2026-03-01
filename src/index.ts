import { webSearch } from "./tools/web-search";
import { fetchUrl } from "./tools/fetch-url";
import { SYSTEM_PROMPT, PROMPT_TEMPLATES } from "./prompts/system";
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
      description:
        "Search the internet for current information. Returns top 5 results.",
      parameters: {
        type: "object",
        properties: {
          search_query: {
            type: "string",
            description: "The search query",
          },
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
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Execute a tool call and return the result
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
    default:
      return `Unknown tool: ${name}`;
  }
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

    let body: AgentRequest;
    try {
      body = (await request.json()) as AgentRequest;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.query || typeof body.query !== "string") {
      return Response.json(
        { error: "Missing 'query' field" },
        { status: 400 }
      );
    }
    if (body.query.length > 2000) {
      return Response.json(
        { error: "Query too long (max 2000 chars)" },
        { status: 400 }
      );
    }

    const model = ALLOWED_MODELS.includes(body.model || "")
      ? body.model!
      : DEFAULT_MODEL;

    try {
      // Build user message from template or raw query
      const template = body.prompt ? PROMPT_TEMPLATES[body.prompt] : null;
      const userMessage = template
        ? template.replace(/\{query\}/g, body.query)
        : body.query;

      const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ];

      let finalResponse = "";

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const aiResponse = (await env.AI.run(model as any, {
          messages,
          tools: TOOLS_SCHEMA,
          max_tokens: 2048,
        })) as any;

        // If model returns text content with no tool calls, we're done
        if (aiResponse.response && (!aiResponse.tool_calls || aiResponse.tool_calls.length === 0)) {
          finalResponse = aiResponse.response;
          break;
        }

        // If no tool calls and no response, bail
        if (!aiResponse.tool_calls || aiResponse.tool_calls.length === 0) {
          finalResponse =
            aiResponse.response || aiResponse.content || "No response generated.";
          break;
        }

        // Add assistant message with tool calls to conversation
        messages.push({
          role: "assistant",
          tool_calls: aiResponse.tool_calls,
        });

        // Execute each tool call and add results
        for (const toolCall of aiResponse.tool_calls) {
          // Handle both flat (name, arguments) and nested (function.name, function.arguments)
          const name = toolCall.name || toolCall.function?.name;
          const rawArgs = toolCall.arguments || toolCall.function?.arguments;
          const args =
            typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

          const result = await executeTool(name, args, env);

          messages.push({
            role: "tool",
            name: name,
            content: result,
          });
        }
      }

      return Response.json(
        { response: finalResponse, model },
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
