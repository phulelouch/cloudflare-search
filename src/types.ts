export interface Env {
  AI: Ai;
  BRAVE_API_KEY: string;
  API_KEY: string;
  KV: KVNamespace;
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
