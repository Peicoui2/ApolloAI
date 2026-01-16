import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mocks for external libs used by ChatGPTService
vi.mock('@langchain/community/vectorstores/supabase', () => ({
  SupabaseVectorStore: class {
    constructor(embeddings, opts) {
      this.embeddings = embeddings;
      this.opts = opts;
      this._docs = [];
    }
    async addDocuments(docs) { this._docs.push(...docs); }
  async similaritySearch() { return [{ pageContent: 'mock doc content' }]; }
  }
}));

vi.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: class {
    constructor(opts) { this.opts = opts; }
  }
}));

vi.mock('langchain/text_splitter', () => ({
  RecursiveCharacterTextSplitter: class {
    constructor(opts) { this.opts = opts; }
    async createDocuments(chunks) { return chunks.map((c, i) => ({ pageContent: c, id: i })); }
  }
}));

// Mock supabase client and business config
vi.mock('../../main', () => ({
  supabase: {
    from: () => ({ delete: async () => ({}) })
  }
}), { virtual: true });

vi.mock('../../config/business.config', () => ({
  businessConfig: {
    business: { name: 'Biz', industry: 'Tech', tagline: 'We do stuff', yearFounded: 2020 },
    contact: { address: 'Addr', phone: '123', email: 'a@b.com', website: 'http://', hours: { weekdays: '9-5', saturday: '10-2', sunday: 'closed' } },
    offerings: { mainServices: [{ name: 'S1', description: 'D1', priceRange: '$', deliveryTime: '1d' }] },
    company: { mission: 'M', values: ['v1'], uniqueSellingPoints: ['usp1'] },
    faq: [{ question: 'Q', answer: 'A' }],
    policies: { payment: { methods: ['card'], terms: 't', refund: 'r' }, support: { channels: ['email'], responseTime: '24h' } }
  }
}), { virtual: true });

import { ChatGPTService } from '../../services/ChatGPTService';

describe('ChatGPTService (unit)', () => {
  let origFetch;

  beforeEach(() => {
    origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '  respuesta desde openai  ' } }] })
    });
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    vi.resetAllMocks();
  });

  it('formatSection builds a section string', () => {
    const svc = new ChatGPTService('key');
    const out = svc.formatSection('Titulo', { A: '1', B: '2' });
    expect(out).toContain('Titulo');
    expect(out).toContain('A: 1');
    expect(out).toContain('B: 2');
  });

  it('ask returns content from mocked fetch and uses vectorStore similaritySearch', async () => {
    const svc = new ChatGPTService('key');
    // inject a fake vectorStore with similaritySearch
    svc.vectorStore = { similaritySearch: vi.fn().mockResolvedValue([{ pageContent: 'doc1' }]) };

  const res = await svc.ask([{ sender: 'User', message: 'Hola' }], 'sistema');
  // ask returns the raw content from the API mock (not trimmed)
  expect(res).toBe('  respuesta desde openai  ');
    expect(svc.vectorStore.similaritySearch).toHaveBeenCalled();
  expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('formatInput uses ask and trims result', async () => {
    const svc = new ChatGPTService('key');
    svc.ask = vi.fn().mockResolvedValue('  resultado ');
    const out = await svc.formatInput('texto', 'FORMATO');
    expect(out).toBe('resultado');
    expect(svc.ask).toHaveBeenCalled();
  });

  it('classifyMessage returns trimmed classifier output', async () => {
    const svc = new ChatGPTService('key');
    svc.ask = vi.fn().mockResolvedValue('  PROGRAMAR  ');
    const out = await svc.classifyMessage({ message: 'Quiero una cita' });
    expect(out).toBe('PROGRAMAR');
  });
});
