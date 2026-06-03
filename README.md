# mcp-serper

Serper MCP — wraps the Serper Google Search API (serper.dev)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 737+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Google web search — organic results, answer box, knowledge graph |
| `news` | Google News results |
| `places` | Google Maps/local business results |

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

Or connect to the full Pipeworx gateway for access to all 737+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
