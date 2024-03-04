import { describe, it, expect } from 'bun:test';
import { postProcess } from './generate.js';

describe('postProcess', () => {
  [
    {
      name: 'simple SVGs w/ CSS based blur',
      cssBlur: true,
      input:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/></svg>',
      expected:
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='blur(55px)' fill-opacity='.5'%3e%3c/g%3e%3c/svg%3e",
    },
    {
      name: 'SVGs with groups w/ CSS based blur',
      cssBlur: true,
      input:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/><g><path d="M0 0h256v256H0z"/></g></svg>',
      expected:
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='blur(12px)'%3e%3cpath d='M0 0h256v256H0z'/%3e%3c/g%3e%3c/svg%3e",
    },
    {
      name: 'simple SVGs w/ SVG based blur',
      cssBlur: false,
      input:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/></svg>',
      expected:
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cfilter id='c'%3e%3cfeGaussianBlur stdDeviation='55'/%3e%3c/filter%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='url(%23c)' fill-opacity='.5'%3e%3c/g%3e%3c/svg%3e",
    },
    {
      name: 'SVGs with groups w/ SVG based blur',
      cssBlur: false,
      input:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M0 0h256v256H0z"/><g><path d="M0 0h256v256H0z"/></g></svg>',
      expected:
        "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3e%3cfilter id='b'%3e%3cfeGaussianBlur stdDeviation='12'/%3e%3c/filter%3e%3cpath d='M0 0h256v256H0z'/%3e%3cg filter='url(%23b)'%3e%3cpath d='M0 0h256v256H0z'/%3e%3c/g%3e%3c/svg%3e",
    },
  ].forEach(({ name, cssBlur, input, expected }) => {
    it(`works with ${name}`, () => {
      expect(
        postProcess(input, {
          width: 256,
          height: 256,
          blurStdDev: 12,
          cssBlur,
        }),
      ).toBe(expected);
    });
  });
});
