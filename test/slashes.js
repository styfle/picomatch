'use strict';

require('mocha');
const assert = require('assert');
const picomatch = require('..');
const pm = require('./support');

const equal = (actual, expected, msg) => {
  if (Array.isArray(actual)) actual.sort();
  if (Array.isArray(expected)) expected.sort();
  assert.deepEqual(actual, expected, msg);
};

describe('slashes', () => {
  beforeEach(() => picomatch.clearCache());

  it('should match one directory level with a single star (*)', () => {
    const fixtures = ['/a', '/a/', '/b', 'a', 'a/', 'b', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a', 'x/y', 'z/z'];
    equal(pm(fixtures, '*'), ['a', 'b', 'a/']);
    equal(pm(fixtures, '/*'), ['/a', '/b']);
    equal(pm(fixtures, '*/'), ['a/']);
    equal(pm(fixtures, '**/*'), fixtures.filter(v => v.slice(-1) !== '/'));
    equal(pm(fixtures, '/*/'), ['/a/']);
    equal(pm(fixtures, '*/*'), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
    equal(pm(fixtures, '*/*/*'), ['a/a/a', 'a/a/b']);
    equal(pm(fixtures, '*/*/*/*'), ['a/a/a/a']);
    equal(pm(fixtures, '*/*/*/*/*'), ['a/a/a/a/a']);
    equal(pm(fixtures, 'a/*'), ['a/a', 'a/b', 'a/c', 'a/x']);
    equal(pm(fixtures, 'a/*/*'), ['a/a/a', 'a/a/b']);
    equal(pm(fixtures, 'a/*/*/*'), ['a/a/a/a']);
    equal(pm(fixtures, 'a/*/*/*/*'), ['a/a/a/a/a']);
    equal(pm(fixtures, 'a/*/a'), ['a/a/a']);
    equal(pm(fixtures, 'a/*/b'), ['a/a/b']);
  });

  it('should match one or more directories with a globstar', () => {
    const fixtures = ['a', 'a/a', 'a/a/a', '/a', 'a/', '/a/', '/a/a', 'a/a/', '/a/a/', 'a/a/a/'];
    equal(pm(fixtures, '**/a'), fixtures);
    equal(pm(fixtures, 'a/**'), ['a/', 'a/a/', 'a/a', 'a/a/a', 'a/a/a/']);
    equal(pm(fixtures, '**/a/**'), ['a/a', 'a/a/a', 'a/', '/a/', '/a/a', 'a/a/', '/a/a/', 'a/a/a/']);
  });

  it('should match one or more characters', () => {
    const fixtures = ['a', 'aa', 'aaa', 'aaaa', 'ab', 'b', 'bb', 'c', 'cc', 'cac', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a', 'x/y', 'z/z'];
    equal(pm(fixtures, '*'), ['a', 'aa', 'aaa', 'aaaa', 'ab', 'b', 'bb', 'c', 'cc', 'cac']);
    equal(pm(fixtures, 'a*'), ['a', 'aa', 'aaa', 'aaaa', 'ab']);
    equal(pm(fixtures, '*b'), ['ab', 'b', 'bb']);
  });

  it('should match one or zero characters', () => {
    const fixtures = ['a', 'aa', 'aaa', 'aaaa', 'ab', 'b', 'bb', 'c', 'cc', 'cac', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a', 'x/y', 'z/z'];
    equal(pm(fixtures, '*'), ['a', 'aa', 'aaa', 'aaaa', 'ab', 'b', 'bb', 'c', 'cc', 'cac']);
    equal(pm(fixtures, '*a*'), ['a', 'aa', 'aaa', 'aaaa', 'ab', 'cac']);
    equal(pm(fixtures, '*b*'), ['ab', 'b', 'bb']);
    equal(pm(fixtures, '*c*'), ['c', 'cc', 'cac']);
  });

  it('should respect trailing slashes on paterns', () => {
    const fixtures = ['a', 'a/', 'b', 'b/', 'a/a', 'a/a/', 'a/b', 'a/b/', 'a/c', 'a/c/', 'a/x', 'a/x/', 'a/a/a', 'a/a/b', 'a/a/b/', 'a/a/a/', 'a/a/a/a', 'a/a/a/a/', 'a/a/a/a/a', 'a/a/a/a/a/', 'x/y', 'z/z', 'x/y/', 'z/z/', 'a/b/c/.d/e/'];
    equal(pm(fixtures, '*/'), ['a/', 'b/']);
    equal(pm(fixtures, '*/*/'), ['a/a/', 'a/b/', 'a/c/', 'a/x/', 'x/y/', 'z/z/']);
    equal(pm(fixtures, '*/*/*/'), ['a/a/a/', 'a/a/b/']);
    equal(pm(fixtures, '*/*/*/*/'), ['a/a/a/a/']);
    equal(pm(fixtures, '*/*/*/*/*/'), ['a/a/a/a/a/']);
    equal(pm(fixtures, 'a/*/'), ['a/a/', 'a/b/', 'a/c/', 'a/x/']);
    equal(pm(fixtures, 'a/*/*/'), ['a/a/a/', 'a/a/b/']);
    equal(pm(fixtures, 'a/*/*/*/'), ['a/a/a/a/']);
    equal(pm(fixtures, 'a/*/*/*/*/'), ['a/a/a/a/a/']);
    equal(pm(fixtures, 'a/*/a/'), ['a/a/a/']);
    equal(pm(fixtures, 'a/*/b/'), ['a/a/b/']);
  });

  it('should match a literal star when escaped', () => {
    const fixtures = ['.md', 'a**a.md', '**a.md', '**/a.md', '**.md', '.md', '*', '**', '*.md'];
    equal(pm(fixtures, '\\*'), ['*']);
    equal(pm(fixtures, '\\*.md'), ['*.md']);
    equal(pm(fixtures, '\\**.md'), ['**a.md', '**.md', '*.md']);
    equal(pm(fixtures, 'a\\**.md'), ['a**a.md']);
  });

  it('should match leading `./`', () => {
    const opts = { prefix: '(\\.\\/(?=.))?', normalize: true };
    const fixtures = ['a', './a', 'b', 'a/a', './a/b', 'a/c', './a/x', './a/a/a', 'a/a/b', './a/a/a/a', './a/a/a/a/a', 'x/y', './z/z'];
    equal(pm(fixtures, '*', opts), ['a', 'b']);
    equal(pm(fixtures, '**/a/**', opts), ['a/a', 'a/c', 'a/b', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(pm(fixtures, '*/*', opts), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
    equal(pm(fixtures, '*/*/*', opts), ['a/a/a', 'a/a/b']);
    equal(pm(fixtures, '*/*/*/*', opts), ['a/a/a/a']);
    equal(pm(fixtures, '*/*/*/*/*', opts), ['a/a/a/a/a']);
    equal(pm(fixtures, './*', opts), ['a', 'b']);
    equal(pm(fixtures, './**/a/**', opts), ['a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(pm(fixtures, './a/*/a', opts), ['a/a/a']);
    equal(pm(fixtures, 'a/*', opts), ['a/a', 'a/b', 'a/c', 'a/x']);
    equal(pm(fixtures, 'a/*/*', opts), ['a/a/a', 'a/a/b']);
    equal(pm(fixtures, 'a/*/*/*', opts), ['a/a/a/a']);
    equal(pm(fixtures, 'a/*/*/*/*', opts), ['a/a/a/a/a']);
    equal(pm(fixtures, 'a/*/a', opts), ['a/a/a']);
  });
});
