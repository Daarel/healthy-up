import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  it('string comparison works', () => {
    expect('hello').toBe('hello');
  });
});
