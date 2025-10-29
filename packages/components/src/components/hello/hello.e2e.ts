import { describe, expect, it } from 'vitest';

describe('cov-hello', () => {
  describe('fake success test test', () => {
    it('should not break math', () => {
      expect(1).toEqual(1);
    });
  });
});
