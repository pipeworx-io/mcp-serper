# mcp-serper

Serper MCP — wraps the Serper Google Search API (serper.dev)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Google web search via Serper: returns organic results (title, link, snippet, position), an answer box if present, and a knowledge graph summary. Accepts query, result count (max 20), and optional country code (gl) and location for geo-targeted results. |
| `news` | Google News search via Serper: returns recent news articles (title, link, snippet, source, date) matching the query. Accepts query, result count (max 20), and optional country code (gl). |
| `places` | Google Maps local business search via Serper: returns matching places with title, address, rating, review count, category, phone number, and website. Accepts query plus optional country code (gl) and location string for geo-targeting. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "serper": {
      "url": "https://gateway.pipeworx.io/serper/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Serper data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
