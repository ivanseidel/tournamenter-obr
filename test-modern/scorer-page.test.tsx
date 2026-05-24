import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ScorerPage } from '../src/ui/pages/ScorerPage';

describe('ScorerPage', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.useRealTimers();
  });

  it('starts from the waiting state and opens the scoring form when the timer starts', () => {
    act(() => root.render(<ScorerPage />));

    expect(document.body).toHaveTextContent('Aguardando...');
    expect(document.body).toHaveTextContent('Versão: Regional 2026.1.5');

    const startButton = [...document.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Iniciar'),
    );
    expect(startButton).toBeInstanceOf(HTMLButtonElement);

    act(() => startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    act(() => vi.advanceTimersByTime(100));

    expect(document.body).toHaveTextContent('Ladrilhos');
    expect(document.body).toHaveTextContent('Bônus de saída');
  });
});
