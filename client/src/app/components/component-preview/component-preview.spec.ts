import { TestBed } from '@angular/core/testing';
import { ComponentExample } from '../../models/library-entry';
import { componentExample, installBrowserStubs } from '../../testing';
import { ComponentPreview } from './component-preview';

describe('ComponentPreview', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ({ writeText } = installBrowserStubs());
  });

  function render(example: ComponentExample = componentExample()) {
    const fixture = TestBed.createComponent(ComponentPreview);
    fixture.componentRef.setInput('example', example);
    fixture.detectChanges();
    const frame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    return { fixture, component: fixture.componentInstance, frame };
  }
  const sessionIdOf = (frame: HTMLIFrameElement) => /const sessionId = "([^"]+)"/.exec(frame.srcdoc)?.[1];
  const message = (source: MessageEventSource | null, data: unknown) => new MessageEvent('message', { source, data });

  it('renders the example in a locked-down document', () => {
    const { frame } = render();

    expect(frame.srcdoc).toContain("default-src 'none'");
    expect(frame.srcdoc).toContain("connect-src 'none'");
    expect(frame.srcdoc).toContain('<button>Open</button>');
    expect(frame.srcdoc).toContain('<title>Basic &lt;dialog&gt; &amp; &quot;friends&quot;</title>');
    expect(frame.srcdoc).not.toContain('button { color: red; }');
    expect(frame.srcdoc).toContain(btoa('button { color: red; }'));
  });

  it('marks the session ready only for messages from its own frame and session', () => {
    const { component, frame } = render();
    const sessionId = sessionIdOf(frame);

    component.handlePreviewMessage(message(window, { source: 'dev-lib-preview', sessionId, type: 'ready' }));
    component.handlePreviewMessage(message(frame.contentWindow, { source: 'dev-lib-preview', sessionId: 'old', type: 'ready' }));
    component.handlePreviewMessage(message(frame.contentWindow, { source: 'other', sessionId, type: 'ready' }));
    expect(component.sessionStatus()).toBe('loading');

    component.handlePreviewMessage(message(frame.contentWindow, { source: 'dev-lib-preview', sessionId, type: 'ready' }));
    expect(component.sessionStatus()).toBe('ready');
  });

  it('shows runtime errors reported by the preview', () => {
    const { component, frame } = render();
    const sessionId = sessionIdOf(frame);

    component.handlePreviewMessage(message(frame.contentWindow, { source: 'dev-lib-preview', sessionId, type: 'error' }));
    expect(component.runtimeError()).toBe('The preview encountered an unknown error.');
    component.handlePreviewMessage(message(frame.contentWindow, { source: 'dev-lib-preview', sessionId, type: 'error', message: 'boom' }));

    expect(component.sessionStatus()).toBe('error');
    expect(component.runtimeError()).toBe('boom');
  });

  it('starts a new session when reloaded', () => {
    const { fixture, component, frame } = render();
    const first = sessionIdOf(frame);

    component.reload();
    fixture.detectChanges();

    expect(sessionIdOf(frame)).not.toBe(first);
    expect(component.sessionStatus()).toBe('loading');
  });

  it('switches between source files and names them', () => {
    const { component } = render();

    expect(component.selectedFileName()).toBe('component.html');
    component.selectFile('css');
    expect(component.selectedSource()).toBe('button { color: red; }');
    expect(component.selectedFileName()).toBe('component.css');
    component.selectFile('javascript');
    expect(component.selectedFileName()).toBe('component.js');
    expect(component.highlightedSource()).toContain('hljs-keyword');
  });

  it('only offers TypeScript when the example has it', () => {
    const { component } = render();
    component.selectFile('javascript');

    component.selectScriptLanguage('typescript');
    expect(component.scriptLanguage()).toBe('javascript');

    const typed = render(componentExample({ source: { ...componentExample().source, typescript: 'export const ready: boolean = true;' } })).component;
    typed.selectFile('javascript');
    typed.selectScriptLanguage('typescript');
    expect(typed.selectedSource()).toBe('export const ready: boolean = true;');
    expect(typed.selectedFileName()).toBe('component.ts');
  });

  it('copies the selected source and resets the copied state', async () => {
    vi.useFakeTimers();
    const { component } = render();

    await component.copySelectedSource();
    expect(writeText).toHaveBeenCalledWith('<button>Open</button>');
    expect(component.copied()).toBe(true);
    vi.advanceTimersByTime(1400);
    expect(component.copied()).toBe(false);
    vi.useRealTimers();
  });

  it('reports a failed copy as not copied', async () => {
    const { component } = render();
    writeText.mockRejectedValueOnce(new Error('denied'));

    await component.copySelectedSource();

    expect(component.copied()).toBe(false);
  });
});
