import { describe, it, expect } from 'bun:test';
import { postProcess } from './generate.js';

describe('postProcess', () => {
  it('works with simple svgs', () => {
    expect(
      postProcess(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/></svg>',
        {
          width: 256,
          height: 256,
          blurStdDev: 12,
        },
      ),
    ).toBe(
      "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cfilter id='c'%3e%3cfeGaussianBlur stdDeviation='55'/%3e%3c/filter%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='url(%23c)' fill-opacity='.5'%3e%3c/g%3e%3c/svg%3e",
    );
  });

  it('works with svgs with groups', () => {
    expect(
      postProcess(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/><g><path d="M0 0h256v256H0z"/></g></svg>',
        {
          width: 256,
          height: 256,
          blurStdDev: 12,
        },
      ),
    ).toBe(
      "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cfilter id='b'%3e%3cfeGaussianBlur stdDeviation='12'/%3e%3c/filter%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='url(%23b)'%3e%3cpath d='M0 0h256v256H0z'/%3e%3c/g%3e%3c/svg%3e",
    );
  });
});
