import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AsyncCustomShow from '../../src/components/async-custom-show';
import CustomShow from '../../src/components/custom-show';
import ErrorBoundary from '../../src/components/error-boundary';

describe('CustomShow', () => {
  it('renders children when condition is truthy', () => {
    render(
      <CustomShow when="ready" fallback={<span>fallback</span>}>
        <span>content</span>
      </CustomShow>
    );

    expect(screen.getByText('content')).toBeTruthy();
    expect(screen.queryByText('fallback')).toBeNull();
  });

  it('renders fallback when condition is falsy', () => {
    render(
      <CustomShow when={false} fallback={<span>fallback</span>}>
        <span>content</span>
      </CustomShow>
    );

    expect(screen.getByText('fallback')).toBeTruthy();
    expect(screen.queryByText('content')).toBeNull();
  });
});

describe('AsyncCustomShow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fallback before promise resolves and children after promise resolves', async () => {
    render(
      <AsyncCustomShow
        when={Promise.resolve('ready')}
        fallback={<span>loading</span>}
      >
        {(value) => <span>value: {value}</span>}
      </AsyncCustomShow>
    );

    expect(screen.getByText('loading')).toBeTruthy();
    await screen.findByText('value: ready');
  });

  it('renders fallback when when is nullish or false', () => {
    const { rerender } = render(
      <AsyncCustomShow when={null} fallback={<span>empty</span>}>
        {(value) => <span>value: {String(value)}</span>}
      </AsyncCustomShow>
    );

    expect(screen.getByText('empty')).toBeTruthy();

    rerender(
      <AsyncCustomShow when={false} fallback={<span>false fallback</span>}>
        {(value) => <span>value: {String(value)}</span>}
      </AsyncCustomShow>
    );
    expect(screen.getByText('false fallback')).toBeTruthy();
  });

  it('[defect-probing] keeps the latest promise result when an older promise resolves later', async () => {
    let resolveFirst!: (value: string) => void;
    let resolveSecond!: (value: string) => void;
    const first = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });
    const second = new Promise<string>((resolve) => {
      resolveSecond = resolve;
    });

    const { rerender } = render(
      <AsyncCustomShow when={first} fallback={<span>loading</span>}>
        {(value) => <span>value: {value}</span>}
      </AsyncCustomShow>
    );

    rerender(
      <AsyncCustomShow when={second} fallback={<span>loading</span>}>
        {(value) => <span>value: {value}</span>}
      </AsyncCustomShow>
    );

    await act(async () => {
      resolveSecond('second');
      await second;
    });
    expect(screen.getByText('value: second')).toBeTruthy();

    await act(async () => {
      resolveFirst('first');
      await first;
    });

    await waitFor(() => {
      expect(screen.getByText('value: second')).toBeTruthy();
      expect(screen.queryByText('value: first')).toBeNull();
    });
  });
});

describe('ErrorBoundary', () => {
  const Broken = () => {
    throw new Error('broken child');
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary fallback={<span>fallback</span>}>
        <span>safe</span>
      </ErrorBoundary>
    );

    expect(screen.getByText('safe')).toBeTruthy();
  });

  it('renders fallback and logs when child throws', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const preventExpectedErrorLog = (event: ErrorEvent) => {
      event.preventDefault();
    };
    window.addEventListener('error', preventExpectedErrorLog);

    try {
      render(
        <ErrorBoundary fallback={<span>fallback</span>} msg="custom error">
          <Broken />
        </ErrorBoundary>
      );
    } finally {
      window.removeEventListener('error', preventExpectedErrorLog);
    }

    expect(screen.getByText('fallback')).toBeTruthy();
    expect(consoleError).toHaveBeenCalled();
    expect(
      String(consoleError.mock.calls[consoleError.mock.calls.length - 1]?.[0])
    ).toContain('custom error');
  });
});
