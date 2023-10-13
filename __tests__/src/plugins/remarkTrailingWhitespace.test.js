import { toMarkdown } from 'mdast-util-to-markdown';
import { u } from 'unist-builder';
import { remarkTrailingWhitespace } from '../../../src/plugins';

describe('remarkTrailingWhitespace', () => {
  test('that it will remove trailing whitespace but wont add space when period is present', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('strong', [u('text', 'text in bold ')]),
        u('text', '.')
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold**.\n');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will remove trailing whitespace but wont add space when space is already present', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('strong', [u('text', 'text in bold ')]),
        u('text', ' with a space after.')
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold** with a space after.\n');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will remove trailing whitespace and insert space as needed', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('strong', [u('text', 'text in bold ')]),
        u('text', 'with no space after.')
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold** with no space after.\n');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
    expect(tree.children[0].children[2].value).toBe(' with no space after.');
  });

  test("that it will remove preceeding whitespace but won't insert space", () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('strong', [u('text', ' text in bold')]),
        u('text', ' with a space after.')
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold** with a space after.\n');
    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will remove preceeding whitespace and will insert space', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some'),
        u('strong', [u('text', ' text in bold')]),
        u('text', ' with a space after.'),
        u('strong', [])
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold** with a space after.\n');
    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
  });

  test('that it will handle all cases', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('strong', [u('text', ' text in bold ')]),
        u('text', 'with no space after.'),
        u('strong', [])
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toBe('Here is some **text in bold** with no space after.\n');
    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].value).toBe('text in bold');
    expect(tree.children[0].children[2].value).toBe(' with no space after.');
  });

  test('a more complex example with nested emphasis', () => {
    const tree = u('root', [
      u('paragraph', [
        u('text', 'Here is some '),
        u('emphasis', [u('strong', [u('text', '  emphasized text ')])]),
        u('text', 'with no space after.')
      ])
    ]);

    const transformer = remarkTrailingWhitespace();
    transformer(tree);

    const markdown = toMarkdown(tree);

    expect(markdown).toEqual('Here is some ***emphasized text*** with no space after.\n');
    expect(tree.children[0].children[0].value).toBe('Here is some ');
    expect(tree.children[0].children[1].children[0].children[0].value).toBe('emphasized text');
    expect(tree.children[0].children[2].value).toBe(' with no space after.');
  });
});
