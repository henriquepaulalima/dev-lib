import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  signal,
  viewChild
} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { ComponentExample } from '../../models/library-entry';

hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

type SourceFile = 'html' | 'css' | 'javascript';
type ScriptLanguage = 'javascript' | 'typescript';
type PreviewViewport = 'responsive' | 'tablet' | 'mobile';

interface PreviewMessage {
  source: 'dev-lib-preview';
  sessionId: string;
  type: 'ready' | 'error';
  message?: string;
}

@Component({
  selector: 'app-component-preview',
  templateUrl: './component-preview.html',
  styleUrl: './component-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentPreview {
  private readonly previewFrame = viewChild<ElementRef<HTMLIFrameElement>>('previewFrame');
  private readonly renderVersion = signal(0);
  private sessionId = '';

  readonly example = input.required<ComponentExample>();
  readonly selectedFile = signal<SourceFile>('html');
  readonly scriptLanguage = signal<ScriptLanguage>('javascript');
  readonly viewport = signal<PreviewViewport>('responsive');
  readonly sessionStatus = signal<'loading' | 'ready' | 'error'>('loading');
  readonly runtimeError = signal('');
  readonly copied = signal(false);

  readonly selectedSource = computed(() => {
    const source = this.example().source;
    if (this.selectedFile() !== 'javascript') return source[this.selectedFile()];
    if (this.scriptLanguage() === 'typescript' && source.typescript) return source.typescript;
    return source.javascript;
  });
  readonly selectedFileName = computed(() => {
    if (this.selectedFile() === 'javascript') {
      return this.scriptLanguage() === 'typescript' ? 'component.ts' : 'component.js';
    }
    return this.selectedFile() === 'html' ? 'component.html' : 'component.css';
  });
  readonly highlightedSource = computed(() => hljs.highlight(this.selectedSource(), {
    language: this.highlightLanguage()
  }).value);

  constructor() {
    effect(() => {
      const frame = this.previewFrame()?.nativeElement;
      const example = this.example();
      this.renderVersion();
      if (!frame) return;

      this.sessionStatus.set('loading');
      this.runtimeError.set('');
      this.sessionId = this.createSessionId();
      frame.srcdoc = this.buildPreviewDocument(example, this.sessionId);
    });
  }

  selectFile(file: SourceFile): void {
    this.selectedFile.set(file);
    this.copied.set(false);
  }

  selectScriptLanguage(language: ScriptLanguage): void {
    if (language === 'typescript' && !this.example().source.typescript) return;
    this.scriptLanguage.set(language);
    this.copied.set(false);
  }

  setViewport(viewport: PreviewViewport): void {
    this.viewport.set(viewport);
  }

  reload(): void {
    this.renderVersion.update((version) => version + 1);
  }

  async copySelectedSource(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.selectedSource());
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1400);
    } catch {
      this.copied.set(false);
    }
  }

  @HostListener('window:message', ['$event'])
  handlePreviewMessage(event: MessageEvent<unknown>): void {
    const frame = this.previewFrame()?.nativeElement;
    if (!frame || event.source !== frame.contentWindow || !this.isPreviewMessage(event.data)) return;
    if (event.data.sessionId !== this.sessionId) return;

    if (event.data.type === 'ready') {
      this.sessionStatus.set('ready');
      return;
    }

    this.sessionStatus.set('error');
    this.runtimeError.set(event.data.message || 'The preview encountered an unknown error.');
  }

  private buildPreviewDocument(example: ComponentExample, sessionId: string): string {
    const nonce = this.createSessionId();
    const encodedCss = this.encode(example.source.css);
    const encodedJavascript = this.encode(example.source.javascript);
    const encodedSession = JSON.stringify(sessionId);
    const contentSecurityPolicy = [
      "default-src 'none'",
      `script-src 'nonce-${nonce}' blob:`,
      `style-src 'nonce-${nonce}'`,
      "img-src data: blob:",
      "font-src data:",
      "connect-src 'none'",
      "form-action 'none'",
      "base-uri 'none'",
      "object-src 'none'"
    ].join('; ');

    const runtime = `
      const sessionId = ${encodedSession};
      const send = (type, message = '') => parent.postMessage({
        source: 'dev-lib-preview', sessionId, type, message
      }, '*');
      const decode = (value) => new TextDecoder().decode(
        Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
      );

      window.addEventListener('error', (event) => send('error', event.message));
      window.addEventListener('unhandledrejection', (event) => {
        send('error', event.reason instanceof Error ? event.reason.message : String(event.reason));
      });

      const style = document.createElement('style');
      style.setAttribute('nonce', ${JSON.stringify(nonce)});
      style.textContent = decode(${JSON.stringify(encodedCss)});
      document.head.append(style);

      const moduleUrl = URL.createObjectURL(new Blob(
        [decode(${JSON.stringify(encodedJavascript)})],
        { type: 'text/javascript' }
      ));

      import(moduleUrl)
        .then(() => send('ready'))
        .catch((error) => send('error', error instanceof Error ? error.message : String(error)))
        .finally(() => URL.revokeObjectURL(moduleUrl));
    `;

    return `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
          <title>${this.escapeHtml(example.title)}</title>
          <style nonce="${nonce}">
            *, *::before, *::after { box-sizing: border-box; }
            html, body { min-height: 100%; }
            html { background: #f5f5ef; color: #171915; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
            body { margin: 0; }
          </style>
        </head>
        <body>
          ${example.source.html}
          <script nonce="${nonce}" type="module">${runtime}</script>
        </body>
      </html>`;
  }

  private highlightLanguage(): 'xml' | 'css' | 'javascript' | 'typescript' {
    if (this.selectedFile() === 'html') return 'xml';
    if (this.selectedFile() === 'css') return 'css';
    return this.scriptLanguage();
  }

  private encode(value: string): string {
    let binary = '';
    for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private createSessionId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private isPreviewMessage(value: unknown): value is PreviewMessage {
    if (!value || typeof value !== 'object') return false;
    const message = value as Partial<PreviewMessage>;
    return message.source === 'dev-lib-preview'
      && typeof message.sessionId === 'string'
      && (message.type === 'ready' || message.type === 'error')
      && (message.message === undefined || typeof message.message === 'string');
  }
}
