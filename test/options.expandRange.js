'use strict';

require('mocha');
const assert = require('assert');
const fill = require('fill-range');
const pm = require('..');

describe('options.expandRange', () => {
  beforeEach(() => pm.clearCache());

  it('should support a custom function for expanding ranges in brace patterns', () => {
    assert(pm.isMatch('a/c', 'a/{a..c}', { expandRange: (a, b) => `([${a}-${b}])` }));
    assert(!pm.isMatch('a/z', 'a/{a..c}', { expandRange: (a, b) => `([${a}-${b}])` }));
    assert(pm.isMatch('a/99', 'a/{1..100}', {
      expandRange(a, b) {
        return `(${fill(a, b, { toRegex: true })})`;
      }
    }));
  });
});
