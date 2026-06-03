interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Serper MCP — wraps the Serper Google Search API (serper.dev)
 *
 * Tools:
 * - search: Google web search — organic results, answer box, knowledge graph
 * - news:   Google News results
 * - places: Google Maps/local business results
 *
 * Dual key model: _apiKey is OPTIONAL. Pass your own Serper key for higher
 * limits, or omit to use the shared Pipeworx key (injected by the gateway).
 * Auth: POST with JSON body, header X-API-KEY: <apiKey>.
 */


const BASE_URL = 'https://google.serper.dev';

const API_KEY_PROP = {
  type: 'string',
  description:
    'Optional — your own Serper API key for higher limits; omit to use the shared Pipeworx key.',
} as const;

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Google web search — organic results, answer box, knowledge graph',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query, e.g. "best espresso machine 2026"',
        },
        num: {
          type: 'number',
          description: 'Number of results (default 10, max 20)',
        },
        gl: {
          type: 'string',
          description: 'Country code for geolocation, e.g. "us", "gb", "de"',
        },
        location: {
          type: 'string',
          description: 'Location string, e.g. "San Francisco, California, United States"',
        },
        _apiKey: API_KEY_PROP,
      },
      required: ['query'],
    },
  },
  {
    name: 'news',
    description: 'Google News results',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query, e.g. "federal reserve rate decision"',
        },
        num: {
          type: 'number',
          description: 'Number of results (default 10, max 20)',
        },
        gl: {
          type: 'string',
          description: 'Country code for geolocation, e.g. "us", "gb", "de"',
        },
        _apiKey: API_KEY_PROP,
      },
      required: ['query'],
    },
  },
  {
    name: 'places',
    description: 'Google Maps/local business results',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query, e.g. "coffee shops near union square"',
        },
        gl: {
          type: 'string',
          description: 'Country code for geolocation, e.g. "us", "gb", "de"',
        },
        location: {
          type: 'string',
          description: 'Location string, e.g. "San Francisco, California, United States"',
        },
        _apiKey: API_KEY_PROP,
      },
      required: ['query'],
    },
  },
];

function clampNum(num: unknown): number {
  const n = typeof num === 'number' ? num : 10;
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(20, Math.floor(n)));
}

async function serperPost(
  path: string,
  body: Record<string, unknown>,
  apiKey: string,
): Promise<unknown> {
  if (!apiKey) {
    return { error: 'api_key_required', message: 'No Serper key available.' };
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text };
  }

  return res.json();
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string;
  delete args._apiKey;

  switch (name) {
    case 'search':
      return search(args);
    case 'news':
      return news(args);
    case 'places':
      return places(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }

  async function search(a: Record<string, unknown>) {
    const query = a.query as string;
    const gl = a.gl as string | undefined;
    const location = a.location as string | undefined;
    const body = {
      q: query,
      num: clampNum(a.num),
      ...(gl ? { gl } : {}),
      ...(location ? { location } : {}),
    };
    const data = await serperPost('/search', body, apiKey);
    if (isErr(data)) return data;
    const d = data as {
      organic?: Array<{ title?: string; link?: string; snippet?: string; position?: number }>;
      answerBox?: unknown;
      knowledgeGraph?: unknown;
    };
    return {
      answer_box: d.answerBox ?? null,
      knowledge_graph: d.knowledgeGraph ?? null,
      organic: (d.organic || []).map((r) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: r.position,
      })),
    };
  }

  async function news(a: Record<string, unknown>) {
    const query = a.query as string;
    const gl = a.gl as string | undefined;
    const body = {
      q: query,
      num: clampNum(a.num),
      ...(gl ? { gl } : {}),
    };
    const data = await serperPost('/news', body, apiKey);
    if (isErr(data)) return data;
    const d = data as {
      news?: Array<{ title?: string; link?: string; snippet?: string; source?: string; date?: string }>;
    };
    return {
      news: (d.news || []).map((n) => ({
        title: n.title,
        link: n.link,
        snippet: n.snippet,
        source: n.source,
        date: n.date,
      })),
    };
  }

  async function places(a: Record<string, unknown>) {
    const query = a.query as string;
    const gl = a.gl as string | undefined;
    const location = a.location as string | undefined;
    const body = {
      q: query,
      ...(gl ? { gl } : {}),
      ...(location ? { location } : {}),
    };
    const data = await serperPost('/places', body, apiKey);
    if (isErr(data)) return data;
    const d = data as {
      places?: Array<{
        title?: string;
        address?: string;
        rating?: number;
        ratingCount?: number;
        category?: string;
        phoneNumber?: string;
        website?: string;
      }>;
    };
    return {
      places: (d.places || []).map((p) => ({
        title: p.title,
        address: p.address,
        rating: p.rating,
        ratingCount: p.ratingCount,
        category: p.category,
        phoneNumber: p.phoneNumber,
        website: p.website,
      })),
    };
  }
}

// serperPost returns an { error, message } object on key-missing or non-2xx;
// pass that straight through to the caller instead of mapping fields off it.
function isErr(data: unknown): data is { error: unknown; message: string } {
  return typeof data === 'object' && data !== null && 'error' in data;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
