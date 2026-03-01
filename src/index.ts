import { runWithTools } from "@cloudflare/ai-utils";
import { webSearch } from "./tools/web-search";
import { fetchUrl } from "./tools/fetch-url";
import { SYSTEM_PROMPT } from "./prompts/system";
import type { Env, AgentRequest } from "./types";

const DEFAULT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const ALLOWED_MODELS = [
  DEFAULT_MODEL,
  "@cf/meta/llama-3.1-8b-instruct-fast",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
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
      return Response.json({ error: "Missing 'query' field" }, { status: 400 });
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
      const response = await runWithTools(
        env.AI,
        model,
        {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: body.query },
          ],
          tools: [
            {
              name: "web_search",
              description:
                "Search the internet for current information. Returns top 5 results with titles, URLs, and snippets.",
              parameters: {
                type: "object" as const,
                properties: {
                  search_query: {
                    type: "string",
                    description: "The search query to look up on the internet",
                  },
                },
                required: ["search_query"],
              },
              function: async ({
                search_query,
              }: {
                search_query: string;
              }) => {
                return await webSearch(search_query, env);
              },
            },
            {
              name: "fetch_url",
              description:
                "Fetch and read the full text content of a specific webpage URL.",
              parameters: {
                type: "object" as const,
                properties: {
                  url: {
                    type: "string",
                    description: "The complete URL to fetch",
                  },
                },
                required: ["url"],
              },
              function: async ({ url }: { url: string }) => {
                return await fetchUrl(url);
              },
            },
          ],
        },
        {
          maxRecursiveToolRuns: 5,
          strictValidation: false,
        }
      );

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
