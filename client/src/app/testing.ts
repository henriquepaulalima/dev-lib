import { CatalogEntry, ComponentExample, EntryDetails } from './models/library-entry';

// jsdom does not implement modal dialogs or the clipboard, which these components use.
export function installBrowserStubs(): { writeText: ReturnType<typeof vi.fn> } {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.open = true; };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.open = false; };
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  return { writeText };
}

export const catalogEntry = (overrides: Partial<CatalogEntry> = {}): CatalogEntry => ({
  slug: 'dialog',
  type: 'component',
  title: 'Dialog',
  summary: 'A native dialog.',
  tags: ['overlay', 'a11y', 'modal', 'extra'],
  subcomponents: [],
  ...overrides
});

export const componentExample = (overrides: Partial<ComponentExample> = {}): ComponentExample => ({
  slug: 'basic',
  title: 'Basic <dialog> & "friends"',
  description: 'Example',
  source: { html: '<button>Open</button>', css: 'button { color: red; }', javascript: 'export const ready = true;' },
  ...overrides
});

export const featureDetails = (): EntryDetails => ({
  catalog: catalogEntry({ slug: 'websocket', type: 'feature', title: 'WebSocket' }),
  content: {
    slug: 'websocket',
    overview: 'Realtime',
    sections: [{ heading: 'Fallback', body: 'Body' }],
    dependencies: [],
    feature: {
      sources: [],
      variants: ['reconnect', 'heartbeat'].map((slug) => ({
        slug,
        title: slug,
        summary: slug,
        guides: {
          javascript: { introduction: '', dependencies: [], sections: [{ heading: `${slug} js`, body: '', code: 'const a = 1;', language: 'javascript' }] },
          typescript: { introduction: '', dependencies: [], sections: [{ heading: `${slug} ts`, body: '', code: 'const a: number = 1;', language: 'typescript' }] },
          go: { introduction: '', dependencies: [], sections: [{ heading: `${slug} go`, body: '', code: 'a := 1', language: 'go' }] },
          csharp: { introduction: '', dependencies: [], sections: [{ heading: `${slug} cs`, body: '', code: 'var a = 1;', language: 'unknown' }] }
        }
      }))
    }
  }
} as EntryDetails);
