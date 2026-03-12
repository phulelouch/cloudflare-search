# open-webSearch container for Cloudflare Containers
FROM ghcr.io/aas-ee/open-web-search:latest

ENV MODE=http
ENV PORT=3000
ENV DEFAULT_SEARCH_ENGINE=duckduckgo
ENV ALLOWED_SEARCH_ENGINES=bing,duckduckgo
ENV ENABLE_CORS=false

EXPOSE 3000
