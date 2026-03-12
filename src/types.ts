import { Container } from "@cloudflare/containers";

export interface Env {
  AI: Ai;
  API_KEY: string;
  KV: KVNamespace;
  // Cloudflare Containers binding for open-webSearch
  SEARCH_CONTAINER: DurableObjectNamespace;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface AgentRequest {
  query: string;
  model?: string;
  prompt?: string; // preset template: "people", "repos", "apis"
  debug?: boolean; // return raw search results
}

// open-webSearch container running as a Cloudflare Container (Durable Object)
export class SearchContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "5m"; // sleep after 5 min idle to save costs

  override onStart() {
    console.log("open-webSearch container started");
  }

  override onStop() {
    console.log("open-webSearch container stopped");
  }

  override onError(error: unknown) {
    console.error("open-webSearch container error:", error);
  }
}
